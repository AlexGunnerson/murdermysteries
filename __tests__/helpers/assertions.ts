/**
 * Custom assertions for integration tests
 */

import { getSessionState } from './testSession'

/**
 * Assert that a specific fact has been discovered
 */
export async function assertFactDiscovered(
  sessionId: string,
  factId: string
): Promise<void> {
  const state = await getSessionState(sessionId)
  const hasFactId = state.facts.some((f) => f.fact_id === factId)
  
  if (!hasFactId) {
    throw new Error(
      `Expected fact "${factId}" to be discovered. Found facts: ${state.facts.map((f) => f.fact_id).join(', ')}`
    )
  }
}

/**
 * Assert that content has been unlocked
 */
export async function assertContentUnlocked(
  sessionId: string,
  type: 'suspect' | 'scene' | 'record',
  contentId: string
): Promise<void> {
  const state = await getSessionState(sessionId)
  const hasUnlock = state.unlocks.some(
    (u) => u.content_type === type && u.content_id === contentId
  )
  
  if (!hasUnlock) {
    throw new Error(
      `Expected ${type} "${contentId}" to be unlocked. Found unlocks: ${state.unlocks.map((u) => `${u.content_type}:${u.content_id}`).join(', ')}`
    )
  }
}

/**
 * Assert current game stage
 */
export async function assertStage(
  sessionId: string,
  expectedStage: 'start' | 'act_i' | 'act_ii'
): Promise<void> {
  const state = await getSessionState(sessionId)
  
  if (!state.session) {
    throw new Error('Session not found')
  }
  
  if (state.session.current_stage !== expectedStage) {
    throw new Error(
      `Expected stage "${expectedStage}" but got "${state.session.current_stage}"`
    )
  }
}

/**
 * Assert that response contains no stage directions or narrative text
 */
export function assertNoStageDirections(response: string): void {
  // Check for common narrative patterns
  const narrativePatterns = [
    /\([^)]*\)/g, // (text in parentheses)
    /\*[^*]*\*/g, // *text in asterisks*
    /\[[^\]]*\]/g, // [text in brackets]
    /^I (slump|shift|lean|look|gaze|turn)/im, // Stage direction verbs at start
  ]
  
  for (const pattern of narrativePatterns) {
    const matches = response.match(pattern)
    if (matches) {
      throw new Error(
        `Response contains stage direction or narrative text: "${matches[0]}"\nFull response: ${response}`
      )
    }
  }
}

/**
 * Assert that response stays in character
 */
export function assertInCharacter(
  response: string,
  characterName: string,
  characterTraits: string[]
): void {
  const lowerResponse = response.toLowerCase()
  
  // Should not break character
  const breakingPhrases = [
    'as an ai',
    'i am playing',
    'you are playing',
    'this is a game',
    'this is a simulation',
    'system:',
    'instructions:',
  ]
  
  for (const phrase of breakingPhrases) {
    if (lowerResponse.includes(phrase)) {
      throw new Error(
        `Response breaks character with phrase: "${phrase}"\nFull response: ${response}`
      )
    }
  }
}

/**
 * Assert that response contains expected content
 */
export function assertResponseContains(
  response: string,
  expectedContent: string | RegExp
): void {
  if (typeof expectedContent === 'string') {
    if (!response.includes(expectedContent)) {
      throw new Error(
        `Response does not contain expected content: "${expectedContent}"\nFull response: ${response}`
      )
    }
  } else {
    if (!expectedContent.test(response)) {
      throw new Error(
        `Response does not match expected pattern: ${expectedContent}\nFull response: ${response}`
      )
    }
  }
}

/**
 * Assert that a theory was validated correctly
 */
export function assertTheoryResult(
  result: { result: string; feedback: string },
  expectedResult: 'correct' | 'incorrect',
  feedbackMustContain?: string
): void {
  if (result.result !== expectedResult) {
    throw new Error(
      `Expected theory result "${expectedResult}" but got "${result.result}". Feedback: ${result.feedback}`
    )
  }
  
  if (feedbackMustContain && !result.feedback.includes(feedbackMustContain)) {
    throw new Error(
      `Theory feedback does not contain expected content: "${feedbackMustContain}"\nFeedback: ${result.feedback}`
    )
  }
}

/**
 * Assert solution submission result
 */
export function assertSolutionCorrect(
  result: { isCorrect: boolean; narrative: string },
  expectedCorrect: boolean
): void {
  if (result.isCorrect !== expectedCorrect) {
    throw new Error(
      `Expected solution to be ${expectedCorrect ? 'correct' : 'incorrect'} but got ${result.isCorrect}.\nNarrative: ${result.narrative}`
    )
  }
}
