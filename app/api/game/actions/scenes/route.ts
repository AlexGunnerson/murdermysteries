import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { DP_COSTS, canAffordAction } from '@/lib/utils/dpCalculator'

/**
 * POST /api/game/actions/scenes
 * Handle the "Investigate Scenes" action
 * Cost: -3 DP
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, sceneId } = body

    if (!sessionId || !sceneId) {
      return NextResponse.json(
        { error: 'sessionId and sceneId are required' },
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
    const cost = DP_COSTS.INVESTIGATE_SCENES
    if (!canAffordAction(session.detective_points, cost)) {
      return NextResponse.json(
        { error: `Not enough Detective Points. This action costs ${Math.abs(cost)} DP.` },
        { status: 403 }
      )
    }

    // Check if scene exists in case_scenes table
    const { data: scene, error: sceneError } = await supabase
      .from('case_scenes')
      .select('*')
      .eq('scene_id', sceneId)
      .eq('case_id', session.case_id)
      .single()

    if (sceneError || !scene) {
      console.error('Scene query error:', sceneError)
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      )
    }

    // Check if scene is unlocked
    const { data: unlocked } = await supabase
      .from('unlocked_content')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'scene')
      .eq('content_id', sceneId)
      .single()

    if (!unlocked && scene.is_locked) {
      return NextResponse.json(
        { error: 'This scene has not been unlocked yet. You may need to discover certain facts first.' },
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

    // Mark scene as investigated
    await supabase
      .from('unlocked_content')
      .upsert({
        game_session_id: sessionId,
        content_type: 'scene',
        content_id: sceneId,
      }, {
        onConflict: 'game_session_id,content_type,content_id',
        ignoreDuplicates: true,
      })

    // Get evidence at this scene
    const { data: evidence } = await supabase
      .from('evidence')
      .select('*')
      .eq('scene_id', sceneId)

    return NextResponse.json({
      success: true,
      scene: {
        id: scene.id,
        name: scene.name,
        description: scene.description,
        imageUrl: scene.image_url,
        relatedFacts: scene.related_facts,
        evidence: evidence || [],
      },
      cost,
      newDP,
    })
  } catch (error) {
    console.error('Error in scenes action:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to investigate scene' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/game/actions/scenes?sessionId=xxx
 * Get list of available scenes
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

    // Get all scenes for the case
    const { data: allScenes } = await supabase
      .from('scenes')
      .select('*')
      .eq('case_id', session.case_id)

    // Get unlocked scenes
    const { data: unlockedContent } = await supabase
      .from('unlocked_content')
      .select('content_id')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'scene')

    const unlockedIds = new Set(unlockedContent?.map(u => u.content_id) || [])

    // Filter scenes based on locked status
    const availableScenes = allScenes?.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      imageUrl: s.image_url,
      isLocked: s.is_locked && !unlockedIds.has(s.id),
      isInvestigated: unlockedIds.has(s.id),
    })) || []

    return NextResponse.json({
      scenes: availableScenes,
      currentDP: session.detective_points,
      cost: DP_COSTS.INVESTIGATE_SCENES,
    })
  } catch (error) {
    console.error('Error getting scenes:', error)
    return NextResponse.json(
      { error: 'Failed to get scenes' },
      { status: 500 }
    )
  }
}

