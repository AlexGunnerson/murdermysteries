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

import FactCardNode from './nodes/FactCardNode'
import SuspectCardNode from './nodes/SuspectCardNode'
import NoteNode from './nodes/NoteNode'
import PhotoNode from './nodes/PhotoNode'
import RedStringEdge from './edges/RedStringEdge'
import { ConnectionTypePopup } from './ConnectionTypePopup'
import { ConnectionContextMenu } from './ConnectionContextMenu'
import { LeftPanel } from './LeftPanel'
import { NoteToolbar } from './NoteToolbar'
import { PhotoSelectorModal } from './PhotoSelectorModal'
import { useInvestigationBoardStore } from './useInvestigationBoardStore'
import { factToNodeData, calculateInitialLayout, generateConnectionId, createFactNode } from './utils'
import { ConnectionType } from './types'
import { DiscoveredFact } from '@/lib/store/gameStore'
import { useGameState } from '@/lib/hooks/useGameState'

// Define custom node types
const nodeTypes = {
  fact: FactCardNode,
  suspect: SuspectCardNode,
  victim: SuspectCardNode,
  note: NoteNode,
  photo: PhotoNode,
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
  discoveredFacts: DiscoveredFact[]
  suspects: Suspect[]
  victim: Suspect
}

function InvestigationBoardContent({
  caseId,
  discoveredFacts,
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
    getPlacedFactIds,
  } = useInvestigationBoardStore(caseId)
  
  // Board state (mode removed - always in select/interact mode)
  const [nodes, setNodes, onNodesChangeBase] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState([] as Edge[])
  const [isInitialized, setIsInitialized] = useState(false)
  const [placedFactIds, setPlacedFactIds] = useState<Set<string>>(new Set())
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isPhotoSelectorOpen, setIsPhotoSelectorOpen] = useState(false)
  const [copiedNode, setCopiedNode] = useState<Node | null>(null)
  
  // Wrap onNodesChange to track when fact nodes are deleted
  const onNodesChange = useCallback((changes: any[]) => {
    // Check if any nodes are being removed
    const removedNodeIds = changes
      .filter(change => change.type === 'remove')
      .map(change => change.id)
    
    // Update placedFactIds if any fact nodes were removed
    if (removedNodeIds.length > 0) {
      setPlacedFactIds(prev => {
        const newSet = new Set(prev)
        removedNodeIds.forEach(id => {
          // Remove from placed facts if it's a fact node
          if (id.startsWith('fact_') || discoveredFacts.some(f => f.id === id)) {
            newSet.delete(id)
          }
        })
        return newSet
      })
    }
    
    // Call the original handler
    onNodesChangeBase(changes)
  }, [onNodesChangeBase, discoveredFacts])
  
  // Use the base onEdgesChange directly
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
  
  // Initialize board with suspects and victim only (facts are added via drag-and-drop)
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
    
    // Get placed fact IDs from stored state
    const storedPlacedFactIds = getPlacedFactIds(storedState)
    const placedFactIdsSet = new Set(storedPlacedFactIds)
    
    // For backward compatibility: if stored state has fact nodes but no placedFactIds,
    // assume all fact nodes in stored state were placed
    if (storedState && storedState.nodes.some(n => n?.id?.startsWith('fact_')) && storedPlacedFactIds.length === 0) {
      storedState.nodes.forEach(n => {
        if (n?.id?.startsWith('fact_')) {
          placedFactIdsSet.add(n.id)
        }
      })
    }
    
    // Add fact nodes for placed facts
    const factNodes: Node[] = discoveredFacts
      .filter(fact => placedFactIdsSet.has(fact.id))
      .map(fact => {
        const factData = factToNodeData(fact)
        // Try to get stored position, otherwise use a default position
        const storedNode = storedState?.nodes.find(n => n.id === fact.id)
        return {
          id: fact.id,
          type: 'fact' as const,
          position: storedNode?.position || { x: 400, y: 200 },
          data: factData,
          draggable: true,
        }
      })
    
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
    
    flowNodes = [...flowNodes, ...factNodes, ...noteNodes, ...photoNodes]
    
    // Apply stored positions if available
    const nodesWithPositions = applyStoredPositions(flowNodes, storedState)
    
    // Get stored edges
    const storedEdges = getStoredEdges(storedState, handleEdgeContextMenu)
    
    setNodes(nodesWithPositions)
    setEdges(storedEdges)
    setPlacedFactIds(placedFactIdsSet)
    setIsInitialized(true)
    hasInitializedRef.current = true
    
    // Always fit view on initial load, regardless of stored viewport
    // This ensures the default zoom is applied
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.6, duration: 0 })
    }, 100)
  }, [
    discoveredFacts,
    suspects,
    victim,
    isInitialized,
    loadState,
    applyStoredPositions,
    getStoredEdges,
    getPlacedFactIds,
    setNodes,
    setEdges,
    handleEdgeContextMenu,
    handleUpdateNote,
    handleDeleteNote,
    handleColorChange,
    handleDeletePhoto,
    handlePhotoClick,
    reactFlowInstance,
  ])
  
  // No longer automatically add new facts to the board when discovered
  // Facts must be manually dragged from the FactsPanel
  
  // Save state when nodes or edges change
  useEffect(() => {
    if (!hasInitializedRef.current) return
    
    const viewport = reactFlowInstance.getViewport()
    saveState(nodes, edges, viewport, Array.from(placedFactIds))
  }, [nodes, edges, placedFactIds, reactFlowInstance, saveState])
  
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
  
  // Handle fact drag start from FactsPanel
  const handleFactDragStart = useCallback((fact: DiscoveredFact, event: React.DragEvent) => {
    // Store fact data in drag event
    event.dataTransfer.setData('application/fact', JSON.stringify(factToNodeData(fact)))
    event.dataTransfer.effectAllowed = 'copy'
  }, [])
  
  // Handle drag over canvas (required to enable drop)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])
  
  // Handle drop on canvas (facts, notes, and photos)
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
    
    // Handle fact drop
    const factDataStr = event.dataTransfer.getData('application/fact')
    if (!factDataStr) return
    
    try {
      const factData = JSON.parse(factDataStr)
      
      // Check if fact is already placed
      if (placedFactIds.has(factData.id)) {
        console.log('Fact already placed on board')
        return
      }
      
      // Create new fact node
      const newNode = createFactNode(factData, position)
      
      // Add node to board
      setNodes(prev => [...prev, newNode])
      
      // Track that this fact has been placed
      setPlacedFactIds(prev => new Set([...prev, factData.id]))
    } catch (error) {
      console.error('Failed to drop fact:', error)
    }
  }, [placedFactIds, reactFlowInstance, setNodes, handleUpdateNote, handleDeleteNote, handleColorChange, handleDeletePhoto, handlePhotoClick])
  
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
  
  // Handle clicking on canvas to close panel
  const handlePaneClick = useCallback(() => {
    if (isPanelOpen) {
      setIsPanelOpen(false)
    }
  }, [isPanelOpen])
  
  // Calculate toolbar position for selected note
  const selectedNote = nodes.find(n => n.selected && n.type === 'note')
  const toolbarPosition = selectedNote
    ? (() => {
        const { x: viewportX, y: viewportY, zoom } = reactFlowInstance.getViewport()
        const nodeWidth = (selectedNote.style?.width as number) || (selectedNote.width || 180)
        const screenX = selectedNote.position.x * zoom + viewportX + (nodeWidth * zoom) / 2
        const screenY = selectedNote.position.y * zoom + viewportY - 50 // Position above the note
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
        onPaneClick={handlePaneClick}
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
        discoveredFacts={discoveredFacts}
        onFactDragStart={handleFactDragStart}
        placedFactIds={placedFactIds}
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onFitView={() => reactFlowInstance.fitView({ padding: 0.60 })}
        onPhotoClick={() => setIsPhotoSelectorOpen(true)}
        isOpen={isPanelOpen}
        setIsOpen={setIsPanelOpen}
      />
      
      {/* Photo Selector Modal */}
      <PhotoSelectorModal
        isOpen={isPhotoSelectorOpen}
        onClose={() => setIsPhotoSelectorOpen(false)}
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
      {selectedNote && toolbarPosition && (
        <NoteToolbar
          position={toolbarPosition}
          currentColor={(selectedNote.data as any).color || 'yellow'}
          onColorChange={(color) => handleColorChange(selectedNote.id, color)}
          onDelete={() => handleDeleteNote(selectedNote.id)}
        />
      )}
    </div>
  )
}

// Main component with provider
interface InvestigationBoardProps {
  caseId: string
  discoveredFacts: DiscoveredFact[]
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
