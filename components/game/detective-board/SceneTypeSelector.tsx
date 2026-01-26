"use client"

import { ArrowLeft, Camera, Search } from "lucide-react"

interface SceneTypeSelectorProps {
  sceneName: string
  hasGalaPhotos: boolean
  onSelectGala: () => void
  onSelectInvestigation: () => void
  onClose: () => void
}

export function SceneTypeSelector({ 
  sceneName, 
  hasGalaPhotos, 
  onSelectGala, 
  onSelectInvestigation, 
  onClose 
}: SceneTypeSelectorProps) {
  // If no gala photos, just go directly to investigation
  if (!hasGalaPhotos) {
    onSelectInvestigation()
    return null
  }

  // Extract short name from parentheses if present, otherwise use full name
  const getShortSceneName = (name: string) => {
    const match = name.match(/\(([^)]+)\)/)
    return match ? match[1] : name
  }

  const shortSceneName = getShortSceneName(sceneName)

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(10,10,10,0.85) 0%, rgba(0,0,0,0.98) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Centered modal container */}
      <div 
        className="relative w-full max-w-3xl mx-auto rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
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
        {/* Enhanced grain overlay for entire modal */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Back button - top left */}
        <button
          onClick={onClose}
          className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Title */}
          <div 
            className="mb-8 text-center"
            style={{
              background: '#0a0a0a',
              color: '#d4af37',
              padding: '12px 20px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              borderRadius: '2px',
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.1), 
                0 2px 4px rgba(0,0,0,0.4),
                0 0 12px rgba(212, 175, 55, 0.2)
              `,
              border: '1px solid rgba(212, 175, 55, 0.3)',
              textTransform: 'uppercase',
              fontSize: '14px',
              fontFamily: 'Courier, monospace',
              textShadow: '0 0 8px rgba(212, 175, 55, 0.5)'
            }}
          >
            {sceneName}
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Gala Photos Button */}
            <button
              onClick={onSelectGala}
              className="relative group"
            >
              <div
                className="p-8 bg-[#f4f1ea] rounded-sm transition-all duration-200 text-left overflow-hidden"
                style={{
                  border: '2px solid rgba(139, 58, 58, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '2px solid rgba(139, 58, 58, 0.8)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 58, 58, 0.4)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '2px solid rgba(139, 58, 58, 0.4)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {/* Grain texture overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px',
                  }}
                />

                {/* Top accent bar */}
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(139, 58, 58, 0.8), rgba(139, 58, 58, 0.4), rgba(139, 58, 58, 0.8))'
                  }}
                />

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <Camera 
                    className="w-12 h-12" 
                    style={{ color: '#8b3a3a' }}
                  />
                </div>

                {/* Title */}
                <h3 
                  className="text-2xl font-bold mb-2 text-center"
                  style={{ 
                    color: '#2c2a29',
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  May 10th, 1986
                </h3>

                {/* Description */}
                <p 
                  className="text-sm text-center"
                  style={{ 
                    color: '#5a5a5a',
                    fontFamily: 'Courier, monospace'
                  }}
                >
                  Gala Event Photos
                </p>
              </div>
            </button>

            {/* Investigation Photos Button */}
            <button
              onClick={onSelectInvestigation}
              className="relative group"
            >
              <div
                className="p-8 bg-[#f4f1ea] rounded-sm transition-all duration-200 text-left overflow-hidden"
                style={{
                  border: '2px solid rgba(44, 74, 107, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '2px solid rgba(44, 74, 107, 0.8)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(44, 74, 107, 0.4)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '2px solid rgba(44, 74, 107, 0.4)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {/* Grain texture overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px',
                  }}
                />

                {/* Top accent bar */}
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(44, 74, 107, 0.8), rgba(44, 74, 107, 0.4), rgba(44, 74, 107, 0.8))'
                  }}
                />

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <Search 
                    className="w-12 h-12" 
                    style={{ color: '#2c4a6b' }}
                  />
                </div>

                {/* Title */}
                <h3 
                  className="text-2xl font-bold mb-2 text-center"
                  style={{ 
                    color: '#2c2a29',
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  {shortSceneName}
                </h3>

                {/* Description */}
                <p 
                  className="text-sm text-center"
                  style={{ 
                    color: '#5a5a5a',
                    fontFamily: 'Courier, monospace'
                  }}
                >
                  Investigation Photos
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
