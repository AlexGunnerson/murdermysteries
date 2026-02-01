"use client"

import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { ConnectionType, CONNECTION_TYPES } from './types'

interface ConnectionContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  currentType: ConnectionType
  onChangeType: (type: ConnectionType) => void
  onDelete: () => void
  onClose: () => void
}

export function ConnectionContextMenu({
  isOpen,
  position,
  currentType,
  onChangeType,
  onDelete,
  onClose,
}: ConnectionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  // Adjust position to keep menu in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 180),
    y: Math.min(position.y, window.innerHeight - 300),
  }
  
  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[160px] py-1.5 rounded-md shadow-2xl"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(63, 63, 70, 0.5)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Change Type Section */}
      <div className="px-2 py-1">
        <p 
          className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1 px-2"
          style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
        >
          Type
        </p>
        
        {(Object.entries(CONNECTION_TYPES) as [ConnectionType, typeof CONNECTION_TYPES[ConnectionType]][]).map(
          ([type, config]) => (
            <button
              key={type}
              onClick={() => {
                onChangeType(type)
                onClose()
              }}
              className={`
                relative flex items-center gap-2 w-full px-2 py-1 rounded transition-colors
                ${type === currentType 
                  ? 'text-zinc-100' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }
              `}
            >
              {/* Left accent line for selected item */}
              {type === currentType && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                  style={{
                    backgroundColor: config.color,
                  }}
                />
              )}
              
              {/* Color indicator */}
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 0 6px ${config.color}40`,
                }}
              />
              
              <span
                className="text-xs"
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
              >
                {config.label || 'Unlabeled'}
              </span>
              
              {type === currentType && (
                <span className="ml-auto text-[10px] text-zinc-400">✓</span>
              )}
            </button>
          )
        )}
      </div>
      
      {/* Divider */}
      <div className="my-1.5 border-t border-zinc-800" />
      
      {/* Delete option */}
      <div className="px-2">
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="flex items-center gap-2 w-full px-2 py-1 rounded text-left text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span
            className="text-xs"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            Remove
          </span>
        </button>
      </div>
    </div>
  )
}
