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

// Act II Clues by Phase
const ACT_II_PHASE_1_CLUES = [
  "The widow's note is grateful, but is it accurate? Compare her words to the evidence.",
  "Veronica's note says everyone had blackmail. But when you look at the papers found near the body, someone seems to be missing.",
  "Veronica's note mentions everyone had blackmail, but Dr. Vale's page is missing from the papers found near the body. Ask Veronica about this."
]

const ACT_II_PHASE_2_CLUES = [
  "The bedroom holds memories. Some are displayed. Others are hidden."
]

const ACT_II_PHASE_3A_CLUES = [
  "The phone logs reveal Vale wasn't where he claimed to be. But motive matters just as much as opportunity. Identify the motive, and confront Dr. Vale."
]

const ACT_II_PHASE_3B_CLUES = [
  "Vale admits the blackmail exists, but he's standing firm on his alibi. Disprove his alibi and confront him."
]

// Final Phase Clues - Categorized by investigation aspect
const FINAL_PHASE_WHO_CLUES = [
  "Killers often leave something behind. Examine the crime scene photos carefully.",
  "The study holds evidence of a struggle. Look closely at the study photos, is there anything that places a member of the inner circle in the study?",
  "A torn white glove on the study desk matches one worn by a guest that evening. Check the photographs of the gala attendees."
]

const FINAL_PHASE_MOTIVE_CLUES = [
  "Dr. Vale's blackmail was missing from the 1st set. Is there anything else unusual about the blackmail documents?",
  "If someone altered their blackmail documents, comparing both sets might reveal what they were desperate to hide."
]

const FINAL_PHASE_WHERE_CLUES = [
  "Reginald's body was found at the staircase, but was that where he died? Look for evidence of his presence elsewhere."
]

// Helper to check if player is in final phase (ready to make accusation)
function isInFinalPhase(gameState: {
  unlockedContent: { scenes: Set<string>, records: Set<string> }
}): boolean {
  const studyUnlocked = gameState.unlockedContent.scenes.has('scene_study')
  const secondBlackmailRetrieved = gameState.unlockedContent.records.has('record_blackmail_portrait')
  
  // Final phase: Study unlocked and both blackmail sets available
  return studyUnlocked && secondBlackmailRetrieved
}

// Helper to determine Act II phase and available clues
function getActIIPhaseAndClues(gameState: {
  unlockedContent: { scenes: Set<string>, records: Set<string> }
  chatHistory: Array<{ suspectId: string, role: 'user' | 'assistant', content: string }>
}): { phase: string, clues: string[], maxClues: number } {
  // Check if in final phase first
  if (isInFinalPhase(gameState)) {
    return { phase: 'Final Phase - Make Accusation', clues: [], maxClues: 0 }
  }
  
  const masterBedroomUnlocked = gameState.unlockedContent.scenes.has('scene_master_bedroom')
  const secondBlackmailRetrieved = gameState.unlockedContent.records.has('record_blackmail_portrait')
  
  // Check if evidence was shown to Vale in chat
  const valeChats = gameState.chatHistory.filter(msg => msg.suspectId === 'suspect_vale')
  const phoneLogsShownToVale = valeChats.some(msg => 
    msg.role === 'user' && msg.content.includes('record_phone_logs')
  )
  const blackmailShownToVale = valeChats.some(msg => 
    msg.role === 'user' && (
      msg.content.includes('record_blackmail_portrait') ||
      msg.content.includes('record_blackmail_portrait_vale')
    )
  )
  
  // Phase 3: Second blackmail retrieved, need to confront Vale
  if (secondBlackmailRetrieved) {
    // Scenario 3A: Phone records shown but not blackmail
    if (phoneLogsShownToVale && !blackmailShownToVale) {
      return { phase: 'Phase 3A - Confront Vale with Motive', clues: ACT_II_PHASE_3A_CLUES, maxClues: 1 }
    }
    // Scenario 3B: Blackmail shown but not phone records
    if (blackmailShownToVale && !phoneLogsShownToVale) {
      return { phase: 'Phase 3B - Confront Vale with Alibi', clues: ACT_II_PHASE_3B_CLUES, maxClues: 1 }
    }
    // If both or neither shown, player probably doesn't need hints for this phase
    return { phase: 'Phase 3 - Complete', clues: [], maxClues: 0 }
  }
  
  // Phase 2: Master bedroom unlocked but painting not retrieved
  if (masterBedroomUnlocked) {
    return { phase: 'Phase 2 - Search the Bedroom', clues: ACT_II_PHASE_2_CLUES, maxClues: 1 }
  }
  
  // Phase 1: Master bedroom locked, need to notice Vale's missing page
  return { phase: 'Phase 1 - Missing Evidence', clues: ACT_II_PHASE_1_CLUES, maxClues: 3 }
}

// Map stages to display names
const getPhaseDisplay = (stage: 'start' | 'act_i' | 'act_ii'): string => {
  if (stage === 'start' || stage === 'act_i') return 'ACT I'
  return 'ACT II'
}

// Get objective text for each phase
const getObjectiveText = (stage: 'start' | 'act_i' | 'act_ii'): string => {
  if (stage === 'start' || stage === 'act_i') {
    return 'Prove this was not an accident. Examine the photos and documents and find contradictions in the official story.'
  }
  return 'Identify the killer. Question suspects, gather evidence, and build your case.'
}

type FinalPhaseCategory = 'who' | 'motive' | 'where' | null

export function GetClueModal({ isOpen, onClose, currentStage, sessionId }: GetClueModalProps) {
  const { 
    actIViewedClues, 
    actIIViewedClues,
    finalPhaseWhoViewedClues,
    finalPhaseMotiveViewedClues,
    finalPhaseWhereViewedClues,
    addActIClue, 
    addActIIClue,
    addFinalPhaseWhoClue,
    addFinalPhaseMotiveClue,
    updateChecklistProgress,
    addFinalPhaseWhereClue,
    unlockedContent,
    chatHistory
  } = useGameState()
  const [isLoading, setIsLoading] = useState(false)
  const [currentClueIndex, setCurrentClueIndex] = useState<number>(0)
  const [viewMode, setViewMode] = useState<'viewing' | 'initial'>('initial')
  const [selectedCategory, setSelectedCategory] = useState<FinalPhaseCategory>(null)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(isOpen)
  
  // Track tutorial progress when modal opens
  useEffect(() => {
    if (isOpen) {
      updateChecklistProgress('viewedHint', true)
    }
  }, [isOpen, updateChecklistProgress])

  // Ensure currentStage has a valid value
  const safeCurrentStage = currentStage || 'start'
  const phaseDisplay = getPhaseDisplay(safeCurrentStage)
  const objectiveText = getObjectiveText(safeCurrentStage)
  const isActI = safeCurrentStage === 'start' || safeCurrentStage === 'act_i'
  
  // Check if in final phase
  const inFinalPhase = !isActI && isInFinalPhase({ unlockedContent })
  
  // For Act II, determine current phase and available clues
  const actIIPhaseInfo = !isActI && !inFinalPhase ? getActIIPhaseAndClues({ unlockedContent, chatHistory }) : null
  
  // Determine available new clues (not yet viewed)
  const availableNewActIClues = isActI ? ACT_I_CLUES.filter(clue => !actIViewedClues.includes(clue)) : []
  const availableNewActIIClues = actIIPhaseInfo?.clues.filter(clue => !actIIViewedClues.includes(clue)) ?? []
  
  // Get current viewed clues based on stage and category
  const getCurrentViewedClues = (): string[] => {
    if (inFinalPhase && selectedCategory) {
      switch (selectedCategory) {
        case 'who': return finalPhaseWhoViewedClues
        case 'motive': return finalPhaseMotiveViewedClues
        case 'where': return finalPhaseWhereViewedClues
        default: return []
      }
    } else if (isActI) {
      return actIViewedClues
    } else {
      return actIIViewedClues
    }
  }
  
  const currentViewedClues = getCurrentViewedClues()
  
  // Track if modal is open to prevent state updates after close
  useEffect(() => {
    isMountedRef.current = isOpen
  }, [isOpen])

  // When modal opens, check if there are viewed clues and show the most recent one
  useEffect(() => {
    if (isOpen) {
      const viewedClues = getCurrentViewedClues()
      if (viewedClues.length > 0) {
        // Show most recent clue
        setViewMode('viewing')
        setCurrentClueIndex(viewedClues.length - 1)
      } else {
        // No clues viewed yet, show initial screen
        setViewMode('initial')
        setCurrentClueIndex(0)
      }
      setError(null)
    }
  }, [isOpen, isActI, inFinalPhase, selectedCategory])

  const handleGetClue = async () => {
    // For Act I, use static clues
    if (isActI) {
      if (availableNewActIClues.length === 0) {
        setError('No more clues available')
        return
      }
      
      const nextClue = availableNewActIClues[0]
      addActIClue(nextClue)
      setViewMode('viewing')
      setCurrentClueIndex(actIViewedClues.length) // Will be the new index after adding
      return
    }

    // For Act II, use phase-based static clues
    if (!actIIPhaseInfo) {
      setError('Unable to determine current phase')
      return
    }

    if (availableNewActIIClues.length === 0) {
      setError('No more clues available for your current progress')
      return
    }

    // Get the next available clue (first one that hasn't been viewed)
    const nextClue = availableNewActIIClues[0]
    addActIIClue(nextClue)
    setViewMode('viewing')
    setCurrentClueIndex(actIIViewedClues.length) // Will be the new index after adding
  }

  const handleFinalPhaseClue = (category: FinalPhaseCategory) => {
    if (!category) return
    
    let clueArray: string[] = []
    let viewedClues: string[] = []
    let addClue: (clueText: string) => void = () => {}
    
    switch (category) {
      case 'who':
        clueArray = FINAL_PHASE_WHO_CLUES
        viewedClues = finalPhaseWhoViewedClues
        addClue = addFinalPhaseWhoClue
        break
      case 'motive':
        clueArray = FINAL_PHASE_MOTIVE_CLUES
        viewedClues = finalPhaseMotiveViewedClues
        addClue = addFinalPhaseMotiveClue
        break
      case 'where':
        clueArray = FINAL_PHASE_WHERE_CLUES
        viewedClues = finalPhaseWhereViewedClues
        addClue = addFinalPhaseWhereClue
        break
    }
    
    const availableClues = clueArray.filter(clue => !viewedClues.includes(clue))
    
    if (availableClues.length === 0) {
      setError('No more hints available for this category')
      return
    }
    
    const nextClue = availableClues[0]
    addClue(nextClue)
    setSelectedCategory(category)
    setViewMode('viewing')
    setCurrentClueIndex(viewedClues.length) // Will be the new index after adding
  }

  const handleCategorySelect = (category: FinalPhaseCategory) => {
    if (!category) return
    
    // Clear any previous error
    setError(null)
    
    // Get the viewed clues for this category
    let viewedClues: string[] = []
    switch (category) {
      case 'who':
        viewedClues = finalPhaseWhoViewedClues
        break
      case 'motive':
        viewedClues = finalPhaseMotiveViewedClues
        break
      case 'where':
        viewedClues = finalPhaseWhereViewedClues
        break
    }
    
    // If there are viewed clues, navigate to the most recent one
    if (viewedClues.length > 0) {
      setSelectedCategory(category)
      setViewMode('viewing')
      setCurrentClueIndex(viewedClues.length - 1)
    } else {
      // No clues viewed yet, fetch the first clue
      handleFinalPhaseClue(category)
    }
  }

  const handleClose = () => {
    // Reset state when closing (but keep viewed clues in store)
    setSelectedCategory(null)
    setError(null)
    onClose()
  }

  const handlePrevious = () => {
    setCurrentClueIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentClueIndex(prev => Math.min(currentViewedClues.length - 1, prev + 1))
  }

  const handleNewClue = () => {
    if (inFinalPhase && selectedCategory) {
      handleFinalPhaseClue(selectedCategory)
    } else {
      handleGetClue()
    }
  }

  // Check if we're on the last viewed clue
  const isOnLastViewedClue = currentClueIndex === currentViewedClues.length - 1

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
            {viewMode === 'initial' ? (
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
                    {inFinalPhase ? 'Build your case and make the accusation. Select a category for assistance.' : objectiveText}
                  </p>
                </div>

                {inFinalPhase ? (
                  <>
                    {/* Final Phase: Category Selection */}
                    <div className="space-y-3 mb-5">
                      <button
                        onClick={() => handleCategorySelect('who')}
                        className="w-full px-6 py-4 text-left transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37]"
                        style={{ fontFamily: "'Courier Prime', monospace" }}
                      >
                        <div>
                          <div className="text-base uppercase tracking-wider font-bold mb-1">Who Did It?</div>
                          <div className="text-sm text-[#e8e4da]/60">Identify the killer</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleCategorySelect('motive')}
                        className="w-full px-6 py-4 text-left transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37]"
                        style={{ fontFamily: "'Courier Prime', monospace" }}
                      >
                        <div>
                          <div className="text-base uppercase tracking-wider font-bold mb-1">Motive</div>
                          <div className="text-sm text-[#e8e4da]/60">Why they did it</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleCategorySelect('where')}
                        className="w-full px-6 py-4 text-left transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37]"
                        style={{ fontFamily: "'Courier Prime', monospace" }}
                      >
                        <div>
                          <div className="text-base uppercase tracking-wider font-bold mb-1">Where</div>
                          <div className="text-sm text-[#e8e4da]/60">Location of the crime</div>
                        </div>
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
                  </>
                ) : (
                  <>
                    {/* Regular Phase: Single Get Clue Button */}
                    <div className="flex justify-center mb-5">
                      <button
                        onClick={handleGetClue}
                        disabled={
                          isLoading || 
                          (isActI && availableNewActIClues.length === 0) ||
                          (!isActI && availableNewActIIClues.length === 0)
                        }
                        className="px-8 py-3 text-base uppercase tracking-wider transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
                        style={{ fontFamily: "'Courier Prime', monospace" }}
                      >
                        <Lightbulb className="w-5 h-5" />
                        {isLoading ? 'Thinking...' : 'Get Clue'}
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <p 
                        className="text-red-400/80 text-base text-center"
                        style={{ fontFamily: "'Courier Prime', monospace" }}
                      >
                        {error}
                      </p>
                    )}
                  </>
                )}
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
                    {selectedCategory ? (
                      selectedCategory === 'who' ? 'Who Did It?' :
                      selectedCategory === 'motive' ? 'Motive' :
                      selectedCategory === 'where' ? 'Where' : 'Clue'
                    ) : 'Clue'}
                  </span>
                  <div className="flex-1 h-px bg-[#d4af37]/20"></div>
                </div>

                {/* Clue Text */}
                <div className="mb-6 p-5 bg-black/20 border-l-2 border-[#d4af37]/30">
                  <p 
                    className="text-[#e8e4da]/90 text-lg leading-relaxed"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {currentViewedClues[currentClueIndex]}
                  </p>
                </div>

                {/* Bottom Row - Navigation */}
                <div className="flex items-center justify-between">
                  {/* Previous Button - Only show if not on first clue */}
                  {currentClueIndex > 0 ? (
                    <button
                      onClick={handlePrevious}
                      className="px-5 py-2 text-base uppercase tracking-wider transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37]"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      ← Previous
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {/* Next or New Clue Button */}
                  {isOnLastViewedClue ? (
                    /* New Clue Button - shown when on last viewed clue */
                    <button
                      onClick={handleNewClue}
                      disabled={
                        (inFinalPhase && selectedCategory && 
                          (() => {
                            switch (selectedCategory) {
                              case 'who': return FINAL_PHASE_WHO_CLUES.filter(c => !finalPhaseWhoViewedClues.includes(c)).length === 0
                              case 'motive': return FINAL_PHASE_MOTIVE_CLUES.filter(c => !finalPhaseMotiveViewedClues.includes(c)).length === 0
                              case 'where': return FINAL_PHASE_WHERE_CLUES.filter(c => !finalPhaseWhereViewedClues.includes(c)).length === 0
                              default: return true
                            }
                          })()
                        ) ||
                        (isActI && availableNewActIClues.length === 0) ||
                        (!isActI && !inFinalPhase && availableNewActIIClues.length === 0)
                      }
                      className="px-5 py-2 text-base uppercase tracking-wider transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      New Clue
                    </button>
                  ) : (
                    /* Next Button - shown when not on last viewed clue */
                    <button
                      onClick={handleNext}
                      className="px-5 py-2 text-base uppercase tracking-wider transition-colors duration-200 border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 text-[#d4af37]/80 hover:text-[#d4af37]"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      Next →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
