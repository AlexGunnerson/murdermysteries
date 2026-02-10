'use client'

import { useState, useMemo } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react'

const checklistItems = [
  { key: 'viewedObjective' as const, label: 'Viewed Objective' },
  { key: 'viewedSuspect' as const, label: 'Met the Suspects' },
  { key: 'chattedWithSuspect' as const, label: 'Chatted with a Suspect' },
  { key: 'viewedDocument' as const, label: 'Reviewed Documents' },
  { key: 'viewedScene' as const, label: 'Reviewed Scenes' },
  { key: 'madeNote' as const, label: 'Made a Note' },
  { key: 'viewedInvestigationBoard' as const, label: 'Viewed Investigation Board' },
  { key: 'submittedEvidence' as const, label: 'Submitted Evidence' },
  { key: 'viewedHint' as const, label: 'Used a Hint' },
]

export default function ProgressChecklist() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const {
    checklistProgress,
    tutorialCompleted,
    tutorialStarted,
    tutorialDismissedAt,
    resumeTutorial,
  } = useGameState()

  // Calculate progress percentage
  const progress = useMemo(() => {
    const completedCount = checklistItems.filter(
      (item) => checklistProgress[item.key]
    ).length
    return Math.round((completedCount / checklistItems.length) * 100)
  }, [checklistProgress])

  // Check if all items are complete
  const allComplete = progress === 100

  // Hide widget if dismissed or all complete
  if (isDismissed || allComplete) {
    return null
  }

  // Show "Resume Tour" button if tutorial was dismissed but not completed
  const canResumeTour = tutorialDismissedAt && !tutorialCompleted && !tutorialStarted

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isExpanded ? (
        // Collapsed view - circular progress indicator
        <button
          onClick={() => setIsExpanded(true)}
          className="relative w-16 h-16 rounded-full bg-[#1a1a1a] shadow-2xl hover:bg-[#2a2520] transition-all border-2 border-[#d4af37]/30 backdrop-blur-sm"
          aria-label="Open progress checklist"
          style={{
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.2), inset 0 0 10px rgba(212, 175, 55, 0.05)',
          }}
        >
          {/* Circular progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(212, 175, 55, 0.2)"
              strokeWidth="3"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#d4af37"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))',
              }}
            />
          </svg>
          
          {/* Percentage text */}
          <span 
            className="relative text-[#d4af37] text-sm font-bold" 
            style={{ 
              fontFamily: "'Courier Prime', monospace", 
              textShadow: '0 0 8px rgba(212, 175, 55, 0.5)' 
            }}
          >
            {progress}%
          </span>
        </button>
      ) : (
        // Expanded view - checklist
        <div 
          className="w-80 bg-[#1a1a1a] rounded-sm shadow-2xl border border-[#d4af37]/20 overflow-hidden relative"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)',
          }}
        >
          {/* Header */}
          <div 
            className="bg-[#121212] px-4 py-3 flex items-center justify-between border-b relative"
            style={{
              borderImage: 'linear-gradient(to right, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.2)) 1',
            }}
          >
            <div className="flex items-center gap-2">
              <span 
                className="font-bold text-lg text-[#d4af37]" 
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  textShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
                }}
              >
                Case Progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-[#d4af37]/10 rounded-sm transition-colors text-[#c5a065]"
                aria-label="Collapse checklist"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 hover:bg-[#d4af37]/10 rounded-sm transition-colors text-[#c5a065]"
                aria-label="Close checklist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div 
            className="px-4 py-3 bg-[#0f0f0f] border-b"
            style={{
              borderImage: 'linear-gradient(to right, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1)) 1',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-sm font-semibold text-[#d4af37] uppercase tracking-wide" 
                style={{ 
                  fontFamily: "'Courier Prime', monospace",
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.2)',
                }}
              >
                {progress}% Complete
              </span>
              <span className="text-xs text-[#c5a065]" style={{ fontFamily: "'Courier Prime', monospace" }}>
                {checklistItems.filter((item) => checklistProgress[item.key]).length} / {checklistItems.length}
              </span>
            </div>
            <div className="w-full bg-[#2a2520] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#d4af37] h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
                }}
              />
            </div>
          </div>

          {/* Checklist items */}
          <div className="px-4 py-3 max-h-80 overflow-y-auto bg-[#1a1a1a]">
            <ul className="space-y-2">
              {checklistItems.map((item) => {
                const isComplete = checklistProgress[item.key]
                return (
                  <li
                    key={item.key}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isComplete
                          ? 'bg-[#d4af37] border-[#d4af37]'
                          : 'bg-transparent border-[#d4af37]/30'
                      }`}
                      style={isComplete ? { boxShadow: '0 0 8px rgba(212, 175, 55, 0.4)' } : {}}
                    >
                      {isComplete && (
                        <svg
                          className="w-3 h-3 text-[#1a1a1a]"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`${
                        isComplete
                          ? 'text-[#dcd0b8] font-semibold'
                          : 'text-[#c5a065]'
                      }`}
                      style={{ fontFamily: "'Courier Prime', monospace", fontSize: '0.875rem' }}
                    >
                      {item.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Resume Tour button */}
          {canResumeTour && (
            <div 
              className="px-4 py-3 bg-[#121212] border-t"
              style={{
                borderImage: 'linear-gradient(to right, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.2)) 1',
              }}
            >
              <button
                onClick={() => {
                  resumeTutorial()
                  setIsExpanded(false)
                }}
                className="w-full bg-[#d4af37] hover:bg-[#c5a065] text-[#1a1a1a] font-semibold py-2 px-4 rounded-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                style={{ 
                  fontFamily: "'Courier Prime', monospace",
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Resume Briefing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
