"use client"

import Image from "next/image"

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
  return (
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
          <div className="w-[150px] h-[150px] mx-auto mb-4 border-8 border-white shadow-md overflow-hidden -rotate-[0.5deg]">
            <Image
              src={suspect.portraitUrl}
              alt={suspect.name}
              width={150}
              height={150}
              className="w-full h-full object-cover grayscale-[80%] sepia-[10%] contrast-110"
            />
          </div>

          {/* Veronica's Note */}
          <div className="text-[#2c2a29] text-lg leading-relaxed opacity-90 font-['var(--font-patrick-hand)']">
            {suspect.veronicaNote}
          </div>
        </div>
      ))}
    </div>
  )
}

