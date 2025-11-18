import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/feedback
 * Submit user feedback
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { rating, feedback, category } = body

    if (!feedback || !category) {
      return NextResponse.json(
        { error: 'feedback and category are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        rating: rating || null,
        feedback_text: feedback,
        category,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting feedback:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      feedbackId: data.id,
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

