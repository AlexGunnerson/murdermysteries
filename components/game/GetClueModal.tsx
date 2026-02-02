"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Lightbulb } from 'lucide-react'
import { useGameState } from '@/lib/hooks/useGameState'

interface GetClueModalProps {
  isOpen: boolean
  onClose: () => void
  currentStage: 'start' | 'act_i' | 'act_ii'
  sessionId: string | null
}

// Static clues for Act I
const ACT_I_CLUES = [
  "Review each of the documents carefully — what are the facts? Do any of the photos contradict these 'facts'?",
  "A man's habits are recorded somewhere. Do his final moments match those habits?",
  "The family physician keeps detailed records. What do those records say about Reginald's health?"
]

// Map stages to display names
const getPhaseDisplay = (stage: 'start' | 'act_i' | 'act_ii'): string => {
  if (stage === 'start' || stage === 'act_i') return 'ACT I'
  return 'ACT II'
}

// Get objective text for each phase
const getObjectiveText = (stage: 'start' | 'act_i' | 'act_ii'): string => {
  if (stage === 'start' || stage === 'act_i') {
    return 'Prove this was not an accident. Examine the crime scene and find contradictions in the official story.'
  }
  return 'Identify the killer. Question suspects, gather evidence, and build your case.'
}

// Placeholder clue limits (will be configurable later)
const getClueLimit = (stage: 'start' | 'act_i' | 'act_ii'): number => {
  if (stage === 'start' || stage === 'act_i') return 3
  return 3
}

export function GetClueModal({ isOpen, onClose, currentStage, sessionId }: GetClueModalProps) {
  const { actICluesUsed, incrementActIClue } = useGameState()
  const [isLoading, setIsLoading] = useState(false)
  const [clueText, setClueText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(isOpen)

  // Ensure currentStage has a valid value
  const safeCurrentStage = currentStage || 'start'
  const phaseDisplay = getPhaseDisplay(safeCurrentStage)
  const objectiveText = getObjectiveText(safeCurrentStage)
  const clueLimit = getClueLimit(safeCurrentStage)
  const isActI = safeCurrentStage === 'start' || safeCurrentStage === 'act_i'
  
  // Track if modal is open to prevent state updates after close
  useEffect(() => {
    isMountedRef.current = isOpen
  }, [isOpen])

  const handleGetClue = async () => {
    // For Act I, use static clues
    if (isActI) {
      if (actICluesUsed >= ACT_I_CLUES.length) {
        setError('No more clues available')
        return
      }
      
      setClueText(ACT_I_CLUES[actICluesUsed])
      incrementActIClue()
      return
    }

    // For Act II, use AI-generated clues (future enhancement)
    if (!sessionId) {
      setError('No active game session found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/game/actions/clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Failed to get clue')
      }

      const data = await response.json()
      
      // Only update state if modal is still open
      if (isMountedRef.current) {
        setClueText(data.clue)
      }
    } catch (err) {
      // Only show error if modal is still open
      if (isMountedRef.current) {
        setError('Failed to retrieve clue. Please try again.')
        console.error('Error fetching clue:', err)
      }
    } finally {
      // Only update loading state if modal is still open
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  const handleClose = () => {
    // Reset state when closing
    setClueText(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div 
          className="relative w-full max-w-xl mx-auto rounded-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-[60] p-2 text-[#d4af37]/60 hover:text-[#d4af37] transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="bg-[#1a1a1a] p-8 relative">
            {!clueText ? (
              <>
                {/* Phase and Objective */}
                <div className="mb-6">
                  <span 
                    className="text-lg uppercase tracking-wider text-[#d4af37] block mb-4"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {phaseDisplay}
                  </span>
                  <p 
                    className="text-[#e8e4da]/90 text-lg leading-relaxed"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {objectiveText}
                  </p>
                </div>

                {/* Get Clue Button */}
                <div className="flex justify-center mb-5">
                  <button
                    onClick={handleGetClue}
                    disabled={isLoading || (isActI && actICluesUsed >= ACT_I_CLUES.length)}
                    className="px-8 py-3 text-base uppercase tracking-wider transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    <Lightbulb className="w-5 h-5" />
                    {isLoading ? 'Thinking...' : (isActI && actICluesUsed >= ACT_I_CLUES.length) ? 'No Clues Remaining' : 'Get Clue'}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <p 
                    className="text-red-400/80 text-base text-center mb-4"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {error}
                  </p>
                )}

                {/* Clue Counter */}
                <p 
                  className="text-[#d4af37]/60 text-base text-center"
                  style={{ fontFamily: "'Courier Prime', monospace" }}
                >
                  {isActI ? `${clueLimit - actICluesUsed} of ${clueLimit} remaining` : `Clues available`}
                </p>
              </>
            ) : (
              <>
                {/* Clue Header */}
                <div className="flex items-center gap-3 mb-5">
                  <Lightbulb className="w-5 h-5 text-[#d4af37]" />
                  <span 
                    className="text-lg uppercase tracking-wider text-[#d4af37]"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    Clue
                  </span>
                  <div className="flex-1 h-px bg-[#d4af37]/20"></div>
                </div>

                {/* Clue Text */}
                <div className="mb-6 p-5 bg-black/20 border-l-2 border-[#d4af37]/30">
                  <p 
                    className="text-[#e8e4da]/90 text-lg leading-relaxed"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {clueText}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <p 
                    className="text-[#d4af37]/60 text-base"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {isActI ? `${actICluesUsed} of ${clueLimit} used` : `Clue provided`}
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2 text-base uppercase tracking-wider transition-colors duration-200 text-[#d4af37]/60 hover:text-[#d4af37]"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
