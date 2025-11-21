"use client"

import { useState, use } from "react"
import { ActionPanel } from "@/components/ui/ActionPanel"
import { MainContentPanel } from "@/components/ui/MainContentPanel"
import { GameMenu } from "@/components/game/GameMenu"
import { DetectiveNotebook } from "@/components/game/DetectiveNotebook"
import { SuspectList } from "@/components/game/SuspectList"
import { SceneList } from "@/components/game/SceneList"
import { SceneDetailViewer } from "@/components/game/SceneDetailViewer"
import { ChatInterface } from "@/components/game/ChatInterface"
import { VeronicaLetter } from "@/components/game/VeronicaLetter"
import { ProtectedRoute } from "@/lib/auth/protected-route"
import { useGameState, useInitializeGame } from "@/lib/hooks/useGameState"

interface Suspect {
  id: string
  name: string
  role: string
  bio: string
  portraitUrl: string
  isLocked: boolean
}

interface Scene {
  id: string
  name: string
  description: string
  imageUrl: string
  dpCost: number
  isLocked: boolean
}

export default function GamePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const [hasReadLetter, setHasReadLetter] = useState(false)
  const [currentView, setCurrentView] = useState("welcome")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null)
  
  // Initialize game state from Zustand store
  useInitializeGame(caseId)
  const { detectivePoints, sessionId } = useGameState()

  const handleAction = (action: string) => {
    console.log("Action triggered:", action)
    
    if (action === "menu") {
      setIsMenuOpen(true)
      return
    }
    
    setCurrentView(action)
    // DP logic will be implemented in game state management
  }

  const handleSelectSuspect = (suspect: Suspect) => {
    setSelectedSuspect(suspect)
  }

  const handleBackToSuspects = () => {
    setSelectedSuspect(null)
  }

  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)

  const handleSelectScene = (scene: Scene) => {
    setSelectedScene(scene)
  }

  const handleBackToScenes = () => {
    setSelectedScene(null)
  }

  const renderContent = () => {
    // If a suspect is selected, show chat interface
    if (selectedSuspect) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700">
            <button
              onClick={handleBackToSuspects}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Suspects
            </button>
          </div>
          <ChatInterface
            suspectId={selectedSuspect.id}
            suspectName={selectedSuspect.name}
            suspectRole={selectedSuspect.role}
            suspectPersonality={selectedSuspect.bio}
            systemPrompt={`You are ${selectedSuspect.name}, ${selectedSuspect.role}. Stay in character and respond naturally to the detective's questions.`}
          />
        </div>
      )
    }

    // If a scene is selected, show scene viewer
    if (selectedScene) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700">
            <button
              onClick={handleBackToScenes}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Scenes
            </button>
          </div>
          <SceneDetailViewer scene={selectedScene} />
        </div>
      )
    }

    switch (currentView) {
      case "welcome":
        return (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">Welcome, Detective</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
              <p className="text-lg leading-relaxed mb-4">
                Every truth you find puts pressure on the lies around it. Your objective is simple: 
                surface contradictions in the facts you uncover.
              </p>
              <p className="text-lg leading-relaxed">
                Compare evidence, follow the leads, and look for the fractures in the stories around you—where 
                one story cracks, the others usually follow.
              </p>
            </div>
            <p className="text-gray-400">
              Select an action from the left panel to begin your investigation.
            </p>
          </div>
        )
      case "notebook":
        return <DetectiveNotebook />
      case "question":
        return (
          <SuspectList
            caseId={caseId}
            sessionId={sessionId || "temp-session"}
            onSelectSuspect={handleSelectSuspect}
          />
        )
      case "scenes":
        return (
          <SceneList
            caseId={caseId}
            sessionId={sessionId || "temp-session"}
            onSelectScene={handleSelectScene}
          />
        )
      case "help":
        return (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">💬 Question Suspects (Free)</h3>
                <p className="text-gray-300">
                  Interview suspects and witnesses. Each new fact you discover earns you +1 DP.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">📄 Check Records (-2 DP)</h3>
                <p className="text-gray-300">
                  Search official databases and documents for crucial evidence.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">🔍 Investigate Scenes (-3 DP)</h3>
                <p className="text-gray-300">
                  Examine crime scenes and locations for physical evidence.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">🧩 Validate Theory (-3 DP)</h3>
                <p className="text-gray-300">
                  Submit evidence to test your theories. Correct theories unlock new leads.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">💡 Get Clue (-2 DP)</h3>
                <p className="text-gray-300">
                  Receive subtle hints to guide your investigation.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">⚖️ Solve the Murder (Free)</h3>
                <p className="text-gray-300">
                  When ready, submit your final accusation with evidence.
                </p>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {currentView} feature coming soon...
            </p>
          </div>
        )
    }
  }

  // Show Veronica's letter first
  if (!hasReadLetter) {
    return <VeronicaLetter onBeginInvestigation={() => setHasReadLetter(true)} />
  }

  return (
    // Temporarily bypassing ProtectedRoute for UI demo
    <>
      <div className="flex min-h-screen bg-gray-900">
        <ActionPanel 
          detectivePoints={detectivePoints} 
          onAction={handleAction} 
        />
        <MainContentPanel title={`Case: ${caseId}`}>
          {renderContent()}
        </MainContentPanel>
      </div>
      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}

