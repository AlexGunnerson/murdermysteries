"use client"

import { X, FileText, Users, Camera, FileSearch, BookOpen, MapPin, Lightbulb } from 'lucide-react'

interface HowToPlayModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null

  const sections = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "THE OBJECTIVE",
      description: "Every case starts here. This is your beat, detective. The objective shifts as you crack deeper into the investigation."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "QUESTION SUSPECTS",
      description: (
        <>
          Each member of Reginald&apos;s inner circle has secrets. Click their image to review their dossier and interrogate them. <strong>Important:</strong> Suspects will lie to protect themselves. Submit documents and photos that contradict their stories to expose the truth.
        </>
      )
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      title: "REVIEW DOCUMENTS",
      description: "The truth hides in the fine print. These documents hold the keys to cracking the case wide open. Review them carefully."
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "SCENE OF THE CRIME",
      description: "Photographs don't lie. Study every shadow, every detail. In this line of work, the truth is hidden in what you choose to ignore."
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "FIELD NOTES",
      description: "A good detective keeps notes. Theories, hunches, patterns - jot them down before they vanish like smoke in the night."
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "THE INVESTIGATION BOARD",
      description: "This is where it all comes together. Pin your evidence, draw connections. The red string never lies, follow it to the truth."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "HINTS",
      description: "Sometimes you hit a dead end. Click here when the trail goes cold and you need a nudge in the right direction."
    }
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div 
          className="relative w-full max-w-2xl mx-auto rounded-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            maxHeight: '90vh'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] p-2 text-[#d4af37]/60 hover:text-[#d4af37] transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="bg-[#1a1a1a] relative">
            {/* Film grain overlay */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35 z-[5]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '120px 120px',
              }}
            />

            {/* Header */}
            <div className="p-8 pb-6 border-b border-[#d4af37]/20 relative z-10">
              <h2 
                className="text-2xl font-bold tracking-wider uppercase text-center"
                style={{
                  color: '#d4af37',
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.3)',
                  fontFamily: "'Courier Prime', monospace"
                }}
              >
                How To Play
              </h2>
              <p 
                className="text-[#e8e4da]/80 text-center mt-3 text-base"
                style={{ fontFamily: "'Courier Prime', monospace" }}
              >
                  Welcome, detective. Here&apos;s how to crack the case.
              </p>
            </div>

            {/* Scrollable Content */}
            <div 
              className="p-8 space-y-6 overflow-y-auto relative z-10"
              style={{ maxHeight: 'calc(90vh - 180px)' }}
            >
              {sections.map((section, index) => (
                <div 
                  key={index}
                  className="border-l-2 border-[#d4af37]/30 pl-5 py-2"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-[#d4af37] mt-1">
                      {section.icon}
                    </div>
                    <h3 
                      className="text-lg uppercase tracking-wider text-[#d4af37] font-bold"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      {section.title}
                    </h3>
                  </div>
                  <p 
                    className="text-[#e8e4da]/80 leading-relaxed ml-8"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {section.description}
                  </p>
                </div>
              ))}

              {/* Final Tips */}
              <div className="mt-8 p-5 bg-black/20 border border-[#d4af37]/20 rounded-sm">
                <p 
                  className="text-[#d4af37]/90 text-center italic leading-relaxed"
                  style={{ fontFamily: "'Courier Prime', monospace" }}
                >
                  Remember detective, every detail matters. The killer always leaves a trail. 
                  Trust your instincts, follow the evidence, and don&apos;t be afraid to challenge the suspects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
