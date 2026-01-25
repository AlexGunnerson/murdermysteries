"use client"

import { Trash2 } from 'lucide-react'

interface NoteToolbarProps {
  position: { x: number; y: number }
  currentColor: 'yellow' | 'blue' | 'pink' | 'green'
  onColorChange: (color: 'yellow' | 'blue' | 'pink' | 'green') => void
  onDelete: () => void
}

const colorOptions = [
  { name: 'yellow', bg: '#fef08a', label: 'Yellow' },
  { name: 'blue', bg: '#93c5fd', label: 'Blue' },
  { name: 'pink', bg: '#fbcfe8', label: 'Pink' },
  { name: 'green', bg: '#bbf7d0', label: 'Green' },
] as const

export function NoteToolbar({ position, currentColor, onColorChange, onDelete }: NoteToolbarProps) {
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
      {/* Color options */}
      <div className="flex items-center gap-1.5">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            onClick={() => onColorChange(color.name)}
            className={`w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 ${
              currentColor === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''
            }`}
            style={{ background: color.bg }}
            title={color.label}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
        title="Delete note (Del)"
      >
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </div>
  )
}
