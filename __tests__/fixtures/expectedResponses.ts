/**
 * Expected responses and key phrases from suspects
 * Used to validate AI behavior and character consistency
 */

export const EXPECTED_CHARACTER_TRAITS = {
  veronica: {
    name: 'Veronica Ashcombe',
    traits: ['composed', 'elegant', 'protective of family', 'grieving'],
    speakingStyle: ['Old Money dignity', 'formal language', 'uses "My late husband"'],
    avoids: ['(parentheses)', '*asterisks*', '[brackets]', 'stage directions'],
    keyPhrases: [
      /my late husband/i,
      /the estate/i,
      /regrettable necessity/i,
    ],
  },
  
  martin: {
    name: 'Martin Ashcombe',
    traits: ['hungover', 'irresponsible', 'casual', 'defensive'],
    speakingStyle: ['calls detective "Pal" or "Chief"', 'complains about hangover', 'no filter'],
    avoids: ['(parentheses)', '*asterisks*', '[brackets]', 'stage directions'],
    keyPhrases: [
      /pal|chief/i,
      /head|hangover/i,
      /reggie/i,
    ],
  },
  
  colin: {
    name: 'Colin Dorsey',
    traits: ['stoic', 'professional', 'formal', 'internally panicking'],
    speakingStyle: ['servant tone', 'refers to people formally', 'precise language'],
    avoids: ['(parentheses)', '*asterisks*', '[brackets]', 'stage directions'],
    keyPhrases: [
      /master reginald|mr\. martin|dr\. vale|mrs\. portwell/i,
      /detective/i,
    ],
  },
  
  lydia: {
    name: 'Lydia Portwell',
    traits: ['warm', 'professional', 'maternal', 'fixer mentality'],
    speakingStyle: ['1980s corporate-charity buzzwords', 'helpful', 'kind'],
    avoids: ['(parentheses)', '*asterisks*', '[brackets]', 'stage directions'],
    keyPhrases: [
      /strategic legacy|philanthropic|bottom line/i,
      /reginald was my mentor/i,
    ],
  },
  
  vale: {
    name: 'Dr. Vale',
    traits: ['clinical', 'professional', 'grandiose', 'cooperative on surface'],
    speakingStyle: ['medical authority', 'clinical precision', 'substantive responses'],
    avoids: ['(parentheses)', '*asterisks*', '[brackets]', 'stage directions'],
    keyPhrases: [
      /detective/i,
      /trauma|contusion|medical/i,
    ],
  },
}

/**
 * Facts that should be discoverable from specific sources
 */
export const DISCOVERABLE_FACTS = {
  veronica: [
    'fact_veronica_timeline',
    'fact_inner_circle_access',
    'fact_reginald_athletic',
    'fact_blackmail_papers_exist',
  ],
  
  scene_staircase: [
    'fact_wine_spill_pattern',
  ],
  
  record_coroner: [
    'fact_coroner_top_fall',
  ],
  
  martin: [
    'fact_martin_drunk',
    'fact_martin_unconscious',
    'fact_martin_affair',
  ],
  
  colin: [
    'fact_colin_no_alibi',
    'fact_colin_at_scene',
    'fact_colin_access_safe',
  ],
  
  lydia: [
    'fact_lydia_with_veronica',
    'fact_lydia_financial_access',
    'fact_lydia_embezzlement',
  ],
  
  vale: [
    'fact_vale_phone_alibi',
    'fact_vale_no_phone_record',
    'fact_vale_greenhouse',
    'fact_greenhouse_camera',
  ],
  
  scene_study: [
    'fact_study_rug_displaced',
    'fact_tie_clip_study',
    'fact_white_gloves_safe',
  ],
}

/**
 * Required evidence for solution
 */
export const SOLUTION_EVIDENCE = {
  killer: 'suspect_colin',
  requiredFacts: [
    'fact_white_gloves_safe',
    'fact_study_rug_displaced',
    'fact_tie_clip_study',
    'fact_colin_swapped_papers',
  ],
}

/**
 * Stage progression unlock requirements
 */
export const STAGE_UNLOCKS = {
  act_i: {
    requiredEvidence: ['scene_staircase_gala_img_0', 'record_coroner_report'],
    unlockedSuspects: ['suspect_martin', 'suspect_colin', 'suspect_lydia', 'suspect_vale'],
    unlockedRecords: ['record_blackmail_floor'],
  },
  
  act_ii: {
    requiredSuspectToProgress: 'suspect_veronica',
    receivesLetter: true,
  },
}

/**
 * Common patterns to avoid in AI responses
 */
export const FORBIDDEN_PATTERNS = [
  // Stage directions
  /\(I (slump|shift|lean|gaze|turn|look)\)/i,
  /\(My (eyes|face|voice|hands)\)/i,
  /\*[^*]+\*/,
  
  // Breaking character
  /as an ai/i,
  /i am playing/i,
  /this is a game/i,
  /system:/i,
  /instructions:/i,
  
  // System prompt leakage
  /you are playing/i,
  /roleplaying as/i,
  /\{[^}]+\}/,
]

/**
 * Expected unlock messages
 */
export const UNLOCK_MESSAGES = {
  act_i_complete: /excellent deduction|proven this was not an accident|inner circle is now available/i,
  master_bedroom_unlock: /vale's page missing|investigate there|original blackmail documents/i,
  study_unlock: /greenhouse footage|study computer|examine the study/i,
}
