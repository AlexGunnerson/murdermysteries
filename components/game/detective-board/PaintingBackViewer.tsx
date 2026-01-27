"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowLeft, FileText } from "lucide-react"
import { QuickNoteButton } from "../QuickNoteButton"

interface PaintingBackViewerProps {
  imagePath: string
  onClose: () => void
  onOpenBlackmail: () => void
}

export function PaintingBackViewer({ imagePath, onClose, onOpenBlackmail }: PaintingBackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-focus the container for keyboard navigation
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  const handleRetrieveBlackmail = async () => {
    await onOpenBlackmail()
    // Don't call onClose() here - onOpenBlackmail already handles closing the painting viewer
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Retrieve Blackmail Button */}
      <div 
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-4 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleRetrieveBlackmail}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg shadow-2xl flex items-center gap-3 border border-blue-500 transition-all transform hover:scale-105 cursor-pointer"
        >
          <FileText className="w-6 h-6" />
          <div>
            <p className="text-lg font-bold tracking-wide">RETRIEVE BLACKMAIL!</p>
          </div>
        </button>
      </div>

      {/* Back button - top left */}
      <button
        onClick={onClose}
        className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
        aria-label="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Main image container */}
      <div 
        className="relative w-full max-w-7xl h-[80vh] flex items-center justify-center bg-gray-900 border-2 border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imagePath}
            alt="Painting - Back Side"
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Subtle shadow overlay for depth */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.3) 100%)'
        }}></div>
      </div>

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
  )
}

