import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { evaluateUnlocks, applyUnlocks, checkAndApplyActIUnlocks } from '@/lib/services/unlockService'
import { GameStage } from '@/lib/config/unlockRules'

/**
 * POST /api/game/actions/validate-theory
 * Handle theory validation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Evaluate unlocks FIRST (before saving theory)
    // This is the authoritative source for determining correctness

    const currentStage = (session.current_stage || 'start') as GameStage
    
    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║              VALIDATE THEORY - EVALUATION START            ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('[VALIDATE-THEORY] Session ID:', sessionId)
    console.log('[VALIDATE-THEORY] Current stage:', currentStage)
    console.log('[VALIDATE-THEORY] Artifact IDs submitted:', artifactIds)
    console.log('[VALIDATE-THEORY] Artifact count:', artifactIds.length)
    console.log('[VALIDATE-THEORY] Theory description:', description.substring(0, 100) + '...')
    
    // Debug: Check if this is the Colin accusation
    if (artifactIds.includes('record_blackmail_floor_colin') || artifactIds.includes('record_blackmail_portrait_colin')) {
      console.log('\n[VALIDATE-THEORY] 🔍 COLIN ACCUSATION DETECTED!')
      console.log('[VALIDATE-THEORY] Checking for required artifacts:')
      console.log('[VALIDATE-THEORY]   ✓ record_blackmail_floor_colin?', artifactIds.includes('record_blackmail_floor_colin'))
      console.log('[VALIDATE-THEORY]   ✓ record_blackmail_portrait_colin?', artifactIds.includes('record_blackmail_portrait_colin'))
      console.log('[VALIDATE-THEORY]   ✓ scene_ballroom_gala_img_2?', artifactIds.includes('scene_ballroom_gala_img_2'))
      console.log('[VALIDATE-THEORY]   ✓ scene_study_img_0?', artifactIds.includes('scene_study_img_0'))
      console.log('[VALIDATE-THEORY]   ✓ scene_study_img_2?', artifactIds.includes('scene_study_img_2'))
      console.log('[VALIDATE-THEORY] Current stage:', currentStage, '(must be "act_ii" for victory)')
    }
    
    console.log('[VALIDATE-THEORY] Calling evaluateUnlocks...')
    const unlockResult = await evaluateUnlocks({
      sessionId,
      evidenceIds: artifactIds,
      currentStage,
      trigger: 'theory'
    })

    console.log('\n[VALIDATE-THEORY] Unlock evaluation complete:')
    console.log('[VALIDATE-THEORY]   Has unlocks?', unlockResult.hasUnlocks)
    console.log('[VALIDATE-THEORY]   Matched rule:', unlockResult.matchedRule?.id || 'none')
    console.log('[VALIDATE-THEORY]   Unlocks:', unlockResult.unlocks)

    // Determine result based on unlock triggers (artifact-based system)
    let finalResult: 'correct' | 'incorrect' = 'incorrect'
    let finalFeedback = 'The current evidence doesn\'t support this theory. Keep investigating to find more connections!'
    let unlockedContent: {
      suspects?: string[]
      scenes?: string[]
      records?: string[]
      stage?: string
      statusUpdate?: string
    } | undefined

    if (unlockResult.hasUnlocks) {
      console.log('[VALIDATE-THEORY] ✓✓✓ UNLOCKS FOUND! Applying...')
      await applyUnlocks(sessionId, unlockResult)
      unlockedContent = unlockResult.unlocks
      console.log('[VALIDATE-THEORY] ✓ Unlocks applied to database')
      
      // Note: checkAndApplyActIUnlocks is deprecated (Act I no longer exists)
      // All unlocks are handled directly in unlock rules
      await checkAndApplyActIUnlocks(sessionId)

      finalResult = 'correct'
      finalFeedback = unlockResult.matchedRule?.notificationMessage || 'Your theory is correct! New content has been unlocked.'
      
      console.log('[VALIDATE-THEORY] Theory result: CORRECT')
      console.log('[VALIDATE-THEORY] Feedback:', finalFeedback)
    } else {
      console.log('[VALIDATE-THEORY] No unlocks matched - theory is incorrect')
      finalResult = 'incorrect'
    }

    // Save theory submission with the result
    console.log('[VALIDATE-THEORY] Saving theory submission to database...')
    await supabase
      .from('theory_submissions')
      .insert({
        game_session_id: sessionId,
        theory_description: description,
        artifact_ids: artifactIds,
        result: finalResult,
        feedback: finalFeedback,
      })
    console.log('[VALIDATE-THEORY] ✓ Theory submission saved')

    // Check if game was completed
    const gameCompleted = unlockedContent?.statusUpdate === 'Case Solved'
    
    console.log('\n[VALIDATE-THEORY] Checking victory condition:')
    console.log('[VALIDATE-THEORY]   Unlocked content status update:', unlockedContent?.statusUpdate)
    console.log('[VALIDATE-THEORY]   Game completed?', gameCompleted)
    
    if (gameCompleted) {
      console.log('[VALIDATE-THEORY] 🎉🎉🎉 VICTORY! Game completed!')
    }
    
    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║              VALIDATE THEORY - RETURNING RESULT            ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('[VALIDATE-THEORY] Returning to client:', {
      success: true,
      result: finalResult,
      gameCompleted,
      unlockedContent
    })
    console.log('')

    return NextResponse.json({
      success: true,
      result: finalResult,
      feedback: finalFeedback,
      matchedFacts: [],
      unlockedContent,
      gameCompleted,
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

