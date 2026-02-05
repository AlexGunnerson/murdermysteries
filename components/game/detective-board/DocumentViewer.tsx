"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

interface DocumentViewerProps {
  documentName: string
  images: string[]
  onClose: () => void
  initialIndex?: number
  annotations?: Record<string, string>
}

export function DocumentViewer({ documentName, images, onClose, initialIndex = 0, annotations }: DocumentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Check if current image has annotations (gala photos)
  const hasAnnotations = !!annotations
  const getCurrentAnnotation = () => {
    if (!annotations) return null
    const imagePath = images[currentIndex]
    const filename = imagePath.split('/').pop() || ''
    return annotations[filename] || null
  }

  // Auto-focus the container for keyboard navigation
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Reset zoom and flip when changing images
  useEffect(() => {
    setIsZoomed(false)
    setIsFlipped(false)
    setPanOffset({ x: 0, y: 0 })
  }, [currentIndex])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDragging) {
      setIsZoomed(!isZoomed)
      if (isZoomed) {
        setPanOffset({ x: 0, y: 0 })
      }
    }
  }
  
  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && !isZoomed) goToNext()
    if (e.key === 'ArrowLeft' && !isZoomed) goToPrevious()
    if (e.key === 'Escape') onClose()
    if (hasAnnotations && (e.key === 'f' || e.key === 'F' || e.key === ' ')) {
      e.preventDefault()
      setIsFlipped(!isFlipped)
    }
    if (!hasAnnotations && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault()
      setIsZoomed(!isZoomed)
      if (isZoomed) setPanOffset({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      e.stopPropagation()
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Calculate visible images for carousel effect
  const getVisibleImages = () => {
    if (images.length === 1) return [{ index: 0, position: 'center' }]
    
    const prev = (currentIndex - 1 + images.length) % images.length
    const next = (currentIndex + 1) % images.length
    
    return [
      { index: prev, position: 'left' },
      { index: currentIndex, position: 'center' },
      { index: next, position: 'right' }
    ]
  }

  const currentAnnotation = getCurrentAnnotation()
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');
        
        .photo-flipper {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        
        .photo-flipper.flipped {
          transform: rotateY(180deg);
        }
        
        .photo-front,
        .photo-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .photo-back {
          transform: rotateY(180deg);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }
        
        .annotation-text {
          font-family: 'Caveat', cursive;
          font-size: 2.8rem;
          line-height: 1.35;
          text-shadow: 0 0 1px rgba(44, 42, 41, 0.2);
          opacity: 0.9;
          color: #2c2a29;
          max-width: 700px;
          text-align: center;
        }
        
        .flip-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-family: Arial, sans-serif;
          animation: pulse 2s infinite;
          pointer-events: none;
          z-index: 20;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @media (max-width: 640px) {
          .annotation-text {
            font-size: 2rem;
            padding: 1.5rem;
          }
          .flip-hint {
            font-size: 0.75rem;
            padding: 6px 12px;
            bottom: 15px;
          }
        }
      `}</style>
      
      {/* Back button - top left */}
      <button
        onClick={onClose}
        className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
        aria-label="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Carousel container */}
      <div 
        className="relative w-full max-w-7xl h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-20 p-4 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110 shadow-xl"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 z-20 p-4 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110 shadow-xl"
              aria-label="Next page"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Polaroid carousel */}
        <div className="relative w-full h-full flex items-center justify-center">
          {getVisibleImages().map(({ index, position }) => {
            const isCenter = position === 'center'
            const isLeft = position === 'left'
            const isRight = position === 'right'
            
            return (
              <div
                key={index}
                className={`absolute transition-all duration-500 ease-out ${
                  isCenter 
                    ? 'scale-100 z-10' 
                    : 'scale-75 cursor-pointer'
                } ${
                  isLeft ? '-translate-x-[450px]' : ''
                } ${
                  isRight ? 'translate-x-[450px]' : ''
                }`}
                onClick={() => {
                  if (isLeft) goToPrevious()
                  if (isRight) goToNext()
                }}
                style={{
                  transform: `
                    ${isLeft ? 'translateX(-450px) rotate(-5deg)' : ''}
                    ${isCenter ? 'translateX(0) rotate(0deg)' : ''}
                    ${isRight ? 'translateX(450px) rotate(5deg)' : ''}
                    ${isCenter ? 'scale(1)' : 'scale(0.75)'}
                  `
                }}
              >
                {/* Polaroid frame with flip capability */}
                <div 
                  className="bg-white p-4 pb-12 shadow-2xl" 
                  style={{ width: '950px', perspective: '2000px' }}
                >
                  <div 
                    className={`photo-flipper ${isCenter && isFlipped ? 'flipped' : ''}`}
                    style={{ height: 'calc(950px * 2/3 + 3rem)' }}
                  >
                    {/* Front side */}
                    <div className="photo-front">
                      <div 
                        className={`relative w-full aspect-[3/2] bg-gray-100 overflow-hidden image-container ${hasAnnotations && isCenter ? 'has-flip-hint' : ''}`}
                        style={{ 
                          cursor: isCenter 
                            ? hasAnnotations
                              ? 'pointer'
                              : isDragging 
                                ? 'grabbing' 
                                : isZoomed 
                                  ? 'zoom-out' 
                                  : 'zoom-in'
                            : 'default'
                        }}
                        onClick={isCenter ? (hasAnnotations ? toggleFlip : toggleZoom) : undefined}
                        onMouseDown={isCenter && !hasAnnotations ? handleMouseDown : undefined}
                        onMouseMove={isCenter && !hasAnnotations ? handleMouseMove : undefined}
                        onMouseUp={isCenter && !hasAnnotations ? handleMouseUp : undefined}
                        onMouseLeave={isCenter && !hasAnnotations ? handleMouseUp : undefined}
                      >
                        <div
                          className="relative w-full h-full transition-transform duration-300 ease-out"
                          style={{
                            transform: isCenter && isZoomed && !hasAnnotations ? `scale(2.5) translate(${panOffset.x / 2.5}px, ${panOffset.y / 2.5}px)` : 'none',
                            transformOrigin: 'center center'
                          }}
                        >
                          <Image
                            src={images[index]}
                            alt={`${documentName} - Page ${index + 1}`}
                            fill
                            className="object-cover object-bottom"
                            sizes="950px"
                            priority={true}
                          />
                        </div>
                        
                        {/* Flip hint - overlayed on image at bottom */}
                        {hasAnnotations && isCenter && (
                          <div className="flip-hint">
                            Click to flip →
                          </div>
                        )}
                      </div>
                      
                      {/* Polaroid caption */}
                      <div className="mt-3 text-center">
                        <p 
                          className="text-base text-gray-700"
                          style={{ fontFamily: "'Caveat', cursive" }}
                        >
                          {documentName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Back side - only for photos with annotations */}
                    {hasAnnotations && isCenter && (
                      <div 
                        className="photo-back"
                        onClick={toggleFlip}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="annotation-text">
                          {currentAnnotation || 'No annotation available'}
                        </div>
                        <div className="flip-hint" title="Spacebar to flip back">
                          ← Click to flip back (Spacebar)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Page dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'w-8 bg-gray-800' 
                  : 'w-3 bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}





