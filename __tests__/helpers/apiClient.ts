/**
 * API client utilities for integration tests
 * Makes actual HTTP requests to Next.js API routes
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface ChatContext {
  systemPrompt: string
  suspectProfile: {
    id: string
    name: string
    role: string
  }
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  attachedItems?: Array<{ id: string; type: string; name: string }>
}

export interface TheoryResponse {
  success: boolean
  result: 'correct' | 'incorrect'
  feedback: string
  matchedFacts: string[]
  unlockedContent?: {
    suspects?: string[]
    scenes?: string[]
    records?: string[]
    stage?: string
  }
}

export interface SolutionResponse {
  success: boolean
  isCorrect: boolean
  narrative: string
}

/**
 * Chat with a suspect using streaming SSE
 */
export async function chatWithSuspect(
  suspectId: string,
  message: string,
  context: ChatContext,
  sessionId?: string,
  authToken?: string
): Promise<string> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  const response = await fetch(`${API_BASE}/api/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      context,
      sessionId,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`)
  }
  
  // Parse SSE stream
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullResponse = ''
  
  if (!reader) {
    throw new Error('No response body')
  }
  
  while (true) {
    const { done, value } = await reader.read()
    
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          
          if (data.error) {
            const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
            throw new Error(`Chat API error: ${errorMsg}`)
          }
          
          if (data.text) {
            fullResponse += data.text
          }
          
          if (data.done) {
            return fullResponse
          }

          if (data.unlock) {
            // Unlock events - just log them for now
            console.log('Unlock event received:', data.unlock)
          }
        } catch (parseError) {
          // Skip invalid JSON lines (empty data events, etc.)
          const trimmed = line.trim()
          if (trimmed && trimmed !== 'data:' && parseError instanceof SyntaxError) {
            console.warn('Failed to parse SSE line:', line.substring(0, 100))
          } else if (!(parseError instanceof SyntaxError)) {
            // Re-throw non-parse errors
            throw parseError
          }
        }
      }
    }
  }
  
  return fullResponse
}

/**
 * Validate a theory with artifacts
 */
export async function validateTheory(
  sessionId: string,
  description: string,
  artifactIds: string[],
  authToken?: string
): Promise<TheoryResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  const response = await fetch(`${API_BASE}/api/game/actions/validate-theory`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId,
      description,
      artifactIds,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Theory validation error: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Submit final solution
 */
export async function submitSolution(
  sessionId: string,
  caseId: string,
  killer: string,
  motive: string,
  keyEvidence: string,
  explanation?: string,
  authToken?: string
): Promise<SolutionResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  const response = await fetch(`${API_BASE}/api/game/actions/solve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId,
      caseId,
      solution: {
        killer,
        motive,
        keyEvidence,
        explanation,
      },
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Solution submission error: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Examine a scene
 */
export async function examineScene(
  sessionId: string,
  sceneId: string,
  authToken?: string
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  const response = await fetch(`${API_BASE}/api/game/actions/scenes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId,
      sceneId,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Scene examination error: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Review a record/document
 */
export async function reviewRecord(
  sessionId: string,
  recordId: string,
  authToken?: string
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  const response = await fetch(`${API_BASE}/api/game/actions/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId,
      recordId,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Record review error: ${response.statusText}`)
  }
  
  return response.json()
}
