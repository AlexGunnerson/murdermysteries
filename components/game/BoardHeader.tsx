"use client"

import { HelpCircle, Menu } from "lucide-react"

interface BoardHeaderProps {
  detectivePoints: number
  hasUnreadMessage?: boolean
  onOpenMessage?: () => void
  onOpenMenu: () => void
  onOpenHelp: () => void
  // Actions
  onGetClue: () => void
  onSolveMurder: () => void
}

export function BoardHeader({ 
  detectivePoints, 
  hasUnreadMessage, 
  onOpenMessage,
  onOpenMenu,
  onOpenHelp,
  onGetClue,
  onSolveMurder
}: BoardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 shadow-lg">
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-700">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕵️</span>
          <h1 className="text-xl md:text-2xl font-bold text-amber-400" style={{ fontFamily: 'serif' }}>
            Board
          </h1>
        </div>

        {/* Right: DP, Message, Help, Menu */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Detective Points */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-700 rounded-lg px-3 md:px-4 py-2 flex items-center gap-2">
            <span className="text-xl md:text-2xl">💎</span>
            <div className="hidden sm:block">
              <div className="text-xs text-blue-300">DP</div>
              <div className="text-lg font-bold text-white leading-none">{detectivePoints}</div>
            </div>
            <div className="sm:hidden text-lg font-bold text-white">{detectivePoints}</div>
          </div>

          {/* Message Notification */}
          {hasUnreadMessage && onOpenMessage && (
            <button
              onClick={onOpenMessage}
              className="relative bg-amber-900/50 hover:bg-amber-900/70 border-2 border-amber-500 rounded-lg p-2 transition-colors animate-pulse"
              title="New message"
            >
              <span className="text-xl">✉️</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 transition-colors"
            title="How to Play"
          >
            <HelpCircle className="h-5 w-5 text-gray-300" />
          </button>

          {/* Menu Button */}
          <button
            onClick={onOpenMenu}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 transition-colors"
            title="Menu"
          >
            <Menu className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Actions */}
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-end gap-3">
          {/* Action Buttons */}
          <button
            onClick={onGetClue}
            disabled={detectivePoints < 2}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-4 rounded shadow-md transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 text-sm"
          >
            <span className="text-base mr-1">💡</span>
            <span className="hidden sm:inline">Get Clue (-2 DP)</span>
            <span className="sm:hidden">Clue</span>
          </button>
          <button
            onClick={onSolveMurder}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-4 rounded shadow-md transition-all hover:-translate-y-0.5 text-sm"
          >
            <span className="text-base mr-1">⚖️</span>
            <span className="hidden sm:inline">Solve Murder</span>
            <span className="sm:hidden">Solve</span>
          </button>
        </div>
      </div>
    </header>
  )
}

