import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateClue } from '@/lib/services/aiService'

/**
 * POST /api/game/actions/clue
 * Handle the "Get Clue" action
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

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

    // Get case info
    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', session.case_id)
      .single()

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Get discovered facts
    const { data: facts } = await supabase
      .from('discovered_facts')
      .select('fact_content')
      .eq('game_session_id', sessionId)

    // Get investigated scenes
    const { data: investigatedScenes } = await supabase
      .from('unlocked_content')
      .select('content_id')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'scene')

    // Get questioned suspects
    const { data: chatLogs } = await supabase
      .from('chat_messages')
      .select('suspect_id')
      .eq('game_session_id', sessionId)

    const uniqueSuspects = [...new Set(chatLogs?.map(c => c.suspect_id) || [])]

    // Build context for AI clue generation
    const context = {
      discoveredFacts: facts?.map(f => f.fact_content) || [],
      investigatedLocations: investigatedScenes?.map(s => s.content_id) || [],
      questionedSuspects: uniqueSuspects,
      correctPath: caseData.correct_path || [],
    }

    // Generate contextual clue
    const clueText = await generateClue(context)

    // Log clue usage (optional, for analytics)
    try {
      await supabase
        .from('clue_logs')
        .insert({
          game_session_id: sessionId,
          clue_text: clueText,
        })
    } catch {
      // Silently fail if table doesn't exist yet
    }

    return NextResponse.json({
      success: true,
      clue: clueText,
    })
  } catch (error) {
    console.error('Error in clue action:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get clue' },
      { status: 500 }
    )
  }
}

