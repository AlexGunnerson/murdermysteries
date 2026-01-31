import { createClient } from '@supabase/supabase-js'

/**
 * Test session management utilities
 * Creates and cleans up test game sessions for integration tests
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface TestSession {
  userId: string
  sessionId: string
  caseId: string
  email: string
  password: string
}

/**
 * Create a test user and game session
 */
export async function createTestSession(caseSlug: string = 'case01'): Promise<TestSession> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  // Look up case by slug to get UUID
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id')
    .eq('slug', caseSlug)
    .single()
  
  if (caseError || !caseData) {
    throw new Error(`Failed to find case with slug "${caseSlug}": ${caseError?.message}`)
  }
  
  const caseId = caseData.id
  
  // Generate unique test user credentials
  const timestamp = Date.now()
  const email = `test-${timestamp}@murdermysteries.test`
  const password = `TestPassword${timestamp}!`
  
  // Create test user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  
  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message}`)
  }
  
  const userId = authData.user.id
  
  // Create game session
  const { data: sessionData, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      user_id: userId,
      case_id: caseId,
      current_stage: 'start',
      is_completed: false,
    })
    .select()
    .single()
  
  if (sessionError || !sessionData) {
    throw new Error(`Failed to create game session: ${sessionError?.message}`)
  }
  
  return {
    userId,
    sessionId: sessionData.id,
    caseId,
    email,
    password,
  }
}

/**
 * Clean up test session and user data
 */
export async function cleanupTestSession(session?: TestSession): Promise<void> {
  if (!session) {
    return // Nothing to clean up
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  try {
    // Delete game session and related data (cascading deletes should handle most)
    if (session.sessionId) {
      await supabase
        .from('game_sessions')
        .delete()
        .eq('id', session.sessionId)
    }
    
    // Delete test user
    if (session.userId) {
      await supabase.auth.admin.deleteUser(session.userId)
    }
  } catch (error) {
    console.error('Error cleaning up test session:', error)
    // Don't throw - cleanup errors shouldn't fail tests
  }
}

/**
 * Get current game state for a session
 */
export async function getSessionState(sessionId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  const [session, facts, theories, unlocks] = await Promise.all([
    supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single(),
    supabase
      .from('discovered_facts')
      .select('*')
      .eq('game_session_id', sessionId),
    supabase
      .from('theory_submissions')
      .select('*')
      .eq('game_session_id', sessionId),
    supabase
      .from('unlocked_content')
      .select('*')
      .eq('game_session_id', sessionId),
  ])
  
  return {
    session: session.data,
    facts: facts.data || [],
    theories: theories.data || [],
    unlocks: unlocks.data || [],
  }
}

/**
 * Sign in as test user and get auth token
 */
export async function signInTestUser(email: string, password: string): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`)
  }
  
  return data.session.access_token
}
