"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function GameMenu({ isOpen, onClose }: GameMenuProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  if (!isOpen) return null

  const handleExitCase = () => {
    setShowConfirm(true)
  }

  const confirmExit = () => {
    router.push("/")
    onClose()
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6 space-y-2 overflow-y-auto">
            <button
              onClick={() => {
                router.push("/game/case01")
                onClose()
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-white"
            >
              🎮 Continue Case
            </button>

            <button
              onClick={() => {
                // TODO: Implement notebook view
                console.log("Open notebook")
                onClose()
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-white"
            >
              📓 Detective&apos;s Notebook
            </button>

            <button
              onClick={() => {
                // TODO: Implement progress view
                console.log("View progress")
                onClose()
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-white"
            >
              📊 Case Progress
            </button>

            <button
              onClick={() => {
                // TODO: Implement settings
                console.log("Open settings")
                onClose()
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-white"
            >
              ⚙️ Settings
            </button>

            <div className="pt-4 border-t border-gray-700 mt-4">
              <button
                onClick={handleExitCase}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-yellow-400"
              >
                🚪 Exit Case
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-red-400"
              >
                🚫 Sign Out
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 text-xs text-gray-400">
            <p>MurderMysteries.AI v0.1</p>
            <button
              onClick={() => {
                // TODO: Implement feedback form
                console.log("Open feedback")
                onClose()
              }}
              className="text-blue-400 hover:text-blue-300 mt-2"
            >
              Send Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-[60]"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-700 rounded-lg p-6 z-[70] max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Exit Case?</h3>
            <p className="text-gray-300 mb-6">
              Your progress will be saved. You can return to this case anytime.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Exit Case
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Continue Playing
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

