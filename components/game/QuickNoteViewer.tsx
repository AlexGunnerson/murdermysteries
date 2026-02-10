"use client"

import { useState, useEffect, useRef } from 'react'
import Draggable from 'react-draggable'
import { Trash2, Plus, X } from 'lucide-react'
import { getQuickNotes, QuickNote } from '@/lib/utils/quickNotes'
import { useInvestigationBoardStore } from './investigation-board/useInvestigationBoardStore'

interface QuickNoteViewerProps {
  isOpen: boolean
  caseId: string
  onClose: () => void
  onNoteCreated: () => void
}

export function QuickNoteViewer({ isOpen, caseId, onClose, onNoteCreated }: QuickNoteViewerProps) {
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const draggableRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const boardStore = useInvestigationBoardStore(caseId)

  // Load notes when viewer opens
  useEffect(() => {
    if (isOpen) {
      const loadedNotes = getQuickNotes(caseId)
      setNotes(loadedNotes)
      
      // Select the first note by default if available
      if (loadedNotes.length > 0 && !selectedNoteId) {
        setSelectedNoteId(loadedNotes[0].id)
        setEditedContent(loadedNotes[0].content)
      }
    }
  }, [isOpen, caseId])

  // Update edited content when selection changes
  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId)
      if (note) {
        setEditedContent(note.content)
      }
    }
  }, [selectedNoteId, notes])

  const handleSave = () => {
    if (!selectedNoteId || !editedContent.trim()) return

    try {
      // Load current board state
      const storedState = boardStore.loadState()
      if (!storedState) return

      // Find and update the note node
      const updatedNodes = storedState.nodes.map((node: any) => {
        if (node.id === selectedNoteId) {
          return {
            ...node,
            data: {
              ...node.data,
              content: editedContent.trim(),
            },
          }
        }
        return node
      })

      // Save updated state
      boardStore.saveState(
        updatedNodes as any,
        storedState.edges as any,
        storedState.viewport
      )

      // Dispatch event to notify Investigation Board
      window.dispatchEvent(new CustomEvent('quickNoteUpdated', {
        detail: { noteId: selectedNoteId, caseId }
      }))

      // Reload notes to reflect changes
      const updatedNotes = getQuickNotes(caseId)
      setNotes(updatedNotes)
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleDelete = () => {
    if (!selectedNoteId) return

    try {
      // Load current board state
      const storedState = boardStore.loadState()
      if (!storedState) return

      // Filter out the deleted note
      const updatedNodes = storedState.nodes.filter((node: any) => node.id !== selectedNoteId)
      
      // Remove any edges connected to this note
      const updatedEdges = storedState.edges.filter((edge: any) => 
        edge.source !== selectedNoteId && edge.target !== selectedNoteId
      )

      // Save updated state
      boardStore.saveState(
        updatedNodes as any,
        updatedEdges as any,
        storedState.viewport
      )

      // Dispatch event to notify Investigation Board
      window.dispatchEvent(new CustomEvent('quickNoteDeleted', {
        detail: { noteId: selectedNoteId, caseId }
      }))

      // Reload notes
      const updatedNotes = getQuickNotes(caseId)
      setNotes(updatedNotes)

      // Close confirmation modal
      setShowDeleteConfirm(false)

      // If this was the last note, close the viewer
      if (updatedNotes.length === 0) {
        onClose()
      } else {
        // Select the first remaining note
        setSelectedNoteId(updatedNotes[0].id)
        setEditedContent(updatedNotes[0].content)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
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

  const getTruncatedPreview = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (!isOpen) return null

  const selectedNote = notes.find(n => n.id === selectedNoteId)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80]"
        onClick={handleBackdropClick}
      />

      {/* Helper Message */}
      {showMessage && (
        <div
          className="fixed z-[85] animate-fade-in-out"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, calc(-50% - 280px))',
          }}
        >
          <div className="bg-gray-200 text-gray-800 text-xs px-4 py-2.5 rounded-lg shadow-md inline-block">
            <p className="text-center font-medium whitespace-nowrap">Close the note viewer to continue</p>
          </div>
        </div>
      )}

      {/* Draggable Note Viewer */}
      <Draggable
        nodeRef={draggableRef}
        handle=".drag-handle"
        bounds="parent"
        defaultPosition={{ x: 0, y: -100 }}
      >
        <div
          ref={draggableRef}
          className="fixed z-[90]"
          style={{
            width: '700px',
            height: '500px',
            top: '50%',
            left: '50%',
            marginLeft: '-350px',
            marginTop: '-250px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Viewer Container */}
          <div
            className={`w-full h-full shadow-2xl flex flex-col ${isShaking ? 'animate-shake' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '2px',
              border: '2px solid #3d3d3d',
              boxShadow: '0 8px 16px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drag Handle */}
            <div
              className="drag-handle w-full h-8 cursor-move flex items-center justify-center flex-shrink-0 relative"
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
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Close viewer"
              >
                <X className="w-4 h-4 text-gray-300 hover:text-white" />
              </button>
            </div>

            {/* Two-Panel Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel - Note List */}
              <div 
                className="w-[250px] flex-shrink-0 flex flex-col"
                style={{
                  borderRight: '1px solid #3d3d3d',
                }}
              >
                {/* New Note Button */}
                <div className="p-3 border-b border-[#3d3d3d]">
                  <button
                    onClick={onNoteCreated}
                    className="w-full px-3 py-2 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plus className="w-3 h-3" />
                    New Note
                  </button>
                </div>

                {/* Note List */}
                <div className="flex-1 overflow-y-auto">
                  {notes.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      No notes yet
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`p-3 cursor-pointer border-b border-[#3d3d3d] transition-colors ${
                          selectedNoteId === note.id
                            ? 'bg-white/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <p
                          className="text-xs text-gray-200 leading-relaxed break-words"
                          style={{
                            fontFamily: "'Courier Prime', 'Courier New', monospace",
                          }}
                        >
                          {getTruncatedPreview(note.content)}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Panel - Note Detail */}
              <div className="flex-1 flex flex-col p-4">
                {selectedNote ? (
                  <>
                    <textarea
                      ref={textareaRef}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm text-gray-100 leading-relaxed mb-3 placeholder-gray-500"
                      style={{
                        fontFamily: "'Courier Prime', 'Courier New', monospace",
                      }}
                      onKeyDown={(e) => {
                        // Save on Ctrl/Cmd + S
                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                          e.preventDefault()
                          handleSave()
                        }
                        // Delete on Ctrl/Cmd + Delete
                        if ((e.ctrlKey || e.metaKey) && (e.key === 'Delete' || e.key === 'Backspace')) {
                          e.preventDefault()
                          setShowDeleteConfirm(true)
                        }
                        // Close on Escape
                        if (e.key === 'Escape') {
                          e.preventDefault()
                          onClose()
                        }
                      }}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-start items-center">
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3 py-2 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 transition-colors flex items-center gap-2"
                        title="Delete note (Ctrl+Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                    Select a note to view
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Draggable>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center"
          onClick={() => setShowDeleteConfirm(false)}
        >
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Confirmation Dialog */}
          <div
            className="relative z-10 p-6 rounded-lg shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              border: '2px solid #3d3d3d',
              minWidth: '300px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Delete Note?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 text-sm font-medium transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
