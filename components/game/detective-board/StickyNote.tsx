"use client"

interface StickyNoteProps {
  content: string
  source?: string
  onClick?: () => void
  rotating?: number
  color?: 'yellow' | 'blue' | 'pink' | 'green'
}

const colorClasses = {
  yellow: 'bg-[#fef68a]',
  blue: 'bg-[#a8d8ff]',
  pink: 'bg-[#ffcce5]',
  green: 'bg-[#ccffcc]'
}

export function StickyNote({ 
  content, 
  source, 
  onClick, 
  rotating = 0,
  color = 'yellow'
}: StickyNoteProps) {
  return (
    <div
      onClick={onClick}
      className={`
        ${colorClasses[color]}
        p-3 shadow-md
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
        relative
        min-h-[100px]
      `}
      style={{
        transform: `rotate(${rotating}deg)`,
        boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
      }}
    >
      {/* Tape at top */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#f0e68c] opacity-50"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      />

      {/* Content */}
      <p 
        className="text-sm text-gray-800 leading-relaxed"
        style={{ fontFamily: "'Caveat', cursive", fontSize: '16px' }}
      >
        {content}
      </p>

      {/* Source */}
      {source && (
        <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-400/30">
          {source}
        </p>
      )}
    </div>
  )
}








