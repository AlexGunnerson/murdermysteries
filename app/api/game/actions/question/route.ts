import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createStoryService } from '@/lib/services/storyService'

/**
 * POST /api/game/actions/question
 * Handle the "Question Suspects" action
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, suspectId, caseId } = body

    if (!sessionId || !suspectId) {
      return NextResponse.json(
        { error: 'sessionId and suspectId are required' },
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

    // Get case ID from session or use provided caseId
    const activeCaseId = caseId || session.case_id

    // Load suspect from Story Service
    const storyService = createStoryService(activeCaseId)
    const suspect = await storyService.getSuspect(suspectId)

    if (!suspect) {
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

    if (!suspect.initiallyAvailable && !unlocked) {
      return NextResponse.json(
        { error: 'This suspect has not been unlocked yet' },
        { status: 403 }
      )
    }

    // Get discovered facts for this session to build context-aware prompt
    const { data: discoveredFacts } = await supabase
      .from('discovered_facts')
      .select('fact_key')
      .eq('game_session_id', sessionId)

    const factKeys = discoveredFacts?.map(f => f.fact_key) || []

    // Generate AI system prompt with discovered facts
    const systemPrompt = await storyService.getSuspectPrompt(suspectId, factKeys)

    // Just return suspect info for the ChatInterface
    return NextResponse.json({
      success: true,
      suspect: {
        id: suspect.id,
        name: suspect.name,
        role: suspect.role,
        bio: suspect.bio,
        portraitUrl: suspect.portraitUrl,
        systemPrompt: systemPrompt,
      },
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
 * GET /api/game/actions/question?sessionId=xxx&caseId=xxx
 * Get list of available suspects to question
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const caseId = searchParams.get('caseId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

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

    // Get case ID from session or query param
    const activeCaseId = caseId || session.case_id

    // Load suspects from Story Service
    const storyService = createStoryService(activeCaseId)
    const allSuspects = await storyService.getSuspects()

    // Get unlocked suspects
    const { data: unlockedContent } = await supabase
      .from('unlocked_content')
      .select('content_id')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'suspect')

    const unlockedIds = new Set(unlockedContent?.map(u => u.content_id) || [])

    // Filter suspects based on availability
    const availableSuspects = allSuspects.filter(
      s => s.initiallyAvailable || unlockedIds.has(s.id)
    ).map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      bio: s.bio,
      portraitUrl: s.portraitUrl,
      isLocked: !s.initiallyAvailable && !unlockedIds.has(s.id),
    }))

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

