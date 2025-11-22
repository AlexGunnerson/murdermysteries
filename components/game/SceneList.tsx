"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X } from "lucide-react"

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

  const handleConfirmUnlock = () => {
    if (confirmScene) {
      onSelectScene(confirmScene)
      setConfirmScene(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Investigate Scenes</h2>
          <p className="text-gray-400">
            Examine locations for physical evidence and clues. Each investigation costs {availableScenes[0]?.dpCost || 3} DP.
          </p>
        </div>

        <div className="grid gap-4">
          {availableScenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setConfirmScene(scene)}
              className="flex flex-col gap-4 p-4 rounded-lg border transition-all text-left bg-gray-800/50 border-gray-700 hover:border-blue-500 hover:bg-gray-800 cursor-pointer"
            >
              {/* Scene Image */}
              <div className="w-full">
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-700">
                  {scene.imageUrl ? (
                    <Image
                      src={scene.imageUrl}
                      alt={scene.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">
                      🔍
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-100">
                    {scene.name}
                  </h3>
                  <span className="text-sm text-red-400 flex-shrink-0">
                    -{scene.dpCost} DP
                  </span>
                </div>
                <p className="text-sm text-gray-400">{scene.description}</p>
              </div>
            </button>
          ))}
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
              <div className="bg-gray-900 border border-red-900/50 rounded p-3">
                <p className="text-red-400 font-semibold text-center">
                  This will cost {confirmScene.dpCost} Detective Points
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmScene(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUnlock}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Investigate
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

