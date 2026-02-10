"use client"

import { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Save, Trash2 } from 'lucide-react'

interface QuickNoteModalProps {
  isOpen: boolean
  onSave: (content: string) => void
  onClose: () => void
}

export function QuickNoteModal({ isOpen, onSave, onClose }: QuickNoteModalProps) {
  const [content, setContent] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const draggableRef = useRef<HTMLDivElement>(null)

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('')
    }
  }, [isOpen])

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim())
      setContent('')
      onClose()
    } else {
      // If empty, just close
      onClose()
    }
  }

  const handleDelete = () => {
    setContent('')
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on backdrop, not on modal
    if (e.target === e.currentTarget) {
      triggerShake()
    }
  }

  const triggerShake = () => {
    setIsShaking(true)
    setShowMessage(true)
    setTimeout(() => setIsShaking(false), 500)
    setTimeout(() => setShowMessage(false), 2500)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop for click detection (no visual effects) */}
      <div
        className="fixed inset-0 z-[80]"
        onClick={handleBackdropClick}
      />

      {/* Helper Message */}
      {showMessage && (
        <div
          className="fixed z-[85] animate-fade-in-out"
          style={{
            bottom: '528px', // 32px (bottom) + 280px (drag offset up) + 200px (note height) + 16px (spacing)
            left: '64px', // 32px (left) + 32px (drag offset right)
          }}
        >
          <div className="bg-[#1a1a1a] text-gray-300 border border-[#3d3d3d] text-xs px-4 py-2.5 rounded-lg shadow-md inline-block">
            <p className="text-center font-medium whitespace-nowrap">Save or discard your note to continue</p>
          </div>
        </div>
      )}

      {/* Draggable Sticky Note */}
      <Draggable
        nodeRef={draggableRef}
        handle=".drag-handle"
        bounds="parent"
        defaultPosition={{ x: 32, y: -280 }}
      >
        <div
          ref={draggableRef}
          className="fixed z-[90]"
          style={{
            width: '300px',
            height: '200px',
            bottom: '32px',
            left: '32px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Note with shake animation */}
          <div
            className={`w-full h-full shadow-2xl ${isShaking ? 'animate-shake' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '2px',
              border: '2px solid #3d3d3d',
              boxShadow: '0 8px 16px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drag Handle Area */}
            <div
              className="drag-handle w-full h-8 cursor-move flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                borderBottom: '1px solid #3d3d3d',
              }}
            >
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-500/70" />
                <div className="w-1 h-1 rounded-full bg-gray-500/70" />
                <div className="w-1 h-1 rounded-full bg-gray-500/70" />
              </div>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 flex flex-col" style={{ height: 'calc(100% - 2rem)' }}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your note..."
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm text-gray-100 leading-relaxed nodrag placeholder-gray-500"
                style={{
                  fontFamily: "'Courier Prime', 'Courier New', monospace",
                }}
                onKeyDown={(e) => {
                  // Save on Ctrl/Cmd + Enter
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault()
                    handleSave()
                  }
                  // Close on Escape
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    handleDelete()
                  }
                }}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleDelete}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  title="Discard note (Esc)"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 text-xs font-medium transition-colors flex items-center gap-1"
                  title="Save to Investigation Board (Ctrl+Enter)"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </Draggable>

      {/* Animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%, 75% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(4px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        
        .animate-fade-in-out {
          animation: fadeInOut 2.5s ease-in-out;
        }
      `}</style>
    </>
  )
}
