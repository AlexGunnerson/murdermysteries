"use client"

import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { QuickNoteModal } from './QuickNoteModal'
import { useGameState } from '@/lib/hooks/useGameState'
import { useInvestigationBoardStore } from './investigation-board/useInvestigationBoardStore'

export function QuickNoteButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { caseId, updateChecklistProgress } = useGameState()
  const caseIdFromPath = (() => {
    if (typeof window === 'undefined') return null
    const match = window.location.pathname.match(/\/game\/([^/]+)/)
    return match?.[1] || null
  })()
  const effectiveCaseId = caseIdFromPath || caseId || 'case01'
  const boardStore = useInvestigationBoardStore(effectiveCaseId)

  const getTopRightPosition = (storedState: any) => {
    const margin = 40
    const noteWidth = 180
    const noteHeight = 120
    
    // Simple fixed position in top-right area of board
    // React Flow coordinates: 0,0 is top-left of the canvas
    // Top-right would be around x: 1200-1400, y: 100-200
    const x = 1200
    const y = 100

    return { x, y, width: noteWidth, height: noteHeight }
  }

  const handleSaveNote = (content: string) => {
    console.log('[QUICK NOTE] Starting handleSaveNote')
    if (!effectiveCaseId) {
      console.error('[QUICK NOTE] No caseId available')
      return
    }

    // Load current board state
    const storedState = boardStore.loadState()
    const position = getTopRightPosition(storedState)
    
    // Create new note node
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('[QUICK NOTE] Created note with ID:', noteId)
    
    const newNote = {
      id: noteId,
      position: { x: position.x, y: position.y }, // Top-right of current board view
      width: position.width,
      height: position.height,
      data: {
        id: noteId,
        content: content,
        color: 'yellow' as const,
      },
    }

    // Add note to stored state
    const updatedNodes = [...(storedState?.nodes || []), newNote]
    const updatedEdges = storedState?.edges || []
    const viewport = storedState?.viewport || { x: 0, y: 0, zoom: 1 }

    // Save updated state
    boardStore.saveState(
      updatedNodes as any,
      updatedEdges as any,
      viewport
    )
    console.log('[QUICK NOTE] Saved note to board store')

    // Track progress immediately when note is created
    console.log('[QUICK NOTE] Updating checklist progress for madeNote')
    updateChecklistProgress('madeNote', true)
    console.log('[QUICK NOTE] Checklist progress updated')

    // Dispatch custom event to notify Investigation Board (if it's open)
    console.log('[QUICK NOTE] Dispatching quickNoteAdded event')
    window.dispatchEvent(new CustomEvent('quickNoteAdded', { 
      detail: { noteId, caseId: effectiveCaseId } 
    }))
    console.log('[QUICK NOTE] Event dispatched successfully')
  }

  return (
    <>
      {/* Quick Note Button */}
      <button
        data-tour-quick-note
        onClick={(e) => {
          e.stopPropagation()
          setIsModalOpen(true)
        }}
        className="fixed bottom-8 left-8 z-[70] p-3 bg-[#fef08a] hover:bg-[#fde047] text-gray-800 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
        title="Quick Note"
      >
        <StickyNote className="w-6 h-6" />
      </button>

      {/* Quick Note Modal */}
      <QuickNoteModal
        isOpen={isModalOpen}
        onSave={handleSaveNote}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
