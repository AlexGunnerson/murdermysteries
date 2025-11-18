"use client"

import { useState } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, XCircle, Scale } from 'lucide-react'

interface SolutionSubmissionProps {
  sessionId: string
  caseId: string
  onSolutionSubmitted?: (isCorrect: boolean) => void
}

export function SolutionSubmission({
  sessionId,
  caseId,
  onSolutionSubmitted,
}: SolutionSubmissionProps) {
  const [killer, setKiller] = useState('')
  const [motive, setMotive] = useState('')
  const [keyEvidence, setKeyEvidence] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    isCorrect: boolean
    narrative: string
    summary: {
      dpRemaining: number
      factsDiscovered: number
      theoriesTested: number
    }
  } | null>(null)

  const { detectivePoints, discoveredFacts, theoryHistory, completeGame } = useGameState()

  const handleSubmit = async () => {
    if (!killer.trim() || !motive.trim() || !keyEvidence.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/game/actions/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          caseId,
          solution: {
            killer: killer.trim(),
            motive: motive.trim(),
            keyEvidence: keyEvidence.trim(),
            explanation: explanation.trim(),
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit solution')
      }

      const data = await response.json()

      // Update game state
      completeGame(data.isCorrect)

      // Set result for display
      setResult({
        isCorrect: data.isCorrect,
        narrative: data.narrative,
        summary: {
          dpRemaining: detectivePoints,
          factsDiscovered: discoveredFacts.length,
          theoriesTested: theoryHistory.length,
        },
      })

      // Notify parent
      if (onSolutionSubmitted) {
        onSolutionSubmitted(data.isCorrect)
      }
    } catch (error) {
      console.error('Error submitting solution:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit solution')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If solution has been submitted, show results
  if (result) {
    return (
      <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Result Header */}
          <div
            className={`mb-6 p-6 rounded-lg border-2 ${
              result.isCorrect
                ? 'bg-green-900/30 border-green-500'
                : 'bg-red-900/30 border-red-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-400" />
                  <div>
                    <h1 className="text-3xl font-bold text-green-400">
                      Case Solved!
                    </h1>
                    <p className="text-gray-300">Congratulations, Detective!</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-400" />
                  <div>
                    <h1 className="text-3xl font-bold text-red-400">
                      Incorrect Solution
                    </h1>
                    <p className="text-gray-300">The case remains unsolved.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Narrative Explanation */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              What Really Happened
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {result.narrative}
              </p>
            </div>
          </div>

          {/* Investigation Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Your Investigation
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-900 p-4 rounded">
                <div className="text-3xl font-bold text-amber-400">
                  {result.summary.dpRemaining}
                </div>
                <div className="text-sm text-gray-400">DP Remaining</div>
              </div>
              <div className="bg-gray-900 p-4 rounded">
                <div className="text-3xl font-bold text-amber-400">
                  {result.summary.factsDiscovered}
                </div>
                <div className="text-sm text-gray-400">Facts Discovered</div>
              </div>
              <div className="bg-gray-900 p-4 rounded">
                <div className="text-3xl font-bold text-amber-400">
                  {result.summary.theoriesTested}
                </div>
                <div className="text-sm text-gray-400">Theories Tested</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              Return to Main Menu
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1 bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
            >
              Replay Case
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Solution submission form
  return (
    <div className="h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-6 flex items-center gap-2">
          <Scale className="h-8 w-8" />
          Submit Final Solution
        </h1>

        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700 rounded">
          <p className="text-amber-200">
            ⚠️ This is your final accusation. Make sure you&apos;ve gathered all the evidence
            you need. You can only submit your solution once per case.
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
          {/* Who is the killer? */}
          <div>
            <Label htmlFor="killer" className="text-lg font-semibold text-gray-200 mb-2 block">
              Who is the killer? *
            </Label>
            <input
              id="killer"
              type="text"
              value={killer}
              onChange={(e) => setKiller(e.target.value)}
              placeholder="Enter the name of the killer"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isSubmitting}
            />
          </div>

          {/* What was the motive? */}
          <div>
            <Label htmlFor="motive" className="text-lg font-semibold text-gray-200 mb-2 block">
              What was the motive? *
            </Label>
            <Textarea
              id="motive"
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
              placeholder="Explain why the killer committed the murder"
              className="min-h-[100px] bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500"
              disabled={isSubmitting}
            />
          </div>

          {/* What is the key evidence? */}
          <div>
            <Label htmlFor="evidence" className="text-lg font-semibold text-gray-200 mb-2 block">
              What is the key evidence? *
            </Label>
            <Textarea
              id="evidence"
              value={keyEvidence}
              onChange={(e) => setKeyEvidence(e.target.value)}
              placeholder="Describe the crucial evidence that proves your case"
              className="min-h-[100px] bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Explain how it happened (optional) */}
          <div>
            <Label htmlFor="explanation" className="text-lg font-semibold text-gray-200 mb-2 block">
              Full Explanation (Optional)
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide a detailed explanation of how the murder took place"
              className="min-h-[150px] bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!killer.trim() || !motive.trim() || !keyEvidence.trim() || isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Final Accusation'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            * Required fields
          </p>
        </div>

        {/* Current Investigation Stats */}
        <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Investigation So Far:</h3>
          <div className="flex gap-6 text-sm text-gray-300">
            <span>DP: <span className="text-amber-400">{detectivePoints}</span></span>
            <span>Facts: <span className="text-amber-400">{discoveredFacts.length}</span></span>
            <span>Theories: <span className="text-amber-400">{theoryHistory.length}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

