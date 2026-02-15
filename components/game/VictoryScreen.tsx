"use client"

import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'

export function VictoryScreen() {
  const router = useRouter()
  const { theoryHistory, discoveredFacts } = useGameStore()

  const handleReturnToMenu = () => {
    router.push('/')
  }

  const handleReplayCase = async () => {
    // TODO: Implement replay functionality - reset game session
    router.push('/game/case01')
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .victory-enter {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .victory-content {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
      
      {/* Full-page overlay */}
      <div 
        className="victory-enter fixed inset-0 z-[200] bg-black/95 flex items-center justify-center py-8 overflow-y-auto"
      >
        {/* Film grain overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Victory Content Container */}
        <div 
          className="victory-content relative z-20 w-full max-w-4xl mx-auto px-6 my-auto"
        >
          {/* Main Card */}
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              boxShadow: `
                0 30px 80px rgba(0, 0, 0, 0.95),
                0 0 60px rgba(212, 175, 55, 0.3),
                inset 0 0 1px rgba(212, 175, 55, 0.4),
                inset 0 1px 2px rgba(255, 255, 255, 0.05)
              `,
              border: '2px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <div 
              className="bg-[#1a1a1a] p-8 sm:p-12"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 15px,
                    rgba(0, 0, 0, 0.3) 15px,
                    rgba(0, 0, 0, 0.3) 16px
                  )
                `,
                fontFamily: "'Courier Prime', monospace",
              }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle2 
                    className="w-12 h-12 text-[#d4af37]" 
                    style={{
                      filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.6))',
                    }}
                  />
                </div>
                <h1 
                  className="text-4xl sm:text-5xl font-bold text-[#d4af37] mb-2"
                  style={{
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                    fontFamily: "'Courier Prime', monospace",
                  }}
                >
                  CASE SOLVED!
                </h1>
                <div className="w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />
              </div>

              {/* Colin's Confession */}
              <div 
                className="mb-10 p-6 rounded-md"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
                }}
              >
                <h2 
                  className="text-2xl font-bold text-[#d4af37] mb-4 text-center"
                  style={{
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  Colin Dorsey&apos;s Confession
                </h2>
                <div 
                  className="text-[#e8d7b5] leading-relaxed space-y-4"
                  style={{
                    fontSize: '1.05rem',
                    textShadow: '0 0 3px rgba(232, 215, 181, 0.15)',
                  }}
                >
                  <p>
                    &quot;I... I didn&apos;t mean to kill him. You have to believe me, Detective. It was an accident. A terrible, tragic accident.&quot;
                  </p>
                  <p>
                    &quot;Years ago, I made a mistake. I needed money desperately, and I... I tried to sell Dorothy Ashcombe&apos;s ring. The most precious family heirloom. Reginald&apos;s grandmother&apos;s ring. I thought I could do it quietly, that no one would ever know. But Reginald found out. He kept proof, blackmail, in his safe.&quot;
                  </p>
                  <p>
                    &quot;After he discovered Lydia&apos;s embezzlement, Reginald changed. He stopped trusting anyone. He started managing the major donors personally, keeping their confidential files in that safe. Every gala night, like clockwork, he&apos;d review those files before greeting the VIPs, leaving the safe unlocked, accessible. I knew the pattern. I knew I&apos;d have my chance.&quot;
                  </p>
                  <p>
                    &quot;During the gala presentation, I went to the study. I had to swap that page. I couldn&apos;t let anyone see what I&apos;d done, not to Dorothy&apos;s ring. I thought I could replace it with something less damaging. Uncle Charles&apos;s pocket watch seemed like a better scandal than selling the greatest Ashcombe treasure.&quot;
                  </p>
                  <p>
                    &quot;But Reginald... he walked in. He caught me at the safe with my gloves on. We argued. He was furious, said I&apos;d betrayed the family&apos;s trust for the last time. We struggled. The rug shifted beneath us. He fell... struck his head on the corner of the desk. The sound... I&apos;ll never forget that sound.&quot;
                  </p>
                  <p>
                    &quot;I panicked. I checked for a pulse, but he was gone. I couldn&apos;t think straight. I staged it at the staircase to look like an accident. The wine glass, the positioning... I thought if it looked like he&apos;d slipped after drinking, no one would ask questions. I even took Dr. Vale&apos;s blackmail page to create a false lead.&quot;
                  </p>
                  <p>
                    &quot;I&apos;ve been carrying this guilt every moment since. When you showed me both blackmail documents and those photographs from the study... I knew it was over. I knew you&apos;d figured it all out. I&apos;m... I&apos;m so sorry.&quot;
                  </p>
                </div>
              </div>

              {/* Key Evidence Section */}
              <div 
                className="mb-8 p-6 rounded-md"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.4)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <h3 
                  className="text-xl font-bold text-[#d4af37] mb-4"
                  style={{
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  Key Evidence That Solved the Case
                </h3>
                <ul className="space-y-3 text-[#e8d7b5]">
                  <li className="flex items-start gap-3">
                    <span className="text-[#d4af37] mt-1">•</span>
                    <span><strong>White Glove in Study:</strong> Colin&apos;s white gala glove with a distinctive tear was found on top of Reginald&apos;s desk, proving he was in the study during the murder. Photographs from the ballroom show Colin wearing matching gloves with the same tear.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#d4af37] mt-1">•</span>
                    <span><strong>Study Struggle Evidence:</strong> The displaced rug, Reginald&apos;s pocket square on the floor, and the open safe revealed a confrontation took place in the study, not at the staircase where the body was found.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#d4af37] mt-1">•</span>
                    <span><strong>Colin&apos;s Blackmail - Near Body:</strong> A fake blackmail page showing Uncle Charles&apos;s pocket watch, the less damaging evidence Colin tried to swap in to protect his reputation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#d4af37] mt-1">•</span>
                    <span><strong>Colin&apos;s Blackmail - Behind Painting:</strong> The real blackmail page found hidden behind Elizabeth&apos;s painting revealed Colin&apos;s attempt to sell Dorothy Ashcombe&apos;s ring, the beloved family heirloom and the true motive for the confrontation.</span>
                  </li>
                </ul>
              </div>

              {/* Investigation Statistics */}
              <div 
                className="mb-8 p-6 rounded-md"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.4)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <h3 
                  className="text-xl font-bold text-[#d4af37] mb-4"
                  style={{
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  Investigation Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-[#e8d7b5]">
                  <div>
                    <p className="text-[#d4af37] font-bold mb-1">Facts Discovered</p>
                    <p className="text-2xl">{discoveredFacts.length}</p>
                  </div>
                  <div>
                    <p className="text-[#d4af37] font-bold mb-1">Theories Submitted</p>
                    <p className="text-2xl">{theoryHistory.length}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleReturnToMenu}
                  className="px-8 py-3 rounded-md font-bold text-lg transition-all"
                  style={{
                    backgroundColor: '#d4af37',
                    color: '#1a1a1a',
                    border: '2px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                    fontFamily: "'Courier Prime', monospace",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0c55d'
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d4af37'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.4)'
                  }}
                >
                  Return to Main Menu
                </button>
                <button
                  onClick={handleReplayCase}
                  className="px-8 py-3 rounded-md font-bold text-lg transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#d4af37',
                    border: '2px solid #d4af37',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
                    fontFamily: "'Courier Prime', monospace",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  Replay Case
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
