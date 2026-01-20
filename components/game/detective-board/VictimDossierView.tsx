"use client"

import { X, FileText } from "lucide-react"
import Image from "next/image"

interface VictimDossierViewProps {
  onClose: () => void
}

export function VictimDossierView({ onClose }: VictimDossierViewProps) {
  const victim = {
    id: 'victim_reginald',
    name: 'Reginald Ashcombe',
    age: 68,
    role: 'Patriarch & Philanthropist',
    bio: 'Built the Ashcombe fortune through shrewd investments in global commodities. Known for his annual charity gala and philanthropic work. Married to Veronica Ashcombe.',
    portraitUrl: '/cases/case01/images/portraits/reginald.jpg',
    veronicaNote: 'My Husband. The Patriarch. He built this entire fortune through relentless foresight in global commodities. He was master of the estate, known for his shrewdness and the annual charity gala. What the world didn\'t see was the profound, quiet love we shared. I thought we had more time...'
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(10,10,10,0.85) 0%, rgba(0,0,0,0.98) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Centered single panel container */}
      <div 
        className="relative w-full max-w-[700px] max-h-[85vh] mx-auto rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(212, 175, 55, 0.15),
            inset 0 0 1px rgba(212, 175, 55, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.03)
          `,
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Enhanced grain overlay for entire modal */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Close button - top right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 bg-[#0a0a0a]/95 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-sm transition-all duration-200 border border-[#d4af37]/40"
          aria-label="Close"
          style={{
            boxShadow: `
              0 2px 10px rgba(0, 0, 0, 0.8),
              0 0 12px rgba(212, 175, 55, 0.3),
              inset 0 0 8px rgba(212, 175, 55, 0.1)
            `,
          }}
        >
          <X 
            className="w-5 h-5" 
            style={{
              filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))',
            }}
          />
        </button>

        {/* Case File Dossier - 'Deep Charcoal Leather' */}
        <div 
          className="bg-[#1a1a1a] overflow-y-auto relative h-full"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(18, 18, 18, 1) 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 12px,
                rgba(0, 0, 0, 0.15) 12px,
                rgba(0, 0, 0, 0.15) 13px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 12px,
                rgba(0, 0, 0, 0.12) 12px,
                rgba(0, 0, 0, 0.12) 13px
              )
            `,
            boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="p-6 lg:p-8 h-full flex flex-col relative">
            {/* Header with typewriter aesthetic */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-[#d4af37] text-sm uppercase tracking-[0.3em]" 
                  style={{ 
                    fontFamily: 'Courier, monospace', 
                    fontWeight: 700,
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  CASE FILE:
                </span>
              </div>
              <p 
                className="text-[#c5a065] text-base"
                style={{ 
                  fontFamily: 'Courier, monospace',
                  textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                }}
              >
                VICTIM - May 10, 1986
              </p>
            </div>

            {/* Note card with photo and bio - 'Tucked Paper' */}
            <div 
              className="bg-[#dcd0b8] p-8 rounded-sm shadow-xl mb-6 -rotate-1 relative"
              style={{
                backgroundImage: `
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(0, 0, 0, 0.03) 100%),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1px,
                    rgba(0, 0, 0, 0.015) 1px,
                    rgba(0, 0, 0, 0.015) 2px
                  )
                `,
                boxShadow: `
                  0 12px 45px rgba(0, 0, 0, 0.6),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                  inset -2px 0 4px rgba(0, 0, 0, 0.1),
                  inset 2px 0 4px rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(0, 0, 0, 0.15)
                `,
              }}
            >
              <div className="flex gap-6">
                {/* Left side - Name and Bio */}
                <div className="flex-1">
                  {/* Name */}
                  <h2 
                    className="text-5xl text-[#2c2a29] mb-4 leading-tight"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {victim.name}
                  </h2>

                  {/* Bio - Veronica's handwriting */}
                  <div className="mb-6">
                    <p 
                      className="text-[#2c2a29] text-2xl leading-relaxed"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {victim.veronicaNote}
                    </p>
                  </div>

                  {/* Signature - handwritten */}
                  <p 
                    className="text-[#2c2a29] text-3xl"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    — V. Ashcombe
                  </p>
                </div>

                {/* Right side - Photo - 'Clipped/Taped' */}
                <div className="flex-shrink-0">
                  <div 
                    className="relative bg-white p-2 shadow-md rotate-3"
                    style={{
                      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
                      border: '8px solid white',
                    }}
                  >
                    <div className="relative w-40 h-52">
                      <Image
                        src={victim.portraitUrl}
                        alt={victim.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facts below the card - Noir Typewriter labels */}
            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-start gap-3 text-[#d4af37]">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-[#d4af37]/60 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    boxShadow: '0 0 8px rgba(212, 175, 55, 0.3), inset 0 0 4px rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full bg-[#d4af37]"
                    style={{
                      boxShadow: '0 0 4px rgba(212, 175, 55, 0.6)',
                    }}
                  ></div>
                </div>
                <div>
                  <span 
                    className="text-[#d4af37] font-bold text-sm uppercase tracking-wider" 
                    style={{ 
                      fontFamily: 'Courier, monospace',
                      textShadow: '0 0 6px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    Status:{" "}
                  </span>
                  <span 
                    className="text-red-400 text-base"
                    style={{
                      textShadow: '0 0 4px rgba(248, 113, 113, 0.3)',
                    }}
                  >
                    Deceased
                  </span>
                </div>
              </div>

              {/* Age */}
              <div className="flex items-start gap-3 text-[#d4af37]">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">🎂</span>
                </div>
                <div>
                  <span 
                    className="text-[#d4af37] font-bold text-sm uppercase tracking-wider" 
                    style={{ 
                      fontFamily: 'Courier, monospace',
                      textShadow: '0 0 6px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    Age:{" "}
                  </span>
                  <span 
                    className="text-[#c5a065] text-base"
                    style={{
                      textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                    }}
                  >
                    {victim.age}
                  </span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3 text-[#d4af37]">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <span 
                    className="text-[#d4af37] font-bold text-sm uppercase tracking-wider" 
                    style={{ 
                      fontFamily: 'Courier, monospace',
                      textShadow: '0 0 6px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    Role:{" "}
                  </span>
                  <span 
                    className="text-[#c5a065] text-base"
                    style={{
                      textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                    }}
                  >
                    {victim.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

