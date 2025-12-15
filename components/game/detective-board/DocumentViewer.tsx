"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface DocumentViewerProps {
  documentName: string
  images: string[]
  onClose: () => void
}

export function DocumentViewer({ documentName, images, onClose }: DocumentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="relative max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white hover:bg-gray-200 text-gray-800 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Document title and counter */}
        <div className="absolute -top-12 left-0 text-white">
          <h3 className="text-2xl font-bold mb-1">{documentName}</h3>
          <p className="text-sm text-gray-300">
            Page {currentIndex + 1} of {images.length}
          </p>
        </div>

        {/* Main image container */}
        <div className="relative bg-white p-4 shadow-2xl">
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={images[currentIndex]}
              alt={`${documentName} - Page ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1536px) 100vw, 1536px"
              priority
            />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all hover:scale-110"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all hover:scale-110"
                aria-label="Next page"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Page dots indicator */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Keyboard hints */}
        {images.length > 1 && (
          <div className="text-center text-white/60 text-sm mt-3">
            Use arrow keys or click arrows to navigate • ESC to close
          </div>
        )}
      </div>
    </div>
  )
}

