"use client"

import { useState, use } from "react"
import { GameMenu } from "@/components/game/GameMenu"
import { DetectiveNotebook } from "@/components/game/DetectiveNotebook"
import { useGameState, useInitializeGame } from "@/lib/hooks/useGameState"

export default function GamePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Initialize game state from Zustand store
  useInitializeGame(caseId)
  const { sessionId, isLoading } = useGameState()

  const handleAction = (action: string) => {
    console.log("Action triggered:", action)
    
    if (action === "menu") {
      setIsMenuOpen(true)
      return
    }
    
    // Handle other actions as needed (help, clue, solve, etc.)
    // Most actions are now handled directly in the DetectiveNotebook
  }

  // Show the Detective Notebook as the main view
  return (
    <>
      <DetectiveNotebook onAction={handleAction} onOpenMenu={() => setIsMenuOpen(true)} />
      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
