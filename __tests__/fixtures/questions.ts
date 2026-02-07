/**
 * Curated investigation questions that discover key facts
 * Based on Case 01: The Final Gala at Ashcombe Estate
 */

export const INVESTIGATION_QUESTIONS = {
  veronica: {
    initial: "Mrs. Ashcombe, I'm so sorry for your loss. Can you tell me what happened?",
    timeline: "Can you walk me through the events of the evening?",
    discovery: "When exactly did you find your husband?",
    redWine: "I noticed there was red wine near your husband's body. Did he drink red wine?",
    suspicions: "You mentioned you don't believe this was an accident. Why?",
    innerCircle: "Who had access to the private areas of the estate that evening?",
    papers: "Were there any papers or documents near the body when you found him?",
  },
  
  martin: {
    initial: "Mr. Ashcombe, can you tell me about last night?",
    drinking: "How much did you have to drink at the gala?",
    memory: "Do you remember what happened after dinner?",
    library: "Who helped you to the library?",
    scream: "Did you hear Mrs. Ashcombe scream?",
    relationship: "How would you describe your relationship with your brother?",
    finances: "Were you financially dependent on Reginald?",
  },
  
  colin: {
    initial: "Mr. Dorsey, I understand you're the estate manager. Can you help me understand the events of that evening?",
    martin: "I heard you helped Martin to the library. Can you tell me about that?",
    timeline: "Where were you between 8:00 PM and 9:00 PM?",
    study: "Do you have access to Mr. Ashcombe's study?",
    safe: "Who has access to the safe in the study?",
    gloves: "I noticed you were wearing white gloves during the gala. Where are they now?",
    blackmail: "Mr. Ashcombe kept files on people. Did he have one on you?",
  },
  
  lydia: {
    initial: "Mrs. Portwell, I know this must be difficult. Can you tell me about the gala?",
    veronica: "Were you with Mrs. Ashcombe when she found the body?",
    timing: "What time were you with Mrs. Ashcombe in the master bedroom?",
    foundation: "You manage the Ashcombe Foundation finances. Can you tell me about that?",
    donations: "Are there any discrepancies in the donation records?",
    blackmail: "Did you know Mr. Ashcombe kept accountability files on the inner circle?",
  },
  
  vale: {
    initial: "Dr. Vale, as the family physician, you were one of the first to examine the body. What did you find?",
    timeline: "Where were you between 8:30 and 9:00 PM?",
    phoneCall: "I understand you were on a phone consultation. Who were you speaking with?",
    redWine: "Mr. Ashcombe had a severe red wine allergy, correct?",
    greenhouse: "Were you in the greenhouse that evening?",
    practice: "How is your medical practice doing financially?",
    blackmail: "Did Mr. Ashcombe have any files documenting concerns about your practice?",
  },
}

/**
 * Evidence combinations that trigger unlocks
 */
export const EVIDENCE_COMBINATIONS = {
  actOneUnlock: {
    description: "The wine contradicts Reginald's allergy - the scene was staged",
    artifacts: ['record_vale_notes', 'scene_staircase_gala_img_0'],
  },
  
  valePageMissing: {
    description: "Dr. Vale's page is missing from the papers found at the scene",
    artifacts: ['record_blackmail_floor'],
  },
  
  valeSuspicious: {
    description: "Dr. Vale's alibi doesn't match the phone records",
    artifacts: ['record_blackmail_portrait', 'record_phone_logs'],
  },
  
  colinStudy: {
    description: "Colin was in the study during the murder. The evidence proves it.",
    artifacts: [
      'scene_study_img_1', // displaced rug
      'scene_study_img_2', // gloves on desk
      'scene_study_img_3', // tie clip
    ],
  },
}

/**
 * Final solution for Case 01
 */
export const CORRECT_SOLUTION = {
  killer: 'Colin Dorsey',
  motive: 'Colin attempted to sell Dorothy Ashcombe\'s ring (the most prized family heirloom) on the black market. Reginald discovered this betrayal and kept proof in his safe. Colin went to the study during the gala to swap his blackmail page for a less damaging fake. Reginald confronted him, they struggled, and Reginald fell and died.',
  keyEvidence: 'White gloves on Reginald\'s desk in the study, displaced rug showing a struggle, Reginald\'s tie clip under the sofa, and the swapped blackmail papers (ring replaced with pocket watch)',
  explanation: 'Colin staged the scene at the grand staircase to make it look like an accident. He also removed Dr. Vale\'s blackmail page to frame him. The evidence in the study proves the murder happened there, not on the stairs.',
}

/**
 * Key conversation progressions for testing
 */
export const CONVERSATION_FLOWS = {
  colinBlackmailProgression: [
    {
      question: "Did Mr. Ashcombe have any files on you?",
      expectedResponse: /prefer not to discuss|loyalty to this family/i,
    },
    {
      question: "I need to know what was in those files. What did Reginald have on you?",
      expectedResponse: /pocket watch|uncle Thomas|not proud/i,
    },
  ],
  
  valePhoneCallProgression: [
    {
      question: "You said you were on a phone call. Who were you speaking with?",
      expectedResponse: /consultation|patient/i,
    },
    {
      question: "The phone records show no calls from your room during that time.",
      expectedResponse: /phone records.*unreliable|technical.*discrepanc|technical.*anomal|logging error/i,
    },
  ],
}
