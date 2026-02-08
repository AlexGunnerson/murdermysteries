"use client"

interface LoadingModalProps {
  message?: string
}

export function LoadingModal({ message = "Loading..." }: LoadingModalProps) {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div 
        className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(10,10,10,0.5) 0%, rgba(0,0,0,0.7) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
          `,
        }}
      >
        <div 
          className="relative w-full max-w-md mx-auto rounded-sm overflow-hidden"
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
          {/* Grain overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          />

          {/* Modal Content */}
          <div 
            className="bg-[#1a1a1a] p-12 relative flex flex-col items-center gap-6"
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
            {/* Spinner */}
            <div className="spinner" />
            
            {/* Message */}
            <p 
              className="text-[#d4af37] text-xl font-bold text-center uppercase tracking-wider"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
