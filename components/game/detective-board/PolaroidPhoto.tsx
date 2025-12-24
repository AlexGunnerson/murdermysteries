"use client"

import Image from "next/image"

interface PolaroidPhotoProps {
  imageUrl: string
  title: string
  onClick?: () => void
  rotating?: number
}

export function PolaroidPhoto({ imageUrl, title, onClick, rotating = 0 }: PolaroidPhotoProps) {
  return (
    <button
      onClick={onClick}
      className="
        bg-white shadow-lg
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl
        cursor-pointer group
        relative
      "
      style={{
        transform: `rotate(${rotating}deg)`,
        boxShadow: '0 4px 6px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
        padding: '18px 18px 80px 18px',
        width: '320px'
      }}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] bg-gray-200 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:opacity-90 transition-opacity"
          sizes="320px"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
      </div>

      {/* Title below photo (polaroid style) */}
      <div className="absolute bottom-5 left-0 right-0 text-center px-4">
        <p 
          className="text-lg text-gray-700 font-handwriting"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {title}
        </p>
      </div>

      {/* Tape effect at top */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-[#f0e68c] opacity-60"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      />
    </button>
  )
}







