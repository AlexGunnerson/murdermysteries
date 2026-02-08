/**
 * Unlock Rules Configuration
 * Defines all unlock triggers and what content they unlock based on the CSV mapping
 */

export type GameStage = 'start' | 'act_i' | 'act_ii'
export type TriggerType = 'chat_attachment' | 'theory_validation' | 'button_click'
export type LogicOperator = 'AND' | 'OR'

export interface UnlockRule {
  id: string
  stage: GameStage
  trigger: TriggerType
  requiredSuspectId?: string  // For chat attachments - must be shown to specific suspect
  requiredArtifacts: string[]
  logicOperator: LogicOperator
  useCumulativeEvidence?: boolean  // If true, checks all evidence ever shown to suspect, not just current message
  unlocks: {
    stage?: GameStage
    suspects?: string[]
    scenes?: string[]
    records?: string[]
    statusUpdate?: string
  }
  notificationMessage?: string
  description?: string  // For debugging/documentation
}

export const UNLOCK_RULES: UnlockRule[] = [
  // Stage: Start -> Act II (Contradiction proven)
  {
    id: 'contradiction',
    stage: 'start',
    trigger: 'theory_validation',
    requiredArtifacts: ['record_vale_notes', 'scene_staircase_gala_img_0'],
    logicOperator: 'AND',
    unlocks: {
      stage: 'act_ii',
      suspects: ['suspect_martin', 'suspect_colin', 'suspect_lydia', 'suspect_vale'],
      records: ['record_veronica_thankyou', 'record_blackmail_floor', 'record_blackmail_floor_colin', 'record_blackmail_floor_martin', 'record_blackmail_floor_lydia', 'record_phone_logs', 'record_speech_notes'],
      statusUpdate: 'Murder Confirmed'
    },
    notificationMessage: 'The contradiction has been proven! According to Dr. Vale\'s Medical Notes, Reginald is allergic to red wine. The wine spill was staged - this was murder, not an accident.',
    description: 'Player notices red wine in crime scene photo and cross-references with Dr. Vale\'s Medical Notes showing Reginald is allergic to red wine'
  },

  // Master Bedroom Unlock - Show blackmail to Veronica (accepts full set or any individual piece)
  {
    id: 'master_bedroom_chat',
    stage: 'act_ii',
    trigger: 'chat_attachment',
    requiredSuspectId: 'suspect_veronica',
    requiredArtifacts: ['record_blackmail_floor', 'record_blackmail_floor_colin', 'record_blackmail_floor_martin', 'record_blackmail_floor_lydia'],
    logicOperator: 'OR',
    unlocks: {
      scenes: ['scene_master_bedroom']
    },
    notificationMessage: 'Master Bedroom Unlocked!',
    description: 'Show the floor blackmail papers to Veronica to prove a page is missing'
  },

  // Master Bedroom Unlock - Theory validation alternative (accepts full set or any individual piece)
  {
    id: 'master_bedroom_theory',
    stage: 'act_ii',
    trigger: 'theory_validation',
    requiredArtifacts: ['record_blackmail_floor', 'record_blackmail_floor_colin', 'record_blackmail_floor_martin', 'record_blackmail_floor_lydia', 'record_veronica_thankyou'],
    logicOperator: 'AND',
    unlocks: {
      scenes: ['scene_master_bedroom']
    },
    notificationMessage: 'Your theory about the missing blackmail page is correct! The master bedroom may hold the complete set.',
    description: 'Submit theory with blackmail papers and Veronica\'s note mentioning everyone had blackmail'
  },

  // Blackmail Set #2 - Retrieved from painting (handled by button, but tracked here)
  {
    id: 'blackmail_set_2',
    stage: 'act_ii',
    trigger: 'button_click',
    requiredArtifacts: [], // No validation needed - button click unlocks it
    logicOperator: 'AND',
    unlocks: {
      records: ['record_blackmail_portrait', 'record_blackmail_portrait_colin', 'record_blackmail_portrait_martin', 'record_blackmail_portrait_lydia', 'record_blackmail_portrait_vale']
    },
    notificationMessage: 'You\'ve retrieved the complete blackmail files from behind the painting!',
    description: 'Player clicks "Retrieve Blackmail!" button on painting in Master Bedroom'
  },

  // The Confrontation - Vale admits to greenhouse theft (with full blackmail set)
  {
    id: 'vale_confrontation_full_set',
    stage: 'act_ii',
    trigger: 'chat_attachment',
    requiredSuspectId: 'suspect_vale',
    requiredArtifacts: ['record_phone_logs', 'record_blackmail_portrait'],
    logicOperator: 'AND',
    useCumulativeEvidence: true,  // Check all evidence ever shown to Vale, not just current message
    unlocks: {
      scenes: ['scene_study']
    },
    notificationMessage: 'Study Unlocked!',
    description: 'Show phone records and full blackmail set to trigger confession (cumulative across all messages)'
  },

  // The Confrontation - Vale admits to greenhouse theft (with individual Vale piece)
  {
    id: 'vale_confrontation_individual',
    stage: 'act_ii',
    trigger: 'chat_attachment',
    requiredSuspectId: 'suspect_vale',
    requiredArtifacts: ['record_phone_logs', 'record_blackmail_portrait_vale'],
    logicOperator: 'AND',
    useCumulativeEvidence: true,  // Check all evidence ever shown to Vale, not just current message
    unlocks: {
      scenes: ['scene_study']
    },
    notificationMessage: 'Study Unlocked!',
    description: 'Show phone records and Vale\'s individual blackmail page to trigger confession (cumulative across all messages)'
  },

  // The Confrontation - Theory validation with full set
  {
    id: 'vale_confrontation_theory_full_set',
    stage: 'act_ii',
    trigger: 'theory_validation',
    requiredArtifacts: ['record_phone_logs', 'record_blackmail_portrait'],
    logicOperator: 'AND',
    unlocks: {
      scenes: ['scene_study']
    },
    notificationMessage: 'Your theory about Dr. Vale\'s deception is correct! The Study may contain evidence of his whereabouts.',
    description: 'Submit theory with phone records and full blackmail set proving Vale lied'
  },

  // The Confrontation - Theory validation with individual Vale piece
  {
    id: 'vale_confrontation_theory_individual',
    stage: 'act_ii',
    trigger: 'theory_validation',
    requiredArtifacts: ['record_phone_logs', 'record_blackmail_portrait_vale'],
    logicOperator: 'AND',
    unlocks: {
      scenes: ['scene_study']
    },
    notificationMessage: 'Your theory about Dr. Vale\'s deception is correct! The Study may contain evidence of his whereabouts.',
    description: 'Submit theory with phone records and Vale\'s individual blackmail page proving Vale lied'
  },

  // CCTV Proof - Retrieved from study (handled by button, but tracked here)
  {
    id: 'cctv_proof',
    stage: 'act_ii',
    trigger: 'button_click',
    requiredArtifacts: [], // Button click unlocks it
    logicOperator: 'AND',
    unlocks: {
      records: ['record_greenhouse_footage']
    },
    notificationMessage: 'The greenhouse security footage proves Dr. Vale was stealing plants during the murder!',
    description: 'Player clicks "Security Footage Available" button in Study scene'
  },

  // The Accusation - Colin confession (Chat with Colin)
  {
    id: 'colin_accusation_chat',
    stage: 'act_ii',
    trigger: 'chat_attachment',
    requiredSuspectId: 'suspect_colin',
    requiredArtifacts: ['record_blackmail_floor_colin', 'record_blackmail_portrait_colin', 'scene_ballroom_gala_img_2', 'scene_study_img_1', 'scene_study_img_3'],
    logicOperator: 'AND',
    useCumulativeEvidence: true,  // Check all evidence ever shown to Colin, not just current message
    unlocks: {
      statusUpdate: 'Case Solved'
    },
    notificationMessage: 'Colin has confessed! He accidentally killed Reginald during a confrontation in the study. Case closed!',
    description: 'Show Colin the incriminating evidence: Colin\'s blackmail from both locations, gala photo of Colin in white gloves (colin_champagne.png - scene_ballroom_gala_img_2), white glove on desk photo (study_2.png - scene_study_img_1), and struggle evidence photo (study_4.png - scene_study_img_3) from study'
  },

  // The Accusation - Colin confession (Theory Validation)
  {
    id: 'colin_accusation_theory',
    stage: 'act_ii',
    trigger: 'theory_validation',
    requiredArtifacts: ['record_blackmail_floor_colin', 'record_blackmail_portrait_colin', 'scene_ballroom_gala_img_2', 'scene_study_img_1', 'scene_study_img_3'],
    logicOperator: 'AND',
    unlocks: {
      statusUpdate: 'Case Solved'
    },
    notificationMessage: 'Your accusation is correct! Colin Dorsey is the killer. He confesses to the accidental killing during a confrontation in the study.',
    description: 'Submit theory with Colin\'s blackmail from both locations, gala photo of Colin in white gloves (colin_champagne.png - scene_ballroom_gala_img_2), white glove on desk photo (study_2.png - scene_study_img_1), and struggle evidence photo (study_4.png - scene_study_img_3) proving Colin is the killer'
  }
]

/**
 * Get rules that are applicable for the current stage
 */
export function getRulesForStage(stage: GameStage): UnlockRule[] {
  return UNLOCK_RULES.filter(rule => rule.stage === stage)
}

/**
 * Get rules that match a specific trigger type
 */
export function getRulesByTrigger(stage: GameStage, trigger: TriggerType): UnlockRule[] {
  return UNLOCK_RULES.filter(rule => rule.stage === stage && rule.trigger === trigger)
}

/**
 * Find a matching unlock rule based on evidence and context
 */
export function findMatchingRule(params: {
  stage: GameStage
  trigger: TriggerType
  suspectId?: string
  evidenceIds: string[]
}): UnlockRule | null {
  const { stage, trigger, suspectId, evidenceIds } = params

  console.log('\n=== UNLOCK RULE MATCHING ===')
  console.log('[UNLOCK-RULES] Finding match for:', { stage, trigger, suspectId, evidenceCount: evidenceIds.length })
  console.log('[UNLOCK-RULES] Evidence IDs provided:', evidenceIds)

  // Get applicable rules
  const applicableRules = UNLOCK_RULES.filter(
    rule => rule.stage === stage && rule.trigger === trigger
  )

  console.log('[UNLOCK-RULES] Found', applicableRules.length, 'applicable rules for stage:', stage, 'trigger:', trigger)
  applicableRules.forEach(rule => {
    console.log(`  - ${rule.id} (requires suspect: ${rule.requiredSuspectId || 'any'})`)
  })

  // Check each rule for a match
  for (const rule of applicableRules) {
    console.log(`\n[UNLOCK-RULES] Checking rule: ${rule.id}`)
    console.log(`[UNLOCK-RULES]   Description: ${rule.description}`)
    console.log(`[UNLOCK-RULES]   Required artifacts (${rule.requiredArtifacts.length}):`, rule.requiredArtifacts)
    console.log(`[UNLOCK-RULES]   Logic operator: ${rule.logicOperator}`)
    console.log(`[UNLOCK-RULES]   Uses cumulative evidence: ${rule.useCumulativeEvidence || false}`)
    
    // If rule requires specific suspect, check it matches
    if (rule.requiredSuspectId && rule.requiredSuspectId !== suspectId) {
      console.log(`[UNLOCK-RULES]   ✗ SKIP - Rule requires suspect: ${rule.requiredSuspectId}, but got: ${suspectId}`)
      continue
    }

    // Check if evidence matches requirements
    if (rule.logicOperator === 'AND') {
      // ALL required artifacts must be present
      console.log(`[UNLOCK-RULES]   Checking AND logic - ALL required artifacts must be present`)
      
      const missingArtifacts: string[] = []
      const presentArtifacts: string[] = []
      
      rule.requiredArtifacts.forEach(artifact => {
        if (evidenceIds.includes(artifact)) {
          presentArtifacts.push(artifact)
        } else {
          missingArtifacts.push(artifact)
        }
      })
      
      console.log(`[UNLOCK-RULES]     ✓ Present (${presentArtifacts.length}/${rule.requiredArtifacts.length}):`, presentArtifacts)
      console.log(`[UNLOCK-RULES]     ✗ Missing (${missingArtifacts.length}/${rule.requiredArtifacts.length}):`, missingArtifacts)
      
      const allPresent = missingArtifacts.length === 0
      
      if (allPresent) {
        console.log(`[UNLOCK-RULES]   ✓✓✓ RULE MATCHED: ${rule.id}`)
        console.log(`[UNLOCK-RULES]   Will unlock:`, rule.unlocks)
        console.log('=== END UNLOCK RULE MATCHING ===\n')
        return rule
      } else {
        console.log(`[UNLOCK-RULES]   ✗ FAIL - Missing ${missingArtifacts.length} required artifact(s)`)
      }
    } else {
      // ANY required artifact must be present (OR logic)
      console.log(`[UNLOCK-RULES]   Checking OR logic - ANY required artifact must be present`)
      
      const presentArtifacts = rule.requiredArtifacts.filter(artifact =>
        evidenceIds.includes(artifact)
      )
      
      console.log(`[UNLOCK-RULES]     ✓ Present (${presentArtifacts.length}/${rule.requiredArtifacts.length}):`, presentArtifacts)
      
      const anyPresent = presentArtifacts.length > 0
      
      if (anyPresent) {
        console.log(`[UNLOCK-RULES]   ✓✓✓ RULE MATCHED: ${rule.id}`)
        console.log(`[UNLOCK-RULES]   Will unlock:`, rule.unlocks)
        console.log('=== END UNLOCK RULE MATCHING ===\n')
        return rule
      } else {
        console.log(`[UNLOCK-RULES]   ✗ FAIL - No required artifacts present`)
      }
    }
  }

  console.log('\n[UNLOCK-RULES] ✗✗✗ NO MATCHING RULE FOUND')
  console.log('=== END UNLOCK RULE MATCHING ===\n')
  return null
}

