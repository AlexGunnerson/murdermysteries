"use client"

import { useEffect, useRef } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
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
    x: Math.min(position.x, window.innerWidth - 220),
    y: Math.min(position.y, window.innerHeight - 300),
  }
  
  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[200px] py-2 rounded-lg shadow-2xl"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '1px solid #d4af37',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15)',
      }}
    >
      {/* Change Type Section */}
      <div className="px-3 py-1">
        <p 
          className="text-xs text-gray-500 uppercase tracking-wider mb-2"
          style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
        >
          Change Type
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
                flex items-center gap-2 w-full px-2 py-1.5 rounded text-left transition-all duration-200
                ${type === currentType 
                  ? 'bg-amber-600/20 text-amber-400' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-amber-400'
                }
              `}
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 0 8px ${config.color}60`,
                }}
              />
              
              <span
                className="text-sm"
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
              >
                {config.label}
              </span>
              
              {type === currentType && (
                <span className="ml-auto text-xs text-amber-500">✓</span>
              )}
            </button>
          )
        )}
      </div>
      
      {/* Divider */}
      <div className="my-2 border-t border-gray-700" />
      
      {/* Delete option */}
      <div className="px-3">
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-left text-red-400 hover:bg-red-900/30 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
          <span
            className="text-sm"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            Remove Connection
          </span>
        </button>
      </div>
    </div>
  )
}
