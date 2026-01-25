"use client"

import { Trash2, Eye } from 'lucide-react'

interface DocumentToolbarProps {
  position: { x: number; y: number }
  onReview: () => void
  onDelete: () => void
}

export function DocumentToolbar({ position, onReview, onDelete }: DocumentToolbarProps) {
  return (
    <div
      className="absolute z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '1px solid rgba(107, 114, 128, 0.5)',
      }}
    >
      {/* Review button */}
      <button
        onClick={onReview}
        className="p-1.5 rounded hover:bg-gray-700 transition-colors"
        title="Review Document"
      >
        <Eye className="w-4 h-4 text-blue-400" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
        title="Delete Document"
      >
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </div>
  )
}
