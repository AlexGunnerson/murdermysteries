"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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

  if (scenes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No scenes available to investigate yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Investigate Scenes</h2>
        <p className="text-gray-400">
          Examine locations for physical evidence and clues. Each investigation costs {scenes[0]?.dpCost || 3} DP.
        </p>
      </div>

      <div className="grid gap-4">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => !scene.isLocked && onSelectScene(scene)}
            disabled={scene.isLocked}
            className={`
              flex flex-col gap-4 p-4 rounded-lg border transition-all text-left
              ${
                scene.isLocked
                  ? "bg-gray-800/30 border-gray-700 opacity-50 cursor-not-allowed"
                  : "bg-gray-800/50 border-gray-700 hover:border-blue-500 hover:bg-gray-800 cursor-pointer"
              }
            `}
          >
            {/* Scene Image */}
            <div className="w-full">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-700">
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
                {scene.isLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
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
  )
}

