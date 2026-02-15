"use client"

import { memo, useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Handle, Position, NodeResizer, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'

interface NoteNodeData {
  id: string
  content: string
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'noir'
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, color: 'yellow' | 'blue' | 'pink' | 'green' | 'noir') => void
  autoFocus?: boolean
  isConnecting?: boolean
}

interface NoteNodeProps {
  data: NoteNodeData
  selected?: boolean
}

const colorStyles = {
  yellow: {
    background: 'linear-gradient(135deg, #fef68a 0%, #fef08a 100%)',
    border: '#e5d968',
    textClass: 'text-gray-800',
  },
  blue: {
    background: 'linear-gradient(135deg, #a8d8ff 0%, #93c5fd 100%)',
    border: '#7cb3e0',
    textClass: 'text-gray-800',
  },
  pink: {
    background: 'linear-gradient(135deg, #ffcce5 0%, #fbcfe8 100%)',
    border: '#f0a8cc',
    textClass: 'text-gray-800',
  },
  green: {
    background: 'linear-gradient(135deg, #ccffcc 0%, #bbf7d0 100%)',
    border: '#a8e0a8',
    textClass: 'text-gray-800',
  },
  noir: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    border: '#3d3d3d',
    textClass: 'text-gray-100',
  },
}

function NoteNode({ data, selected }: NoteNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(data.content)
  const [wasSelected, setWasSelected] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const lastHeightRef = useRef<number | null>(null)
  const updateNodeInternals = useUpdateNodeInternals()
  const { setNodes, getNode, getViewport } = useReactFlow()
  const colorStyle = colorStyles[data.color] || colorStyles.noir

  // Auto-focus on mount if autoFocus is true
  useEffect(() => {
    if (data.autoFocus) {
      // Small delay to ensure node is rendered and selected
      setTimeout(() => {
        setIsEditing(true)
      }, 100)
    }
  }, []) // Only run on mount
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  // Auto-resize based on content
  useEffect(() => {
    const measureContent = () => {
      if (!nodeRef.current) return

      const currentWidth = nodeRef.current.offsetWidth || 180
      
      // Create a temporary measuring element
      const temp = document.createElement('div')
      temp.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${currentWidth - 32}px;
        font-family: 'Courier Prime', 'Courier New', monospace;
        font-size: 0.875rem;
        line-height: 1.625;
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 0;
      `
      temp.textContent = content || 'Type your note...'
      document.body.appendChild(temp)
      
      const contentHeight = temp.scrollHeight
      document.body.removeChild(temp)

      // Add padding (16px top + 16px bottom = 32px total)
      const totalHeight = Math.max(120, contentHeight + 32)
      
      // Update the container height
      if (lastHeightRef.current !== totalHeight) {
        lastHeightRef.current = totalHeight
        setNodes(prev =>
          prev.map(node =>
            node.id === data.id
              ? {
                  ...node,
                  style: {
                    ...node.style,
                    height: totalHeight,
                  },
                }
              : node
          )
        )
        // Notify React Flow that the node dimensions changed
        updateNodeInternals(data.id)
      }
    }

    // Delay measurement slightly to ensure content is rendered
    const timer = setTimeout(measureContent, 0)
    return () => clearTimeout(timer)
  }, [content, data.id, setNodes, updateNodeInternals])

  // Track selection state to enable click-to-edit
  useEffect(() => {
    if (selected && wasSelected && !isEditing) {
      // Was already selected, now clicked again - start editing
      setIsEditing(true)
    } else if (selected) {
      setWasSelected(true)
    } else {
      setWasSelected(false)
    }
  }, [selected])

  // Sync React Flow wrapper height to match computed note height
  useLayoutEffect(() => {
    const parent = nodeRef.current?.parentElement
    const styleHeight = getNode(data.id)?.style?.height
    if (parent && styleHeight && parent.style.height !== `${styleHeight}px`) {
      parent.style.height = `${styleHeight}px`
    }
  })

  const handleClick = (e: React.MouseEvent) => {
    if (selected && !isEditing) {
      // Already selected, start editing
      e.stopPropagation()
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (content !== data.content) {
      data.onUpdate(data.id, content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Stop propagation for Delete/Backspace when editing to prevent node deletion
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.stopPropagation()
    }
    
    if (e.key === 'Escape') {
      setIsEditing(false)
      setContent(data.content) // Reset to original
    }
    // Allow Ctrl+Enter or Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleBlur()
    }
  }

  const showConnectionDots = selected || data.isConnecting

  return (
    <div ref={nodeRef} className="relative w-full">
      <NodeResizer
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="border-gray-400"
        handleClassName="h-3 w-3 bg-gray-400 border border-gray-600"
        shouldResize={(event, params) => {
          // Only allow resizing from corner handles, not edges
          return params.direction[0] !== 0 && params.direction[1] !== 0
        }}
      />
      
      {/* Connection handles - optimized for better snap detection */}
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(-50%, -50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(-50%, 50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(-50%, 50%)'
        }}
      />
      
      {/* Left */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(-50%, -50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(50%, -50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(50%, -50%)'
        }}
      />

      {/* Custom visual dots at midpoints - visible when selected or near connection */}
      {showConnectionDots && (
        <>
          <div className="absolute pointer-events-none" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
          <div className="absolute pointer-events-none" style={{ bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
          <div className="absolute pointer-events-none" style={{ left: '-10px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
          <div className="absolute pointer-events-none" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
        </>
      )}

      {/* Sticky Note */}
      <div
        ref={noteRef}
        className="relative w-full min-w-[100px] min-h-[120px] p-4"
        style={{
          background: colorStyle.background,
          borderRadius: '2px',
          border: selected ? `2px solid #9CA3AF` : `1px solid ${colorStyle.border}`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
          transition: 'box-shadow 200ms',
        }}
        onClick={handleClick}
      >
        {/* Content */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden text-sm leading-relaxed nodrag placeholder-gray-500 ${colorStyle.textClass}`}
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            placeholder="Type your note..."
          />
        ) : (
          <div 
            ref={contentRef}
            className={`w-full h-full overflow-hidden text-sm leading-relaxed whitespace-pre-wrap cursor-text ${colorStyle.textClass}`}
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(NoteNode)
