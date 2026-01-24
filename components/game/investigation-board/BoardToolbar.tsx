"use client"

import { MousePointer2, GitBranch, StickyNote, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

export type BoardMode = 'select'

interface BoardToolbarProps {
  mode: BoardMode
  onModeChange: (mode: BoardMode) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
}

export function BoardToolbar({
  mode,
  onModeChange,
  onZoomIn,
  onZoomOut,
  onFitView,
}: BoardToolbarProps) {
  return (
    <div 
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-2 rounded-lg shadow-xl"
      style={{
        background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '1px solid #d4af37',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.1)',
      }}
    >
      {/* Actions */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-600">
        {/* Add Note - disabled for Phase 1 */}
        <ToolbarButton
          disabled
          title="Add Note (Coming Soon)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="text-xs ml-1 hidden sm:inline">Add Note</span>
        </ToolbarButton>
      </div>
      
      {/* Zoom controls */}
      <div className="flex items-center gap-1 pl-1">
        <ToolbarButton
          onClick={onZoomOut}
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={onZoomIn}
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={onFitView}
          title="Fit to View (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </ToolbarButton>
      </div>
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
    <button
      className={`
        flex items-center px-3 py-2 rounded transition-all duration-200
        ${disabled 
          ? 'opacity-40 cursor-not-allowed text-gray-500' 
          : active
            ? 'bg-amber-600/30 text-amber-400 shadow-inner'
            : 'text-gray-300 hover:bg-gray-700 hover:text-amber-400'
        }
      `}
      style={{
        fontFamily: "'Courier Prime', 'Courier New', monospace",
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}
