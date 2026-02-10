"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { useGameState } from "@/lib/hooks/useGameState"

interface DocumentPage {
  label: string
  content: React.ReactNode
}

interface DocumentHTMLViewerProps {
  documentName: string
  pages: DocumentPage[]
  onClose: () => void
}

export function DocumentHTMLViewer({ documentName, pages, onClose }: DocumentHTMLViewerProps) {
  const { updateChecklistProgress } = useGameState()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track tutorial progress when document is viewed
  useEffect(() => {
    updateChecklistProgress('viewedDocument', true)
  }, [updateChecklistProgress])

  // Auto-focus the container for keyboard navigation
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Boundary checks for navigation
  const isAtStart = currentIndex === 0
  const isAtEnd = currentIndex === pages.length - 1

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, pages.length - 1))
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && !isAtEnd) goToNext()
    if (e.key === 'ArrowLeft' && !isAtStart) goToPrevious()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="w-full max-w-4xl h-full pt-2 pb-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-[900px] mx-auto mt-2 mb-8" onClick={(e) => e.stopPropagation()}>
          {/* Back button */}
          <button
            onClick={onClose}
            className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Document title label */}
          <div 
            className="label"
            style={{
              background: '#1a1a1a',
              color: '#ffffff',
              padding: '12px 20px',
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '20px',
              width: '100%',
              borderRadius: '2px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
              border: '1px solid #333',
              textTransform: 'uppercase',
              fontSize: '14px'
            }}
          >
            {documentName.toUpperCase()}
          </div>

          {/* Document container */}
          <div className="relative bg-[#f4e8d8] shadow-2xl border border-[#8b7355] flex flex-col" style={{ height: '850px' }}>
            {/* Paper texture overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 z-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(139, 115, 85, 0.1) 2px,
                  rgba(139, 115, 85, 0.1) 4px
                )`
              }}
            />
            
            {/* Content - with overflow scroll if content is too long */}
            <div className="relative z-10 p-8 md:p-12 overflow-y-auto" style={{ fontFamily: "'Courier New', monospace", height: '100%' }}>
              {pages[currentIndex].content}
            </div>

            {/* Navigation arrows */}
            {pages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={isAtStart}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all shadow-lg z-20 ${
                    isAtStart 
                      ? 'bg-[#8b7355]/50 text-[#8b7355]/40 cursor-not-allowed' 
                      : 'bg-[#2a2520] hover:bg-[#3a3530] text-[#f4e8d8] hover:scale-110'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={goToNext}
                  disabled={isAtEnd}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all shadow-lg z-20 ${
                    isAtEnd 
                      ? 'bg-[#8b7355]/50 text-[#8b7355]/40 cursor-not-allowed' 
                      : 'bg-[#2a2520] hover:bg-[#3a3530] text-[#f4e8d8] hover:scale-110'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Page dots indicator */}
          {pages.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'w-8 bg-[#f4e8d8]' 
                      : 'w-2 bg-[#8b7355] hover:bg-[#a0886a]'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Keyboard hints */}
          {pages.length > 1 && (
            <div className="text-center text-[#8b7355] text-sm mt-3">
              Use arrow keys or click arrows to navigate • ESC to close
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

