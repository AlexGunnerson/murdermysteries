"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pages.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + pages.length) % pages.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2520] p-4 overflow-y-auto"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="relative max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Document title and counter */}
        <div className="absolute -top-12 left-0 text-[#f4e8d8]">
          <h3 className="text-2xl font-bold mb-1">{documentName}</h3>
          <p className="text-sm text-[#8b7355]">
            {pages[currentIndex].label}
          </p>
        </div>

        {/* Document container */}
        <div className="relative bg-[#f4e8d8] shadow-2xl border border-[#8b7355] max-h-[85vh] flex flex-col">
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
          
          {/* Content with scrolling */}
          <div className="relative z-10 overflow-y-auto p-8 md:p-12" style={{ fontFamily: "'Courier New', monospace" }}>
            {pages[currentIndex].content}
          </div>

          {/* Navigation arrows */}
          {pages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#2a2520] hover:bg-[#3a3530] text-[#f4e8d8] rounded-full transition-all hover:scale-110 shadow-lg z-20"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2a2520] hover:bg-[#3a3530] text-[#f4e8d8] rounded-full transition-all hover:scale-110 shadow-lg z-20"
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
  )
}

