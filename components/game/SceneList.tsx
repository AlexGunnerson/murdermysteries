"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X, RefreshCw } from "lucide-react"
import { useGameState } from "@/lib/hooks/useGameState"

interface Scene {
  id: string
  name: string
  description: string
  imageUrl: string
  dpCost: number
  isLocked: boolean
}

interface SceneListProps {
  caseId: string
  sessionId: string
  onSelectScene: (scene: Scene) => void
}

export function SceneList({ caseId, sessionId, onSelectScene }: SceneListProps) {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmScene, setConfirmScene] = useState<Scene | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  
  // Use game store for persistent unlocked state
  const { unlockedContent, unlockScene, detectivePoints, subtractDetectivePoints, isLoading: gameLoading, initializeGame } = useGameState()

  useEffect(() => {
    loadScenes()
  }, [caseId, sessionId])

  const loadScenes = async () => {
    try {
      setLoading(true)
      
      // Load scenes directly from the case metadata JSON file
      const response = await fetch(`/cases/${caseId}/metadata.json`)

      if (!response.ok) {
        throw new Error("Failed to load case metadata")
      }

      const metadata = await response.json()
      
      // Map scenes to the format we need
      const sceneList = metadata.locations.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        dpCost: s.dpCost,
        isLocked: !s.initiallyAvailable
      }))
      
      setScenes(sceneList)
    } catch (err) {
      console.error("Error loading scenes:", err)
      setError("Failed to load scenes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading if game session is still initializing
  if (gameLoading || !sessionId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Initializing game session...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading scenes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={loadScenes} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  // Filter out locked scenes - they should be completely hidden
  const availableScenes = scenes.filter(scene => !scene.isLocked)

  if (availableScenes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No scenes available to investigate yet.</p>
      </div>
    )
  }

  const handleConfirmUnlock = async () => {
    if (!confirmScene) return
    
    // Check if session is initialized
    if (!sessionId) {
      setError('Game session not initialized. Please refresh the page.')
      setConfirmScene(null)
      return
    }
    
    // Check if player has enough DP
    if (detectivePoints < confirmScene.dpCost) {
      setError(`Not enough Detective Points. You need ${confirmScene.dpCost} DP but only have ${detectivePoints} DP.`)
      setConfirmScene(null)
      return
    }
    
    try {
      setUnlocking(true)
      setError(null)
      
      // Call API to unlock the scene
      const response = await fetch('/api/game/actions/scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          sceneId: confirmScene.id,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // If session is not found, it means the stored sessionId is invalid
        // This can happen when database is reset or user switched accounts
        if (response.status === 404 && errorData.error?.includes('Session not found')) {
          setError('Your game session has expired. Please reset your session to continue.')
          setSessionExpired(true)
          setConfirmScene(null)
          return
        }
        
        throw new Error(errorData.error || 'Failed to unlock scene')
      }
      
      const data = await response.json()
      
      // Update game store
      unlockScene(confirmScene.id)
      subtractDetectivePoints(Math.abs(data.cost))
      
      // Open the scene
      onSelectScene(confirmScene)
      setConfirmScene(null)
    } catch (err) {
      console.error('Error unlocking scene:', err)
      setError(err instanceof Error ? err.message : 'Failed to unlock scene')
    } finally {
      setUnlocking(false)
    }
  }

  const handleSceneClick = (scene: Scene) => {
    // Clear any previous errors
    setError(null)
    
    // If already investigated, open directly without confirmation
    if (unlockedContent.scenes.has(scene.id)) {
      onSelectScene(scene)
    } else {
      // Show confirmation dialog for first-time investigation
      setConfirmScene(scene)
    }
  }

  const handleResetSession = async () => {
    setLoading(true)
    setError(null)
    setSessionExpired(false)
    try {
      await initializeGame(caseId, true)
      // Reload the page to ensure clean state
      window.location.reload()
    } catch (err) {
      console.error('Error resetting session:', err)
      setError('Failed to reset session. Please try refreshing the page.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Investigate Scenes</h2>
          <p className="text-gray-400">
            Examine locations for physical evidence and clues. First investigation costs {availableScenes[0]?.dpCost || 3} DP. Once unlocked, scenes remain accessible for the entire game.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {sessionExpired && (
                <Button
                  onClick={handleResetSession}
                  variant="outline"
                  size="sm"
                  className="ml-4 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Session
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {availableScenes.map((scene) => {
            const isInvestigated = unlockedContent.scenes.has(scene.id)
            
            return (
              <button
                key={scene.id}
                onClick={() => handleSceneClick(scene)}
                className={`
                  flex flex-col gap-4 p-4 rounded-lg border transition-all text-left cursor-pointer
                  ${
                    isInvestigated
                      ? "bg-gray-800/50 border-green-700/50 hover:border-green-600 hover:bg-gray-800"
                      : "bg-gray-800/30 border-gray-700/50 opacity-70 hover:opacity-100 hover:border-blue-500 hover:bg-gray-800"
                  }
                `}
              >
                {/* Scene Image */}
                <div className="w-full">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-700">
                    {scene.imageUrl ? (
                      <Image
                        src={scene.imageUrl}
                        alt={scene.name}
                        fill
                        className={`object-cover ${isInvestigated ? "" : "opacity-60"}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">
                        🔍
                      </div>
                    )}
                    
                    {/* Investigated Badge */}
                    {isInvestigated && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span>✓</span>
                        <span>Investigated</span>
                      </div>
                    )}
                    
                    {/* Locked Overlay for Uninvestigated */}
                    {!isInvestigated && (
                      <div className="absolute top-2 right-2 bg-gray-900/80 text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Locked
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className={`font-semibold text-lg ${isInvestigated ? "text-gray-100" : "text-gray-300"}`}>
                      {scene.name}
                    </h3>
                    {!isInvestigated && (
                      <span className="text-sm text-red-400 flex-shrink-0">
                        -{scene.dpCost} DP
                      </span>
                    )}
                    {isInvestigated && (
                      <span className="text-sm text-green-400 flex-shrink-0">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isInvestigated ? "text-gray-400" : "text-gray-500"}`}>
                    {scene.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmScene && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmScene(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">Investigate Scene?</h3>
              <button
                onClick={() => setConfirmScene(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-200 mb-4">
                You are about to investigate: <span className="font-semibold text-white">{confirmScene.name}</span>
              </p>
              <div className="bg-gray-900 border border-red-900/50 rounded p-3 mb-3">
                <p className="text-red-400 font-semibold text-center">
                  This will cost {confirmScene.dpCost} Detective Points
                </p>
              </div>
              <p className="text-sm text-gray-400 text-center">
                Once unlocked, you can revisit this scene anytime without additional cost.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmScene(null)}
                variant="outline"
                className="flex-1"
                disabled={unlocking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUnlock}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={unlocking}
              >
                {unlocking ? "Unlocking..." : "Investigate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

