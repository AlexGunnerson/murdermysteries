/**
 * Integration Test: AI Conversation Quality
 * 
 * Validates AI suspect behavior, consistency, and response quality
 * Tests character personalities, secret reveals, and prompt adherence
 * 
 * Duration: ~5-10 minutes
 */

import {
  createTestSession,
  cleanupTestSession,
  signInTestUser,
  TestSession,
} from '../helpers/testSession'
import {
  chatWithSuspect,
  validateTheory,
} from '../helpers/apiClient'
import {
  assertNoStageDirections,
  assertInCharacter,
  assertResponseContains,
} from '../helpers/assertions'
import {
  INVESTIGATION_QUESTIONS,
  CONVERSATION_FLOWS,
  EVIDENCE_COMBINATIONS,
} from '../fixtures/questions'
import {
  EXPECTED_CHARACTER_TRAITS,
  FORBIDDEN_PATTERNS,
} from '../fixtures/expectedResponses'
import { TestStoryService } from '../helpers/storyServiceTest'

describe('AI Conversation Quality', () => {
  let testSession: TestSession | undefined
  let authToken: string
  let storyService: TestStoryService

  beforeAll(async () => {
    console.log('🔧 Setting up test session for AI quality tests...')
    testSession = await createTestSession('case01')
    authToken = await signInTestUser(testSession.email, testSession.password)
    storyService = new TestStoryService('case01')
    await storyService.loadMetadata()
    await storyService.loadStoryConfig()
    
    // Unlock inner circle for testing
    await validateTheory(
      testSession.sessionId,
      EVIDENCE_COMBINATIONS.actOneUnlock.description,
      EVIDENCE_COMBINATIONS.actOneUnlock.artifacts,
      authToken
    )
    
    console.log('✅ Test session ready with inner circle unlocked')
  })

  afterAll(async () => {
    console.log('🧹 Cleaning up test session...')
    await cleanupTestSession(testSession)
  })

  describe('Character Consistency', () => {
    test('Veronica maintains elegant, composed character', async () => {
      console.log('\n📝 Testing Veronica\'s character...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_veronica', [])
      const response = await chatWithSuspect(
        'suspect_veronica',
        INVESTIGATION_QUESTIONS.veronica.timeline,
        {
          systemPrompt: prompt,
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
      
      // Validate character traits
      assertNoStageDirections(response)
      assertInCharacter(
        response,
        EXPECTED_CHARACTER_TRAITS.veronica.name,
        EXPECTED_CHARACTER_TRAITS.veronica.traits
      )
      
      // Should use formal language
      expect(response.toLowerCase()).toMatch(/detective|my late husband|estate/i)
      
      console.log('✅ Veronica maintains character')
    })

    test('Martin maintains hungover, casual character', async () => {
      console.log('\n📝 Testing Martin\'s character...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_martin', ['fact_staged_scene'])
      const response = await chatWithSuspect(
        'suspect_martin',
        INVESTIGATION_QUESTIONS.martin.drinking,
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_martin',
            name: 'Martin Ashcombe',
            role: 'Brother',
          },
          conversationHistory: [],
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      assertNoStageDirections(response)
      
      // Should use casual language and mention hangover
      expect(response.toLowerCase()).toMatch(/pal|chief|head|hangover/i)
      
      console.log('✅ Martin maintains character')
    })

    test('Colin maintains stoic, professional character', async () => {
      console.log('\n📝 Testing Colin\'s character...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_colin', ['fact_staged_scene'])
      const response = await chatWithSuspect(
        'suspect_colin',
        INVESTIGATION_QUESTIONS.colin.timeline,
        {
          systemPrompt: prompt,
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
      
      assertNoStageDirections(response)
      
      // Should use formal servant language
      expect(response.toLowerCase()).toMatch(/detective|master|mr\./i)
      
      console.log('✅ Colin maintains character')
    })

    test('Lydia maintains warm, professional character', async () => {
      console.log('\n📝 Testing Lydia\'s character...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_lydia', ['fact_staged_scene'])
      const response = await chatWithSuspect(
        'suspect_lydia',
        INVESTIGATION_QUESTIONS.lydia.foundation,
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_lydia',
            name: 'Lydia Portwell',
            role: 'Foundation Director',
          },
          conversationHistory: [],
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      assertNoStageDirections(response)
      
      // Should use professional charity language
      expect(response.toLowerCase()).toMatch(/detective|foundation|reginald/i)
      
      console.log('✅ Lydia maintains character')
    })

    test('Dr. Vale maintains clinical, professional character', async () => {
      console.log('\n📝 Testing Dr. Vale\'s character...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_vale', ['fact_staged_scene'])
      const response = await chatWithSuspect(
        'suspect_vale',
        INVESTIGATION_QUESTIONS.vale.redWine,
        {
          systemPrompt: prompt,
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
      
      assertNoStageDirections(response)
      
      // Should use medical/clinical language
      expect(response.toLowerCase()).toMatch(/detective|allergy|medical/i)
      
      console.log('✅ Dr. Vale maintains character')
    })
  })

  describe('No Stage Directions', () => {
    test('All suspects avoid narrative stage directions', async () => {
      console.log('\n📝 Testing for stage directions across all suspects...')
      
      const suspects = ['suspect_martin', 'suspect_colin', 'suspect_lydia', 'suspect_vale']
      
      for (const suspectId of suspects) {
        const suspectMeta = await storyService.getSuspect(suspectId)
        const prompt = await storyService.getSuspectPrompt(suspectId, ['fact_staged_scene'])
        
        const response = await chatWithSuspect(
          suspectId,
          "Tell me about the evening of the gala.",
          {
            systemPrompt: prompt,
            suspectProfile: {
              id: suspectId,
              name: suspectMeta?.name || 'Suspect',
              role: suspectMeta?.role || 'Suspect',
            },
            conversationHistory: [],
          },
          testSession.sessionId,
          authToken
        )
        
        global.apiCallCount++
        
        // Check for forbidden patterns
        for (const pattern of FORBIDDEN_PATTERNS) {
          expect(response).not.toMatch(pattern)
        }
        
        assertNoStageDirections(response)
        console.log(`✓ ${suspectMeta?.name}: No stage directions found`)
      }
      
      console.log('✅ All suspects pass stage direction check')
    })
  })

  describe('Secret Revelation', () => {
    test('Colin reveals pocket watch when pressed about blackmail', async () => {
      console.log('\n📝 Testing Colin\'s secret revelation progression...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_colin', ['fact_staged_scene'])
      let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
      
      // First question - should deflect
      const response1 = await chatWithSuspect(
        'suspect_colin',
        CONVERSATION_FLOWS.colinBlackmailProgression[0].question,
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_colin',
            name: 'Colin Dorsey',
            role: 'Estate Manager',
          },
          conversationHistory,
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      expect(response1).toMatch(CONVERSATION_FLOWS.colinBlackmailProgression[0].expectedResponse)
      console.log('✓ Colin deflects initial blackmail question')
      
      conversationHistory.push(
        { role: 'user', content: CONVERSATION_FLOWS.colinBlackmailProgression[0].question },
        { role: 'assistant', content: response1 }
      )
      
      // Second question - pressed harder, should admit pocket watch
      const response2 = await chatWithSuspect(
        'suspect_colin',
        CONVERSATION_FLOWS.colinBlackmailProgression[1].question,
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_colin',
            name: 'Colin Dorsey',
            role: 'Estate Manager',
          },
          conversationHistory,
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      expect(response2).toMatch(CONVERSATION_FLOWS.colinBlackmailProgression[1].expectedResponse)
      console.log('✓ Colin admits to pocket watch when pressed')
      console.log('✅ Secret revelation works correctly')
    })

    test('Dr. Vale deflects phone call questions until evidence presented', async () => {
      console.log('\n📝 Testing Dr. Vale\'s alibi progression...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_vale', ['fact_staged_scene'])
      let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
      
      // First question - claims phone consultation
      const response1 = await chatWithSuspect(
        'suspect_vale',
        CONVERSATION_FLOWS.valePhoneCallProgression[0].question,
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_vale',
            name: 'Dr. Vale',
            role: 'Family Physician',
          },
          conversationHistory,
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      expect(response1).toMatch(CONVERSATION_FLOWS.valePhoneCallProgression[0].expectedResponse)
      console.log('✓ Dr. Vale claims phone consultation')
      
      conversationHistory.push(
        { role: 'user', content: CONVERSATION_FLOWS.valePhoneCallProgression[0].question },
        { role: 'assistant', content: response1 }
      )
      
      // Second question - phone records contradiction, should deflect
      const response2 = await chatWithSuspect(
        'suspect_vale',
        CONVERSATION_FLOWS.valePhoneCallProgression[1].question,
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_vale',
            name: 'Dr. Vale',
            role: 'Family Physician',
          },
          conversationHistory,
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      expect(response2).toMatch(CONVERSATION_FLOWS.valePhoneCallProgression[1].expectedResponse)
      console.log('✓ Dr. Vale deflects phone record contradiction')
      console.log('✅ Alibi progression works correctly')
    })
  })

  describe('Context Awareness', () => {
    test('Suspects reference conversation history', async () => {
      console.log('\n📝 Testing conversation history awareness...')
      
      const prompt = await storyService.getSuspectPrompt('suspect_veronica', [])
      
      // First question
      const response1 = await chatWithSuspect(
        'suspect_veronica',
        "Did Reginald drink red wine?",
        {
          systemPrompt: prompt,
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
      
      // Follow-up referencing previous answer
      const response2 = await chatWithSuspect(
        'suspect_veronica',
        "You mentioned he was allergic. When did this allergy develop?",
        {
          systemPrompt: prompt,
          suspectProfile: {
            id: 'suspect_veronica',
            name: 'Veronica Ashcombe',
            role: 'Widow',
          },
          conversationHistory: [
            { role: 'user', content: "Did Reginald drink red wine?" },
            { role: 'assistant', content: response1 },
          ],
        },
        testSession.sessionId,
        authToken
      )
      
      global.apiCallCount++
      
      // Should reference November incident
      expect(response2.toLowerCase()).toMatch(/november|last year|dr\. vale/i)
      console.log('✅ Suspects maintain conversation context')
    })
  })
})
