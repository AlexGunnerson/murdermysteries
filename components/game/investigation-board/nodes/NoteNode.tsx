"use client"

import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'

interface NoteNodeData {
  id: string
  content: string
  color: 'yellow' | 'blue' | 'pink' | 'green'
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, color: 'yellow' | 'blue' | 'pink' | 'green') => void
  autoFocus?: boolean
}

interface NoteNodeProps {
  data: NoteNodeData
  selected?: boolean
}

const colorStyles = {
  yellow: {
    background: 'linear-gradient(135deg, #fef68a 0%, #fef08a 100%)',
    border: '#e5d968',
  },
  blue: {
    background: 'linear-gradient(135deg, #a8d8ff 0%, #93c5fd 100%)',
    border: '#7cb3e0',
  },
  pink: {
    background: 'linear-gradient(135deg, #ffcce5 0%, #fbcfe8 100%)',
    border: '#f0a8cc',
  },
  green: {
    background: 'linear-gradient(135deg, #ccffcc 0%, #bbf7d0 100%)',
    border: '#a8e0a8',
  },
}

function NoteNode({ data, selected }: NoteNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(data.content)
  const [wasSelected, setWasSelected] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const colorStyle = colorStyles[data.color]

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

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="border-gray-400"
        handleClassName="h-3 w-3 bg-gray-400 border border-gray-600"
      />
      
      {/* Connection handles - invisible but functional */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-3 !h-3 !bg-transparent !border-0"
        style={{ opacity: 0, pointerEvents: 'auto' }}
      />

      {/* Custom visual dots at midpoints - only visible when selected */}
      {selected && (
        <>
          <div className="absolute pointer-events-none" style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
          <div className="absolute pointer-events-none" style={{ bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
          <div className="absolute pointer-events-none" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
          <div className="absolute pointer-events-none" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9CA3AF', borderRadius: '50%', zIndex: 10 }} />
        </>
      )}

      {/* Sticky Note */}
      <div
        className="relative w-full h-full min-w-[100px] min-h-[80px] p-4"
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
            className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-gray-800 leading-relaxed nodrag"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            placeholder="Type your note..."
          />
        ) : (
          <div 
            className="w-full h-full text-sm text-gray-800 leading-relaxed whitespace-pre-wrap cursor-text"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            {content}
          </div>
        )}
      </div>
    </>
  )
}

export default memo(NoteNode)
