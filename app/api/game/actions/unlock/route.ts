import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/game/actions/unlock
 * Handle button-click unlocks (e.g., retrieve blackmail, security footage)
 * These are "free" unlocks that don't cost DP
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, contentType, contentId } = body

    if (!sessionId || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'sessionId, contentType, and contentId are required' },
        { status: 400 }
      )
    }

    if (!['suspect', 'scene', 'record'].includes(contentType)) {
      return NextResponse.json(
        { error: 'contentType must be one of: suspect, scene, record' },
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

    // Unlock the content
    const { error: unlockError } = await supabase
      .from('unlocked_content')
      .upsert({
        game_session_id: sessionId,
        content_type: contentType,
        content_id: contentId,
      }, {
        onConflict: 'game_session_id,content_type,content_id',
        ignoreDuplicates: true,
      })

    if (unlockError) {
      console.error('Error unlocking content:', unlockError)
      return NextResponse.json(
        { error: 'Failed to unlock content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${contentType} unlocked successfully`,
    })
  } catch (error) {
    console.error('Error in unlock action:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to unlock content' },
      { status: 500 }
    )
  }
}
