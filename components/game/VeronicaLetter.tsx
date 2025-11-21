"use client"

import { Button } from "@/components/ui/button"

interface VeronicaLetterProps {
  onBeginInvestigation: () => void
}

export function VeronicaLetter({ onBeginInvestigation }: VeronicaLetterProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-20 px-4 overflow-y-auto">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Herr+Von+Muellerhoff&display=swap');
        
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
          transform: rotate(-0.5deg);
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
          font-size: 3.5rem;
          line-height: 0.8;
          opacity: 0.9;
        }
        
        .ink-text {
          font-size: 1.75rem;
          line-height: 1.4;
          text-shadow: 0 0 1px rgba(44, 42, 41, 0.2);
          opacity: 0.9;
          color: #2c2a29;
        }
        
        .ink-text p {
          margin-bottom: 1.5rem;
        }
        
        .signature {
          font-family: 'Herr Von Muellerhoff', cursive;
          font-size: 3rem;
          transform: rotate(-2deg);
          display: inline-block;
        }
        
        .seal {
          width: 70px;
          height: 70px;
          background: #8d2424;
          border-radius: 50%;
          position: absolute;
          bottom: 40px;
          right: 40px;
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
          font-size: 30px;
          font-weight: bold;
          color: rgba(60, 10, 10, 0.4);
          text-shadow: 1px 1px 0 rgba(255,255,255,0.2);
        }
        
        @media (max-width: 640px) {
          .parchment {
            padding: 30px 20px !important;
          }
          .letter-title {
            font-size: 2.5rem;
          }
          .ink-text {
            font-size: 1.2rem;
          }
          .seal {
            width: 50px;
            height: 50px;
            bottom: 20px;
            right: 20px;
          }
          .seal-inner {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="max-w-[700px] mx-auto">
        <div className="parchment relative rounded-sm p-[60px_50px] mb-8">
          {/* Date/Location */}
          <div className="text-right text-gray-600 text-lg mb-6 pr-4 opacity-80">
            Ashcombe Manor<br />
            October 14th, 1924
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
        </div>

        {/* Begin Investigation Button */}
        <div className="text-center">
          <Button
            onClick={onBeginInvestigation}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg"
            size="lg"
          >
            Begin Investigation
          </Button>
        </div>
      </div>
    </div>
  )
}

