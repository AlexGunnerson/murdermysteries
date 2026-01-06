"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"

interface SceneViewerProps {
  sceneName: string
  images: string[]
  onClose: () => void
  onOpenDocument?: (documentId: string) => void
  sceneId?: string
}

export function SceneViewer({ sceneName, images, onClose, onOpenDocument, sceneId }: SceneViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Check if this is the study monitor photo (image 3 = index 2)
  const isMonitorPhoto = sceneId === 'scene_study' && currentIndex === 2
  
  // Check if this is the master bedroom painting photo (image 3 = index 2)
  const isPaintingPhoto = sceneId === 'scene_master_bedroom' && currentIndex === 2

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-colors shadow-lg z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Scene title - top left */}
      <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800">{sceneName}</h3>
        <p className="text-sm text-gray-600">
          Image {currentIndex + 1} of {images.length}
        </p>
      </div>

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
                <div className="bg-white p-4 pb-12 shadow-2xl" style={{ width: '950px' }}>
                  <div className="relative w-full aspect-video bg-gray-100">
                    <Image
                      src={images[index]}
                      alt={`${sceneName} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="950px"
                      priority={isCenter}
                    />
                  </div>
                  
                  {/* Polaroid caption */}
                  <div className="mt-3 text-center">
                    <p 
                      className="text-base text-gray-700"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {sceneName}
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
    </div>
  )
}





