"use client"

import { useState, useEffect } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileText, MapPin, Lightbulb, TrendingUp, Award } from 'lucide-react'
import Image from 'next/image'

type NotebookTab = 'dashboard' | 'facts' | 'people' | 'records' | 'scenes' | 'theories'

interface CaseMetadata {
  suspects: Array<{
    id: string
    name: string
    role: string
    bio: string
    portraitUrl: string
  }>
  locations: Array<{
    id: string
    name: string
    description: string
    imageUrl: string
  }>
  records: Array<{
    id: string
    name: string
    description: string
  }>
}

export function DetectiveNotebook() {
  const [activeTab, setActiveTab] = useState<NotebookTab>('dashboard')
  const { discoveredFacts, chatHistory, theoryHistory, detectivePoints, caseId } = useGameState()
  const [caseMetadata, setCaseMetadata] = useState<CaseMetadata | null>(null)

  // Load case metadata
  useEffect(() => {
    const loadCaseData = async () => {
      if (!caseId) return
      
      try {
        const response = await fetch(`/cases/${caseId}/metadata.json`)
        const data = await response.json()
        setCaseMetadata(data)
      } catch (error) {
        console.error('Failed to load case metadata:', error)
      }
    }
    
    loadCaseData()
  }, [caseId])

  // Get unique suspects from chat history
  const uniqueSuspectIds = Array.from(
    new Set(chatHistory.map(msg => msg.suspectId))
  )
  
  // Get suspect details from metadata
  const questionedSuspects = uniqueSuspectIds
    .map(id => caseMetadata?.suspects.find(s => s.id === id))
    .filter(Boolean)

  // Statistics
  const stats = {
    detectivePoints,
    factsDiscovered: discoveredFacts.length,
    suspectsQuestioned: uniqueSuspectIds.length,
    scenesVisited: new Set(discoveredFacts.filter(f => f.source === 'scene').map(f => f.sourceId)).size,
    recordsViewed: new Set(discoveredFacts.filter(f => f.source === 'record').map(f => f.sourceId)).size,
    theoriesSubmitted: theoryHistory.length,
    correctTheories: theoryHistory.filter(t => t.result === 'correct').length,
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">
              Investigation Overview
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span className="text-xs text-gray-400 uppercase">Detective Points</span>
                </div>
                <p className="text-3xl font-bold text-amber-400">{stats.detectivePoints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-gray-400 uppercase">Facts Found</span>
                </div>
                <p className="text-3xl font-bold text-blue-400">{stats.factsDiscovered}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span className="text-xs text-gray-400 uppercase">Suspects Questioned</span>
                </div>
                <p className="text-3xl font-bold text-purple-400">{stats.suspectsQuestioned}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-xs text-gray-400 uppercase">Theories</span>
                </div>
                <p className="text-3xl font-bold text-green-400">
                  {stats.correctTheories}/{stats.theoriesSubmitted}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Recent Discoveries</h3>
              <div className="space-y-2">
                {discoveredFacts.slice(-5).reverse().map((fact) => (
                  <div
                    key={fact.id}
                    className="bg-gray-800/50 border border-gray-700 rounded p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {fact.source === 'chat' && <Users className="h-4 w-4 text-purple-400" />}
                        {fact.source === 'scene' && <MapPin className="h-4 w-4 text-blue-400" />}
                        {fact.source === 'record' && <FileText className="h-4 w-4 text-amber-400" />}
                        {fact.source === 'clue' && <Lightbulb className="h-4 w-4 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{fact.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(fact.discoveredAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {discoveredFacts.length === 0 && (
                  <p className="text-gray-500 italic text-center py-8">
                    No discoveries yet. Start investigating to uncover clues!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setActiveTab('people')}
                className="bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/50 text-purple-300 justify-start h-auto py-4"
              >
                <Users className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">View Suspects</div>
                  <div className="text-xs opacity-75">{stats.suspectsQuestioned} questioned</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setActiveTab('scenes')}
                className="bg-blue-900/30 hover:bg-blue-800/40 border border-blue-700/50 text-blue-300 justify-start h-auto py-4"
              >
                <MapPin className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">View Scenes</div>
                  <div className="text-xs opacity-75">{stats.scenesVisited} visited</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setActiveTab('records')}
                className="bg-amber-900/30 hover:bg-amber-800/40 border border-amber-700/50 text-amber-300 justify-start h-auto py-4"
              >
                <FileText className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">View Records</div>
                  <div className="text-xs opacity-75">{stats.recordsViewed} reviewed</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setActiveTab('theories')}
                className="bg-green-900/30 hover:bg-green-800/40 border border-green-700/50 text-green-300 justify-start h-auto py-4"
              >
                <Lightbulb className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">View Theories</div>
                  <div className="text-xs opacity-75">{stats.theoriesSubmitted} submitted</div>
                </div>
              </Button>
            </div>
          </div>
        )

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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Key People
            </h2>
            {questionedSuspects.length === 0 ? (
              <p className="text-gray-500 italic">No suspects questioned yet.</p>
            ) : (
              <div className="grid gap-4">
                {questionedSuspects.map((suspect) => {
                  if (!suspect) return null
                  
                  const suspectMessages = chatHistory.filter(
                    msg => msg.suspectId === suspect.id
                  )
                  const messageCount = suspectMessages.length
                  const lastInteraction = suspectMessages[suspectMessages.length - 1]

                  return (
                    <div
                      key={suspect.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Portrait */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-600">
                            <Image
                              src={suspect.portraitUrl}
                              alt={suspect.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-100 text-lg">
                            {suspect.name}
                          </h3>
                          <p className="text-sm text-purple-400 mb-2">
                            {suspect.role}
                          </p>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {suspect.bio}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-400">{messageCount}</span> conversation{messageCount !== 1 ? 's' : ''}
                              {lastInteraction && (
                                <span className="ml-2">
                                  • Last: {new Date(lastInteraction.timestamp).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-purple-900/30 text-purple-300 border-purple-700/50 hover:bg-purple-800/40"
                              onClick={() => {
                                // TODO: Navigate to chat with this suspect
                                console.log('View chat with', suspect.id)
                              }}
                            >
                              View Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'records':
        const viewedRecordIds = Array.from(
          new Set(discoveredFacts.filter(f => f.source === 'record').map(f => f.sourceId))
        )
        const viewedRecords = viewedRecordIds
          .map(id => caseMetadata?.records.find(r => r.id === id))
          .filter(Boolean)

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Records Reviewed
            </h2>
            {viewedRecords.length === 0 ? (
              <p className="text-gray-500 italic">No records viewed yet.</p>
            ) : (
              <div className="grid gap-4">
                {viewedRecords.map((record) => {
                  if (!record) return null
                  
                  const recordFacts = discoveredFacts.filter(
                    f => f.source === 'record' && f.sourceId === record.id
                  )

                  return (
                    <div
                      key={record.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded bg-amber-900/30 border border-amber-700/50 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-amber-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-100 mb-1">
                            {record.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3">
                            {record.description}
                          </p>
                          
                          <div className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-400">{recordFacts.length}</span> fact{recordFacts.length !== 1 ? 's' : ''} extracted
                          </div>
                          
                          {recordFacts.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {recordFacts.map(fact => (
                                <div key={fact.id} className="bg-gray-900/50 rounded p-2 border-l-2 border-amber-600">
                                  <p className="text-xs text-gray-300">{fact.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'scenes':
        const visitedSceneIds = Array.from(
          new Set(discoveredFacts.filter(f => f.source === 'scene').map(f => f.sourceId))
        )
        const visitedScenes = visitedSceneIds
          .map(id => caseMetadata?.locations.find(l => l.id === id))
          .filter(Boolean)

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Scenes Investigated
            </h2>
            {visitedScenes.length === 0 ? (
              <p className="text-gray-500 italic">No scenes investigated yet.</p>
            ) : (
              <div className="grid gap-4">
                {visitedScenes.map((scene) => {
                  if (!scene) return null
                  
                  const sceneFacts = discoveredFacts.filter(
                    f => f.source === 'scene' && f.sourceId === scene.id
                  )

                  return (
                    <div
                      key={scene.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors"
                    >
                      {/* Scene Image */}
                      <div className="relative w-full h-40">
                        <Image
                          src={scene.imageUrl}
                          alt={scene.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                        <h3 className="absolute bottom-2 left-3 text-lg font-semibold text-white">
                          {scene.name}
                        </h3>
                      </div>
                      
                      {/* Scene Details */}
                      <div className="p-4">
                        <p className="text-sm text-gray-400 mb-3">
                          {scene.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Lightbulb className="h-3 w-3 text-blue-400" />
                            <span className="font-semibold text-gray-400">{sceneFacts.length}</span> fact{sceneFacts.length !== 1 ? 's' : ''} discovered
                          </div>
                          
                          {sceneFacts.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {sceneFacts.slice(0, 2).map(fact => (
                                <div key={fact.id} className="bg-gray-900/50 rounded p-2">
                                  <p className="text-xs text-gray-300">{fact.content}</p>
                                </div>
                              ))}
                              {sceneFacts.length > 2 && (
                                <p className="text-xs text-gray-500 italic">
                                  +{sceneFacts.length - 2} more...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
      <div className="flex border-b border-gray-700 bg-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('facts')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
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

