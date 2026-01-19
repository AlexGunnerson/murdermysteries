"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { useGameState } from "@/lib/hooks/useGameState"

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function GameMenu({ isOpen, onClose }: GameMenuProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const { resetGame, unlockSuspect, unlockScene, unlockRecord, setCurrentStage, caseId } = useGameState()

  if (!isOpen) return null

  const handleExitCase = () => {
    setShowConfirm(true)
  }

  const confirmExit = () => {
    router.push("/")
    onClose()
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleResetToGameStart = async () => {
    if (!caseId) {
      alert('No active case to reset')
      return
    }

    try {
      // Reset database state
      const response = await fetch(`/api/game/state?caseId=${caseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset game state')
      }

      // Reset local state
      resetGame()
      
      // Reload page to fetch fresh state
      window.location.reload()
    } catch (error) {
      console.error('Error resetting game:', error)
      alert('Failed to reset game state. Please try again.')
    }
  }

  const handleJumpToActII = () => {
    // Reset game first
    resetGame()
    
    // Set stage to Act II (after contradiction is proven)
    setCurrentStage('act_ii')
    
    // Unlock inner circle suspects (what contradiction unlocks)
    unlockSuspect('suspect_martin')
    unlockSuspect('suspect_colin')
    unlockSuspect('suspect_lydia')
    unlockSuspect('suspect_vale')
    
    // Unlock Act II records (what contradiction unlocks)
    unlockRecord('record_veronica_thankyou')
    unlockRecord('record_blackmail_floor')
    unlockRecord('record_phone_logs')
    unlockRecord('record_speech_notes')
    
    window.location.reload()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 z-[100]"
        onClick={onClose}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
        }}
      />

      {/* Menu Panel */}
      <div 
        className="fixed right-0 top-0 h-full w-80 bg-[#1a1a1a] z-[110] shadow-2xl"
        style={{
          borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: `
            -20px 0 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(212, 175, 55, 0.1),
            inset 0 0 1px rgba(212, 175, 55, 0.3)
          `
        }}
      >
        {/* Film grain overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5] mix-blend-overlay opacity-35"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        <div className="flex flex-col h-full relative z-10">
          {/* Header */}
          <div 
            className="p-6 border-b"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="flex items-center justify-between">
              <h2 
                className="text-xl font-bold tracking-wider uppercase"
                style={{
                  color: '#d4af37',
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.3)'
                }}
              >
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-sm transition-all duration-200"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6 space-y-2 overflow-y-auto">
            <button
              onClick={() => {
                // TODO: Implement settings
                console.log("Open settings")
                onClose()
              }}
              className="w-full text-left px-4 py-3 rounded-sm transition-all duration-200 font-semibold tracking-wide"
              style={{
                color: '#d4af37',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
              }}
            >
              Settings
            </button>

            <div 
              className="pt-4 mt-4"
              style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}
            >
              <div 
                className="text-xs mb-2 px-4 tracking-wider uppercase"
                style={{ color: 'rgba(212, 175, 55, 0.5)' }}
              >
                Development Tools - Jump to Checkpoint
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (confirm('Jump to Game Start? This will reset the game to the beginning.')) {
                      handleResetToGameStart()
                    }
                  }}
                  className="w-full text-left px-4 py-2 rounded-sm transition-all duration-200 font-semibold tracking-wide text-sm"
                  style={{
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
                  }}
                >
                  ↻ Game Start
                </button>
                <button
                  onClick={() => {
                    if (confirm('Jump to Act II? Contradiction will be proven, inner circle unlocked.')) {
                      handleJumpToActII()
                    }
                  }}
                  className="w-full text-left px-4 py-2 rounded-sm transition-all duration-200 font-semibold tracking-wide text-sm"
                  style={{
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
                  }}
                >
                  → Act II
                </button>
              </div>
            </div>

            <div 
              className="pt-4 mt-4"
              style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}
            >
              <button
                onClick={handleExitCase}
                className="w-full text-left px-4 py-3 rounded-sm transition-all duration-200 font-semibold tracking-wide mb-2"
                style={{
                  color: '#d4af37',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  backgroundColor: 'rgba(212, 175, 55, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
                }}
              >
                Exit Case
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 rounded-sm transition-all duration-200 font-semibold tracking-wide"
                style={{
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="p-6 border-t text-xs"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.2)',
              color: 'rgba(212, 175, 55, 0.5)'
            }}
          >
            <p className="font-mono">MurderMysteries.AI v0.1</p>
            <button
              onClick={() => {
                // TODO: Implement feedback form
                console.log("Open feedback")
                onClose()
              }}
              className="mt-2 transition-colors"
              style={{
                color: '#d4af37'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f4d478'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#d4af37'
              }}
            >
              Send Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/90 z-[120]"
            onClick={() => setShowConfirm(false)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
            }}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] rounded-sm p-6 z-[130] max-w-md w-full mx-4 relative"
            style={{
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.9),
                0 0 40px rgba(212, 175, 55, 0.15),
                inset 0 0 1px rgba(212, 175, 55, 0.3)
              `
            }}
          >
            {/* Film grain overlay */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35 rounded-sm z-[5]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '120px 120px',
              }}
            />
            
            <div className="relative z-[20]">
              <h3 
                className="text-xl font-bold mb-4 tracking-wider uppercase"
                style={{
                  color: '#d4af37',
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.3)'
                }}
              >
                Exit Case?
              </h3>
              <p 
                className="mb-6"
                style={{ color: 'rgba(212, 175, 55, 0.7)' }}
              >
                Your progress will be saved. You can return to this case anytime.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 rounded-sm transition-all font-semibold tracking-wide"
                  style={{
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Exit Case
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-sm transition-all font-semibold tracking-wide"
                  style={{
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
                  }}
                >
                  Continue Playing
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

