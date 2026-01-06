"use client"

import Image from "next/image"
import { X, FileText } from "lucide-react"

interface PaintingBackViewerProps {
  imagePath: string
  onClose: () => void
  onOpenBlackmail: () => void
}

export function PaintingBackViewer({ imagePath, onClose, onOpenBlackmail }: PaintingBackViewerProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  const handleRetrieveBlackmail = () => {
    onOpenBlackmail()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
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

      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors shadow-lg z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
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
    </div>
  )
}

