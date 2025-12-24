"use client"

interface TypewrittenLabelProps {
  text: string
  rotating?: number
}

export function TypewrittenLabel({ text, rotating = 0 }: TypewrittenLabelProps) {
  return (
    <div
      className="inline-block relative"
      style={{
        transform: `rotate(${rotating}deg)`,
      }}
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&display=swap');
        
        .label-card {
          background: linear-gradient(to bottom, #fefefe 0%, #f5f5f5 100%);
          border: 1px solid #d0d0d0;
          padding: 12px 24px;
          box-shadow: 
            0 3px 6px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
        }
        
        .label-text {
          font-family: 'Courier Prime', 'Courier New', monospace;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1a1a1a;
          text-align: center;
        }
        
        /* Pushpin */
        .label-pushpin {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          z-index: 10;
        }
        
        .label-pushpin-head {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #4a4a4a, #1a1a1a);
          box-shadow: 
            0 2px 4px rgba(0,0,0,0.4),
            inset -1px -1px 2px rgba(0,0,0,0.3),
            inset 1px 1px 2px rgba(255,255,255,0.3);
          position: relative;
        }
        
        .label-pushpin-head::after {
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
      `}</style>

      {/* Pushpin */}
      <div className="label-pushpin">
        <div className="label-pushpin-head"></div>
      </div>

      {/* Label Card */}
      <div className="label-card">
        <div className="label-text">{text}</div>
      </div>
    </div>
  )
}

