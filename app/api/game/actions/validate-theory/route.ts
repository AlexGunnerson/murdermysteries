import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { DP_COSTS, canAffordAction } from '@/lib/utils/dpCalculator'
import { evaluateUnlocks, applyUnlocks, checkAndApplyActIUnlocks } from '@/lib/services/unlockService'
import { GameStage } from '@/lib/config/unlockRules'

/**
 * POST /api/game/actions/validate-theory
 * Handle theory validation
 * Cost: -3 DP
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, description, artifactIds } = body

    if (!sessionId || !description || !artifactIds) {
      return NextResponse.json(
        { error: 'sessionId, description, and artifactIds are required' },
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
    const cost = DP_COSTS.VALIDATE_THEORY
    if (!canAffordAction(session.detective_points, cost)) {
      return NextResponse.json(
        { error: `Not enough Detective Points. This action costs ${Math.abs(cost)} DP.` },
        { status: 403 }
      )
    }

    // Get case data
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

    // Get discovered facts to build artifact content map
    const { data: facts } = await supabase
      .from('discovered_facts')
      .select('*')
      .eq('game_session_id', sessionId)

    // Deduct DP
    const newDP = session.detective_points + cost
    await supabase
      .from('game_sessions')
      .update({
        detective_points: newDP,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Evaluate unlocks FIRST (before saving theory)
    // This is the authoritative source for determining correctness

    console.log('[VALIDATE-THEORY] Evaluating unlocks:', {
      sessionId,
      evidenceIds: artifactIds,
      currentStage: session.current_stage || 'start',
    })
    
    const unlockResult = await evaluateUnlocks({
      sessionId,
      evidenceIds: artifactIds,
      currentStage: (session.current_stage || 'start') as GameStage,
      trigger: 'theory'
    })

    console.log('[VALIDATE-THEORY] Unlock result:', {
      hasUnlocks: unlockResult.hasUnlocks,
      matchedRule: unlockResult.matchedRule?.id,
      unlocks: unlockResult.unlocks
    })

    // Determine result based on unlock triggers (artifact-based system)
    let finalResult: 'correct' | 'incorrect' = 'incorrect'
    let finalFeedback = 'The evidence submitted does not support a valid theory. Try different combinations of evidence.'
    let unlockedContent: {
      suspects?: string[]
      scenes?: string[]
      records?: string[]
      stage?: string
      statusUpdate?: string
    } | undefined

    if (unlockResult.hasUnlocks) {
      await applyUnlocks(sessionId, unlockResult)
      unlockedContent = unlockResult.unlocks
      
      console.log('[VALIDATE-THEORY] Applied unlocks')
      // Note: checkAndApplyActIUnlocks is deprecated (Act I no longer exists)
      // All unlocks are handled directly in unlock rules
      await checkAndApplyActIUnlocks(sessionId)

      finalResult = 'correct'
      finalFeedback = unlockResult.matchedRule?.notificationMessage || 'Your theory is correct! New content has been unlocked.'
    } else {
      console.log('[VALIDATE-THEORY] No unlocks matched')
    }

    // Save theory submission with the result
    await supabase
      .from('theory_submissions')
      .insert({
        game_session_id: sessionId,
        theory_description: description,
        artifact_ids: artifactIds,
        result: finalResult,
        feedback: finalFeedback,
      })

    return NextResponse.json({
      success: true,
      result: finalResult,
      feedback: finalFeedback,
      matchedFacts: [],
      unlockedContent,
      cost,
      newDP,
    })
  } catch (error) {
    console.error('Error validating theory:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to validate theory' },
      { status: 500 }
    )
  }
}

