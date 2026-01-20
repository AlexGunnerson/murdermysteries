"use client"

import Image from "next/image"
import { X } from "lucide-react"

interface SuspectCardProps {
  suspect: {
    id: string
    name: string
    age: number
    role: string
    portraitUrl: string
    veronicaNote: string
  }
  onClose: () => void
}

export function SuspectCard({ suspect, onClose }: SuspectCardProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#fef8e0] max-w-2xl w-full shadow-2xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: `
            linear-gradient(to bottom, transparent 95%, rgba(150, 150, 150, 0.1) 100%),
            linear-gradient(to bottom, rgba(250, 240, 200, 0.5) 0%, transparent 100%)
          `,
          transform: 'rotate(-0.5deg)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Push pin at top */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full shadow-md"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 2px rgba(0,0,0,0.2)'
          }}
        />

        <div className="p-6 pt-10">
          {/* Name and Age - Handwritten style */}
          <h2 
            className="text-4xl text-gray-800 mb-4"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            {suspect.name} ({suspect.age})
          </h2>

          {/* Portrait with handwritten caption */}
          <div className="flex flex-col items-center mb-4">
            <div 
              className="relative w-64 h-80 bg-white border-4 border-white shadow-lg mb-2"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transform: 'rotate(-1deg)'
              }}
            >
              <Image
                src={suspect.portraitUrl}
                alt={suspect.name}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
            <p 
              className="text-lg text-gray-600 italic"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              — {suspect.role}
            </p>
          </div>

          {/* Veronica's personal note */}
          <div className="space-y-3 mb-6">
            <p 
              className="text-2xl text-gray-900 leading-relaxed"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              {suspect.veronicaNote}
            </p>
          </div>

          {/* Veronica's signature */}
          <div className="flex justify-end mt-6">
            <p 
              className="text-2xl text-gray-700"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              — V. Ashcombe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

