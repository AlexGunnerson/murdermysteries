"use client"

import { useState, useEffect } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/button'
import { MapPin, Lock, Eye, Search } from 'lucide-react'
import Image from 'next/image'

interface Evidence {
  id: string
  name: string
  description: string
  significance: string
}

interface Scene {
  id: string
  name: string
  description: string
  imageUrl?: string
  relatedFacts?: string[]
  evidence?: Evidence[]
  isLocked: boolean
  isInvestigated: boolean
}

interface SceneViewerProps {
  sessionId: string
  onFactDiscovered?: (fact: string) => void
}

export function SceneViewer({ sessionId, onFactDiscovered }: SceneViewerProps) {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { detectivePoints, subtractDetectivePoints, addDiscoveredFact, unlockScene, isLoading: gameLoading } = useGameState()

  // Fetch available scenes
  useEffect(() => {
    fetchScenes()
  }, [sessionId])

  const fetchScenes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/game/actions/scenes?sessionId=${sessionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch scenes')
      }

      const data = await response.json()
      setScenes(data.scenes)
    } catch (err) {
      console.error('Error fetching scenes:', err)
      setError('Failed to load scenes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvestigateScene = async (scene: Scene) => {
    if (scene.isLocked) {
      setError('This scene is locked. Discover more facts to unlock it.')
      return
    }

    if (scene.isInvestigated && scene.evidence) {
      // Already investigated, just display it
      setSelectedScene(scene)
      return
    }

    // Check if session is initialized
    if (!sessionId) {
      setError('Game session not initialized. Please refresh the page.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/game/actions/scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          sceneId: scene.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to investigate scene')
      }

      const data = await response.json()

      // Update DP
      subtractDetectivePoints(Math.abs(data.cost))
      
      // Update game store
      unlockScene(scene.id)

      // Update scene with full content
      const fullScene = { ...scene, ...data.scene, isInvestigated: true }
      setSelectedScene(fullScene)

      // Update scenes list
      setScenes(scenes.map(s => 
        s.id === scene.id ? fullScene : s
      ))

      // Add related facts if any
      if (data.scene.relatedFacts && data.scene.relatedFacts.length > 0) {
        data.scene.relatedFacts.forEach((fact: string) => {
          addDiscoveredFact({
            content: fact,
            source: 'scene',
            sourceId: scene.id,
          })
          if (onFactDiscovered) {
            onFactDiscovered(fact)
          }
        })
      }
    } catch (err) {
      console.error('Error investigating scene:', err)
      setError(err instanceof Error ? err.message : 'Failed to investigate scene')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedScene(null)
  }

  if (selectedScene) {
    return (
      <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={handleClose}
            variant="outline"
            className="mb-4 bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
          >
            ← Back to Scenes
          </Button>

          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {/* Scene Image */}
            {selectedScene.imageUrl && (
              <div className="relative w-full h-64 bg-gray-950">
                <Image
                  src={selectedScene.imageUrl}
                  alt={selectedScene.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h1 className="text-3xl font-bold text-amber-400 mb-4">
                {selectedScene.name}
              </h1>

              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {selectedScene.description}
                </p>
              </div>

              {/* Evidence Found */}
              {selectedScene.evidence && selectedScene.evidence.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Evidence Found
                  </h3>
                  <div className="space-y-3">
                    {selectedScene.evidence.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-900 border border-gray-700 rounded p-4"
                      >
                        <h4 className="font-semibold text-gray-100 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                          {item.description}
                        </p>
                        <p className="text-xs text-amber-400">
                          Significance: {item.significance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Facts */}
              {selectedScene.relatedFacts && selectedScene.relatedFacts.length > 0 && (
                <div className="p-4 bg-amber-900/20 border border-amber-700 rounded">
                  <h3 className="text-amber-400 font-semibold mb-2">
                    Facts Discovered:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {selectedScene.relatedFacts.map((fact, index) => (
                      <li key={index}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-6">
          Crime Scenes
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 text-gray-400">
          <p>Detective Points: <span className="text-amber-400 font-semibold">{detectivePoints} DP</span></p>
          <p className="text-sm">Cost to investigate a scene: <span className="text-red-400">-3 DP</span></p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading scenes...</div>
        ) : (
          <div className="grid gap-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={`bg-gray-800 border border-gray-700 rounded-lg p-4 transition-all ${
                  scene.isLocked 
                    ? 'opacity-60' 
                    : 'hover:border-amber-500 cursor-pointer'
                }`}
                onClick={() => !scene.isLocked && handleInvestigateScene(scene)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-amber-400" />
                      <h3 className="text-lg font-semibold text-gray-100">
                        {scene.name}
                      </h3>
                      {scene.isInvestigated && !scene.isLocked && (
                        <Eye className="h-4 w-4 text-green-400" />
                      )}
                      {scene.isLocked && (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{scene.description}</p>
                  </div>
                  {!scene.isLocked && !scene.isInvestigated && (
                    <span className="text-red-400 text-sm font-semibold">
                      -3 DP
                    </span>
                  )}
                </div>
              </div>
            ))}

            {scenes.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 py-8">
                No scenes available yet. Continue your investigation to unlock more.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

