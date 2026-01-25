"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  addEdge,
  OnConnect,
  OnReconnect,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import SuspectCardNode from './nodes/SuspectCardNode'
import NoteNode from './nodes/NoteNode'
import PhotoNode from './nodes/PhotoNode'
import DocumentNode from './nodes/DocumentNode'
import RedStringEdge from './edges/RedStringEdge'
import { ConnectionTypePopup } from './ConnectionTypePopup'
import { ConnectionContextMenu } from './ConnectionContextMenu'
import { LeftPanel } from './LeftPanel'
import { NoteToolbar } from './NoteToolbar'
import { DocumentToolbar } from './DocumentToolbar'
import { EvidenceSelectorModal } from './EvidenceSelectorModal'
import { useInvestigationBoardStore } from './useInvestigationBoardStore'
import { calculateInitialLayout, generateConnectionId } from './utils'
import { ConnectionType } from './types'
import { useGameState } from '@/lib/hooks/useGameState'

// Define custom node types
const nodeTypes = {
  suspect: SuspectCardNode,
  victim: SuspectCardNode,
  note: NoteNode,
  photo: PhotoNode,
  document: DocumentNode,
}

// Define custom edge types
const edgeTypes = {
  redString: RedStringEdge,
}

interface Suspect {
  id: string
  name: string
  portraitUrl: string
}

interface InvestigationBoardContentProps {
  caseId: string
  suspects: Suspect[]
  victim: Suspect
}

function InvestigationBoardContent({
  caseId,
  suspects,
  victim,
}: InvestigationBoardContentProps) {
  const reactFlowInstance = useReactFlow()
  const { unlockedContent } = useGameState()
  const {
    loadState,
    saveState,
    applyStoredPositions,
    getStoredEdges,
  } = useInvestigationBoardStore(caseId)
  
  // Board state (mode removed - always in select/interact mode)
  const [nodes, setNodes, onNodesChangeBase] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState([] as Edge[])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isEvidenceSelectorOpen, setIsEvidenceSelectorOpen] = useState(false)
  const [evidenceSelectorInitialTab, setEvidenceSelectorInitialTab] = useState<'photos' | 'documents'>('photos')
  const [copiedNode, setCopiedNode] = useState<Node | null>(null)
  
  // Use the base handlers directly
  const onNodesChange = onNodesChangeBase
  const onEdgesChange = onEdgesChangeBase
  
  // Connection popup state
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)
  const [connectionPopupPosition, setConnectionPopupPosition] = useState({ x: 0, y: 0 })
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    edgeId: string
    connectionType: ConnectionType
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    edgeId: '',
    connectionType: 'supports',
  })
  
  // Ref to track if we've done initial save
  const hasInitializedRef = useRef(false)
  
  // Handle edge context menu
  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edgeId: string) => {
    event.preventDefault()
    
    const edge = edges.find(e => e.id === edgeId)
    if (!edge) return
    
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      edgeId,
      connectionType: (edge.data as any)?.connectionType || 'supports',
    })
  }, [edges])
  
  // Note handlers
  const handleUpdateNote = useCallback((noteId: string, content: string) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === noteId
          ? {
              ...node,
              data: {
                ...node.data,
                content,
              },
            }
          : node
      )
    )
  }, [setNodes])
  
  const handleDeleteNote = useCallback((noteId: string) => {
    setNodes(prev => prev.filter(node => node.id !== noteId))
  }, [setNodes])
  
  const handleColorChange = useCallback((noteId: string, color: 'yellow' | 'blue' | 'pink' | 'green') => {
    setNodes(prev => 
      prev.map(node => 
        node.id === noteId
          ? {
              ...node,
              data: {
                ...node.data,
                color,
              },
            }
          : node
      )
    )
  }, [setNodes])
  
  // Photo handlers
  const handleDeletePhoto = useCallback((photoId: string) => {
    setNodes(prev => prev.filter(node => node.id !== photoId))
  }, [setNodes])
  
  const handlePhotoClick = useCallback((photoId: string) => {
    // TODO: Implement photo enlargement/viewer
    console.log('Photo clicked:', photoId)
  }, [])
  
  // Document handlers
  const handleDeleteDocument = useCallback((documentId: string) => {
    setNodes(prev => prev.filter(node => node.id !== documentId))
  }, [setNodes])
  
  const handleReviewDocument = useCallback((documentId: string) => {
    // TODO: Open DocumentViewer modal with the document
    console.log('Review document:', documentId)
  }, [])
  
  // Initialize board with suspects and victim only
  useEffect(() => {
    if (isInitialized) return
    if (suspects.length === 0) return
    
    // Load stored state
    const storedState = loadState()
    
    // Calculate initial layout (suspects and victim only)
    const initialNodes = calculateInitialLayout(
      suspects,
      victim,
      1400, // canvas width
      900   // canvas height
    )
    
    // Convert to ReactFlow nodes
    let flowNodes: Node[] = initialNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      draggable: true,
    }))
    
    // Add note nodes from stored state
    const noteNodes: Node[] = storedState?.nodes
      .filter(n => n?.id?.startsWith('note_'))
      .map(n => ({
        id: n.id,
        type: 'note' as const,
        position: n.position,
        data: {
          ...(n as any).data,
          onUpdate: handleUpdateNote,
          onDelete: handleDeleteNote,
          onColorChange: handleColorChange,
        },
        draggable: true,
        width: n.width,
        height: n.height,
      })) || []
    
    // Add photo nodes from stored state
    const photoNodes: Node[] = storedState?.nodes
      .filter(n => n?.id?.startsWith('photo_'))
      .map(n => ({
        id: n.id,
        type: 'photo' as const,
        position: n.position,
        data: {
          ...(n as any).data,
          onDelete: handleDeletePhoto,
          onClick: handlePhotoClick,
        },
        draggable: true,
        resizing: true,
        style: (n as any).style || {
          width: 200,
          height: 200,
        },
        width: (n as any).width || (n as any).style?.width || 200,
        height: (n as any).height || (n as any).style?.height || 200,
      })) || []
    
    // Add document nodes from stored state
    const documentNodes: Node[] = storedState?.nodes
      .filter(n => n?.id?.startsWith('document_'))
      .map(n => ({
        id: n.id,
        type: 'document' as const,
        position: n.position,
        data: {
          ...(n as any).data,
          onDelete: handleDeleteDocument,
          onReview: handleReviewDocument,
        },
        draggable: true,
        resizing: false,
        style: {
          width: 250,
          height: 200,
        },
        width: 250,
        height: 200,
      })) || []
    
    flowNodes = [...flowNodes, ...noteNodes, ...photoNodes, ...documentNodes]
    
    // Apply stored positions if available
    const nodesWithPositions = applyStoredPositions(flowNodes, storedState)
    
    // Get stored edges
    const storedEdges = getStoredEdges(storedState, handleEdgeContextMenu)
    
    setNodes(nodesWithPositions)
    setEdges(storedEdges)
    setIsInitialized(true)
    hasInitializedRef.current = true
    
    // Always fit view on initial load, regardless of stored viewport
    // This ensures the default zoom is applied
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.6, duration: 0 })
    }, 100)
  }, [
    suspects,
    victim,
    isInitialized,
    loadState,
    applyStoredPositions,
    getStoredEdges,
    setNodes,
    setEdges,
    handleEdgeContextMenu,
    handleUpdateNote,
    handleDeleteNote,
    handleColorChange,
    handleDeletePhoto,
    handlePhotoClick,
    handleDeleteDocument,
    handleReviewDocument,
    reactFlowInstance,
  ])
  
  // Save state when nodes or edges change
  useEffect(() => {
    if (!hasInitializedRef.current) return
    
    const viewport = reactFlowInstance.getViewport()
    saveState(nodes, edges, viewport)
  }, [nodes, edges, reactFlowInstance, saveState])
  
  // Handle connection creation
  const onConnect: OnConnect = useCallback((connection) => {
    if (!connection.source || !connection.target) return
    
    // Show connection type popup
    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)
    
    if (sourceNode && targetNode) {
      // Calculate popup position (25% of the way from source to target)
      const posX = sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) * 0.25
      const posY = sourceNode.position.y + (targetNode.position.y - sourceNode.position.y) * 0.25
      
      // Convert to screen coordinates
      const { x, y, zoom } = reactFlowInstance.getViewport()
      const screenX = posX * zoom + x
      const screenY = posY * zoom + y
      
      setPendingConnection(connection)
      setConnectionPopupPosition({
        x: Math.max(10, Math.min(screenX, window.innerWidth - 220)),
        y: Math.max(10, Math.min(screenY, window.innerHeight - 250)),
      })
    }
  }, [nodes, reactFlowInstance])
  
  // Handle connection type selection
  const handleConnectionTypeSelect = useCallback((type: ConnectionType) => {
    if (!pendingConnection) return
    
    const newEdge: Edge = {
      id: generateConnectionId(),
      source: pendingConnection.source!,
      target: pendingConnection.target!,
      sourceHandle: pendingConnection.sourceHandle || undefined,
      targetHandle: pendingConnection.targetHandle || undefined,
      type: 'redString',
      data: {
        connectionType: type,
        onContextMenu: handleEdgeContextMenu,
      },
    }
    
    setEdges(prev => addEdge(newEdge, prev))
    setPendingConnection(null)
  }, [pendingConnection, setEdges, handleEdgeContextMenu])
  
  // Handle connection type change from context menu
  const handleChangeConnectionType = useCallback((type: ConnectionType) => {
    setEdges(prev =>
      prev.map(edge =>
        edge.id === contextMenu.edgeId
          ? {
              ...edge,
              data: {
                ...(edge.data as any),
                connectionType: type,
              },
            }
          : edge
      )
    )
  }, [contextMenu.edgeId, setEdges])
  
  // Handle edge reconnection - preserve edge data
  const handleReconnect: OnReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    setEdges(edges => {
      return edges.map(edge => {
        if (edge.id === oldEdge.id) {
          // Update this edge with new connection but preserve data
          return {
            ...edge,
            source: newConnection.source!,
            target: newConnection.target!,
            sourceHandle: newConnection.sourceHandle || undefined,
            targetHandle: newConnection.targetHandle || undefined,
            type: 'redString',
            data: {
              connectionType: (oldEdge.data as any)?.connectionType || 'supports',
              onContextMenu: handleEdgeContextMenu,
            },
          }
        }
        return edge
      })
    })
  }, [handleEdgeContextMenu, setEdges])
  
  // Handle edge deletion
  const handleDeleteEdge = useCallback(() => {
    setEdges(prev => prev.filter(edge => edge.id !== contextMenu.edgeId))
  }, [contextMenu.edgeId, setEdges])
  
  // Handle drag over canvas (required to enable drop)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])
  
  // Handle drop on canvas (notes and photos)
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    
    // Get drop position in ReactFlow coordinates
    const reactFlowBounds = event.currentTarget.getBoundingClientRect()
    const { x: viewportX, y: viewportY, zoom } = reactFlowInstance.getViewport()
    
    const position = {
      x: (event.clientX - reactFlowBounds.left - viewportX) / zoom,
      y: (event.clientY - reactFlowBounds.top - viewportY) / zoom,
    }
    
    // Check for note drop first
    const noteData = event.dataTransfer.getData('application/note')
    if (noteData) {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newNote: Node = {
        id: noteId,
        type: 'note',
        position: {
          x: position.x - 90, // Center the note (180px wide / 2)
          y: position.y - 60, // Center the note (120px tall / 2)
        },
        data: {
          id: noteId,
          content: '',
          color: 'yellow',
          onUpdate: handleUpdateNote,
          onDelete: handleDeleteNote,
          onColorChange: handleColorChange,
          autoFocus: true,
        },
        draggable: true,
        style: {
          width: 180,
          height: 120,
        },
      }
      
      setNodes(prev => [...prev, newNote])
      return
    }
    
    // Check for photo drop
    const photoDataStr = event.dataTransfer.getData('application/photo')
    if (photoDataStr) {
      try {
        const photoData = JSON.parse(photoDataStr)
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const newPhoto: Node = {
          id: photoId,
          type: 'photo',
          position: {
            x: position.x - 100, // Center the photo (200px wide / 2)
            y: position.y - 100, // Center the photo (200px tall / 2)
          },
          data: {
            id: photoId,
            imageUrl: photoData.imageUrl,
            title: photoData.title,
            onDelete: handleDeletePhoto,
            onClick: handlePhotoClick,
          },
          draggable: true,
          resizing: true,
          style: {
            width: 200,
            height: 200,
          },
          width: 200,
          height: 200,
        }
        
        setNodes(prev => [...prev, newPhoto])
        return
      } catch (error) {
        console.error('Failed to drop photo:', error)
        return
      }
    }
    
    // Handle document drop
    const documentDataStr = event.dataTransfer.getData('application/document')
    if (documentDataStr) {
      try {
        const documentData = JSON.parse(documentDataStr)
        const docId = `document_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const newDocument: Node = {
          id: docId,
          type: 'document',
          position: {
            x: position.x - 125, // Center the document (250px wide / 2)
            y: position.y - 100, // Center the document (200px tall / 2)
          },
          data: {
            id: docId,
            documentId: documentData.documentId,
            title: documentData.title,
            description: documentData.description,
            thumbnailUrl: documentData.thumbnailUrl,
            images: documentData.images,
            documentUrl: documentData.documentUrl,
            isLetter: documentData.isLetter,
            isHTML: documentData.isHTML,
            onDelete: handleDeleteDocument,
            onReview: handleReviewDocument,
          },
          draggable: true,
          resizing: false,
          style: {
            width: 250,
            height: 200,
          },
          width: 250,
          height: 200,
        }
        
        setNodes(prev => [...prev, newDocument])
        return
      } catch (error) {
        console.error('Failed to drop document:', error)
        return
      }
    }
  }, [reactFlowInstance, setNodes, handleUpdateNote, handleDeleteNote, handleColorChange, handleDeletePhoto, handlePhotoClick, handleDeleteDocument, handleReviewDocument])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Copy selected node (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const selectedNodes = nodes.filter(n => n.selected)
        if (selectedNodes.length === 1 && selectedNodes[0].type === 'note') {
          setCopiedNode(selectedNodes[0])
          e.preventDefault()
        }
        return
      }
      
      // Paste copied node (Ctrl+V or Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (copiedNode && copiedNode.type === 'note') {
          e.preventDefault()
          
          // Create a new note with copied content at an offset position
          const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const newNote: Node = {
            id: noteId,
            type: 'note',
            position: {
              x: copiedNode.position.x + 30,
              y: copiedNode.position.y + 30,
            },
            data: {
              id: noteId,
              content: (copiedNode.data as any).content || '',
              color: (copiedNode.data as any).color || 'yellow',
              onUpdate: handleUpdateNote,
              onDelete: handleDeleteNote,
              onColorChange: handleColorChange,
              autoFocus: true,
            },
            draggable: true,
            style: copiedNode.style,
          }
          
          setNodes(prev => [...prev, newNote])
        }
        return
      }
      
      switch (e.key.toLowerCase()) {
        case 'f':
          reactFlowInstance.fitView({ padding: 0.6 })
          break
        case '=':
        case '+':
          reactFlowInstance.zoomIn()
          break
        case '-':
          reactFlowInstance.zoomOut()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [reactFlowInstance, nodes, copiedNode, setNodes, handleUpdateNote, handleDeleteNote])
  
  // Calculate toolbar position for selected note
  const selectedNote = nodes.find(n => n.selected && n.type === 'note')
  const noteToolbarPosition = selectedNote
    ? (() => {
        const { x: viewportX, y: viewportY, zoom } = reactFlowInstance.getViewport()
        const nodeWidth = (selectedNote.style?.width as number) || (selectedNote.width || 180)
        const screenX = selectedNote.position.x * zoom + viewportX + (nodeWidth * zoom) / 2
        const screenY = selectedNote.position.y * zoom + viewportY - 50 // Position above the note
        return { x: screenX, y: Math.max(10, screenY) }
      })()
    : null
  
  // Calculate toolbar position for selected document
  const selectedDocument = nodes.find(n => n.selected && n.type === 'document')
  const documentToolbarPosition = selectedDocument
    ? (() => {
        const { x: viewportX, y: viewportY, zoom } = reactFlowInstance.getViewport()
        const nodeWidth = (selectedDocument.style?.width as number) || (selectedDocument.width || 250)
        const screenX = selectedDocument.position.x * zoom + viewportX + (nodeWidth * zoom) / 2
        const screenY = selectedDocument.position.y * zoom + viewportY - 50 // Position above the document
        return { x: screenX, y: Math.max(10, screenY) }
      })()
    : null
  
  return (
    <div 
      className="w-full h-full relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={handleReconnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'redString',
        }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        elevateEdgesOnSelect={true}
        edgesReconnectable={true}
        reconnectRadius={20}
        panOnDrag={[1, 2]}
        selectionOnDrag={true}
        selectNodesOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        fitView
        fitViewOptions={{ padding: 0.6 }}
        minZoom={0.1}
        maxZoom={2}
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)',
        }}
        proOptions={{ hideAttribution: true }}
      >
      </ReactFlow>
      
      {/* Unified Left Panel */}
      <LeftPanel
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onFitView={() => reactFlowInstance.fitView({ padding: 0.60 })}
        onEvidenceClick={(initialTab) => {
          setEvidenceSelectorInitialTab(initialTab)
          setIsEvidenceSelectorOpen(true)
        }}
      />
      
      {/* Evidence Selector Modal */}
      <EvidenceSelectorModal
        isOpen={isEvidenceSelectorOpen}
        onClose={() => setIsEvidenceSelectorOpen(false)}
        initialTab={evidenceSelectorInitialTab}
        unlockedContent={unlockedContent}
        caseId={caseId}
      />
      
      {/* Connection Type Popup */}
      <ConnectionTypePopup
        isOpen={pendingConnection !== null}
        position={connectionPopupPosition}
        onSelect={handleConnectionTypeSelect}
        onCancel={() => setPendingConnection(null)}
      />
      
      {/* Connection Context Menu */}
      <ConnectionContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        currentType={contextMenu.connectionType}
        onChangeType={handleChangeConnectionType}
        onDelete={handleDeleteEdge}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Note Toolbar - appears when a note is selected */}
      {selectedNote && noteToolbarPosition && (
        <NoteToolbar
          position={noteToolbarPosition}
          currentColor={(selectedNote.data as any).color || 'yellow'}
          onColorChange={(color) => handleColorChange(selectedNote.id, color)}
          onDelete={() => handleDeleteNote(selectedNote.id)}
        />
      )}
      
      {/* Document Toolbar - appears when a document is selected */}
      {selectedDocument && documentToolbarPosition && (
        <DocumentToolbar
          position={documentToolbarPosition}
          onReview={() => handleReviewDocument((selectedDocument.data as any).documentId)}
          onDelete={() => handleDeleteDocument(selectedDocument.id)}
        />
      )}
    </div>
  )
}

// Main component with provider
interface InvestigationBoardProps {
  caseId: string
  suspects: Suspect[]
  victim: Suspect
}

export function InvestigationBoard(props: InvestigationBoardProps) {
  return (
    <ReactFlowProvider>
      <InvestigationBoardContent {...props} />
    </ReactFlowProvider>
  )
}
