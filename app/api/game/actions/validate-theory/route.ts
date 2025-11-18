import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { DP_COSTS, canAffordAction } from '@/lib/utils/dpCalculator'
import { evaluateTheory } from '@/lib/services/aiService'

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

    // If correct, unlock content based on case progression
    let unlockedContent: {
      suspects?: string[]
      scenes?: string[]
      records?: string[]
    } | undefined

    if (evaluation.result === 'correct' && theoryRecord) {
      // Determine what to unlock based on case configuration
      // This would be defined in the case data
      const toUnlock = caseData.theory_unlocks?.[theoryRecord.id] || {}

      if (toUnlock.suspects || toUnlock.scenes || toUnlock.records) {
        unlockedContent = toUnlock

        // Insert unlocked content
        const contentToInsert = []

        if (toUnlock.suspects) {
          contentToInsert.push(...toUnlock.suspects.map((id: string) => ({
            game_session_id: sessionId,
            content_type: 'suspect',
            content_id: id,
          })))
        }

        if (toUnlock.scenes) {
          contentToInsert.push(...toUnlock.scenes.map((id: string) => ({
            game_session_id: sessionId,
            content_type: 'scene',
            content_id: id,
          })))
        }

        if (toUnlock.records) {
          contentToInsert.push(...toUnlock.records.map((id: string) => ({
            game_session_id: sessionId,
            content_type: 'record',
            content_id: id,
          })))
        }

        if (contentToInsert.length > 0) {
          await supabase
            .from('unlocked_content')
            .upsert(contentToInsert, {
              onConflict: 'game_session_id,content_type,content_id',
              ignoreDuplicates: true,
            })
        }
      }
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

