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

  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║          UNLOCK SERVICE - EVALUATION START                ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('[UNLOCK-SERVICE] Session ID:', sessionId)
  console.log('[UNLOCK-SERVICE] Current Stage:', currentStage)
  console.log('[UNLOCK-SERVICE] Trigger Type:', trigger)
  console.log('[UNLOCK-SERVICE] Suspect ID:', suspectId || 'none')
  console.log('[UNLOCK-SERVICE] Evidence IDs submitted this turn:', evidenceIds)
  console.log('[UNLOCK-SERVICE] Evidence count this turn:', evidenceIds.length)

  // Map trigger types
  const triggerType: TriggerType = trigger === 'chat' ? 'chat_attachment' : 'theory_validation'
  console.log('[UNLOCK-SERVICE] Mapped trigger type:', triggerType)

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

  console.log('[UNLOCK-SERVICE] Needs cumulative evidence?', needsCumulative)

  if (needsCumulative && suspectId && trigger === 'chat') {
    console.log('[UNLOCK-SERVICE] Fetching cumulative evidence for suspect:', suspectId)
    // Use provided cumulative evidence or fetch it
    if (cumulativeEvidence) {
      evidenceToCheck = cumulativeEvidence
      console.log('[UNLOCK-SERVICE] Using provided cumulative evidence (count:', cumulativeEvidence.length, ')')
      console.log('[UNLOCK-SERVICE] Cumulative evidence:', evidenceToCheck)
    } else {
      evidenceToCheck = await getCumulativeEvidenceForSuspect({ sessionId, suspectId })
      console.log('[UNLOCK-SERVICE] Fetched cumulative evidence (count:', evidenceToCheck.length, ')')
      console.log('[UNLOCK-SERVICE] Cumulative evidence:', evidenceToCheck)
    }
  } else {
    console.log('[UNLOCK-SERVICE] Using only current turn evidence (count:', evidenceToCheck.length, ')')
  }

  // Find matching rule
  console.log('[UNLOCK-SERVICE] Calling findMatchingRule with:')
  console.log('  - Stage:', currentStage)
  console.log('  - Trigger:', triggerType)
  console.log('  - Suspect:', suspectId)
  console.log('  - Evidence to check:', evidenceToCheck)
  
  const matchedRule = findMatchingRule({
    stage: currentStage,
    trigger: triggerType,
    suspectId,
    evidenceIds: evidenceToCheck
  })

  if (!matchedRule) {
    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║          UNLOCK SERVICE - NO MATCH FOUND                   ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')
    return {
      hasUnlocks: false,
      matchedRule: null,
      unlocks: {}
    }
  }

  // Return the unlock result
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║          UNLOCK SERVICE - MATCH FOUND!                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('[UNLOCK-SERVICE] ✓✓✓ Matched Rule ID:', matchedRule.id)
  console.log('[UNLOCK-SERVICE] Unlocks:', JSON.stringify(matchedRule.unlocks, null, 2))
  console.log('[UNLOCK-SERVICE] Notification:', matchedRule.notificationMessage)
  console.log('')
  
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
    records: unlocks.records,
    statusUpdate: unlocks.statusUpdate
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

  // Handle game completion status updates
  if (unlocks.statusUpdate === 'Case Solved') {
    await supabase
      .from('game_sessions')
      .update({
        is_completed: true,
        is_solved_correctly: true,
        completed_at: new Date().toISOString(),
        game_status: unlocks.statusUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    console.log('[UNLOCK-SERVICE] Game completed successfully! Status:', unlocks.statusUpdate)
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

  console.log('\n--- FETCHING CUMULATIVE EVIDENCE ---')
  console.log('[CUMULATIVE] Session ID:', sessionId)
  console.log('[CUMULATIVE] Suspect ID:', suspectId)

  // Get all evidence presentations for this suspect
  const { data, error } = await supabase
    .from('evidence_presentations')
    .select('evidence_ids, presented_at')
    .eq('game_session_id', sessionId)
    .eq('suspect_id', suspectId)
    .order('presented_at', { ascending: true })

  if (error) {
    console.error('[CUMULATIVE] ✗ Error fetching cumulative evidence:', error)
    return []
  }

  console.log('[CUMULATIVE] Found', data?.length || 0, 'evidence presentation records')

  // Flatten and deduplicate all evidence IDs
  const allEvidenceIds = new Set<string>()
  data?.forEach((presentation, index) => {
    const ids = presentation.evidence_ids as string[]
    console.log(`[CUMULATIVE]   Presentation ${index + 1} (${presentation.presented_at}):`, ids)
    ids.forEach((id) => allEvidenceIds.add(id))
  })

  const cumulativeEvidence = Array.from(allEvidenceIds).sort()
  console.log('[CUMULATIVE] ✓ Total unique evidence IDs:', cumulativeEvidence.length)
  console.log('[CUMULATIVE] Complete cumulative evidence list:', cumulativeEvidence)
  console.log('--- END CUMULATIVE EVIDENCE ---\n')

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

