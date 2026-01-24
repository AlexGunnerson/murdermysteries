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
  ReactFlowProvider,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import FactCardNode from './nodes/FactCardNode'
import SuspectCardNode from './nodes/SuspectCardNode'
import RedStringEdge from './edges/RedStringEdge'
import { BoardToolbar, BoardMode } from './BoardToolbar'
import { ConnectionTypePopup } from './ConnectionTypePopup'
import { ConnectionContextMenu } from './ConnectionContextMenu'
import { useInvestigationBoardStore } from './useInvestigationBoardStore'
import { factToNodeData, calculateInitialLayout, generateConnectionId } from './utils'
import { ConnectionType } from './types'
import { DiscoveredFact } from '@/lib/store/gameStore'

// Define custom node types
const nodeTypes = {
  fact: FactCardNode,
  suspect: SuspectCardNode,
  victim: SuspectCardNode,
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
  const {
    loadState,
    saveState,
    applyStoredPositions,
    getStoredEdges,
  } = useInvestigationBoardStore(caseId)
  
  // Board state (mode removed - always in select/interact mode)
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [isInitialized, setIsInitialized] = useState(false)
  
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
  
  // Initialize board with facts and suspects
  useEffect(() => {
    if (isInitialized) return
    if (discoveredFacts.length === 0 && suspects.length === 0) return
    
    // Convert facts to node data
    const factNodeData = discoveredFacts.map(factToNodeData)
    
    // Calculate initial layout
    const initialNodes = calculateInitialLayout(
      factNodeData,
      suspects,
      victim,
      1400, // canvas width
      900   // canvas height
    )
    
    // Convert to ReactFlow nodes
    const flowNodes: Node[] = initialNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      draggable: true,
    }))
    
    // Load stored state
    const storedState = loadState()
    
    // Apply stored positions if available
    const nodesWithPositions = applyStoredPositions(flowNodes, storedState)
    
    // Get stored edges
    const storedEdges = getStoredEdges(storedState, handleEdgeContextMenu)
    
    setNodes(nodesWithPositions)
    setEdges(storedEdges)
    setIsInitialized(true)
    hasInitializedRef.current = true
    
    // Fit view after a short delay
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 })
    }, 100)
  }, [
    discoveredFacts,
    suspects,
    victim,
    isInitialized,
    loadState,
    applyStoredPositions,
    getStoredEdges,
    setNodes,
    setEdges,
    handleEdgeContextMenu,
    reactFlowInstance,
  ])
  
  // Update nodes when facts change (new facts discovered)
  useEffect(() => {
    if (!isInitialized) return
    
    const existingFactIds = new Set(
      nodes.filter(n => n.type === 'fact').map(n => n.id)
    )
    
    const newFacts = discoveredFacts.filter(f => !existingFactIds.has(f.id))
    
    if (newFacts.length > 0) {
      const newNodes: Node[] = newFacts.map((fact, index): Node => ({
        id: fact.id,
        type: 'fact',
        position: {
          // Place new facts in "New Facts" area (top-left)
          x: 50 + (index % 3) * 220,
          y: 50 + Math.floor(index / 3) * 140,
        },
        data: factToNodeData(fact) as unknown as Record<string, unknown>,
        draggable: true,
      }))
      
      setNodes(prev => [...prev, ...newNodes])
    }
  }, [discoveredFacts, isInitialized, nodes, setNodes])
  
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
      // Calculate popup position (midpoint between nodes)
      const midX = (sourceNode.position.x + targetNode.position.x) / 2
      const midY = (sourceNode.position.y + targetNode.position.y) / 2
      
      // Convert to screen coordinates
      const { x, y, zoom } = reactFlowInstance.getViewport()
      const screenX = midX * zoom + x + window.innerWidth / 2
      const screenY = midY * zoom + y + window.innerHeight / 2
      
      setPendingConnection(connection)
      setConnectionPopupPosition({
        x: Math.min(screenX, window.innerWidth - 120),
        y: Math.min(screenY, window.innerHeight - 200),
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
  
  // Handle edge deletion
  const handleDeleteEdge = useCallback(() => {
    setEdges(prev => prev.filter(edge => edge.id !== contextMenu.edgeId))
  }, [contextMenu.edgeId, setEdges])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      switch (e.key.toLowerCase()) {
        case 'f':
          reactFlowInstance.fitView({ padding: 0.2 })
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
  }, [reactFlowInstance])
  
  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'redString',
        }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={[1, 2]}
        selectionOnDrag={true}
        selectNodesOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)',
        }}
        proOptions={{ hideAttribution: true }}
      >
        {/* Help text */}
        <Panel position="top-right" className="!m-4">
          <div 
            className="px-3 py-2 rounded-lg shadow-lg max-w-xs"
            style={{
              background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
              border: '1px solid #d4af37',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.1)',
            }}
          >
            <p 
              className="text-xs text-gray-300"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              Drag cards to move • Click cards to reveal connection points • Scroll to zoom • Right-click connections to edit
            </p>
          </div>
        </Panel>
      </ReactFlow>
      
      {/* Toolbar */}
      <BoardToolbar
        mode="select"
        onModeChange={() => {}}
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onFitView={() => reactFlowInstance.fitView({ padding: 0.2 })}
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
