import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { DP_COSTS, canAffordAction } from '@/lib/utils/dpCalculator'
import { evaluateTheory } from '@/lib/services/aiService'
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

    const artifacts: Record<string, string> = {}
    facts?.forEach(fact => {
      artifacts[fact.fact_key] = fact.fact_content
    })

    // Evaluate theory using AI
    const evaluation = await evaluateTheory(
      {
        description,
        artifactIds,
      },
      {
        correctSolution: caseData.solution_description || '',
        requiredFacts: caseData.required_facts || [],
        artifacts,
      }
    )

    // Deduct DP
    const newDP = session.detective_points + cost
    await supabase
      .from('game_sessions')
      .update({
        detective_points: newDP,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Save theory submission
    const { data: theoryRecord } = await supabase
      .from('theory_submissions')
      .insert({
        game_session_id: sessionId,
        theory_description: description,
        artifact_ids: artifactIds,
        result: evaluation.result,
        feedback: evaluation.feedback,
      })
      .select()
      .single()

    // Evaluate unlocks based on submitted artifacts
    let unlockedContent: {
      suspects?: string[]
      scenes?: string[]
      records?: string[]
      stage?: string
      statusUpdate?: string
    } | undefined

    // Always evaluate unlocks, regardless of AI evaluation result
    // The unlock rules determine if the artifacts trigger unlocks
    const unlockResult = await evaluateUnlocks({
      sessionId,
      evidenceIds: artifactIds,
      currentStage: (session.current_stage || 'start') as GameStage,
      trigger: 'theory'
    })

    if (unlockResult.hasUnlocks) {
      await applyUnlocks(sessionId, unlockResult)
      unlockedContent = unlockResult.unlocks
      
      // Check and apply Act I unlocks if needed
      await checkAndApplyActIUnlocks(sessionId)
    }

    return NextResponse.json({
      success: true,
      result: evaluation.result,
      feedback: evaluation.feedback,
      matchedFacts: evaluation.matchedFacts,
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

