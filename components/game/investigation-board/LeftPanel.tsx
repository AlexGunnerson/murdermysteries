"use client"

import { StickyNote, ZoomIn, ZoomOut, Maximize2, Image } from 'lucide-react'

interface LeftPanelProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onPhotoClick: () => void
}

export function LeftPanel({ 
  onZoomIn,
  onZoomOut,
  onFitView,
  onPhotoClick,
}: LeftPanelProps) {
  // Toolbar with notes, photos, and zoom controls (no facts panel)
  return (
    <div
      className="absolute top-1/2 left-4 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 p-2.5 rounded-lg"
      style={{
        background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '1px solid #d4af37',
        boxShadow: '4px 0 16px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15)',
      }}
    >
      {/* Note button */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/note', 'new-note')
          e.dataTransfer.effectAllowed = 'copy'
        }}
        className="cursor-grab active:cursor-grabbing relative group"
      >
        <ToolbarButton title="Drag to add note">
          <StickyNote className="w-5 h-5" />
        </ToolbarButton>
      </div>
      
      {/* Photo button */}
      <ToolbarButton
        onClick={onPhotoClick}
        title="Photos"
      >
        <Image className="w-5 h-5" />
      </ToolbarButton>
      
      <div className="w-full h-px bg-gray-600 my-0.5" />
      
      <ToolbarButton
        onClick={onZoomOut}
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-5 h-5" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={onZoomIn}
        title="Zoom In (+)"
      >
        <ZoomIn className="w-5 h-5" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={onFitView}
        title="Fit to View (F)"
      >
        <Maximize2 className="w-5 h-5" />
      </ToolbarButton>
    </div>
  )
}

interface ToolbarButtonProps {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
}

function ToolbarButton({ children, active, disabled, onClick, title }: ToolbarButtonProps) {
  return (
    <div className="relative group">
      <button
        className={`
          flex items-center justify-center p-2 rounded transition-all duration-200
          ${disabled 
            ? 'opacity-40 cursor-not-allowed text-gray-500' 
            : active
              ? 'bg-gray-600/30 text-gray-200 shadow-inner'
              : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
          }
        `}
        style={{
          fontFamily: "'Courier Prime', 'Courier New', monospace",
        }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        {children}
      </button>
      {title && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200 text-gray-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg border border-gray-300">
          {title}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-200"></div>
        </div>
      )}
    </div>
  )
}
