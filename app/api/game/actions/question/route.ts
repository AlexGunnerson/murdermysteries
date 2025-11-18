import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { DP_COSTS } from '@/lib/utils/dpCalculator'

/**
 * POST /api/game/actions/question
 * Handle the "Question Suspects" action
 * Cost: Free (0 DP)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, suspectId } = body

    if (!sessionId || !suspectId) {
      return NextResponse.json(
        { error: 'sessionId and suspectId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if suspect exists and is unlocked
    const { data: suspect, error: suspectError } = await supabase
      .from('suspects')
      .select('*')
      .eq('id', suspectId)
      .eq('case_id', session.case_id)
      .single()

    if (suspectError || !suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      )
    }

    // Check if suspect is unlocked for this session
    const { data: unlocked } = await supabase
      .from('unlocked_content')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'suspect')
      .eq('content_id', suspectId)
      .single()

    if (!unlocked && suspect.is_locked) {
      return NextResponse.json(
        { error: 'This suspect has not been unlocked yet' },
        { status: 403 }
      )
    }

    // Questioning is free, so no DP deduction needed
    // Just return suspect info for the ChatInterface
    return NextResponse.json({
      success: true,
      suspect: {
        id: suspect.id,
        name: suspect.name,
        role: suspect.role,
        personality: suspect.personality,
        systemPrompt: suspect.system_prompt,
      },
      cost: DP_COSTS.QUESTION_SUSPECTS,
    })
  } catch (error) {
    console.error('Error in question action:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process question action' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/game/actions/question?sessionId=xxx
 * Get list of available suspects to question
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify session
    const { data: session } = await supabase
      .from('game_sessions')
      .select('case_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get all suspects for the case
    const { data: allSuspects } = await supabase
      .from('suspects')
      .select('*')
      .eq('case_id', session.case_id)

    // Get unlocked suspects
    const { data: unlockedContent } = await supabase
      .from('unlocked_content')
      .select('content_id')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'suspect')

    const unlockedIds = new Set(unlockedContent?.map(u => u.content_id) || [])

    // Filter suspects based on locked status
    const availableSuspects = allSuspects?.filter(
      s => !s.is_locked || unlockedIds.has(s.id)
    ).map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      description: s.description,
      isLocked: s.is_locked && !unlockedIds.has(s.id),
    })) || []

    return NextResponse.json({
      suspects: availableSuspects,
    })
  } catch (error) {
    console.error('Error getting suspects:', error)
    return NextResponse.json(
      { error: 'Failed to get suspects' },
      { status: 500 }
    )
  }
}

