"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Camera, ArrowLeft, Repeat } from "lucide-react"
import { QuickNoteButton } from "../QuickNoteButton"

interface SceneViewerProps {
  sceneName: string
  images: string[]
  onClose: () => void
  onOpenDocument?: (documentId: string) => void
  sceneId?: string
  initialIndex?: number
  unlockedContent?: string[]
  photoType?: 'investigation' | 'gala'
  annotations?: Record<string, string>
}

export function SceneViewer({ sceneName, images, onClose, onOpenDocument, sceneId, initialIndex = 0, unlockedContent = [], photoType = 'investigation', annotations }: SceneViewerProps) {
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
  
  // Check if this is the study monitor photo (image 3 = index 2)
  const isMonitorPhoto = sceneId === 'scene_study' && currentIndex === 2
  
  // Check if this is the master bedroom painting photo (image 3 = index 2)
  // Only show the investigate button if blackmail hasn't been retrieved yet
  const hasRetrievedBlackmail = unlockedContent.includes('record_blackmail_portrait')
  const isPaintingPhoto = sceneId === 'scene_master_bedroom' && currentIndex === 2 && !hasRetrievedBlackmail

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

  const handleSecurityFootageClick = () => {
    if (onOpenDocument) {
      onOpenDocument('record_security_footage')
      onClose() // Close the scene viewer
    }
  }

  const handlePaintingInvestigationClick = () => {
    if (onOpenDocument) {
      onOpenDocument('painting_back')
      onClose() // Close the scene viewer
    }
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
        
        .flip-hint {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: white;
          color: white;
          padding: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
          z-index: 20;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .flip-hint:hover {
          background: #f5f5f5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @media (max-width: 640px) {
          .flip-hint {
            padding: 8px;
            bottom: 15px;
            right: 15px;
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

      {/* Security Footage Indicator */}
      {isMonitorPhoto && (
        <div 
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleSecurityFootageClick}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg shadow-2xl transition-all transform hover:scale-105 animate-pulse"
          >
            <Camera className="w-5 h-5" />
            <div className="text-left">
              <div className="font-bold text-sm">Security Footage Available</div>
              <div className="text-xs opacity-90">View 18 camera clips in Documents →</div>
            </div>
          </button>
        </div>
      )}

      {/* Painting Investigation Indicator */}
      {isPaintingPhoto && (
        <div 
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handlePaintingInvestigationClick}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg shadow-2xl transition-all transform hover:scale-105 animate-pulse"
          >
            <Camera className="w-5 h-5" />
            <div className="text-left">
              <div className="font-bold text-sm">Investigate Painting</div>
              <div className="text-xs opacity-90">Look behind the painting →</div>
            </div>
          </button>
        </div>
      )}

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
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 z-20 p-4 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110 shadow-xl"
              aria-label="Next image"
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
                {/* Polaroid frame */}
                <div 
                  className="bg-white p-4 pb-12 shadow-2xl relative"
                  style={{ 
                    width: '950px',
                    perspective: '2000px'
                  }}
                >
                  <div
                    className="relative w-full transition-transform duration-700"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isCenter && isFlipped && hasAnnotations ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Front side - Photo */}
                    <div
                      className="relative w-full aspect-[3/2] bg-gray-100 overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
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
                          alt={`${sceneName} - Image ${index + 1}`}
                          fill
                          className="object-cover object-bottom"
                          sizes="950px"
                          priority={true}
                        />
                      </div>
                      
                      {/* Flip button for annotations - overlayed on photo */}
                      {hasAnnotations && isCenter && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFlip(e)
                          }}
                          className="flip-hint"
                          title={isFlipped ? 'Flip back' : 'Flip photo'}
                        >
                          <Repeat className="w-5 h-5 text-gray-800" />
                        </button>
                      )}
                    </div>

                    {/* Back side - Annotation */}
                    {hasAnnotations && isCenter && (
                      <div
                        className="absolute inset-0 aspect-[3/2] bg-white overflow-hidden flex items-center justify-center p-8"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          cursor: 'pointer'
                        }}
                        onClick={toggleFlip}
                      >
                        <div className="max-w-full max-h-full overflow-auto">
                          <p 
                            className="text-gray-800 leading-relaxed"
                            style={{ 
                              fontFamily: "'Caveat', cursive",
                              fontSize: '2.5rem'
                            }}
                          >
                            {getCurrentAnnotation()}
                          </p>
                        </div>
                        
                        {/* Flip button for annotations - overlayed on annotation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFlip(e)
                          }}
                          className="flip-hint"
                          title="Flip back (Spacebar)"
                        >
                          <Repeat className="w-5 h-5 text-gray-800" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Polaroid caption */}
                  <div className="mt-3 text-center">
                    <p 
                      className="text-2xl text-gray-700"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {hasAnnotations && photoType === 'gala' ? 'May 10th, 1986' : sceneName}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Image dots indicator */}
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
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
  )
}





