"use client"

import { useState } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Lightbulb, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { QuickNoteButton } from './QuickNoteButton'

interface TheorySubmissionProps {
  sessionId: string
  onTheorySubmitted?: () => void
}

export function TheorySubmission({ sessionId, onTheorySubmitted }: TheorySubmissionProps) {
  const [theoryDescription, setTheoryDescription] = useState('')
  const [selectedArtifacts, setSelectedArtifacts] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    result: 'correct' | 'partial' | 'incorrect'
    feedback: string
  } | null>(null)

  const { discoveredFacts, addTheorySubmission } = useGameState()

  const handleArtifactToggle = (artifactId: string) => {
    const newSelected = new Set(selectedArtifacts)
    if (newSelected.has(artifactId)) {
      newSelected.delete(artifactId)
    } else {
      newSelected.add(artifactId)
    }
    setSelectedArtifacts(newSelected)
  }

  const handleSubmit = async () => {
    if (!theoryDescription.trim() || selectedArtifacts.size === 0) {
      alert('Please provide a theory description and select at least one artifact.')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmissionResult(null)

      const response = await fetch('/api/game/actions/validate-theory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          description: theoryDescription.trim(),
          artifactIds: Array.from(selectedArtifacts),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit theory')
      }

      const data = await response.json()

      // Add theory to history
      addTheorySubmission({
        description: theoryDescription.trim(),
        artifactIds: Array.from(selectedArtifacts),
        result: data.result,
        feedback: data.feedback,
        unlockedContent: data.unlockedContent,
      })

      // Show result
      setSubmissionResult({
        result: data.result,
        feedback: data.feedback,
      })

      // Reset form if correct
      if (data.result === 'correct') {
        setTheoryDescription('')
        setSelectedArtifacts(new Set())
      }

      // Notify parent
      if (onTheorySubmitted) {
        onTheorySubmitted()
      }
    } catch (error) {
      console.error('Error submitting theory:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit theory')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-6 flex items-center gap-2">
          <Lightbulb className="h-8 w-8" />
          Submit a Theory
        </h1>

        <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded">
          <p className="text-gray-300 mb-2">
            As you investigate, you may form theories about the case. Submit your theories here with
            supporting evidence to validate your thinking.
          </p>
        </div>

        {/* Theory Description */}
        <div className="mb-6">
          <Label htmlFor="theory" className="text-lg font-semibold text-gray-200 mb-2 block">
            Your Theory
          </Label>
          <Textarea
            id="theory"
            value={theoryDescription}
            onChange={(e) => setTheoryDescription(e.target.value)}
            placeholder="Describe your theory about the case. Who is involved? What happened? Why?"
            className="min-h-[150px] bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Artifact Selection */}
        <div className="mb-6">
          <Label className="text-lg font-semibold text-gray-200 mb-3 block">
            Supporting Evidence
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Select artifacts that support your theory)
            </span>
          </Label>

          {discoveredFacts.length === 0 ? (
            <p className="text-gray-500 italic">
              No facts discovered yet. Continue investigating to gather evidence.
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto bg-gray-800 border border-gray-700 rounded p-4">
              {discoveredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="flex items-start gap-3 p-3 bg-gray-900 rounded hover:bg-gray-850 transition-colors"
                >
                  <Checkbox
                    id={fact.id}
                    checked={selectedArtifacts.has(fact.id)}
                    onCheckedChange={() => handleArtifactToggle(fact.id)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor={fact.id}
                    className="flex-1 text-gray-200 cursor-pointer"
                  >
                    <span className="block">{fact.content}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      Source: {fact.source}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-400 mt-2">
            Selected: {selectedArtifacts.size} artifact{selectedArtifacts.size !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Submission Result */}
        {submissionResult && (
          <div
            className={`mb-6 p-4 border rounded ${
              submissionResult.result === 'correct'
                ? 'bg-green-900/30 border-green-600'
                : submissionResult.result === 'partial'
                ? 'bg-yellow-900/30 border-yellow-600'
                : 'bg-red-900/30 border-red-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {submissionResult.result === 'correct' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-400">Correct Theory!</span>
                </>
              )}
              {submissionResult.result === 'partial' && (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">Partially Correct</span>
                </>
              )}
              {submissionResult.result === 'incorrect' && (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-400">Incorrect Theory</span>
                </>
              )}
            </div>
            <p className="text-gray-200">{submissionResult.feedback}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !theoryDescription.trim() ||
            selectedArtifacts.size === 0 ||
            isSubmitting
          }
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3"
        >
          {isSubmitting ? 'Validating Theory...' : 'Submit Theory'}
        </Button>
      </div>

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
  )
}

