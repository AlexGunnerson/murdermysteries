"use client"

import { MessageCircle, FileText } from 'lucide-react'

interface SuspectToolbarProps {
  position: { x: number; y: number }
  onChat: () => void
  suspectName?: string
  isVictim?: boolean
}

export function SuspectToolbar({ position, onChat, suspectName, isVictim }: SuspectToolbarProps) {
  return (
    <div
      onClick={onChat}
      className="absolute z-50 flex items-center justify-center px-1.5 py-1.5 rounded-md shadow-lg transition-all duration-75 ease-out cursor-pointer hover:bg-gray-700/50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '1px solid rgba(107, 114, 128, 0.5)',
      }}
      title={isVictim ? `View ${suspectName || 'victim'} information` : `Chat with ${suspectName || 'suspect'}`}
    >
      {isVictim ? (
        <FileText className="w-4 h-4 text-blue-400" />
      ) : (
        <MessageCircle className="w-4 h-4 text-green-400" />
      )}
    </div>
  )
}
