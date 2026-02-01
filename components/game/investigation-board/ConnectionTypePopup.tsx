"use client"

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { ConnectionType, CONNECTION_TYPES } from './types'

interface ConnectionTypePopupProps {
  isOpen: boolean
  position: { x: number; y: number }
  currentType?: ConnectionType
  onSelect: (type: ConnectionType) => void
  onCancel: () => void
}

export function ConnectionTypePopup({
  isOpen,
  position,
  currentType,
  onSelect,
  onCancel,
}: ConnectionTypePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onCancel()
      }
    }
    
    if (isOpen) {
      // Delay to prevent immediate close on the same click
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onCancel])
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[99] bg-black/50"
        style={{ backdropFilter: 'blur(2px)' }}
      />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed z-[100] min-w-[200px] p-3 rounded-lg shadow-2xl"
        style={{
          left: position.x,
          top: position.y,
          background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
          border: '1px solid #d4af37',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15)',
          transform: 'translate(-50%, 10px)',
        }}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <h3 
          className="text-sm font-bold text-amber-400 uppercase tracking-wider"
          style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
        >
          {currentType ? 'Change Type' : 'Connection Type'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-amber-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Options */}
      <div className="flex flex-col gap-2">
        {(Object.entries(CONNECTION_TYPES) as [ConnectionType, typeof CONNECTION_TYPES[ConnectionType]][]).map(
          ([type, config]) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 group
                ${type === currentType 
                  ? 'bg-amber-600/20 text-amber-400' 
                  : 'hover:bg-gray-700/50'
                }
              `}
            >
              {/* Color indicator */}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 0 10px ${config.color}80`,
                }}
              />
              
              {/* Label */}
              <span
                className={`
                  text-sm transition-colors
                  ${type === currentType 
                    ? 'text-amber-400' 
                    : 'text-gray-300 group-hover:text-amber-400'
                  }
                `}
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
              >
                {config.label || 'Unlabeled'}
              </span>
              
              {/* Connection line preview */}
              <div className="flex-1 flex items-center justify-end">
                <div
                  className="h-0.5 w-8"
                  style={{ 
                    backgroundColor: config.color,
                    boxShadow: `0 0 4px ${config.color}60`,
                  }}
                />
                <div
                  className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px]"
                  style={{ borderLeftColor: config.color }}
                />
              </div>
              
              {/* Check mark for current type */}
              {type === currentType && (
                <span className="text-xs text-amber-500 ml-1">✓</span>
              )}
            </button>
          )
        )}
      </div>
      
      {/* Helper text */}
      <p 
        className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-500 text-center"
        style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
      >
        {currentType ? 'Change the connection type' : 'Select the type of connection'}
      </p>
      </div>
    </>
  )
}
