"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface Suspect {
  id: string
  name: string
  age: number
  role: string
  portraitUrl: string
  veronicaNote: string
}

interface SuspectProfilesProps {
  suspects: Suspect[]
}

export function SuspectProfiles({ suspects }: SuspectProfilesProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string } | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto font-['var(--font-patrick-hand)']">
      {suspects.map((suspect, index) => (
        <div
          key={suspect.id}
          className={`relative bg-[#f0ebd8] p-4 pt-12 shadow-lg border border-[#d4c8b2] transition-transform duration-300 hover:scale-105 hover:rotate-0 ${
            index % 2 === 0 ? 'rotate-1' : '-rotate-[1.5deg]'
          }`}
        >
          {/* Paper Clip */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 rotate-[10deg] w-8 h-3 bg-gray-400 rounded-lg shadow-sm z-10">
            <div className="absolute top-0 left-0 w-[70%] h-full border-2 border-gray-700 rounded-lg border-r-0" />
          </div>

          {/* Title */}
          <div className="text-center text-gray-700 font-bold text-lg uppercase tracking-wider border-b border-dashed border-gray-500 pb-2 mb-4 font-['var(--font-courier-prime)']">
            {suspect.name} ({suspect.age})
          </div>

          {/* Photo */}
          <button
            onClick={() => setSelectedPhoto({ url: suspect.portraitUrl, name: suspect.name })}
            className="block w-[150px] h-[150px] mx-auto mb-4 border-8 border-white shadow-md overflow-hidden -rotate-[0.5deg] cursor-pointer hover:border-amber-200 transition-colors"
            aria-label={`View ${suspect.name}'s portrait`}
          >
            <Image
              src={suspect.portraitUrl}
              alt={suspect.name}
              width={150}
              height={150}
              className="w-full h-full object-cover grayscale-[80%] sepia-[10%] contrast-110"
            />
          </button>

          {/* Veronica's Note */}
          <div className="text-[#2c2a29] text-lg leading-relaxed opacity-90 font-['var(--font-patrick-hand)']">
            {suspect.veronicaNote}
          </div>
        </div>
      ))}
    </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
            aria-label="Close photo"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                width={1024}
                height={1024}
                className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
              />
            </div>
            <p className="text-center mt-4 text-gray-700 font-semibold text-lg">
              {selectedPhoto.name}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

