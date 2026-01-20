"use client"

import { X, AlertCircle } from 'lucide-react'

interface ErrorNotificationProps {
  message: string
  onClose: () => void
}

export function ErrorNotification({ message, onClose }: ErrorNotificationProps) {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Courier+Prime:wght@400;700&display=swap');
      `}</style>
    <div 
      className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(10,10,10,0.5) 0%, rgba(0,0,0,0.7) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      <div 
        className="relative w-full max-w-md mx-auto rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(220, 38, 38, 0.15),
            inset 0 0 1px rgba(220, 38, 38, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.03)
          `,
          border: '1px solid rgba(220, 38, 38, 0.2)',
        }}
      >
        {/* Enhanced grain overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 bg-[#0a0a0a]/95 hover:bg-red-500/20 text-red-400 rounded-sm transition-all duration-200 border border-red-400/40"
          aria-label="Close"
          style={{
            boxShadow: `
              0 2px 10px rgba(0, 0, 0, 0.8),
              0 0 12px rgba(220, 38, 38, 0.3),
              inset 0 0 8px rgba(220, 38, 38, 0.1)
            `,
          }}
        >
          <X 
            className="w-5 h-5" 
            style={{
              filter: 'drop-shadow(0 0 4px rgba(220, 38, 38, 0.5))',
            }}
          />
        </button>

        {/* Modal Content */}
        <div 
          className="bg-[#1a1a1a] p-6 relative"
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
          {/* Error Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 
              className="text-xl font-bold uppercase tracking-wider text-red-400"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Error
            </h3>
          </div>

          {/* Error Message */}
          <div className="mb-6">
            <p 
              className="text-[#e8e4da] text-lg leading-relaxed"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              {message}
            </p>
          </div>

          {/* OK Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-400"
              style={{
                fontFamily: "'Courier Prime', monospace",
                boxShadow: '0 0 15px rgba(220, 38, 38, 0.2), inset 0 0 8px rgba(220, 38, 38, 0.1)',
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
