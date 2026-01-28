"use client"

import Image from "next/image"

interface PortraitFrameProps {
  imageUrl: string
  name: string
  role: string
  onClick?: () => void
  rotating?: number
  isRevealed?: boolean
}

export function PortraitFrame({ imageUrl, name, role, onClick, rotating = 0, isRevealed = true }: PortraitFrameProps) {
  return (
    <button
      onClick={onClick}
      className="
        bg-gradient-to-br from-[#3d2817] to-[#5c4a3a]
        p-3 shadow-lg
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl
        cursor-pointer group
        relative
      "
      style={{
        transform: `rotate(${rotating}deg)`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)',
        border: '4px ridge #6d5a47'
      }}
    >
      {/* Portrait */}
      <div className="relative w-full aspect-[3/4] bg-gray-800 overflow-hidden border-2 border-[#2a1f15]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>

      {/* Name plate */}
      <div className="mt-2 bg-[#c9b898] border border-[#8b7355] p-1 text-center">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          {name}
        </p>
        <p className="text-[10px] text-gray-600 italic">
          {role}
        </p>
      </div>
    </button>
  )
}

