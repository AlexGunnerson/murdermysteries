"use client"

import { useState } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileText, MapPin, Lightbulb } from 'lucide-react'

type NotebookTab = 'facts' | 'people' | 'records' | 'scenes' | 'theories'

export function DetectiveNotebook() {
  const [activeTab, setActiveTab] = useState<NotebookTab>('facts')
  const { discoveredFacts, chatHistory, theoryHistory } = useGameState()

  // Get unique suspects from chat history
  const uniqueSuspects = Array.from(
    new Set(chatHistory.map(msg => msg.suspectId))
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'facts':
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Discovered Facts
            </h2>
            {discoveredFacts.length === 0 ? (
              <p className="text-gray-500 italic">No facts discovered yet. Start investigating!</p>
            ) : (
              discoveredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="bg-gray-800 border border-gray-700 rounded p-3"
                >
                  <p className="text-gray-200 mb-2">{fact.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="capitalize">Source: {fact.source}</span>
                    <span>
                      {new Date(fact.discoveredAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )

      case 'people':
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Key People
            </h2>
            {uniqueSuspects.length === 0 ? (
              <p className="text-gray-500 italic">No suspects questioned yet.</p>
            ) : (
              uniqueSuspects.map((suspectId) => {
                const suspectMessages = chatHistory.filter(
                  msg => msg.suspectId === suspectId
                )
                const messageCount = suspectMessages.length

                return (
                  <div
                    key={suspectId}
                    className="bg-gray-800 border border-gray-700 rounded p-4"
                  >
                    <h3 className="font-semibold text-gray-100 mb-1">
                      Suspect ID: {suspectId}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {messageCount} conversation{messageCount !== 1 ? 's' : ''}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                      onClick={() => {
                        // TODO: Navigate to chat with this suspect
                        console.log('View chat with', suspectId)
                      }}
                    >
                      View Conversations
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        )

      case 'records':
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Records Reviewed
            </h2>
            {discoveredFacts.filter(f => f.source === 'record').length === 0 ? (
              <p className="text-gray-500 italic">No records viewed yet.</p>
            ) : (
              <div className="space-y-2">
                {discoveredFacts
                  .filter(f => f.source === 'record')
                  .map((fact) => (
                    <div
                      key={fact.id}
                      className="bg-gray-800 border border-gray-700 rounded p-3"
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-amber-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-200">{fact.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Source ID: {fact.sourceId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )

      case 'scenes':
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Scenes Investigated
            </h2>
            {discoveredFacts.filter(f => f.source === 'scene').length === 0 ? (
              <p className="text-gray-500 italic">No scenes investigated yet.</p>
            ) : (
              <div className="space-y-2">
                {discoveredFacts
                  .filter(f => f.source === 'scene')
                  .map((fact) => (
                    <div
                      key={fact.id}
                      className="bg-gray-800 border border-gray-700 rounded p-3"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-amber-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-200">{fact.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Scene ID: {fact.sourceId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )

      case 'theories':
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Theory Submission History
            </h2>
            {theoryHistory.length === 0 ? (
              <p className="text-gray-500 italic">No theories submitted yet.</p>
            ) : (
              theoryHistory.map((theory) => (
                <div
                  key={theory.id}
                  className={`bg-gray-800 border rounded p-4 ${
                    theory.result === 'correct'
                      ? 'border-green-600'
                      : theory.result === 'partial'
                      ? 'border-yellow-600'
                      : 'border-red-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                        theory.result === 'correct'
                          ? 'bg-green-900/30 text-green-400'
                          : theory.result === 'partial'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {theory.result}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(theory.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-2">{theory.description}</p>
                  {theory.feedback && (
                    <p className="text-sm text-gray-400 italic">
                      Feedback: {theory.feedback}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Artifacts used: {theory.artifactIds.length}
                  </p>
                  {theory.unlockedContent && (
                    <div className="mt-2 p-2 bg-amber-900/20 border border-amber-700 rounded">
                      <p className="text-xs text-amber-400 font-semibold">
                        ✓ Unlocked new content!
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Detective&apos;s Notebook
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        <button
          onClick={() => setActiveTab('facts')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'facts'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Facts
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'people'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="h-4 w-4" />
          People
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'records'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Records
        </button>
        <button
          onClick={() => setActiveTab('scenes')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'scenes'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Scenes
        </button>
        <button
          onClick={() => setActiveTab('theories')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'theories'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Theories
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

