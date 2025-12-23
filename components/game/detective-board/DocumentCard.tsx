"use client"

import { FileText } from "lucide-react"

interface DocumentCardProps {
  title: string
  preview?: string
  onClick?: () => void
  rotating?: number
}

export function DocumentCard({ title, preview, onClick, rotating = 0 }: DocumentCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        bg-[#f8f5e6] border border-gray-400 rounded-sm
        p-3 shadow-md
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg
        cursor-pointer group
        relative
      "
      style={{
        transform: `rotate(${rotating}deg)`,
        backgroundImage: `
          linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(0,0,0,0.02)),
          url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.05'/%3E%3C/svg%3E")
        `
      }}
    >
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-amber-800 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-amber-900">
            {title}
          </h4>
          {preview && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {preview}
            </p>
          )}
        </div>
      </div>

      {/* Paper clip */}
      <div 
        className="absolute -top-1 -right-1 w-6 h-8 bg-gray-400 rounded-sm opacity-60"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
        }}
      />
    </button>
  )
}







