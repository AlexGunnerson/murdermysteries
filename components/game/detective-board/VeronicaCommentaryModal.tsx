"use client"

import Image from 'next/image'
import { X } from 'lucide-react'

interface VeronicaCommentaryModalProps {
  onClose: () => void
}

export function VeronicaCommentaryModal({ onClose }: VeronicaCommentaryModalProps) {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .commentary-enter {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
      
      {/* Modal */}
      <div 
        className="commentary-enter fixed top-16 left-1/2 z-[75] w-[95%] max-w-6xl rounded-lg overflow-hidden"
        style={{
          transform: 'translateX(-50%)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(212, 175, 55, 0.2),
            inset 0 0 1px rgba(212, 175, 55, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.03)
          `,
          border: '1px solid rgba(212, 175, 55, 0.3)',
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
          className="bg-[#0a0a0a] px-6 py-4 relative"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(5, 5, 5, 1) 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 12px,
                rgba(0, 0, 0, 0.25) 12px,
                rgba(0, 0, 0, 0.25) 13px
              )
            `,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-sm border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors z-10"
            style={{
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
            }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5">
            {/* Veronica's Avatar */}
            <div 
              className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4af37]"
              style={{
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Image 
                src="/cases/case01/images/portraits/veronica_avi_2.png" 
                alt="Veronica Ashcombe"
                width={64} 
                height={64}
                className="scale-[2] object-cover"
              />
            </div>

            {/* Commentary */}
            <div 
              className="text-[#e8d7b5] leading-snug flex-1 pr-12"
              style={{ 
                fontFamily: "'Courier Prime', monospace",
                fontSize: '1.05rem',
                textShadow: '0 0 3px rgba(232, 215, 181, 0.2)',
              }}
            >
              <p>
                "Detective, wait... These aren't the papers I gave you. This is an entirely different set—a backup Reginald must have kept. I had no idea he made copies, let alone where he hid them. And look... Dr. Vale's file is here in this set. How meticulous of him to maintain duplicates."
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
