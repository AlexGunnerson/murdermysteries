import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { DP_COSTS, canAffordAction } from '@/lib/utils/dpCalculator'

/**
 * POST /api/game/actions/records
 * Handle the "Check Records" action
 * Cost: -2 DP
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, recordId } = body

    if (!sessionId || !recordId) {
      return NextResponse.json(
        { error: 'sessionId and recordId are required' },
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

    // Check if player has enough DP
    const cost = DP_COSTS.CHECK_RECORDS
    if (!canAffordAction(session.detective_points, cost)) {
      return NextResponse.json(
        { error: `Not enough Detective Points. This action costs ${Math.abs(cost)} DP.` },
        { status: 403 }
      )
    }

    // Check if record exists
    const { data: record, error: recordError } = await supabase
      .from('records')
      .select('*')
      .eq('id', recordId)
      .eq('case_id', session.case_id)
      .single()

    if (recordError || !record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    // Check if record is unlocked
    const { data: unlocked } = await supabase
      .from('unlocked_content')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'record')
      .eq('content_id', recordId)
      .single()

    if (!unlocked && record.is_locked) {
      return NextResponse.json(
        { error: 'This record has not been unlocked yet. You may need to discover certain facts first.' },
        { status: 403 }
      )
    }

    // Deduct DP
    const newDP = session.detective_points + cost
    await supabase
      .from('game_sessions')
      .update({ 
        detective_points: newDP,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Mark record as viewed if not already
    await supabase
      .from('unlocked_content')
      .upsert({
        game_session_id: sessionId,
        content_type: 'record',
        content_id: recordId,
      }, {
        onConflict: 'game_session_id,content_type,content_id',
        ignoreDuplicates: true,
      })

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        title: record.title,
        type: record.type,
        content: record.content,
        date: record.date,
        relatedFacts: record.related_facts,
      },
      cost,
      newDP,
    })
  } catch (error) {
    console.error('Error in records action:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to check records' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/game/actions/records?sessionId=xxx
 * Get list of available records
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

    const supabase = createServiceRoleClient()

    // Verify session
    const { data: session } = await supabase
      .from('game_sessions')
      .select('case_id, detective_points')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get all records for the case
    const { data: allRecords } = await supabase
      .from('records')
      .select('*')
      .eq('case_id', session.case_id)

    // Get unlocked records
    const { data: unlockedContent } = await supabase
      .from('unlocked_content')
      .select('content_id')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'record')

    const unlockedIds = new Set(unlockedContent?.map(u => u.content_id) || [])

    // Filter records based on locked status
    const availableRecords = allRecords?.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      description: r.description,
      isLocked: r.is_locked && !unlockedIds.has(r.id),
      isViewed: unlockedIds.has(r.id),
    })) || []

    return NextResponse.json({
      records: availableRecords,
      currentDP: session.detective_points,
      cost: DP_COSTS.CHECK_RECORDS,
    })
  } catch (error) {
    console.error('Error getting records:', error)
    return NextResponse.json(
      { error: 'Failed to get records' },
      { status: 500 }
    )
  }
}

