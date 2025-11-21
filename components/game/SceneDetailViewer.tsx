"use client"

import Image from "next/image"

interface Scene {
  id: string
  name: string
  description: string
  imageUrl: string
  dpCost: number
}

interface SceneDetailViewerProps {
  scene: Scene
}

export function SceneDetailViewer({ scene }: SceneDetailViewerProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Large Scene Image */}
        <div className="relative w-full h-[32rem] rounded-lg overflow-hidden bg-gray-700 mb-6">
          <Image
            src={scene.imageUrl}
            alt={scene.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>

        {/* Scene Details */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-3xl font-bold text-amber-400 mb-4">
            {scene.name}
          </h2>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
              {scene.description}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              💡 <span className="text-amber-400">Tip:</span> Examine the scene carefully. Look for details that might contradict witness statements or reveal hidden connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

