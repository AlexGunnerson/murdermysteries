'use client'

import { useGameState } from '@/lib/hooks/useGameState'
import { Compass, X } from 'lucide-react'

export default function TourPromptModal() {
  const { startTutorial, skipTutorial, tutorialStarted, tutorialCompleted } = useGameState()

  // Don't show if tutorial already started or completed
  if (tutorialStarted || tutorialCompleted) {
    return null
  }

  const handleStartTour = () => {
    startTutorial()
  }

  const handleSkip = () => {
    skipTutorial()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Film grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative w-full max-w-lg mx-4 bg-[#1a1a1a] rounded-sm overflow-hidden animate-in fade-in zoom-in duration-300"
        style={{
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)',
        }}
      >
        {/* Header */}
        <div 
          className="bg-[#121212] px-6 py-4 border-b relative"
          style={{
            borderImage: 'linear-gradient(to right, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.2)) 1',
          }}
        >
          <div className="flex items-center gap-3">
            <Compass 
              className="w-7 h-7 text-[#d4af37]"
              style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))' }}
            />
            <h2 
              className="text-2xl font-bold text-[#d4af37]"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
              }}
            >
              Detective Briefing
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4 bg-[#1a1a1a]">
          <p 
            className="text-[#dcd0b8] text-lg leading-relaxed"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            Want me to show you the ropes, or are you going in blind?
          </p>
          
          <div 
            className="bg-[#0f0f0f] border border-[#d4af37]/20 rounded-sm p-4 mt-4"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
          >
            <p className="text-sm text-[#c5a065]" style={{ fontFamily: "'Courier Prime', monospace" }}>
              <span className="text-[#d4af37] font-bold">TIP:</span> You can pick up the trail anytime from the progress tracker, or replay this briefing from the menu.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div 
          className="px-6 py-4 bg-[#121212] border-t flex gap-3"
          style={{
            borderImage: 'linear-gradient(to right, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.2)) 1',
          }}
        >
          <button
            onClick={handleStartTour}
            className="flex-1 bg-[#d4af37] hover:bg-[#c5a065] text-[#1a1a1a] font-bold py-3 px-6 rounded-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            style={{ 
              fontFamily: "'Courier Prime', monospace",
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
            }}
          >
            <Compass className="w-5 h-5" />
            Show Me Around
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 bg-transparent hover:bg-[#d4af37]/10 text-[#c5a065] font-semibold py-3 px-6 rounded-sm transition-all border border-[#d4af37]/30 uppercase tracking-wider"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            I Work Alone
          </button>
        </div>
      </div>
    </div>
  )
}
