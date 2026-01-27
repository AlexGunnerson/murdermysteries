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
    setTimeout(() => setIsShaking(false), 500)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[80]"
        onClick={handleBackdropClick}
      />

      {/* Draggable Sticky Note */}
      <Draggable
        nodeRef={draggableRef}
        handle=".drag-handle"
        bounds="parent"
        defaultPosition={{ x: 32, y: -280 }}
      >
        <div
          ref={draggableRef}
          className={`fixed z-[90] ${isShaking ? 'animate-shake' : ''}`}
          style={{
            width: '300px',
            height: '200px',
            bottom: '32px',
            left: '32px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Note */}
          <div
            className="w-full h-full shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #fef68a 0%, #fef08a 100%)',
              borderRadius: '2px',
              border: '1px solid #e5d968',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            {/* Drag Handle Area */}
            <div
              className="drag-handle w-full h-8 cursor-move flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 100%)',
              }}
            >
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-400/50" />
                <div className="w-1 h-1 rounded-full bg-gray-400/50" />
                <div className="w-1 h-1 rounded-full bg-gray-400/50" />
              </div>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 flex flex-col" style={{ height: 'calc(100% - 2rem)' }}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your note..."
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm text-gray-800 leading-relaxed nodrag"
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
                  className="p-2 rounded hover:bg-black/10 transition-colors"
                  title="Discard note (Esc)"
                >
                  <Trash2 className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium transition-colors flex items-center gap-1"
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

      {/* Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  )
}
