"use client"

interface BoardHeaderProps {
  detectivePoints: number
  hasUnreadMessage?: boolean
  onOpenMessage?: () => void
  onOpenMenu: () => void
  onOpenHelp: () => void
  // Actions
  onGetClue: () => void
  onSolveMurder: () => void
}

export function BoardHeader({ 
  detectivePoints, 
  hasUnreadMessage, 
  onOpenMessage,
  onOpenMenu,
  onOpenHelp,
  onGetClue,
  onSolveMurder
}: BoardHeaderProps) {
  return (
    <header className="game-header">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Playfair+Display:wght@700&family=VT323&display=swap');

        .game-header {
          width: 100%;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          box-sizing: border-box;
          
          /* Wood Grain Texture */
          background-color: #2a1b12;
          background-image: 
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 2px,
              transparent 2px,
              transparent 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0%,
              rgba(0,0,0,0.4) 15%,
              transparent 30%
            ),
            linear-gradient(
              to bottom,
              #3e2723,
              #251510
            );
          
          border-bottom: 4px solid #1a0f0a;
          box-shadow: 
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 10px 20px black;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .game-header::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.15);
        }

        .plaque-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .brass-plaque {
          background: linear-gradient(
            135deg, 
            #8c701c 0%, 
            #d4af37 20%, 
            #fdf5a6 45%, 
            #d4af37 55%, 
            #8c701c 100%
          );
          padding: 6px 16px;
          border-radius: 4px;
          box-shadow: 
            inset 1px 1px 0 rgba(255,255,255,0.4),
            inset -1px -1px 0 rgba(0,0,0,0.6),
            2px 2px 5px rgba(0,0,0,0.8);
          border: 1px solid #5c4a16;
          display: flex;
          gap: 12px;
          align-items: center;
          position: relative;
        }

        .brass-plaque::before, .brass-plaque::after {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #555);
          box-shadow: 0 1px 1px rgba(0,0,0,0.8);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        .brass-plaque::before { left: 5px; }
        .brass-plaque::after { right: 5px; }

        .plaque-label {
          font-family: 'Playfair Display', serif;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #3e2723;
          text-shadow: 0 1px 0 rgba(255,255,255,0.4);
          font-weight: bold;
          margin-left: 8px;
        }

        .digital-counter {
          background: #000;
          color: #39ff14;
          font-family: 'VT323', monospace;
          font-size: 1.8rem;
          line-height: 1;
          padding: 2px 8px;
          border-radius: 2px;
          border: 1px solid #333;
          box-shadow: 
            inset 0 2px 5px rgba(0,0,0,0.9),
            0 0 5px rgba(57, 255, 20, 0.2);
          text-shadow: 0 0 4px #39ff14;
          margin-right: 8px;
          position: relative;
        }
        
        .digital-counter::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }

        .spacer {
          flex-grow: 1;
        }

        .controls-area {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        button {
          cursor: pointer;
          border: none;
          outline: none;
          transition: transform 0.1s;
        }
        button:active:not(:disabled) {
          transform: translateY(2px);
        }

        .btn-clue {
          background: linear-gradient(to bottom, #e0e0e0, #bdbdbd);
          color: #333;
          font-family: 'Courier Prime', monospace;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 10px 20px;
          border-radius: 3px;
          box-shadow: 
            inset 1px 1px 0 #fff,
            inset -1px -1px 0 #888,
            0 4px 0 #555,
            0 5px 5px rgba(0,0,0,0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
        }
        
        .btn-clue:active:not(:disabled) {
          box-shadow: 
            inset 1px 1px 0 #888,
            inset -1px -1px 0 #fff,
            0 1px 0 #555,
            0 2px 2px rgba(0,0,0,0.5);
          background: linear-gradient(to bottom, #bdbdbd, #e0e0e0);
        }

        .btn-clue:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-solve {
          background: linear-gradient(to bottom, #d32f2f, #b71c1c);
          color: #fce4ec;
          font-family: 'Courier Prime', monospace;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 12px 24px;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 
            inset 0 2px 0 rgba(255,255,255,0.2),
            inset 0 -2px 0 rgba(0,0,0,0.3),
            0 6px 0 #7f0000,
            0 8px 10px rgba(0,0,0,0.6);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-solve::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
          border-radius: 50px 50px 0 0;
        }

        .btn-solve:hover {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          box-shadow: 
            inset 0 2px 0 rgba(255,255,255,0.2),
            inset 0 -2px 0 rgba(0,0,0,0.3),
            0 6px 0 #7f0000,
            0 8px 15px rgba(211, 47, 47, 0.6);
        }

        .btn-solve:active {
          transform: translateY(4px);
          box-shadow: 
            inset 0 2px 5px rgba(0,0,0,0.4),
            0 2px 0 #7f0000,
            0 3px 5px rgba(0,0,0,0.6);
        }

        .icon-btn {
          background: transparent;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          box-shadow: 
            inset 2px 2px 5px rgba(0,0,0,0.7),
            inset -1px -1px 0 rgba(255,255,255,0.1);
          background-color: rgba(0,0,0,0.2);
          transition: background-color 0.2s;
          position: relative;
        }
        
        .icon-btn:hover {
          background-color: rgba(0,0,0,0.3);
        }

        .icon-btn.has-notification::after {
          content: '';
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #ff0000;
          border-radius: 50%;
          box-shadow: 0 0 4px #ff0000;
          animation: pulse-notification 2s infinite;
        }

        @keyframes pulse-notification {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hamburger-icon {
          width: 20px;
          height: 2px;
          background-color: #8d6e63;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.1);
        }
        .hamburger-icon::before, .hamburger-icon::after {
          content: '';
          width: 20px;
          height: 2px;
          background-color: #8d6e63;
          position: absolute;
          left: 0;
          box-shadow: 0 1px 0 rgba(255,255,255,0.1);
        }
        .hamburger-icon::before { top: -6px; }
        .hamburger-icon::after { top: 6px; }

        .help-icon {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: #8d6e63;
          text-shadow: 
            -1px -1px 2px rgba(0,0,0,0.8),
            1px 1px 0 rgba(255,255,255,0.1);
          user-select: none;
        }

        @media (max-width: 768px) {
          .game-header {
            height: auto;
            min-height: 70px;
            padding: 1rem;
            flex-wrap: wrap;
            gap: 1rem;
          }
          
          .plaque-label {
            display: none;
          }
          
          .brass-plaque {
            padding: 4px 12px;
          }
          
          .digital-counter {
            font-size: 1.5rem;
            padding: 2px 6px;
          }
          
          .controls-area {
            gap: 12px;
            width: 100%;
            justify-content: flex-end;
          }
          
          .btn-clue {
            padding: 8px 12px;
            font-size: 0.75rem;
          }
          
          .btn-solve {
            padding: 8px 16px;
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* Left: Detective Points Plaque */}
      <div className="plaque-container">
        <div className="brass-plaque" title="Detective Points">
          <span className="plaque-label">Detective Points</span>
          <div className="digital-counter">{detectivePoints}</div>
        </div>
      </div>

      {/* Center: Empty Spacer */}
      <div className="spacer"></div>

      {/* Right: Game Controls */}
      <div className="controls-area">
        <button 
          className="btn-clue" 
          onClick={onGetClue}
          disabled={detectivePoints < 2}
          title={detectivePoints < 2 ? "Not enough Detective Points" : "Get Clue (-2 DP)"}
        >
          Get Clue
        </button>

        <button 
          className="btn-solve" 
          onClick={onSolveMurder}
          title="Solve Murder"
        >
          Solve Murder
        </button>

        {/* Message Notification Icon (combined with Help) */}
        {hasUnreadMessage && onOpenMessage && (
          <button 
            className={`icon-btn has-notification`}
            onClick={onOpenMessage}
            title="New Message"
          >
            <span className="help-icon">✉</span>
          </button>
        )}

        {/* Help Icon */}
        {!hasUnreadMessage && (
          <button 
            className="icon-btn" 
            onClick={onOpenHelp}
            title="Help"
          >
            <span className="help-icon">?</span>
          </button>
        )}

        {/* Menu Icon */}
        <button 
          className="icon-btn" 
          onClick={onOpenMenu}
          title="Menu"
        >
          <div className="hamburger-icon"></div>
        </button>
      </div>
    </header>
  )
}

