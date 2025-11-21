"use client"

import { useState, useEffect } from "react"
import { useGameState } from "@/lib/hooks/useGameState"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VeronicaLetter } from "@/components/game/VeronicaLetter"
import { SuspectProfiles } from "@/components/game/SuspectProfiles"
import Image from "next/image"
import { FileText, Camera, Lightbulb, ClipboardList, Users } from "lucide-react"

interface Suspect {
  id: string
  name: string
  age: number
  role: string
  portraitUrl: string
  veronicaNote: string
}

export function DetectiveNotebook() {
  const { discoveredFacts, theoryHistory, chatHistory } = useGameState()
  const [showVeronicaLetter, setShowVeronicaLetter] = useState(false)
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [loading, setLoading] = useState(true)

  // Load suspect data from metadata
  useEffect(() => {
    async function loadSuspects() {
      try {
        const response = await fetch('/cases/case01/metadata.json')
        const data = await response.json()
        
        // Extract age from name (e.g., "Martin Ashcombe (61)" -> 61)
        const suspectsWithNotes = data.suspects
          .filter((s: any) => s.veronicaNote) // Only include suspects with notes
          .map((s: any) => {
            const ageMatch = s.bio.match(/(\d+) years old/)
            return {
              id: s.id,
              name: s.name,
              age: ageMatch ? parseInt(ageMatch[1]) : 0,
              role: s.role,
              portraitUrl: s.portraitUrl,
              veronicaNote: s.veronicaNote
            }
          })
        
        setSuspects(suspectsWithNotes)
      } catch (error) {
        console.error('Failed to load suspects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSuspects()
  }, [])

  // Group facts by category
  const factsByCategory = discoveredFacts.reduce((acc, fact) => {
    const category = fact.source || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(fact)
    return acc
  }, {} as Record<string, typeof discoveredFacts>)

  // Get unique suspects from chat history
  const chatSuspects = Array.from(
    new Set(chatHistory.map(msg => msg.suspectId))
  )

  // Placeholder for investigated scenes (would come from game state)
  const investigatedScenes: string[] = []

  if (showVeronicaLetter) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowVeronicaLetter(false)}
          className="absolute top-4 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
        >
          ← Back to Notebook
        </button>
        <VeronicaLetter onBeginInvestigation={() => setShowVeronicaLetter(false)} />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-6">Detective&apos;s Notebook</h1>
        <p className="text-gray-400 mb-6">
          Your investigation records. Review discovered facts, artifacts, and clues to piece together the mystery.
        </p>

        <Tabs defaultValue="facts" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="facts" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Facts</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="scenes" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scenes</span>
            </TabsTrigger>
            <TabsTrigger value="clues" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Clues</span>
            </TabsTrigger>
          </TabsList>

          {/* Facts Tab */}
          <TabsContent value="facts" className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">Discovered Facts</h2>
              
              {discoveredFacts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No facts discovered yet. Start investigating to uncover clues!
                </p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(factsByCategory).map(([category, facts]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-blue-300 uppercase mb-3">
                        {category === 'chat' ? '💬 From Conversations' : 
                         category === 'scene' ? '🔍 From Scenes' :
                         category === 'record' ? '📄 From Records' :
                         category === 'clue' ? '💡 From Clues' : '📋 Other'}
                      </h3>
                      <div className="space-y-2">
                        {facts.map((fact, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-900 border border-gray-700 rounded p-4"
                          >
                            <p className="text-gray-200">{fact.content}</p>
                            {fact.sourceId && (
                              <p className="text-xs text-gray-500 mt-2">
                                Source: {fact.sourceId}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theory History */}
            {theoryHistory.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-amber-400 mb-4">Theory Submissions</h2>
                <div className="space-y-3">
                  {theoryHistory.map((theory, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900 border border-gray-700 rounded p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          Theory #{theoryHistory.length - idx}
                        </span>
                        <span className={`text-sm font-semibold ${
                          theory.result === 'correct' ? 'text-green-400' :
                          theory.result === 'partial' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {theory.result.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-200 mb-2">{theory.description}</p>
                      {theory.feedback && (
                        <p className="text-sm text-blue-300 italic">{theory.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-amber-400 mb-2 text-center">People of Interest</h2>
              <p className="text-gray-400 mb-6 text-center text-sm">
                Veronica&apos;s handwritten notes on the inner circle
              </p>
              
              {loading ? (
                <p className="text-gray-400 text-center py-8">Loading profiles...</p>
              ) : suspects.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No profiles available yet.
                </p>
              ) : (
                <SuspectProfiles suspects={suspects} />
              )}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">Documents & Letters</h2>
              
              <div className="space-y-3">
                {/* Veronica's Letter - Always available */}
                <button
                  onClick={() => setShowVeronicaLetter(true)}
                  className="w-full text-left bg-gray-900 border border-gray-700 hover:border-amber-500 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-amber-400" />
                    <div>
                      <h3 className="font-semibold text-gray-100">Letter from Veronica Ashcombe</h3>
                      <p className="text-sm text-gray-400">October 14th, 1924 - Ashcombe Manor</p>
                    </div>
                  </div>
                </button>

                {/* Placeholder for other documents */}
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Additional documents will appear here as you discover them</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scenes Tab */}
          <TabsContent value="scenes" className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">Investigated Scenes</h2>
              
              {investigatedScenes.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No scenes investigated yet.</p>
                  <p className="text-sm mt-2">Use &quot;Investigate Scenes&quot; to examine locations.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {investigatedScenes.map(sceneId => (
                    <div key={sceneId} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                      {/* Scene images would go here */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-100">{sceneId}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Clues Tab */}
          <TabsContent value="clues" className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">Clues Received</h2>
              
              <div className="text-gray-400 text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No clues requested yet.</p>
                <p className="text-sm mt-2">Use &quot;Get Clue&quot; action (costs 2 DP) for hints.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
