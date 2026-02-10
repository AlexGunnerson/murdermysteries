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
import { SuspectToolbar } from './SuspectToolbar'
import { EvidenceSelectorModal } from './EvidenceSelectorModal'
import { DocumentViewer } from '../detective-board/DocumentViewer'
import { DocumentHTMLViewer } from '../detective-board/DocumentHTMLViewer'
import { BlackmailViewer } from '../detective-board/BlackmailViewer'
import { BlackmailSceneViewer } from '../detective-board/BlackmailSceneViewer'
import { SecurityFootageViewer } from '../detective-board/SecurityFootageViewer'
import { SpeechNotes } from '../SpeechNotes'
import { CallLog } from '../CallLog'
import { VeronicaThankYouNote } from '../VeronicaThankYouNote'
import { SuspectDossierView } from '../detective-board/SuspectDossierView'
import { ValeNotesPage1, ValeNotesPage2 } from '../documents/ValeNotesDocs'
import { CoronerReportPage1, CoronerReportPage2, CoronerReportPage3 } from '../documents/CoronerReportDocs'
import { useInvestigationBoardStore } from './useInvestigationBoardStore'
import { calculateInitialLayout, generateConnectionId } from './utils'
import { ConnectionType } from './types'
import { useGameState } from '@/lib/hooks/useGameState'
import { QuickNoteButton } from '../QuickNoteButton'

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
  const { unlockedContent, updateChecklistProgress } = useGameState()
  const {
    loadState,
    saveState,
    applyStoredPositions,
    getStoredEdges,
  } = useInvestigationBoardStore(caseId)
  
  // Track tutorial progress when board loads
  useEffect(() => {
    updateChecklistProgress('viewedInvestigationBoard', true)
  }, [updateChecklistProgress])
  
  // Board state (mode removed - always in select/interact mode)
  const [nodes, setNodes, onNodesChangeBase] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState([] as Edge[])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isEvidenceSelectorOpen, setIsEvidenceSelectorOpen] = useState(false)
  const [evidenceSelectorInitialTab, setEvidenceSelectorInitialTab] = useState<'photos' | 'documents'>('photos')
  const [copiedNode, setCopiedNode] = useState<Node | null>(null)
  const [reviewingDocument, setReviewingDocument] = useState<{ title: string; images: string[] } | null>(null)
  const [reviewingHTMLDocument, setReviewingHTMLDocument] = useState<{ title: string; documentId: string } | null>(null)
  const [reviewingSecurityFootage, setReviewingSecurityFootage] = useState<string[] | null>(null)
  const [chatSuspect, setChatSuspect] = useState<any | null>(null)
  const [storyConfig, setStoryConfig] = useState<any | null>(null)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })
  const [isMoving, setIsMoving] = useState(false)
  const [isDraggingNode, setIsDraggingNode] = useState(false)
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Connection state to show dots on all nodes
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Use the base handlers directly
  const onNodesChange = useCallback((changes: any[]) => {
    const adjustedChanges = changes.map(change => {
      if (change.type === 'dimensions') {
        const node = nodes.find(n => n.id === change.id)
        if (node?.type === 'note' && node.style?.height && change.dimensions) {
          return {
            ...change,
            dimensions: {
              width: change.dimensions.width,
              height: node.style.height,
            },
          }
        }
      }
      return change
    })
    onNodesChangeBase(adjustedChanges)
  }, [onNodesChangeBase, nodes])
  const onEdgesChange = onEdgesChangeBase
  
  
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
    connectionType: 'connection',
  })
  
  // Ref to track if we've done initial save
  const hasInitializedRef = useRef(false)
  
  // Handle edge context menu
  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edgeId: string, connectionType?: ConnectionType) => {
    event.preventDefault()
    
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      edgeId,
      connectionType: connectionType || 'connection',
    })
  }, [])
  
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
    // Find the document node by documentId
    const docNode = nodes.find(node => 
      node.type === 'document' && 
      (node.data as any).documentId === documentId
    )
    
    if (docNode) {
      const docData = docNode.data as any
      
      // Check if it's security footage
      if (documentId === 'record_security_footage') {
        const images = docData.images || []
        setReviewingSecurityFootage(images)
      }
      // Check if it's an HTML document or document with custom viewer
      else if (docData.isHTML || 
          docData.isLetter ||
          documentId === 'record_blackmail_portrait' || 
          documentId.startsWith('record_blackmail_portrait_') ||
          documentId === 'record_blackmail_floor' ||
          documentId.startsWith('record_blackmail_floor_') ||
          documentId === 'record_speech_notes' ||
          documentId === 'record_coroner' ||
          documentId === 'record_phone_logs' ||
          documentId === 'record_veronica_thankyou') {
        setReviewingHTMLDocument({
          title: docData.title || 'Document',
          documentId: documentId
        })
      } else {
        // Regular image-based document
        const images = docData.images || (docData.documentUrl ? [docData.documentUrl] : [])
        setReviewingDocument({
          title: docData.title || 'Document',
          images: images
        })
      }
    }
  }, [nodes])
  
  // Listen for external note additions (from QuickNote button)
  useEffect(() => {
    const handleQuickNoteAdded = (e?: Event) => {
      console.log('[INVESTIGATION BOARD] === QUICK NOTE ADDED EVENT RECEIVED ===')
      console.log('[INVESTIGATION BOARD] Event detail:', e ? (e as CustomEvent).detail : 'N/A')
      console.log('[INVESTIGATION BOARD] isInitialized:', isInitialized)
      console.log('[INVESTIGATION BOARD] Current nodes count:', nodes.length)
      console.log('[INVESTIGATION BOARD] updateChecklistProgress function:', typeof updateChecklistProgress)
      
      if (!isInitialized) {
        console.log('[INVESTIGATION BOARD] Board not initialized yet, skipping')
        return
      }
      
      // Reload notes from storage
      const storedState = loadState()
      console.log('[INVESTIGATION BOARD] Loaded state:', storedState)
      console.log('[INVESTIGATION BOARD] Stored nodes:', storedState?.nodes?.length || 0)
      
      const existingNodeIds = new Set(nodes.map(n => n.id))
      console.log('[INVESTIGATION BOARD] Existing node IDs:', Array.from(existingNodeIds))
      
      // Find new notes that don't exist yet
      const newNotes = storedState?.nodes
        .filter(n => n?.id?.startsWith('note_') && !existingNodeIds.has(n.id))
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
          style: {
            width: n.width || 180,
          },
        })) || []
      
      console.log('[INVESTIGATION BOARD] New notes to add:', newNotes.length)
      console.log('[INVESTIGATION BOARD] New notes:', newNotes)
      
      if (newNotes.length > 0) {
        console.log('[INVESTIGATION BOARD] Adding notes to board...')
        setNodes(prev => {
          const updated = [...prev, ...newNotes]
          console.log('[INVESTIGATION BOARD] Updated nodes count:', updated.length)
          return updated
        })
        // Track tutorial progress when note is created via quick note button
        console.log('[INVESTIGATION BOARD] Calling updateChecklistProgress with madeNote=true')
        updateChecklistProgress('madeNote', true)
        console.log('[INVESTIGATION BOARD] updateChecklistProgress called successfully')
      } else {
        console.log('[INVESTIGATION BOARD] No new notes to add')
      }
      console.log('[INVESTIGATION BOARD] === END EVENT HANDLER ===')
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      // Check if it's our storage key (for cross-tab updates)
      if (e.key === `investigation-board-state-${caseId}` && e.newValue && isInitialized) {
        handleQuickNoteAdded()
      }
    }
    
    window.addEventListener('quickNoteAdded', handleQuickNoteAdded)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('quickNoteAdded', handleQuickNoteAdded)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [caseId, isInitialized, nodes, loadState, handleUpdateNote, handleDeleteNote, handleColorChange, setNodes, updateChecklistProgress])
  
  // Check for new notes when board becomes initialized
  useEffect(() => {
    if (!isInitialized) return
    
    // Small delay to ensure nodes state is set
    const timeoutId = setTimeout(() => {
      // Reload notes from storage to catch any that were added while board was closed
      const storedState = loadState()
      setNodes(prev => {
        const existingNodeIds = new Set(prev.map(n => n.id))
        
        const newNotes = storedState?.nodes
          .filter(n => n?.id?.startsWith('note_') && !existingNodeIds.has(n.id))
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
            style: {
              width: n.width || 180,
            },
          })) || []
        
        if (newNotes.length > 0) {
          console.log('Found new notes after initialization:', newNotes.length)
          return [...prev, ...newNotes]
        }
        return prev
      })
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [isInitialized, caseId, loadState, handleUpdateNote, handleDeleteNote, handleColorChange, setNodes])
  
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
        style: {
          width: n.width || 180,
        },
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
        resizing: true,
        style: {
          width: 200,
          height: 283,
        },
        width: 200,
        height: 283,
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
  
  // Initialize viewport state
  useEffect(() => {
    if (isInitialized) {
      const currentViewport = reactFlowInstance.getViewport()
      setViewport(currentViewport)
    }
  }, [isInitialized, reactFlowInstance])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current)
      }
    }
  }, [])
  
  // Update all nodes with connection state to show dots
  useEffect(() => {
    if (!isInitialized) return
    
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isConnecting,
        },
      }))
    )
  }, [isConnecting, isInitialized, setNodes])
  
  // Save state when nodes or edges change
  useEffect(() => {
    if (!hasInitializedRef.current) return
    
    // Don't save if we have suspiciously few nodes (prevents overwriting during React state updates)
    // Minimum is 6 nodes (5 suspects + 1 victim)
    if (nodes.length < 6) return
    
    // Strip connection state before saving (it's transient UI state)
    const nodesToSave = nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        isConnecting: undefined,
      }
    }))
    
    const currentViewport = reactFlowInstance.getViewport()
    saveState(nodesToSave, edges, currentViewport)
  }, [nodes, edges, reactFlowInstance, saveState])
  
  // Handle connection creation - create immediately with default 'connection' type
  const onConnect: OnConnect = useCallback((connection) => {
    if (!connection.source || !connection.target) return
    
    const newEdge: Edge = {
      id: generateConnectionId(),
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle || undefined,
      targetHandle: connection.targetHandle || undefined,
      type: 'redString',
      data: {
        connectionType: 'connection',
        onContextMenu: handleEdgeContextMenu,
      },
    }
    
    setEdges(prev => addEdge(newEdge, prev))
  }, [setEdges, handleEdgeContextMenu])
  
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
              connectionType: (oldEdge.data as any)?.connectionType || 'connection',
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
  
  // Handle connection start - show dots on all nodes
  const handleConnectStart = useCallback(() => {
    setIsConnecting(true)
  }, [])
  
  // Handle connection end - hide dots on all nodes
  const handleConnectEnd = useCallback(() => {
    setIsConnecting(false)
  }, [])
  
  // Detect handle drag start/end reliably
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest('.react-flow__handle')) {
        setIsConnecting(true)
      }
    }

    const handlePointerUp = () => {
      setIsConnecting(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])
  
  // Load story config and suspect metadata
  useEffect(() => {
    async function loadConfig() {
      try {
        const [metadataRes, storyRes] = await Promise.all([
          fetch(`/cases/${caseId}/metadata.json`),
          fetch(`/cases/${caseId}/story-config.json`)
        ])
        
        const metadata = await metadataRes.json()
        const story = await storyRes.json()
        
        setStoryConfig({
          metadata,
          story
        })
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }
    
    loadConfig()
  }, [caseId])
  
  // Handle opening chat with suspect/victim
  const handleOpenChat = useCallback((suspectId: string) => {
    if (!storyConfig) return
    
    // Handle victim (Reginald) - show dossier but with different info
    if (suspectId === 'victim_reginald') {
      setChatSuspect({
        id: 'victim_reginald',
        name: 'Reginald Ashcombe',
        role: 'The Victim',
        bio: 'Patriarch of the Ashcombe Estate and host of the annual charity gala. Found dead at the bottom of the grand staircase on the night of May 10th, 1986. The official ruling was accidental death, but his widow suspects murder.',
        portraitUrl: '/cases/case01/images/portraits/reginald.jpg',
        avatarUrl: '/cases/case01/images/portraits/reginald.jpg',
        veronicaNote: 'My husband. A man of high standards and unwavering principles. He believed in accountability and legacy above all else. His death was no accident—I know it in my bones.',
        age: 0,
      })
      return
    }
    
    // Find suspect in metadata
    const suspect = storyConfig.metadata.suspects.find((s: any) => s.id === suspectId)
    if (suspect) {
      setChatSuspect({
        ...suspect,
        age: 0, // Age not used in investigation board
      })
    }
  }, [storyConfig])
  
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
        },
      }
      
      setNodes(prev => [...prev, newNote])
      updateChecklistProgress('madeNote', true)
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
        
        // Close the evidence selector panel after dropping a photo
        setIsEvidenceSelectorOpen(false)
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
            x: position.x - 70, // Center the document (140px wide / 2)
            y: position.y - 99, // Center the document (198px tall / 2)
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
          resizing: true,
          style: {
            width: 140,
            height: 198,
          },
          width: 140,
          height: 198,
        }
        
        setNodes(prev => [...prev, newDocument])
        
        // Close the evidence selector panel after dropping a document
        setIsEvidenceSelectorOpen(false)
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
      
      // Delete selected edges (Delete or Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedEdges = edges.filter(edge => edge.selected)
        if (selectedEdges.length > 0) {
          e.preventDefault()
          setEdges(prev => prev.filter(edge => !edge.selected))
          return
        }
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
            style: {
              width: copiedNode.style?.width || 180,
            },
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
  }, [reactFlowInstance, nodes, edges, copiedNode, setNodes, setEdges, handleUpdateNote, handleDeleteNote])
  
  // Calculate toolbar position for selected note
  const selectedNote = nodes.find(n => n.selected && n.type === 'note')
  const noteToolbarPosition = selectedNote
    ? (() => {
        const { x: viewportX, y: viewportY, zoom } = viewport
        const nodeWidth = (selectedNote.style?.width as number) || (selectedNote.width || 180)
        const toolbarWidth = 200 // Approximate toolbar width
        const screenX = selectedNote.position.x * zoom + viewportX + (nodeWidth * zoom) / 2 - toolbarWidth / 2
        const screenY = selectedNote.position.y * zoom + viewportY - 50 // Position above the note
        // Keep toolbar within viewport bounds
        return { 
          x: Math.max(10, Math.min(screenX, window.innerWidth - toolbarWidth - 10)),
          y: Math.max(10, screenY)
        }
      })()
    : null
  
  // Calculate toolbar position for selected document
  const selectedDocument = nodes.find(n => n.selected && n.type === 'document')
  const documentToolbarPosition = selectedDocument
    ? (() => {
        const { x: viewportX, y: viewportY, zoom } = viewport
        const nodeWidth = (selectedDocument.style?.width as number) || (selectedDocument.width || 140)
        const toolbarWidth = 120 // Approximate toolbar width
        const screenX = selectedDocument.position.x * zoom + viewportX + (nodeWidth * zoom) - toolbarWidth + 20 // Align to right edge with offset to move further right
        const screenY = selectedDocument.position.y * zoom + viewportY - 50 // Position above the document
        // Keep toolbar within viewport bounds
        return { 
          x: Math.max(10, Math.min(screenX, window.innerWidth - toolbarWidth - 10)),
          y: Math.max(10, screenY)
        }
      })()
    : null
  
  // Calculate toolbar position for selected suspect/victim
  const selectedSuspect = nodes.find(n => n.selected && (n.type === 'suspect' || n.type === 'victim'))
  const suspectToolbarPosition = selectedSuspect
    ? (() => {
        const { x: viewportX, y: viewportY, zoom } = viewport
        const nodeWidth = 170 // Suspect card width is approximately 170px (150px + padding)
        const toolbarWidth = 40 // Approximate width of the compact toolbar
        const screenX = selectedSuspect.position.x * zoom + viewportX + (nodeWidth * zoom) - toolbarWidth - 4  // Position at right edge, moved further right
        const screenY = selectedSuspect.position.y * zoom + viewportY + 12 // Position at top with small padding
        // Keep toolbar within viewport bounds
        return { 
          x: Math.max(10, Math.min(screenX, window.innerWidth - toolbarWidth - 10)),
          y: Math.max(10, screenY)
        }
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
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onReconnect={handleReconnect}
        onEdgeContextMenu={(event, edge) => {
          event.preventDefault()
          handleEdgeContextMenu(event, edge.id, (edge.data as any)?.connectionType)
        }}
        onNodeDragStart={() => setIsDraggingNode(true)}
        onNodeDragStop={() => setIsDraggingNode(false)}
        onMove={(event, newViewport) => {
          setViewport(newViewport)
          setIsMoving(true)
          
          // Clear existing timeout
          if (moveTimeoutRef.current) {
            clearTimeout(moveTimeoutRef.current)
          }
          
          // Set new timeout to hide toolbars after movement stops
          moveTimeoutRef.current = setTimeout(() => {
            setIsMoving(false)
          }, 150)
        }}
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
      
      {/* Connection Context Menu */}
      <ConnectionContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        currentType={contextMenu.connectionType}
        onChangeType={handleChangeConnectionType}
        onDelete={handleDeleteEdge}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Note Toolbar - appears when a note is selected and board/node is not moving */}
      {!isMoving && !isDraggingNode && selectedNote && noteToolbarPosition && (
        <NoteToolbar
          key={selectedNote.id}
          position={noteToolbarPosition}
          currentColor={(selectedNote.data as any).color || 'yellow'}
          onColorChange={(color) => handleColorChange(selectedNote.id, color)}
          onDelete={() => handleDeleteNote(selectedNote.id)}
        />
      )}
      
      {/* Document Toolbar - appears when a document is selected and board/node is not moving */}
      {!isMoving && !isDraggingNode && selectedDocument && documentToolbarPosition && (
        <DocumentToolbar
          key={selectedDocument.id}
          position={documentToolbarPosition}
          onReview={() => handleReviewDocument((selectedDocument.data as any).documentId)}
          onDelete={() => handleDeleteDocument(selectedDocument.id)}
        />
      )}
      
      {/* Suspect Toolbar - appears when a suspect/victim is selected and board/node is not moving */}
      {!isMoving && !isDraggingNode && selectedSuspect && suspectToolbarPosition && (
        <SuspectToolbar
          key={selectedSuspect.id}
          position={suspectToolbarPosition}
          onChat={() => handleOpenChat((selectedSuspect.data as any).suspectId)}
          suspectName={(selectedSuspect.data as any).name}
          isVictim={(selectedSuspect.data as any).isVictim || selectedSuspect.type === 'victim'}
        />
      )}
      
      {/* Document Viewer Modal */}
      {reviewingDocument && (
        <DocumentViewer
          documentName={reviewingDocument.title}
          images={reviewingDocument.images}
          onClose={() => setReviewingDocument(null)}
        />
      )}
      
      {/* Security Footage Viewer */}
      {reviewingSecurityFootage && (
        <SecurityFootageViewer
          images={reviewingSecurityFootage}
          onClose={() => setReviewingSecurityFootage(null)}
        />
      )}
      
      {/* HTML Document Viewers */}
      {reviewingHTMLDocument && reviewingHTMLDocument.documentId === 'record_vale_notes' && (
        <DocumentHTMLViewer
          documentName={reviewingHTMLDocument.title}
          pages={[
            {
              label: "PAGE 1 OF 2",
              content: <ValeNotesPage1 />
            },
            {
              label: "PAGE 2 OF 2",
              content: <ValeNotesPage2 />
            }
          ]}
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Blackmail Papers - Found Behind Painting (Complete or Individual) */}
      {reviewingHTMLDocument && (reviewingHTMLDocument.documentId === 'record_blackmail_portrait' || reviewingHTMLDocument.documentId.startsWith('record_blackmail_portrait_')) && (
        <BlackmailViewer
          suspectId={reviewingHTMLDocument.documentId.startsWith('record_blackmail_portrait_') 
            ? reviewingHTMLDocument.documentId.replace('record_blackmail_portrait_', '') 
            : undefined}
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Blackmail Papers - Found Near Body (Missing Vale or Individual) */}
      {reviewingHTMLDocument && (reviewingHTMLDocument.documentId === 'record_blackmail_floor' || reviewingHTMLDocument.documentId.startsWith('record_blackmail_floor_')) && (
        <BlackmailSceneViewer
          suspectId={reviewingHTMLDocument.documentId.startsWith('record_blackmail_floor_') 
            ? reviewingHTMLDocument.documentId.replace('record_blackmail_floor_', '') 
            : undefined}
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Reginald's Speech Notes */}
      {reviewingHTMLDocument && reviewingHTMLDocument.documentId === 'record_speech_notes' && (
        <SpeechNotes
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Coroner's Report */}
      {reviewingHTMLDocument && reviewingHTMLDocument.documentId === 'record_coroner' && (
        <DocumentHTMLViewer
          documentName="Coroner's Report"
          pages={[
            {
              label: "PAGE 1 OF 3",
              content: <CoronerReportPage1 />
            },
            {
              label: "PAGE 2 OF 3",
              content: <CoronerReportPage2 />
            },
            {
              label: "PAGE 3 OF 3",
              content: <CoronerReportPage3 />
            }
          ]}
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Phone Records */}
      {reviewingHTMLDocument && reviewingHTMLDocument.documentId === 'record_phone_logs' && (
        <CallLog
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Veronica's Thank You Note */}
      {reviewingHTMLDocument && reviewingHTMLDocument.documentId === 'record_veronica_thankyou' && (
        <VeronicaThankYouNote
          onClose={() => setReviewingHTMLDocument(null)}
        />
      )}
      
      {/* Suspect Chat Modal */}
      {chatSuspect && storyConfig && (
        <SuspectDossierView
          suspect={chatSuspect}
          suspectPersonality={storyConfig.story.suspects[chatSuspect.id]?.personality || ''}
          suspectAlibi={storyConfig.story.suspects[chatSuspect.id]?.alibi || ''}
          systemPrompt={storyConfig.story.systemPrompt || ''}
          onClose={() => setChatSuspect(null)}
        />
      )}

      {/* Quick Note Button */}
      <QuickNoteButton />
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
