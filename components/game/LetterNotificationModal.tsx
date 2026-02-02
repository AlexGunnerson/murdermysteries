"use client"

import { Mail } from 'lucide-react'

interface LetterNotificationModalProps {
  onOpenLetter: () => void
}

export function LetterNotificationModal({ onOpenLetter }: LetterNotificationModalProps) {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        
        .notification-enter {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .envelope-icon {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(10,10,10,0.5) 0%, rgba(0,0,0,0.7) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
          `,
        }}
      >
        <div 
          className="notification-enter relative w-full max-w-md mx-auto rounded-sm overflow-hidden"
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
          {/* Film grain overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          />

          {/* Modal Content */}
          <div 
            className="bg-[#1a1a1a] p-10 relative"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(18, 18, 18, 1) 100%),
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 12px,
                  rgba(0, 0, 0, 0.15) 12px,
                  rgba(0, 0, 0, 0.15) 13px
                )
              `,
            }}
          >
            {/* Envelope Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="envelope-icon p-6 rounded-full border-2 border-[#d4af37]"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1)',
                }}
              >
                <Mail 
                  className="w-12 h-12 text-[#d4af37]" 
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))',
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <h2 
              className="text-3xl font-bold text-[#d4af37] mb-3 text-center tracking-wide"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 8px rgba(212, 175, 55, 0.3)',
                letterSpacing: '0.05em',
              }}
            >
              You Have Received a Letter
            </h2>

            {/* Message */}
            <p 
              className="text-[#c5a065] text-center mb-8 text-sm"
              style={{ 
                fontFamily: "'Courier Prime', monospace",
                textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
              }}
            >
              From: Veronica Ashcombe
            </p>

            {/* Open Letter Button */}
            <div className="flex justify-center">
              <button
                onClick={onOpenLetter}
                className="px-8 py-4 rounded-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border-[#d4af37] group"
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(212, 175, 55, 0.1)',
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
                }}
              >
                <span className="flex items-center gap-2">
                  Open Letter
                  <Mail 
                    className="w-5 h-5 transition-transform group-hover:scale-110" 
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))',
                    }}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
