"use client"

import { useState, useEffect } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/button'
import { FileText, Lock, Eye } from 'lucide-react'

interface Record {
  id: string
  title: string
  type: string
  description: string
  content?: string
  date?: string
  relatedFacts?: string[]
  isLocked: boolean
  isViewed: boolean
}

interface RecordViewerProps {
  sessionId: string
  onFactDiscovered?: (fact: string) => void
}

export function RecordViewer({ sessionId, onFactDiscovered }: RecordViewerProps) {
  const [records, setRecords] = useState<Record[]>([])
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { detectivePoints, subtractDetectivePoints, addDiscoveredFact, unlockRecord, isLoading: gameLoading } = useGameState()

  // Fetch available records
  useEffect(() => {
    fetchRecords()
  }, [sessionId])

  const fetchRecords = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/game/actions/records?sessionId=${sessionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }

      const data = await response.json()
      setRecords(data.records)
    } catch (err) {
      console.error('Error fetching records:', err)
      setError('Failed to load records')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecord = async (record: Record) => {
    if (record.isLocked) {
      setError('This record is locked. Discover more facts to unlock it.')
      return
    }

    if (record.isViewed && record.content) {
      // Already viewed, just display it
      setSelectedRecord(record)
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

      const response = await fetch('/api/game/actions/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          recordId: record.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to view record')
      }

      const data = await response.json()

      // Update DP
      subtractDetectivePoints(Math.abs(data.cost))
      
      // Update game store
      unlockRecord(record.id)

      // Update record with full content
      const fullRecord = { ...record, ...data.record, isViewed: true }
      setSelectedRecord(fullRecord)

      // Update records list
      setRecords(records.map(r => 
        r.id === record.id ? fullRecord : r
      ))

      // Add related facts if any
      if (data.record.relatedFacts && data.record.relatedFacts.length > 0) {
        data.record.relatedFacts.forEach((fact: string) => {
          addDiscoveredFact({
            content: fact,
            source: 'record',
            sourceId: record.id,
          })
          if (onFactDiscovered) {
            onFactDiscovered(fact)
          }
        })
      }
    } catch (err) {
      console.error('Error viewing record:', err)
      setError(err instanceof Error ? err.message : 'Failed to view record')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedRecord(null)
  }

  if (selectedRecord) {
    return (
      <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={handleClose}
            variant="outline"
            className="mb-4 bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
          >
            ← Back to Records
          </Button>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="mb-4">
              <span className="text-xs text-amber-400 uppercase tracking-wide">
                {selectedRecord.type}
              </span>
              {selectedRecord.date && (
                <span className="text-xs text-gray-400 ml-4">
                  Date: {selectedRecord.date}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-amber-400 mb-4">
              {selectedRecord.title}
            </h1>

            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-200">
                {selectedRecord.content}
              </div>
            </div>

            {selectedRecord.relatedFacts && selectedRecord.relatedFacts.length > 0 && (
              <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded">
                <h3 className="text-amber-400 font-semibold mb-2">
                  Facts Discovered:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {selectedRecord.relatedFacts.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-6">
          Official Records
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 text-gray-400">
          <p>Detective Points: <span className="text-amber-400 font-semibold">{detectivePoints} DP</span></p>
          <p className="text-sm">Cost to view a record: <span className="text-red-400">-2 DP</span></p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading records...</div>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <div
                key={record.id}
                className={`bg-gray-800 border border-gray-700 rounded-lg p-4 transition-all ${
                  record.isLocked 
                    ? 'opacity-60' 
                    : 'hover:border-amber-500 cursor-pointer'
                }`}
                onClick={() => !record.isLocked && handleViewRecord(record)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-amber-400" />
                      <h3 className="text-lg font-semibold text-gray-100">
                        {record.title}
                      </h3>
                      {record.isViewed && !record.isLocked && (
                        <Eye className="h-4 w-4 text-green-400" />
                      )}
                      {record.isLocked && (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{record.description}</p>
                    <span className="text-xs text-amber-400 uppercase">
                      {record.type}
                    </span>
                  </div>
                  {!record.isLocked && !record.isViewed && (
                    <span className="text-red-400 text-sm font-semibold">
                      -2 DP
                    </span>
                  )}
                </div>
              </div>
            ))}

            {records.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 py-8">
                No records available yet. Continue your investigation to unlock more.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

