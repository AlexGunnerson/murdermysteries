"use client"

import { ReactNode } from "react"

interface BoardSectionProps {
  title: string
  icon?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  rotating?: number // Rotation degree for pinned effect
}

export function BoardSection({ 
  title, 
  icon, 
  onClick, 
  children, 
  className = "",
  rotating = 0
}: BoardSectionProps) {
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`
        bg-[#f8f5e6] border-2 border-gray-400 rounded-lg p-4
        shadow-[0_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.1)]
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_4px_8px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.15)]' : ''}
        ${className}
      `}
      style={{
        transform: `rotate(${rotating}deg)`,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
        `
      }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
          {title}
        </h3>
      </div>

      {/* Section Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}










