"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Suspect {
  id: string
  name: string
  role: string
  bio: string
  portraitUrl: string
  isLocked: boolean
}

interface SuspectListProps {
  caseId: string
  sessionId: string
  onSelectSuspect: (suspect: Suspect) => void
}

export function SuspectList({ caseId, sessionId, onSelectSuspect }: SuspectListProps) {
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSuspects()
  }, [caseId, sessionId])

  const loadSuspects = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/game/actions/question?sessionId=${sessionId}&caseId=${caseId}`
      )

      if (!response.ok) {
        throw new Error("Failed to load suspects")
      }

      const data = await response.json()
      setSuspects(data.suspects || [])
    } catch (err) {
      console.error("Error loading suspects:", err)
      setError("Failed to load suspects. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading suspects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={loadSuspects} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (suspects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No suspects available to question yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Question Suspects</h2>
        <p className="text-gray-400">
          Select a suspect to begin questioning. Discovering new facts earns you +1 DP.
        </p>
      </div>

      <div className="grid gap-4">
        {suspects.map((suspect) => (
          <button
            key={suspect.id}
            onClick={() => !suspect.isLocked && onSelectSuspect(suspect)}
            disabled={suspect.isLocked}
            className={`
              flex items-start gap-4 p-4 rounded-lg border transition-all text-left
              ${
                suspect.isLocked
                  ? "bg-gray-800/30 border-gray-700 opacity-50 cursor-not-allowed"
                  : "bg-gray-800/50 border-gray-700 hover:border-blue-500 hover:bg-gray-800 cursor-pointer"
              }
            `}
          >
            {/* Portrait */}
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700">
                {suspect.portraitUrl ? (
                  <Image
                    src={suspect.portraitUrl}
                    alt={suspect.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                    ?
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-gray-100">
                  {suspect.name}
                </h3>
                {suspect.isLocked && (
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                    🔒 Locked
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-300 mb-2">{suspect.role}</p>
              <p className="text-sm text-gray-400 line-clamp-2">{suspect.bio}</p>
            </div>

            {/* Arrow */}
            {!suspect.isLocked && (
              <div className="flex-shrink-0 self-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

