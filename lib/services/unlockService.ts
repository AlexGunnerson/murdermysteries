/**
 * Unlock Service
 * Evaluates evidence combinations and applies unlocks based on unlock rules
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { findMatchingRule, GameStage, TriggerType, UnlockRule } from '@/lib/config/unlockRules'

export interface UnlockResult {
  hasUnlocks: boolean
  matchedRule: UnlockRule | null
  unlocks: {
    stage?: GameStage
    suspects?: string[]
    scenes?: string[]
    records?: string[]
    statusUpdate?: string
  }
  notificationMessage?: string
}

/**
 * Evaluate if the current evidence combination triggers any unlocks
 */
export async function evaluateUnlocks(params: {
  sessionId: string
  suspectId?: string
  evidenceIds: string[]
  currentStage: GameStage
  trigger: 'chat' | 'theory'
}): Promise<UnlockResult> {
  const { sessionId, suspectId, evidenceIds, currentStage, trigger } = params

  // Map trigger types
  const triggerType: TriggerType = trigger === 'chat' ? 'chat_attachment' : 'theory_validation'

  // Find matching rule
  const matchedRule = findMatchingRule({
    stage: currentStage,
    trigger: triggerType,
    suspectId,
    evidenceIds
  })

  if (!matchedRule) {
    return {
      hasUnlocks: false,
      matchedRule: null,
      unlocks: {}
    }
  }

  // Return the unlock result
  return {
    hasUnlocks: true,
    matchedRule,
    unlocks: matchedRule.unlocks,
    notificationMessage: matchedRule.notificationMessage
  }
}

/**
 * Apply unlocks to the database
 */
export async function applyUnlocks(
  sessionId: string,
  unlockResult: UnlockResult
): Promise<void> {
  if (!unlockResult.hasUnlocks || !unlockResult.unlocks) {
    return
  }

  const supabase = createServiceRoleClient()
  const { unlocks } = unlockResult

  // Update stage if it changed
  if (unlocks.stage) {
    await supabase
      .from('game_sessions')
      .update({
        current_stage: unlocks.stage,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
  }

  // Prepare content to unlock
  const contentToInsert: Array<{
    game_session_id: string
    content_type: 'suspect' | 'scene' | 'record'
    content_id: string
  }> = []

  if (unlocks.suspects) {
    contentToInsert.push(...unlocks.suspects.map((id) => ({
      game_session_id: sessionId,
      content_type: 'suspect' as const,
      content_id: id,
    })))
  }

  if (unlocks.scenes) {
    contentToInsert.push(...unlocks.scenes.map((id) => ({
      game_session_id: sessionId,
      content_type: 'scene' as const,
      content_id: id,
    })))
  }

  if (unlocks.records) {
    contentToInsert.push(...unlocks.records.map((id) => ({
      game_session_id: sessionId,
      content_type: 'record' as const,
      content_id: id,
    })))
  }

  // Insert unlocked content
  if (contentToInsert.length > 0) {
    await supabase
      .from('unlocked_content')
      .upsert(contentToInsert, {
        onConflict: 'game_session_id,content_type,content_id',
        ignoreDuplicates: true,
      })
  }
}

/**
 * Save evidence presentation to database
 */
export async function saveEvidencePresentation(params: {
  sessionId: string
  suspectId: string
  evidenceIds: string[]
}): Promise<void> {
  const { sessionId, suspectId, evidenceIds } = params
  const supabase = createServiceRoleClient()

  await supabase
    .from('evidence_presentations')
    .insert({
      game_session_id: sessionId,
      suspect_id: suspectId,
      evidence_ids: evidenceIds,
    })
}

/**
 * Check if Act I has been unlocked (for auto-unlocking Act I content)
 */
export async function checkAndApplyActIUnlocks(sessionId: string): Promise<void> {
  const supabase = createServiceRoleClient()

  // Get session data
  const { data: session } = await supabase
    .from('game_sessions')
    .select('current_stage')
    .eq('id', sessionId)
    .single()

  // If we just moved to Act I, unlock the inner circle
  if (session && session.current_stage === 'act_i') {
    // Check if suspects are already unlocked
    const { data: existingUnlocks } = await supabase
      .from('unlocked_content')
      .select('content_id')
      .eq('game_session_id', sessionId)
      .eq('content_type', 'suspect')

    const unlockedSuspects = new Set(existingUnlocks?.map(u => u.content_id) || [])

    // If inner circle not yet unlocked, unlock them
    if (!unlockedSuspects.has('suspect_martin')) {
      const contentToInsert = [
        { game_session_id: sessionId, content_type: 'suspect', content_id: 'suspect_martin' },
        { game_session_id: sessionId, content_type: 'suspect', content_id: 'suspect_colin' },
        { game_session_id: sessionId, content_type: 'suspect', content_id: 'suspect_lydia' },
        { game_session_id: sessionId, content_type: 'suspect', content_id: 'suspect_vale' },
        { game_session_id: sessionId, content_type: 'record', content_id: 'record_veronica_thankyou' },
        { game_session_id: sessionId, content_type: 'record', content_id: 'record_blackmail_floor' },
        { game_session_id: sessionId, content_type: 'record', content_id: 'record_phone_logs' },
      ]

      await supabase
        .from('unlocked_content')
        .upsert(contentToInsert, {
          onConflict: 'game_session_id,content_type,content_id',
          ignoreDuplicates: true,
        })
    }
  }
}

