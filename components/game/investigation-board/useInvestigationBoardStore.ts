import { useCallback, useEffect, useState } from 'react'
import { Node, Edge, Viewport } from '@xyflow/react'
import { ConnectionType } from './types'

const STORAGE_KEY = 'investigation-board-state'

export interface StoredBoardState {
  nodes: Array<{
    id: string
    position: { x: number; y: number }
    width?: number
    height?: number
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
    data: {
      connectionType: ConnectionType
    }
  }>
  viewport: Viewport
}

export function useInvestigationBoardStore(caseId: string) {
  const storageKey = `${STORAGE_KEY}-${caseId}`
  
  // Load initial state from localStorage
  const loadState = useCallback((): StoredBoardState | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        
        // Migration: Remove any fact nodes from stored state
        if (parsed.nodes) {
          parsed.nodes = parsed.nodes.filter((node: any) => {
            // Remove fact nodes (by ID pattern or explicit check)
            return !node.id.startsWith('fact_')
          })
        }
        
        // Migration: Remove any edges connected to fact nodes
        if (parsed.edges && parsed.nodes) {
          const validNodeIds = new Set(parsed.nodes.map((n: any) => n.id))
          parsed.edges = parsed.edges.filter((edge: any) => {
            return validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
          })
        }
        
        // Remove deprecated placedFactIds field
        delete parsed.placedFactIds
        
        return parsed
      }
    } catch (error) {
      console.error('Failed to load board state from localStorage:', error)
    }
    return null
  }, [storageKey])
  
  // Save state to localStorage
  const saveState = useCallback((
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => {
    if (typeof window === 'undefined') return
    
    try {
      const state: StoredBoardState = {
        nodes: nodes.map(node => {
          const baseNode: any = {
            id: node.id,
            position: node.position,
            width: node.measured?.width || node.width,
            height: node.measured?.height || node.height,
          }
          
          // For note nodes, include the data (content and color)
          if (node.id.startsWith('note_')) {
            baseNode.data = {
              id: (node.data as any).id,
              content: (node.data as any).content,
              color: (node.data as any).color,
            }
          }
          
          return baseNode
        }),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
          data: {
            connectionType: (edge.data as any)?.connectionType || 'supports',
          },
        })),
        viewport,
      }
      
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save board state to localStorage:', error)
    }
  }, [storageKey])
  
  // Clear state from localStorage
  const clearState = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Failed to clear board state from localStorage:', error)
    }
  }, [storageKey])
  
  // Apply stored positions to nodes
  const applyStoredPositions = useCallback((
    nodes: Node[],
    storedState: StoredBoardState | null
  ): Node[] => {
    if (!storedState) return nodes
    
    const storedNodeMap = new Map(
      storedState.nodes.map(n => [n.id, n])
    )
    
    return nodes.map(node => {
      const stored = storedNodeMap.get(node.id)
      if (stored) {
        return {
          ...node,
          position: stored.position,
          width: stored.width,
          height: stored.height,
        }
      }
      return node
    })
  }, [])
  
  // Get stored edges
  const getStoredEdges = useCallback((
    storedState: StoredBoardState | null,
    onContextMenu: (event: React.MouseEvent, edgeId: string) => void
  ): Edge[] => {
    if (!storedState) return []
    
    return storedState.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'redString',
      data: {
        connectionType: edge.data.connectionType,
        onContextMenu,
      },
    }))
  }, [])
  
  return {
    loadState,
    saveState,
    clearState,
    applyStoredPositions,
    getStoredEdges,
  }
}
