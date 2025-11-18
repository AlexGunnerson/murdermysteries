"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Star } from 'lucide-react'

interface FeedbackFormProps {
  onClose?: () => void
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [category, setCategory] = useState<string>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert('Please provide your feedback before submitting.')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
          category,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setSubmitted(true)
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-300">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Share Your Feedback
      </h1>

      <div className="space-y-6">
        {/* Rating */}
        <div>
          <Label className="text-gray-200 mb-2 block">
            How would you rate your experience?
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="text-gray-200 mb-2 block">
            Feedback Category
          </Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="general">General Feedback</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="case">Case Content</option>
            <option value="ui">User Interface</option>
            <option value="difficulty">Difficulty Level</option>
          </select>
        </div>

        {/* Feedback Text */}
        <div>
          <Label className="text-gray-200 mb-2 block">
            Your Feedback *
          </Label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think. Your feedback helps us improve the game!"
            className="min-h-[150px] bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

