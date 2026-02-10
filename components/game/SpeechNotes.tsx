"use client"

import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useGameState } from "@/lib/hooks/useGameState"

interface SpeechNotesProps {
  onClose: () => void
}

export function SpeechNotes({ onClose }: SpeechNotesProps) {
  const { updateChecklistProgress } = useGameState()

  // Track tutorial progress when document is viewed
  useEffect(() => {
    updateChecklistProgress('viewedDocument', true)
  }, [updateChecklistProgress])

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="min-h-screen pt-24 pb-16 px-4 flex flex-col justify-center relative w-full max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Top Left Button */}
      <button
        onClick={onClose}
        className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
        aria-label="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bradley+Hand&display=swap');
        
        .document {
          background: #f4e8d8;
          padding: 45px 40px 70px 40px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border: 1px solid #8b7355;
          position: relative;
          font-family: 'Courier New', monospace;
          height: 850px;
          overflow-y: auto;
        }
        
        .document::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 115, 85, 0.03) 2px,
            rgba(139, 115, 85, 0.03) 4px
          );
          pointer-events: none;
        }
        
        .notes {
          background: #fff;
          padding: 35px;
          font-family: 'Bradley Hand', cursive;
          font-size: 16px;
          line-height: 2.2;
          color: #1a1510;
          position: relative;
        }
        
        .notes h2 {
          font-family: 'Times New Roman', serif;
          text-align: center;
          font-size: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 25px;
        }
        
        .notes p {
          margin: 15px 0;
        }
        
        .notes .indent {
          margin-left: 40px;
        }
        
        .notes .underline {
          text-decoration: underline;
        }
        
        .notes .bracket {
          color: #666;
          font-style: italic;
        }
        
        .label {
          background: #2a2520;
          color: #f4e8d8;
          padding: 10px 20px;
          text-align: center;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }
        
        @media (max-width: 640px) {
          .document {
            padding: 25px 20px 50px 20px;
            height: 750px;
          }
          
          .notes {
            padding: 20px;
            font-size: 14px;
            line-height: 1.8;
          }
          
          .notes h2 {
            font-size: 18px;
          }
          
          .notes .indent {
            margin-left: 20px;
          }
        }
      `}</style>

      <div className="max-w-[700px] mx-auto">
        <div className="document rounded-sm">
          <div className="notes">
            <h2>Opening Remarks - Annual Gala<br/>May 10, 1986</h2>

            <p>Good evening, and welcome to Ashcombe Estate.</p>

            <p>Thank you all for joining us on this special evening. <span className="bracket">[pause for applause]</span></p>

            <p><span className="underline">Acknowledge:</span></p>
            <p className="indent">- Lord and Lady Pemberton</p>
            <p className="indent">- Dr. Morrison and the hospital board</p>
            <p className="indent">- Our Foundation trustees</p>

            <p>Tonight marks the 63rd annual Ashcombe Foundation Gala. For over six decades, this family has been committed to supporting education and the arts in our community.</p>

            <p><span className="underline">Foundation achievements this year:</span></p>
            <p className="indent">- 47 scholarships awarded</p>
            <p className="indent">- £180,000 raised for local schools</p>
            <p className="indent">- New music program at Wickham Academy</p>
            <p className="indent"><span className="bracket">[mention Lydia&apos;s hard work]</span></p>

            <p>I often think of my father, who started this tradition in 1923. He believed that privilege carries responsibility. That those who have been fortunate must give back. <span className="bracket">[personal touch - brief story about father?]</span></p>

            <p>Tonight, we continue that legacy. Every contribution you make this evening goes directly to young people who deserve a chance to pursue their dreams.</p>

            <p><span className="underline">Greenhouse mention:</span></p>
            <p className="indent">Many of you toured the greenhouse earlier. Those exotic plants represent years of careful cultivation - much like the young minds we nurture through our scholarships. <span className="bracket">[good metaphor]</span></p>

            <p>Before I turn things over to Veronica for the formal program, I want to thank each of you personally. Your generosity makes this work possible.</p>

            <p><span className="bracket">[look around room, make eye contact]</span></p>

            <p>Now, please enjoy the evening. Bid generously at our auction. And know that you are changing lives.</p>

            <p>Thank you.</p>

            <p style={{ marginTop: '40px', textAlign: 'right' }}>— R.A.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}





