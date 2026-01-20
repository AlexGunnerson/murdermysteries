"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface VeronicaLetterProps {
  onBeginInvestigation: () => void
  isFirstView?: boolean
}

export function VeronicaLetter({ onBeginInvestigation, isFirstView = true }: VeronicaLetterProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="min-h-screen bg-[#1a1a1a] py-8 px-4 flex flex-col justify-center relative"
      onClick={onBeginInvestigation}
    >
      {/* Top Left Button */}
      {isFirstView ? (
        <div className="absolute top-4 left-4 z-20" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={onBeginInvestigation}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            Begin Investigation
          </Button>
        </div>
      ) : (
        <button
          onClick={onBeginInvestigation}
          className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Herr+Von+Muellerhoff&display=swap');
        
        .letter-container {
          perspective: 2000px;
          cursor: pointer;
        }
        
        .letter-flipper {
          position: relative;
          width: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        
        .letter-flipper.flipped {
          transform: rotateY(180deg);
        }
        
        .parchment {
          font-family: 'Caveat', cursive;
          background-color: #f8f5e6;
          background-image: 
            url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            linear-gradient(to bottom right, rgba(255,255,255,0.5), rgba(0,0,0,0.1));
          box-shadow: 
            0 1px 4px rgba(0,0,0,0.3),
            0 0 40px rgba(0,0,0,0.1) inset,
            10px 10px 30px rgba(0,0,0,0.5);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .parchment-front {
          transform: rotate(-0.5deg);
          min-height: 750px;
        }
        
        .parchment-back {
          transform: rotateY(180deg) rotate(0.5deg);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          min-height: 750px;
        }
        
        .parchment::before {
          content: '';
          position: absolute;
          top: 33%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0,0,0,0.05);
          box-shadow: 0 1px 1px rgba(255,255,255,0.4);
        }
        
        .parchment::after {
          content: '';
          position: absolute;
          top: 66%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0,0,0,0.05);
          box-shadow: 0 1px 1px rgba(255,255,255,0.4);
        }
        
        .letter-title {
          font-family: 'Herr Von Muellerhoff', cursive;
          font-weight: 400;
          font-size: 2.5rem;
          line-height: 0.8;
          opacity: 0.9;
        }
        
        .ink-text {
          font-size: 1.4rem;
          line-height: 1.35;
          text-shadow: 0 0 1px rgba(44, 42, 41, 0.2);
          opacity: 0.9;
          color: #2c2a29;
        }
        
        .ink-text p {
          margin-bottom: 1.2rem;
        }
        
        .signature {
          font-family: 'Herr Von Muellerhoff', cursive;
          font-size: 2rem;
          transform: rotate(-2deg);
          display: inline-block;
        }
        
        .seal {
          width: 60px;
          height: 60px;
          background: #8d2424;
          border-radius: 50%;
          position: absolute;
          bottom: 30px;
          right: 30px;
          box-shadow: 
            inset 0 0 10px rgba(0,0,0,0.5),
            2px 2px 4px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px double rgba(255,255,255,0.2);
          opacity: 0.9;
        }
        
        .seal-inner {
          border: 2px solid rgba(60, 10, 10, 0.3);
          border-radius: 50%;
          width: 85%;
          height: 85%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: serif;
          font-size: 24px;
          font-weight: bold;
          color: rgba(60, 10, 10, 0.4);
          text-shadow: 1px 1px 0 rgba(255,255,255,0.2);
        }
        
        .page-turn-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-family: Arial, sans-serif;
          animation: pulse 2s infinite;
          pointer-events: none;
          z-index: 10;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .corner-curl {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 60px 60px;
          border-color: transparent transparent #d4c4a8 transparent;
          opacity: 0.6;
          transition: border-width 0.3s;
        }
        
        .letter-container:hover .corner-curl {
          border-width: 0 0 80px 80px;
        }
        
        @media (max-width: 640px) {
          .parchment {
            padding: 25px 20px 50px 20px !important;
          }
          .parchment-front,
          .parchment-back {
            min-height: 650px;
          }
          .letter-title {
            font-size: 2rem;
          }
          .ink-text {
            font-size: 1rem;
          }
          .ink-text p {
            margin-bottom: 0.75rem;
          }
          .signature {
            font-size: 1.5rem;
          }
          .seal {
            width: 45px;
            height: 45px;
            bottom: 15px;
            right: 15px;
          }
          .seal-inner {
            font-size: 18px;
          }
          .page-turn-hint {
            font-size: 0.75rem;
            padding: 6px 12px;
            bottom: 15px;
          }
        }
      `}</style>

      <div className="max-w-[700px] mx-auto">
        <div 
          className="letter-container mb-8" 
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped(!isFlipped)
          }}
        >
          <div className={`letter-flipper ${isFlipped ? 'flipped' : ''}`}>
            {/* FRONT PAGE */}
            <div className="parchment parchment-front relative rounded-sm pt-[45px] px-[40px] pb-[70px]">
              {/* Date/Location */}
              <div className="text-right text-gray-600 text-base mb-5 pr-4 opacity-80">
                Ashcombe Manor<br />
                May 12th, 1986
              </div>

              <div className="ink-text">
                <p>To the Inquiry Agent,</p>

                <p>
                  I write this with a trembling hand, though I pray my resolve remains steady. By now, 
                  the countryside is awash with the news. The constable calls it a misfortune—a slip of 
                  the foot after too much wine and celebration. He calls it an accident.
                </p>

                <p className="font-bold" style={{ color: '#202020' }}>
                  I call it impossible.
                </p>

                <p>
                  Reginald was a man of immense vitality. Even at his age, he moved with the grace of a 
                  man twenty years his junior. He has descended that grand staircase thousands of times—in 
                  darkness, in haste, in joy. To suggest he simply &quot;slipped&quot; is an insult to his memory, 
                  and to my intelligence.
                </p>

                <p>
                  I was the one who found him. Mrs. Portwell and I were looking to revise a speech, and as 
                  I descended the stairs... he was just there at the bottom. He wasn&apos;t moving. A wine glass 
                  lay shattered near him, the dark liquid pooling across the marble like a terrible shadow. 
                  I screamed, and it must have been loud because Colin, Lydia, and Dr. Vale came running 
                  immediately.
                </p>

                <p>
                  Dr. Vale knelt beside him and checked for a pulse. The way he looked up at me... I knew 
                  Reginald was gone. I just stood there, frozen, unable to comprehend the silence where his 
                  laughter should have been.
                </p>
              </div>

              {/* Corner curl indicator */}
              <div className="corner-curl"></div>
              
              {/* Page turn hint */}
              <div className="page-turn-hint">
                Click to turn page →
              </div>
            </div>

            {/* BACK PAGE */}
            <div className="parchment parchment-back relative rounded-sm pt-[45px] px-[40px] pb-[70px]">
              <div className="ink-text">
                <p>
                  Reginald was a generous man, but generosity often breeds resentment in the shadows. There 
                  are those under this very roof who had reason to wish him silenced. Legacies are heavy 
                  burdens, and not everyone in our circle carries them with grace.
                </p>

                <p>
                  However, I will not have the Ashcombe name dragged through the mud on mere speculation. 
                  I cannot allow a circus of accusations while my husband is not yet cold. Therefore 
                  Reginald&apos;s inner circle, his closest family and friends are unavailable for your questioning 
                  until you can bring me some type of proof that this was foul play.
                </p>

                <p>
                  Do not disturb them. Do not alert them. Investigate the grounds and the physical evidence. 
                  Prove to me that my worst fears are true, and I will give you the keys to the kingdom. 
                  Until then, tread lightly.
                </p>

                <p>Bring me the truth.</p>

                <div className="signature mt-8">
                  Veronica Ashcombe
                </div>
              </div>

              {/* Wax Seal */}
              <div className="seal">
                <div className="seal-inner">A</div>
              </div>

              {/* Page turn hint */}
              <div className="page-turn-hint">
                ← Click to turn back
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

