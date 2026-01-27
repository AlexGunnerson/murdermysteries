"use client"

import { ArrowLeft, Search, Lock } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { ChatInterfaceWithAttachments } from "../ChatInterfaceWithAttachments"
import { useGameState } from "@/lib/hooks/useGameState"
import { QuickNoteButton } from "../QuickNoteButton"

interface SuspectDossierViewProps {
  suspect: {
    id: string
    name: string
    age: number
    role: string
    bio: string
    portraitUrl: string
    avatarUrl?: string
    veronicaNote: string
  }
  suspectPersonality: string
  suspectAlibi: string
  systemPrompt: string
  onClose: () => void
  onUnlocksQueued?: (notifications: string[]) => void
}

export function SuspectDossierView({ 
  suspect, 
  suspectPersonality,
  suspectAlibi,
  systemPrompt,
  onClose,
  onUnlocksQueued 
}: SuspectDossierViewProps) {
  const { unlockedContent } = useGameState()
  const queuedNotificationsRef = useRef<string[]>([])
  
  // Check if this suspect is unlocked for questioning
  // Veronica (suspect_veronica) is always available
  const isUnlockedForQuestioning = suspect.id === 'suspect_veronica' || unlockedContent.suspects.has(suspect.id)
  
  // Handle unlock notifications from chat
  const handleUnlockQueued = (notification: string) => {
    queuedNotificationsRef.current.push(notification)
  }
  
  // Handle close and pass queued notifications to parent
  const handleClose = () => {
    if (queuedNotificationsRef.current.length > 0 && onUnlocksQueued) {
      onUnlocksQueued(queuedNotificationsRef.current)
    }
    onClose()
  }
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(10,10,10,0.85) 0%, rgba(0,0,0,0.98) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Split-screen container - 'The Noir Dossier' */}
      <div 
        className="relative w-full h-full max-w-[1400px] max-h-[85vh] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden"
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

        {/* Back button - top left corner */}
        <button
          onClick={handleClose}
          className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* LEFT PANEL - Case File Dossier - 'Deep Charcoal Leather' */}
        <div 
          className="bg-[#1a1a1a] overflow-y-auto relative"
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
            boxShadow: 'inset -3px 0 12px rgba(0, 0, 0, 0.7), inset 0 0 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Gold-etched vertical divider line */}
          <div 
            className="absolute top-0 right-0 bottom-0 w-[2px] z-10"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  transparent 0%,
                  rgba(197, 160, 101, 0.3) 5%,
                  rgba(197, 160, 101, 0.8) 20%,
                  rgba(197, 160, 101, 1) 50%,
                  rgba(197, 160, 101, 0.8) 80%,
                  rgba(197, 160, 101, 0.3) 95%,
                  transparent 100%
                )
              `,
              boxShadow: `
                0 0 8px rgba(197, 160, 101, 0.6),
                0 0 16px rgba(197, 160, 101, 0.4),
                inset 0 0 4px rgba(255, 215, 0, 0.3)
              `,
            }}
          />
          {/* Metallic accent strips */}
          <div 
            className="absolute top-0 right-[1px] bottom-0 w-[1px]"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  transparent 0%,
                  rgba(255, 215, 0, 0.4) 5%,
                  rgba(255, 215, 0, 0.6) 50%,
                  rgba(255, 215, 0, 0.4) 95%,
                  transparent 100%
                )
              `,
            }}
          />
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
                  {suspect.id === 'suspect_veronica' ? 'MY STATEMENT:' : 'CASE FILE:'}
                </span>
              </div>
              <p 
                className="text-[#c5a065] text-base"
                style={{ 
                  fontFamily: 'Courier, monospace',
                  textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                }}
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
                    className="text-5xl text-[#2c2a29] mb-4 leading-tight"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {suspect.name}
                  </h2>

                  {/* Bio - Veronica's handwriting */}
                  <div className="mb-6">
                    <p 
                      className="text-[#2c2a29] text-2xl leading-relaxed"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {suspect.id === 'suspect_veronica' 
                        ? "Sixty-two years old. I once trained as a concert pianist, that life feels so distant now. For decades, I've managed the social and charitable affairs of this estate. I was the one who found Reginald at the bottom of the stairs, a sight that will forever haunt me."
                        : (suspect.veronicaNote || suspect.bio)
                      }
                    </p>
                  </div>

                  {/* Signature - handwritten */}
                  <p 
                    className="text-[#2c2a29] text-3xl"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {suspect.id === 'suspect_veronica' ? '— Veronica Ashcombe' : '— V. Ashcombe'}
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

            {/* Facts below the card - Noir Typewriter labels */}
            <div className="space-y-3">
              {/* Relationship */}
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
                    Relationship:{" "}
                  </span>
                  <span 
                    className="text-[#c5a065] text-base"
                    style={{
                      textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                    }}
                  >
                    {suspect.role}
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
                    {suspect.age}
                  </span>
                </div>
              </div>

              {/* Vices / Notes */}
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
                    {suspect.id === 'suspect_veronica' ? 'Notes:' : 'Vices:'}{" "}
                  </span>
                  <span 
                    className="text-[#c5a065] text-base"
                    style={{
                      textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                    }}
                  >
                    {suspect.id === 'suspect_martin' && 'Gambling, drinking.'}
                    {suspect.id === 'suspect_veronica' && 'Perhaps too trusting in the past. Determined to find the truth.'}
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

        {/* RIGHT PANEL - 'Deep Charcoal Leather' Chat Interface */}
        <div className="bg-[#1a1a1a] flex flex-col overflow-hidden relative">
          {/* Deep leather texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `
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
            }}
          />
          
          {/* Header - Noir Gold Typography */}
          <div 
            className="bg-[#121212] border-b p-6 flex items-center justify-between relative z-10"
            style={{
              borderImage: 'linear-gradient(to right, rgba(197, 160, 101, 0.3), rgba(197, 160, 101, 0.6), rgba(197, 160, 101, 0.3)) 1',
              boxShadow: '0 2px 12px rgba(197, 160, 101, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <Search 
                className="w-6 h-6 text-[#d4af37]" 
                strokeWidth={1.5}
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))',
                }}
              />
              <h2 
                className="text-3xl text-[#d4af37] tracking-wider uppercase"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: '0.15em',
                  fontWeight: 500,
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 8px rgba(212, 175, 55, 0.3)',
                }}
              >
                Question Suspects
              </h2>
            </div>
          </div>

          {/* Chat Interface or Locked Message */}
          <div className="flex-1 overflow-hidden relative z-10">
            {isUnlockedForQuestioning ? (
              <ChatInterfaceWithAttachments
                suspectId={suspect.id}
                suspectName={suspect.name}
                suspectRole={suspect.role}
                suspectPersonality={suspectPersonality}
                systemPrompt={systemPrompt}
                suspectAvatarUrl={suspect.avatarUrl}
                onUnlockQueued={handleUnlockQueued}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#1a1a1a] relative">
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
                  }}
                />
                <div className="text-center px-8 relative z-10">
                  <Lock 
                    className="w-20 h-20 mx-auto mb-6 text-gray-600"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))'
                    }}
                  />
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{
                      color: '#d4af37',
                      fontFamily: "'Playfair Display', serif",
                      textShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    Not Available for Questioning
                  </h3>
                  <p 
                    className="text-gray-400 max-w-md mx-auto leading-relaxed"
                    style={{
                      fontFamily: 'Courier, monospace',
                    }}
                  >
                    {suspect.name} is not yet available for questioning. 
                    You'll need to prove this was murder before Veronica allows you access to the inner circle.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
  )
}
