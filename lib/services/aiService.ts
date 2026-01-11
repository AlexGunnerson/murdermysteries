import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI client
let genAI: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export interface ChatMessage {
  role: 'user' | 'model'
  parts: string
}

export interface StreamResponse {
  text: string
  isComplete: boolean
  error?: string
}

export interface ChatContext {
  systemPrompt: string
  conversationHistory: ChatMessage[]
  discoveredFacts: string[]
  suspectProfile: {
    id: string
    name: string
    role: string
    personality: string
  }
}

/**
 * Generate streaming response from Gemini AI
 */
export async function* streamAIResponse(
  userMessage: string,
  context: ChatContext
): AsyncGenerator<StreamResponse> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    })

    // Build conversation context with system prompt
    const fullPrompt = buildPrompt(userMessage, context)

    // Start streaming generation
    const result = await model.generateContentStream(fullPrompt)

    let accumulatedText = ''

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      accumulatedText += chunkText

      yield {
        text: chunkText,
        isComplete: false,
      }
    }

    // Final chunk
    yield {
      text: '',
      isComplete: true,
    }
  } catch (error) {
    console.error('Error in AI streaming:', error)
    yield {
      text: '',
      isComplete: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate complete AI response (non-streaming)
 */
export async function generateAIResponse(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    })

    const fullPrompt = buildPrompt(userMessage, context)
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw new Error('Failed to generate AI response')
  }
}

/**
 * Build complete prompt with context and history
 */
function buildPrompt(userMessage: string, context: ChatContext): string {
  const { systemPrompt, conversationHistory, discoveredFacts, suspectProfile } = context

  // Build the full context
  let prompt = `${systemPrompt}\n\n`

  // Add suspect profile
  prompt += `You are playing the role of ${suspectProfile.name}, a ${suspectProfile.role}.\n`
  prompt += `Personality traits: ${suspectProfile.personality}\n\n`

  // Add discovered facts context
  if (discoveredFacts.length > 0) {
    prompt += `Facts the detective has discovered so far:\n`
    discoveredFacts.forEach((fact, index) => {
      prompt += `${index + 1}. ${fact}\n`
    })
    prompt += `\n`
  }

  // Add conversation history
  if (conversationHistory.length > 0) {
    prompt += `Previous conversation:\n`
    conversationHistory.forEach((msg) => {
      const speaker = msg.role === 'user' ? 'Detective' : suspectProfile.name
      prompt += `${speaker}: ${msg.parts}\n`
    })
    prompt += `\n`
  }

  // Add current user message
  prompt += `Detective: ${userMessage}\n`
  prompt += `${suspectProfile.name}:`

  return prompt
}

/**
 * Extract new facts from AI response
 * This uses simple heuristics - can be enhanced with more sophisticated NLP
 */
export function extractFactsFromResponse(
  response: string,
  knownFacts: string[]
): string[] {
  const newFacts: string[] = []

  // Look for sentences that might contain factual information
  // Simple heuristic: sentences with specific keywords or patterns
  const factIndicators = [
    /I was at/i,
    /I saw/i,
    /I heard/i,
    /I know that/i,
    /The victim/i,
    /at \d+:\d+ (AM|PM)/i, // Time mentions
    /on (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i, // Day mentions
  ]

  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  for (const sentence of sentences) {
    const trimmed = sentence.trim()

    // Check if sentence matches any fact indicator
    const matchesIndicator = factIndicators.some((pattern) => pattern.test(trimmed))

    if (matchesIndicator) {
      // Check if this is a new fact (not already known)
      const isNewFact = !knownFacts.some((knownFact) =>
        knownFact.toLowerCase().includes(trimmed.toLowerCase()) ||
        trimmed.toLowerCase().includes(knownFact.toLowerCase())
      )

      if (isNewFact && trimmed.length > 10 && trimmed.length < 200) {
        newFacts.push(trimmed)
      }
    }
  }

  return newFacts
}

/**
 * Validate that system prompts are never exposed to frontend
 */
export function sanitizeResponseForClient(response: string): string {
  // Remove any potential system prompt leakage
  const systemPromptMarkers = [
    'You are playing the role',
    'SYSTEM:',
    'INSTRUCTIONS:',
    'Facts the detective has discovered',
  ]

  let sanitized = response

  for (const marker of systemPromptMarkers) {
    const index = sanitized.indexOf(marker)
    if (index !== -1) {
      sanitized = sanitized.substring(0, index)
    }
  }

  return sanitized.trim()
}

/**
 * Generate contextual clue based on current game state
 */
export async function generateClue(
  caseContext: {
    discoveredFacts: string[]
    investigatedLocations: string[]
    questionedSuspects: string[]
    correctPath: string[]
  }
): Promise<string> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build clue generation prompt
    const prompt = `You are a mystery game hint system. Generate a subtle clue that helps the detective without giving away the solution.

Context:
- Facts discovered: ${caseContext.discoveredFacts.join('; ')}
- Locations investigated: ${caseContext.investigatedLocations.join(', ')}
- Suspects questioned: ${caseContext.questionedSuspects.join(', ')}

The detective should be guided toward: ${caseContext.correctPath[0]}

Generate a subtle, helpful clue that:
1. Does NOT directly reveal the answer
2. Encourages investigation in the right direction
3. Is mysterious and fits the noir detective theme
4. Is 1-2 sentences maximum

Clue:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Error generating clue:', error)
    return 'Consider reviewing the evidence you\'ve already collected. Sometimes the answer lies in the details.'
  }
}

/**
 * Calculate relevance score for a theory
 * Used to determine if theory is correct, partial, or incorrect
 */
export async function evaluateTheory(
  theory: {
    description: string
    artifactIds: string[]
  },
  caseData: {
    correctSolution: string
    requiredFacts: string[]
    artifacts: Record<string, string>
  }
): Promise<{
  result: 'correct' | 'partial' | 'incorrect'
  feedback: string
  matchedFacts: string[]
}> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build evaluation prompt
    const artifactContents = theory.artifactIds
      .map((id) => caseData.artifacts[id])
      .filter(Boolean)
      .join('\n')

    const prompt = `You are evaluating a detective's theory in a murder mystery game.

Correct Solution: ${caseData.correctSolution}

Required Facts: ${caseData.requiredFacts.join(', ')}

Detective's Theory: ${theory.description}

Supporting Evidence: ${artifactContents}

Evaluate if the theory is:
- CORRECT: Matches the correct solution closely
- PARTIAL: Has some correct elements but missing key insights
- INCORRECT: Goes in wrong direction or lacks evidence

Respond with JSON format:
{
  "result": "correct|partial|incorrect",
  "feedback": "Brief explanation of what's right/wrong",
  "matchedFacts": ["list of correctly identified facts"]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // Fallback if parsing fails
    return {
      result: 'incorrect',
      feedback: 'Unable to evaluate theory. Please try again.',
      matchedFacts: [],
    }
  } catch (error) {
    console.error('Error evaluating theory:', error)
    return {
      result: 'incorrect',
      feedback: 'Error evaluating theory. Please try again.',
      matchedFacts: [],
    }
  }
}

