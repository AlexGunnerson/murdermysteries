"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, Home, RotateCcw } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'

export default function VictoryPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const router = useRouter()
  const { 
    discoveredFacts, 
    isGameCompleted, 
    gameStatus,
    actIViewedClues,
    actIIViewedClues,
    finalPhaseWhoViewedClues,
    finalPhaseMotiveViewedClues,
    finalPhaseWhereViewedClues
  } = useGameStore()
  const [isVisible, setIsVisible] = useState(false)
  
  // Calculate total hints used
  const totalHintsUsed = 
    actIViewedClues.length + 
    actIIViewedClues.length + 
    finalPhaseWhoViewedClues.length + 
    finalPhaseMotiveViewedClues.length + 
    finalPhaseWhereViewedClues.length

  useEffect(() => {
    // Redirect if game not completed
    if (!isGameCompleted) {
      router.push(`/game/${caseId}`)
      return
    }
    
    // Fade in animation
    setIsVisible(true)
  }, [isGameCompleted, router, caseId])

  const handleReturnToMenu = () => {
    router.push('/')
  }

  const handleReplayCase = async () => {
    // TODO: Implement replay functionality - reset game session
    router.push(`/game/${caseId}`)
  }

  if (!isGameCompleted) {
    return null
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap');
        
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .victory-enter {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .victory-content {
          animation: slideUp 0.8s ease-out forwards;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className={`min-h-screen bg-[#0a0a0a] relative overflow-y-auto ${isVisible ? 'victory-enter' : 'opacity-0'}`}
      >
        {/* Subtle film grain overlay */}
        <div 
          className="fixed inset-0 pointer-events-none z-10 mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />

        {/* Background glow effect */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
          }}
        />

        <div className="victory-content relative z-20 max-w-7xl mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="relative text-center mb-16">
            {/* Main Header Content */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <CheckCircle2 
                className="w-16 h-16 text-[#d4af37] float-animation" 
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.7))',
                }}
              />
            </div>
            <h1 
              className="text-6xl md:text-7xl font-bold text-[#d4af37] mb-4"
              style={{
                textShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.3)',
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '0.02em',
              }}
            >
              CASE SOLVED
            </h1>
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#d4af37]/60" />
              <span 
                className="text-[#c5a065] text-lg tracking-widest"
                style={{ fontFamily: "'Courier Prime', monospace" }}
              >
                THE ASHCOMBE MYSTERY
              </span>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#d4af37]/60" />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Left Column - Colin's Portrait */}
            <div className="lg:col-span-1">
              <div 
                className="relative rounded-lg overflow-hidden mb-6"
                style={{
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.8),
                    0 0 30px rgba(212, 175, 55, 0.2),
                    inset 0 0 1px rgba(212, 175, 55, 0.4)
                  `,
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <div className="relative aspect-[3/4] bg-[#1a1a1a]">
                  <Image
                    src="/cases/case01/images/portraits/colin_confession.png"
                    alt="Colin Dorsey"
                    fill
                    className="object-cover object-center"
                    sizes="400px"
                  />
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                    }}
                  />
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 p-6 text-center"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,10,10,0.95), transparent)',
                  }}
                >
                  <h3 
                    className="text-2xl font-bold text-[#d4af37] mb-1"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      textShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
                    }}
                  >
                    Colin Dorsey
                  </h3>
                  <p 
                    className="text-red-400 text-sm font-bold tracking-wider"
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      textShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
                    }}
                  >
                    THE KILLER
                  </p>
                </div>
              </div>

              {/* Investigation Stats */}
              <div 
                className="rounded-lg p-6"
                style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
                }}
              >
                <h3 
                  className="text-lg font-bold text-[#d4af37] mb-4 text-center"
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  INVESTIGATION SUMMARY
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-[#c5a065] text-sm"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      Facts Discovered:
                    </span>
                    <span 
                      className="text-[#d4af37] text-xl font-bold"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      {discoveredFacts.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-[#c5a065] text-sm"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      Hints Used:
                    </span>
                    <span 
                      className="text-[#d4af37] text-xl font-bold"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      {totalHintsUsed}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Confession & Evidence */}
            <div className="lg:col-span-2 space-y-8">
              {/* Colin's Confession */}
              <div 
                className="rounded-lg p-8"
                style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.9)',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.7),
                    inset 0 2px 8px rgba(0, 0, 0, 0.4)
                  `,
                }}
              >
                <h2 
                  className="text-3xl font-bold text-[#d4af37] mb-6 text-center"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    textShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  Colin Dorsey&apos;s Confession
                </h2>
                <div 
                  className="text-[#e8d7b5] leading-relaxed space-y-4"
                  style={{
                    fontSize: '1rem',
                    fontFamily: "'Courier Prime', monospace",
                    textShadow: '0 0 3px rgba(232, 215, 181, 0.15)',
                  }}
                >
                  <p>
                    I... I didn&apos;t mean to kill him. You have to believe me, Detective. It was an accident. A terrible, tragic accident.
                  </p>
                  <p>
                    Years ago, I made a mistake. I needed money desperately, and I... I tried to sell Dorothy Ashcombe&apos;s ring. The most precious family heirloom. Reginald&apos;s grandmother&apos;s ring. I thought I could do it quietly, that no one would ever know. But Reginald found out. He kept proof as black his safe.
                  </p>
                  <p>
                    After he discovered Lydia&apos;s embezzlement, Reginald changed. He stopped trusting anyone. He started managing the major donors personally, keeping their confidential files in that safe. Every gala night, like clockwork, he&apos;d review those files before greeting the VIPs—leaving the safe unlocked, accessible. I knew the pattern. I knew I&apos;d have my chance.
                  </p>
                  <p>
                    During the gala presentation, I went to the study. I had to swap that page. I couldn&apos;t simply remove it—others in the family knew Reginald kept something on me, though not what it was. Removing it entirely would be too suspicious. But if I replaced it with something less damaging—Uncle Charles&apos;s pocket watch instead of Dorothy&apos;s ring—no one would know the difference. Reginald wasn&apos;t actively reviewing the files, and after his death, the truth would remain buried.
                  </p>
                  <p>
                    But Reginald... he walked in. He caught me at the safe. We argued. He was furious—said I&apos;d betrayed the family&apos;s trust for the last time. We struggled. The rug shifted beneath us. He fell... struck his head on the corner of the desk. The sound... I&apos;ll never forget that sound.
                  </p>
                  <p>
                    I panicked. I checked for a pulse, but he was gone. I couldn&apos;t think straight. I staged it at the staircase to look like an accident. The wine glass, the positioning... I thought if it looked like he&apos;d slipped after drinking, no one would ask questions. I even took Dr. Vale&apos;s blackmail page to create a false lead.
                  </p>
                  <p>
                    I&apos;ve been carrying this guilt every moment since. When you showed me both blackmail documents and those photographs from the study... I knew it was over. I knew you&apos;d figured it all out. I&apos;m... I&apos;m so sorry.
                  </p>
                </div>
              </div>

              {/* Key Evidence */}
              <div 
                className="rounded-lg p-8"
                style={{
                  backgroundColor: 'rgba(18, 18, 18, 0.9)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
                }}
              >
                  <h3 
                    className="text-2xl font-bold text-[#d4af37] mb-6"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      textShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    Key Evidence That Solved the Case
                  </h3>
                  <ul className="space-y-4 text-[#e8d7b5]" style={{ fontFamily: "'Courier Prime', monospace" }}>
                    <li className="flex items-start gap-3">
                      <span className="text-[#d4af37] mt-1 text-lg">•</span>
                      <span><strong className="text-[#d4af37]">White Glove in Study:</strong> Colin&apos;s white gala glove with a distinctive tear was found on top of Reginald&apos;s desk, proving he was in the study during the murder. Photographs from the ballroom show Colin wearing matching gloves with the same tear.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#d4af37] mt-1 text-lg">•</span>
                      <span><strong className="text-[#d4af37]">Study Struggle Evidence:</strong> The displaced rug, Reginald&apos;s pocket square on the floor, and the open safe revealed a confrontation took place in the study—not at the staircase where the body was found.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#d4af37] mt-1 text-lg">•</span>
                      <span><strong className="text-[#d4af37]">Colin&apos;s Blackmail - Near Body:</strong> A fake blackmail page showing Uncle Charles&apos;s pocket watch—the less damaging evidence Colin tried to swap in to protect his reputation.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#d4af37] mt-1 text-lg">•</span>
                      <span><strong className="text-[#d4af37]">Colin&apos;s Blackmail - Behind Painting:</strong> The real blackmail page found hidden behind Elizabeth&apos;s painting revealed Colin&apos;s attempt to sell Dorothy Ashcombe&apos;s ring—the beloved family heirloom and the true motive for the confrontation.</span>
                    </li>
                  </ul>
                </div>
            </div>
          </div>

          {/* Other Suspects Gallery */}
          <div 
            className="rounded-lg p-8 mb-12"
            style={{
              backgroundColor: 'rgba(18, 18, 18, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            <h3 
              className="text-2xl font-bold text-[#d4af37] mb-8 text-center"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
              }}
            >
              The Ashcombe Circle
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Veronica Ashcombe', image: '/cases/case01/images/scenes/Scene 1 - Ballroom/gala/veronica_champagne.jpg', role: 'The Widow' },
                { name: 'Martin Ashcombe', image: '/cases/case01/images/scenes/Scene 1 - Ballroom/gala/martin_lounging.png', role: 'The Brother' },
                { name: 'Lydia Portwell', image: '/cases/case01/images/scenes/Scene 1 - Ballroom/gala/lydia_networking.png', role: 'The Fundraiser' },
                { name: 'Dr. Vale', image: '/cases/case01/images/scenes/Scene 1 - Ballroom/gala/vale_gala.png', role: 'The Doctor' },
              ].map((suspect) => (
                <div 
                  key={suspect.name}
                  className="group relative rounded-lg overflow-hidden"
                  style={{
                    boxShadow: `
                      0 10px 30px rgba(0, 0, 0, 0.6),
                      0 0 15px rgba(212, 175, 55, 0.1)
                    `,
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <div className="relative aspect-[3/4] bg-[#1a1a1a]">
                    <Image
                      src={suspect.image}
                      alt={suspect.name}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      sizes="300px"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h4 
                      className="text-[#d4af37] font-bold mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {suspect.name}
                    </h4>
                    <p 
                      className="text-[#c5a065] text-xs"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      {suspect.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleReturnToMenu}
              className="group px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center gap-3"
              style={{
                backgroundColor: '#d4af37',
                color: '#0a0a0a',
                border: '2px solid #d4af37',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
                fontFamily: "'Courier Prime', monospace",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0c55d'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.7)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d4af37'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.5)'
              }}
            >
              <Home className="w-5 h-5" />
              Return to Main Menu
            </button>
            <button
              onClick={handleReplayCase}
              className="group px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center gap-3"
              style={{
                backgroundColor: 'transparent',
                color: '#d4af37',
                border: '2px solid #d4af37',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                fontFamily: "'Courier Prime', monospace",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              <RotateCcw className="w-5 h-5" />
              Replay Case
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
