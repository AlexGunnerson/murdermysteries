"use client"

import Image from "next/image"

interface PinnedPhotoProps {
  imageUrl: string
  name: string
  subtitle?: string
  onClick?: () => void
  rotating?: number
  isRevealed?: boolean
  pushpinColor?: 'red' | 'black' | 'blue' | 'green'
}

export function PinnedPhoto({ imageUrl, name, subtitle, onClick, rotating = 0, isRevealed = true, pushpinColor = 'red' }: PinnedPhotoProps) {
  const pushpinColors = {
    red: 'radial-gradient(circle at 30% 30%, #ff6b6b, #cc4545)',
    black: 'radial-gradient(circle at 30% 30%, #4a4a4a, #1a1a1a)',
    blue: 'radial-gradient(circle at 30% 30%, #6b9fff, #4573cc)',
    green: 'radial-gradient(circle at 30% 30%, #6bff8b, #45cc5e)'
  }

  return (
    <div 
      className="relative inline-block"
      style={{
        transform: `rotate(${rotating}deg)`,
      }}
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        
        .pushpin {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          z-index: 10;
        }
        
        .pushpin-head {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${pushpinColors[pushpinColor]};
          box-shadow: 
            0 2px 4px rgba(0,0,0,0.4),
            inset -1px -1px 2px rgba(0,0,0,0.3),
            inset 1px 1px 2px rgba(255,255,255,0.3);
          position: relative;
        }
        
        .pushpin-head::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 6px;
          background: linear-gradient(to bottom, #999, #666);
          border-radius: 0 0 2px 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        
        .photo-print {
          background: white;
          padding: 12px 12px 16px 12px;
          box-shadow: 
            0 4px 8px rgba(0,0,0,0.3),
            0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .photo-print:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 8px 16px rgba(0,0,0,0.4),
            0 2px 6px rgba(0,0,0,0.3);
        }
        
        .photo-print::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.8) 0%,
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.05) 100%
          );
          pointer-events: none;
        }
        
        .sticky-note {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%) rotate(${rotating * -0.5}deg);
          background: white;
          padding: 10px 20px;
          min-width: 140px;
          text-align: center;
          box-shadow: 
            0 3px 6px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(0,0,0,0.1);
          font-family: 'Permanent Marker', cursive;
          color: #1f2937;
          z-index: 5;
        }
        
        .sticky-name {
          font-size: 1.1rem;
          margin-bottom: 2px;
        }
        
        .sticky-subtitle {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        
        .sticky-note::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 15px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05), transparent);
        }
        
        @media (max-width: 768px) {
          .photo-print {
            padding: 10px 10px 14px 10px;
          }
          
          .sticky-note {
            bottom: -35px;
            padding: 8px 14px;
            min-width: 120px;
          }
          
          .sticky-name {
            font-size: 0.9rem;
          }
          
          .sticky-subtitle {
            font-size: 0.65rem;
          }
          
          .pushpin-head {
            width: 14px;
            height: 14px;
          }
          
          .pushpin {
            width: 14px;
            height: 14px;
            top: -7px;
          }
        }
      `}</style>

      {/* Pushpin */}
      <div className="pushpin">
        <div className="pushpin-head"></div>
      </div>

      {/* Photo Print */}
      <button
        onClick={onClick}
        className="photo-print"
      >
        <div className="relative w-[160px] md:w-[200px] aspect-[3/4] bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover ${!isRevealed ? 'brightness-50' : ''}`}
            sizes="(max-width: 768px) 50vw, 200px"
          />
        </div>
      </button>

      {/* Sticky Note with Name */}
      <div className="sticky-note">
        <div className="sticky-name">{name}</div>
        {subtitle && <div className="sticky-subtitle">{subtitle}</div>}
      </div>
    </div>
  )
}

