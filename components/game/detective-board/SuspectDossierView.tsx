"use client"

import { X, Search } from "lucide-react"
import Image from "next/image"
import { ChatInterface } from "../ChatInterface"

interface SuspectDossierViewProps {
  suspect: {
    id: string
    name: string
    age: number
    role: string
    bio: string
    portraitUrl: string
    veronicaNote: string
  }
  suspectPersonality: string
  suspectAlibi: string
  systemPrompt: string
  onClose: () => void
}

export function SuspectDossierView({ 
  suspect, 
  suspectPersonality,
  suspectAlibi,
  systemPrompt,
  onClose 
}: SuspectDossierViewProps) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Split-screen container - 'The Folder' */}
      <div 
        className="relative w-full h-full max-w-[1400px] max-h-[85vh] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Grain overlay for entire modal */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Close button - top right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 bg-[#2a211b]/90 hover:bg-[#1a1410] text-[#c5a065] rounded-sm transition-colors border border-[#c5a065]/20"
          aria-label="Close"
          style={{
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL - Case File Dossier - 'Heavy Leather Folder' */}
        <div 
          className="bg-[#2a211b] overflow-y-auto relative"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(42, 33, 27, 0.9) 0%, rgba(26, 20, 16, 1) 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(0, 0, 0, 0.08) 10px,
                rgba(0, 0, 0, 0.08) 11px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(0, 0, 0, 0.05) 10px,
                rgba(0, 0, 0, 0.05) 11px
              )
            `,
            boxShadow: 'inset -2px 0 8px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="p-6 lg:p-8 h-full flex flex-col relative">
            {/* Header with typewriter aesthetic */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#c5a065] text-xs uppercase tracking-[0.3em]" style={{ fontFamily: 'Courier, monospace', fontWeight: 700 }}>
                  CASE FILE:
                </span>
              </div>
              <p 
                className="text-[#8b7355] text-sm"
                style={{ fontFamily: 'Courier, monospace' }}
              >
                70s: Final Gala at the Estate
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
                    className="text-4xl text-[#2c2a29] mb-4 leading-tight"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {suspect.name}
                  </h2>

                  {/* Bio - Veronica's handwriting */}
                  <div className="mb-6">
                    <p 
                      className="text-[#2c2a29] text-lg leading-relaxed"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {suspect.veronicaNote || suspect.bio}
                    </p>
                  </div>

                  {/* Signature - handwritten */}
                  <p 
                    className="text-[#2c2a29] text-2xl"
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
                        src={suspect.portraitUrl}
                        alt={suspect.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facts below the card - Typewriter labels */}
            <div className="space-y-3">
              {/* Relationship */}
              <div className="flex items-start gap-3 text-[#c5a065]">
                <div className="w-6 h-6 rounded-full border-2 border-[#c5a065]/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#c5a065]"></div>
                </div>
                <div>
                  <span className="text-[#c5a065] font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Courier, monospace' }}>
                    Relationship:{" "}
                  </span>
                  <span className="text-[#c5a065]/90">
                    {suspect.role}
                  </span>
                </div>
              </div>

              {/* Age */}
              <div className="flex items-start gap-3 text-[#c5a065]">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">🎂</span>
                </div>
                <div>
                  <span className="text-[#c5a065] font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Courier, monospace' }}>
                    Age:{" "}
                  </span>
                  <span className="text-[#c5a065]/90">
                    {suspect.age}
                  </span>
                </div>
              </div>

              {/* Vices */}
              <div className="flex items-start gap-3 text-[#c5a065]">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <span className="text-[#c5a065] font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Courier, monospace' }}>
                    Vices:{" "}
                  </span>
                  <span className="text-[#c5a065]/90">
                    {suspect.id === 'suspect_martin' && 'Gambling, drinking.'}
                    {suspect.id === 'suspect_veronica' && 'Suspicious, protective.'}
                    {suspect.id === 'suspect_colin' && 'Secretive, desperate.'}
                    {suspect.id === 'suspect_lydia' && 'Ambitious, vain.'}
                    {suspect.id === 'suspect_vale' && 'Calculating, cold.'}
                    {!['suspect_martin', 'suspect_veronica', 'suspect_colin', 'suspect_lydia', 'suspect_vale'].includes(suspect.id) && 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - 'Warm Black' Chat Interface */}
        <div className="bg-[#141414] flex flex-col overflow-hidden relative">
          {/* Subtle texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(255, 255, 255, 0.01) 2px,
                  rgba(255, 255, 255, 0.01) 4px
                )
              `,
            }}
          />
          
          {/* Header - Serif Typography */}
          <div className="bg-[#0a0a0a] border-b border-[#c5a065]/10 p-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-[#c5a065]" strokeWidth={1.5} />
              <h2 
                className="text-2xl text-[#c5a065] tracking-wider uppercase"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: '0.15em',
                  fontWeight: 500,
                }}
              >
                Analyze Suspects
              </h2>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden relative z-10">
            <ChatInterface
              suspectId={suspect.id}
              suspectName={suspect.name}
              suspectRole={suspect.role}
              suspectPersonality={suspectPersonality}
              systemPrompt={systemPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
