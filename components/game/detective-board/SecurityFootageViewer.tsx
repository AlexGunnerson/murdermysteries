"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowLeft, ChevronLeft, ChevronRight, Camera } from "lucide-react"
import { QuickNoteButton } from "../QuickNoteButton"

interface SecurityFootageViewerProps {
  images: string[]
  onClose: () => void
}

export function SecurityFootageViewer({ images, onClose }: SecurityFootageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-focus the container for keyboard navigation
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

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

  // Determine camera number from filename
  const getCameraInfo = (imagePath: string) => {
    const filename = imagePath.split('/').pop() || ''
    const match = filename.match(/cam(\d+)\.(\d+)/)
    if (match) {
      return {
        camera: match[1],
        clip: match[2]
      }
    }
    return { camera: '1', clip: '1' }
  }

  const cameraInfo = getCameraInfo(images[currentIndex])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Back button - top left */}
      <button
        onClick={onClose}
        className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
        aria-label="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Security Camera Header */}
      <div className="absolute top-8 right-8 bg-gray-900/95 backdrop-blur-sm px-6 py-3 rounded border border-red-600/50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <div>
            <h3 className="text-lg font-mono font-bold text-red-500">CAMERA {cameraInfo.camera}</h3>
            <p className="text-xs text-gray-400 font-mono">
              Clip {currentIndex + 1} of {images.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main viewer area */}
      <div 
        className="relative w-full max-w-7xl h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-20 p-4 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full transition-all hover:scale-110 shadow-xl"
              aria-label="Previous clip"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 z-20 p-4 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full transition-all hover:scale-110 shadow-xl"
              aria-label="Next clip"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Security footage frame */}
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg border-4 border-gray-800 shadow-2xl overflow-hidden">
          {/* Scanline effect overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)'
            }}
          />
          
          {/* The footage image */}
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex]}
              alt={`Security Camera ${cameraInfo.camera} - Clip ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

        </div>
      </div>

      {/* Clip dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-2 bg-gray-900/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-700">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'w-8 bg-red-600' 
                  : 'w-2 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to clip ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
  )
}

