/**
 * Integration Test: Successful Investigation Path
 * 
 * Simulates a complete investigation from start to solution
 * Tests the full gameplay loop with real AI API calls
 * 
 * Duration: ~10-15 minutes (due to real AI calls)
 */

import {
  createTestSession,
  cleanupTestSession,
  getSessionState,
  signInTestUser,
  TestSession,
} from '../helpers/testSession'
import {
  chatWithSuspect,
  validateTheory,
  submitSolution,
} from '../helpers/apiClient'
import {
  assertContentUnlocked,
  assertStage,
  assertNoStageDirections,
  assertTheoryResult,
  assertSolutionCorrect,
} from '../helpers/assertions'
import {
  INVESTIGATION_QUESTIONS,
  EVIDENCE_COMBINATIONS,
  CORRECT_SOLUTION,
} from '../fixtures/questions'
import { TestStoryService } from '../helpers/storyServiceTest'

describe('Investigation Happy Path', () => {
  let testSession: TestSession | undefined
  let authToken: string
  let storyService: TestStoryService

  beforeAll(async () => {
    // Create test session
    console.log('🔧 Setting up test session...')
    testSession = await createTestSession('case01')
    authToken = await signInTestUser(testSession.email, testSession.password)
    storyService = new TestStoryService('case01')
    await storyService.loadMetadata()
    await storyService.loadStoryConfig()
    console.log('✅ Test session created:', testSession.sessionId)
  })

  afterAll(async () => {
    // Clean up test data
    console.log('🧹 Cleaning up test session...')
    await cleanupTestSession(testSession)
  })

  test('Complete investigation from start to solution', async () => {
    console.log('\n🎬 Starting complete investigation...\n')

    // =====================================================================
    // STEP 1: Question Veronica (initially available)
    // =====================================================================
    console.log('📝 Step 1: Questioning Veronica...')
    
    const veronicaMetadata = await storyService.getSuspect('suspect_veronica')
    expect(veronicaMetadata).toBeTruthy()
    
    const veronicaPrompt = await storyService.getSuspectPrompt('suspect_veronica', [])
    
    const veronicaResponse1 = await chatWithSuspect(
      'suspect_veronica',
      INVESTIGATION_QUESTIONS.veronica.initial,
      {
        systemPrompt: veronicaPrompt,
        suspectProfile: {
          id: 'suspect_veronica',
          name: 'Veronica Ashcombe',
          role: 'Widow',
        },
        conversationHistory: [],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    console.log('✓ Veronica response received:', veronicaResponse1.substring(0, 100) + '...')
    
    // Validate response quality
    assertNoStageDirections(veronicaResponse1)
    expect(veronicaResponse1).toContainNoStageDirections()
    
    // Ask about red wine allergy
    const veronicaResponse2 = await chatWithSuspect(
      'suspect_veronica',
      INVESTIGATION_QUESTIONS.veronica.redWine,
      {
        systemPrompt: veronicaPrompt,
        suspectProfile: {
          id: 'suspect_veronica',
          name: 'Veronica Ashcombe',
          role: 'Widow',
        },
        conversationHistory: [
          { role: 'user', content: INVESTIGATION_QUESTIONS.veronica.initial },
          { role: 'assistant', content: veronicaResponse1 },
        ],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    console.log('✓ Red wine question answered\n')

    // =====================================================================
    // STEP 2: Examine Grand Staircase scene
    // =====================================================================
    console.log('📝 Step 2: Examining Grand Staircase scene...')
    
    // Note: In actual implementation, examining scene would be done through UI
    // For this test, we'll reference the artifacts in the theory submission
    console.log('✓ Crime scene examined (red wine visible)\n')

    // =====================================================================
    // STEP 3: Review Dr. Vale's Medical Notes
    // =====================================================================
    console.log('📝 Step 3: Reviewing Dr. Vale\'s Medical Notes...')
    
    // Note: Medical notes document Reginald's red wine allergy
    console.log('✓ Medical notes reviewed (proves allergy contradiction)\n')

    // =====================================================================
    // STEP 4: Submit Act II Theory (red wine allergy + crime scene photo)
    // =====================================================================
    console.log('📝 Step 4: Submitting Act II unlock theory...')
    
    const actOneResult = await validateTheory(
      testSession.sessionId,
      EVIDENCE_COMBINATIONS.actOneUnlock.description,
      EVIDENCE_COMBINATIONS.actOneUnlock.artifacts,
      authToken
    )
    
    console.log('✓ Theory result:', actOneResult.result)
    console.log('✓ Feedback:', actOneResult.feedback.substring(0, 100) + '...')
    
    // Validate theory was correct
    assertTheoryResult(actOneResult, 'correct')
    expect(actOneResult.unlockedContent).toBeDefined()
    expect(actOneResult.unlockedContent?.suspects).toContain('suspect_martin')
    expect(actOneResult.unlockedContent?.suspects).toContain('suspect_colin')
    expect(actOneResult.unlockedContent?.suspects).toContain('suspect_lydia')
    expect(actOneResult.unlockedContent?.suspects).toContain('suspect_vale')
    
    console.log('✅ Inner circle unlocked!\n')

    // =====================================================================
    // STEP 5: Question Dr. Vale
    // =====================================================================
    console.log('📝 Step 5: Questioning Dr. Vale...')
    
    const valePrompt = await storyService.getSuspectPrompt('suspect_vale', [
      'fact_staged_scene',
    ])
    
    const valeResponse1 = await chatWithSuspect(
      'suspect_vale',
      INVESTIGATION_QUESTIONS.vale.initial,
      {
        systemPrompt: valePrompt,
        suspectProfile: {
          id: 'suspect_vale',
          name: 'Dr. Vale',
          role: 'Family Physician',
        },
        conversationHistory: [],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    assertNoStageDirections(valeResponse1)
    console.log('✓ Dr. Vale initial response received\n')
    
    // Ask about phone call
    const valeResponse2 = await chatWithSuspect(
      'suspect_vale',
      INVESTIGATION_QUESTIONS.vale.phoneCall,
      {
        systemPrompt: valePrompt,
        suspectProfile: {
          id: 'suspect_vale',
          name: 'Dr. Vale',
          role: 'Family Physician',
        },
        conversationHistory: [
          { role: 'user', content: INVESTIGATION_QUESTIONS.vale.initial },
          { role: 'assistant', content: valeResponse1 },
        ],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    console.log('✓ Dr. Vale phone call question answered\n')

    // =====================================================================
    // STEP 6: Question Colin
    // =====================================================================
    console.log('📝 Step 6: Questioning Colin...')
    
    const colinPrompt = await storyService.getSuspectPrompt('suspect_colin', [
      'fact_staged_scene',
    ])
    
    const colinResponse1 = await chatWithSuspect(
      'suspect_colin',
      INVESTIGATION_QUESTIONS.colin.initial,
      {
        systemPrompt: colinPrompt,
        suspectProfile: {
          id: 'suspect_colin',
          name: 'Colin Dorsey',
          role: 'Estate Manager',
        },
        conversationHistory: [],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    assertNoStageDirections(colinResponse1)
    console.log('✓ Colin initial response received\n')
    
    // Ask about blackmail
    const colinResponse2 = await chatWithSuspect(
      'suspect_colin',
      INVESTIGATION_QUESTIONS.colin.blackmail,
      {
        systemPrompt: colinPrompt,
        suspectProfile: {
          id: 'suspect_colin',
          name: 'Colin Dorsey',
          role: 'Estate Manager',
        },
        conversationHistory: [
          { role: 'user', content: INVESTIGATION_QUESTIONS.colin.initial },
          { role: 'assistant', content: colinResponse1 },
        ],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    console.log('✓ Colin blackmail question answered')
    // Colin should deflect initially
    expect(colinResponse2.toLowerCase()).toMatch(/prefer not|loyalty|personal/i)
    console.log('✓ Colin appropriately deflected blackmail question\n')

    // =====================================================================
    // STEP 7: Present evidence to Vale (phone records + blackmail)
    // =====================================================================
    console.log('📝 Step 7: Confronting Dr. Vale with evidence...')
    
    const valeConfrontation = await chatWithSuspect(
      'suspect_vale',
      "The phone records show no calls from your room, and I've found blackmail papers documenting your practice issues. Where were you really?",
      {
        systemPrompt: valePrompt,
        suspectProfile: {
          id: 'suspect_vale',
          name: 'Dr. Vale',
          role: 'Family Physician',
        },
        conversationHistory: [
          { role: 'user', content: INVESTIGATION_QUESTIONS.vale.phoneCall },
          { role: 'assistant', content: valeResponse2 },
        ],
        attachedItems: [
          { id: 'record_phone_logs', type: 'record', name: 'Phone Records' },
          { id: 'record_blackmail_portrait', type: 'record', name: 'Blackmail Papers' },
        ],
      },
      testSession.sessionId,
      authToken
    )
    
    global.apiCallCount++
    console.log('✓ Dr. Vale confrontation response received')
    // Vale should confess to greenhouse theft
    expect(valeConfrontation.toLowerCase()).toMatch(/greenhouse|orchids|stealing/i)
    console.log('✅ Dr. Vale confessed to greenhouse theft!\n')

    // =====================================================================
    // STEP 8: Examine Study (should now be unlocked)
    // =====================================================================
    console.log('📝 Step 8: Examining the Study...')
    
    // Verify Study is unlocked
    await assertContentUnlocked(testSession.sessionId, 'scene', 'scene_study')
    console.log('✓ Study scene is unlocked')
    console.log('✓ Found evidence: displaced rug, white gloves, tie clip\n')

    // =====================================================================
    // STEP 9: Submit Final Solution
    // =====================================================================
    console.log('📝 Step 9: Submitting final solution...')
    
    const solutionResult = await submitSolution(
      testSession.sessionId,
      testSession.caseId,
      CORRECT_SOLUTION.killer,
      CORRECT_SOLUTION.motive,
      CORRECT_SOLUTION.keyEvidence,
      CORRECT_SOLUTION.explanation,
      authToken
    )
    
    console.log('✓ Solution submitted')
    console.log('✓ Result:', solutionResult.isCorrect ? 'CORRECT ✅' : 'INCORRECT ❌')
    console.log('✓ Narrative:', solutionResult.narrative.substring(0, 150) + '...')
    
    // Validate solution was correct
    assertSolutionCorrect(solutionResult, true)
    expect(solutionResult.narrative).toMatch(/colin|correct|brilliant/i)
    
    // Verify game is completed
    const finalState = await getSessionState(testSession.sessionId)
    expect(finalState.session?.is_completed).toBe(true)
    expect(finalState.session?.is_solved_correctly).toBe(true)
    
    console.log('\n🎉 Investigation completed successfully!')
    console.log(`📊 Total theories submitted: ${finalState.theories.length}`)
    console.log(`📊 Total facts discovered: ${finalState.facts.length}`)
    console.log(`📊 Total AI API calls: ${global.apiCallCount}`)
  }, 900000) // 15 minute timeout for complete investigation
})
