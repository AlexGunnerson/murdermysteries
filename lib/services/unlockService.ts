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
  cumulativeEvidence?: string[]  // Pass in cumulative evidence if already fetched
}): Promise<UnlockResult> {
  const { sessionId, suspectId, evidenceIds, currentStage, trigger, cumulativeEvidence } = params

  console.log('[UNLOCK-SERVICE] Evaluating:', { currentStage, trigger, evidenceIds, suspectId })

  // Map trigger types
  const triggerType: TriggerType = trigger === 'chat' ? 'chat_attachment' : 'theory_validation'

  // For cumulative rules, we need to get all evidence shown to this suspect
  let evidenceToCheck = evidenceIds
  
  // Check if we need cumulative evidence for any rules
  const applicableRules = await import('@/lib/config/unlockRules').then(m => m.UNLOCK_RULES)
  const needsCumulative = applicableRules.some(
    rule => rule.stage === currentStage && 
            rule.trigger === triggerType && 
            rule.useCumulativeEvidence &&
            (!rule.requiredSuspectId || rule.requiredSuspectId === suspectId)
  )

  if (needsCumulative && suspectId && trigger === 'chat') {
    // Use provided cumulative evidence or fetch it
    if (cumulativeEvidence) {
      evidenceToCheck = cumulativeEvidence
      console.log('[UNLOCK-SERVICE] Using provided cumulative evidence:', evidenceToCheck)
    } else {
      evidenceToCheck = await getCumulativeEvidenceForSuspect({ sessionId, suspectId })
      console.log('[UNLOCK-SERVICE] Fetched cumulative evidence:', evidenceToCheck)
    }
  }

  // Find matching rule
  const matchedRule = findMatchingRule({
    stage: currentStage,
    trigger: triggerType,
    suspectId,
    evidenceIds: evidenceToCheck
  })

  console.log('[UNLOCK-SERVICE] Matched rule:', matchedRule?.id || 'none')

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

  console.log('[UNLOCK-SERVICE] Applying unlocks:', {
    stage: unlocks.stage,
    suspects: unlocks.suspects,
    scenes: unlocks.scenes,
    records: unlocks.records
  })

  // Update stage if it changed
  if (unlocks.stage) {
    await supabase
      .from('game_sessions')
      .update({
        current_stage: unlocks.stage,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    console.log('[UNLOCK-SERVICE] Updated stage to:', unlocks.stage)
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

  console.log('[UNLOCK-SERVICE] Content to insert:', contentToInsert.length, 'items')

  // Insert unlocked content
  if (contentToInsert.length > 0) {
    const { data, error } = await supabase
      .from('unlocked_content')
      .upsert(contentToInsert, {
        onConflict: 'game_session_id,content_type,content_id',
        ignoreDuplicates: true,
      })
      .select()

    if (error) {
      console.error('[UNLOCK-SERVICE] Error inserting unlocked content:', error)
    } else {
      console.log('[UNLOCK-SERVICE] Successfully inserted unlocked content')
    }
  }
}

/**
 * Get all evidence ever shown to a specific suspect (cumulative)
 */
export async function getCumulativeEvidenceForSuspect(params: {
  sessionId: string
  suspectId: string
}): Promise<string[]> {
  const { sessionId, suspectId } = params
  const supabase = createServiceRoleClient()

  console.log('[UNLOCK-SERVICE] Getting cumulative evidence for:', { sessionId, suspectId })

  // Get all evidence presentations for this suspect
  const { data, error } = await supabase
    .from('evidence_presentations')
    .select('evidence_ids')
    .eq('game_session_id', sessionId)
    .eq('suspect_id', suspectId)
    .order('presented_at', { ascending: true })

  if (error) {
    console.error('[UNLOCK-SERVICE] Error fetching cumulative evidence:', error)
    return []
  }

  // Flatten and deduplicate all evidence IDs
  const allEvidenceIds = new Set<string>()
  data?.forEach((presentation) => {
    const ids = presentation.evidence_ids as string[]
    ids.forEach((id) => allEvidenceIds.add(id))
  })

  const cumulativeEvidence = Array.from(allEvidenceIds)
  console.log('[UNLOCK-SERVICE] Cumulative evidence:', cumulativeEvidence)

  return cumulativeEvidence
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
  // This function is now deprecated - Act I no longer exists
  // All unlocks are handled directly in the unlock rules
  // Keeping this function for backwards compatibility but it does nothing
  return
}

