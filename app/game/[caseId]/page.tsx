"use client"

import { useState, use } from "react"
import { ActionPanel } from "@/components/ui/ActionPanel"
import { MainContentPanel } from "@/components/ui/MainContentPanel"
import { ProtectedRoute } from "@/lib/auth/protected-route"

export default function GamePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const [detectivePoints, setDetectivePoints] = useState(25)
  const [currentView, setCurrentView] = useState("welcome")

  const handleAction = (action: string) => {
    console.log("Action triggered:", action)
    setCurrentView(action)
    // DP logic will be implemented in game state management
  }

  const renderContent = () => {
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

  return (
    // Temporarily bypassing ProtectedRoute for UI demo
    <div className="flex min-h-screen bg-gray-900">
      <ActionPanel 
        detectivePoints={detectivePoints} 
        onAction={handleAction} 
      />
      <MainContentPanel title={`Case: ${caseId}`}>
        {renderContent()}
      </MainContentPanel>
    </div>
  )
}

