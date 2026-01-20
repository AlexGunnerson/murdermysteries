import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'

// GET - Fetch game state
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const caseSlug = searchParams.get('caseId') // This is actually a slug like "case01"

    if (!caseSlug) {
      return NextResponse.json(
        { error: 'caseId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // First, look up the case UUID by slug
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('slug', caseSlug)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const caseId = caseData.id

    // Fetch game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('case_id', caseId)
      .single()

    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError
    }

    // If no session exists, return initial state
    if (!session) {
      return NextResponse.json({
        session: null,
        discoveredFacts: [],
        chatMessages: [],
        theorySubmissions: [],
        unlockedContent: {
          suspects: [],
          scenes: [],
          records: [],
        },
      })
    }

    // Fetch discovered facts
    const { data: facts } = await supabase
      .from('discovered_facts')
      .select('*')
      .eq('game_session_id', session.id)
      .order('discovered_at', { ascending: true })

    // Fetch chat messages
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('game_session_id', session.id)
      .order('created_at', { ascending: true })

    // Fetch theory submissions
    const { data: theories } = await supabase
      .from('theory_submissions')
      .select('*')
      .eq('game_session_id', session.id)
      .order('submitted_at', { ascending: true })

    // Fetch unlocked content
    const { data: unlocked } = await supabase
      .from('unlocked_content')
      .select('*')
      .eq('game_session_id', session.id)

    // Organize unlocked content by type
    const unlockedContent = {
      suspects: unlocked?.filter(u => u.content_type === 'suspect').map(u => u.content_id) || [],
      scenes: unlocked?.filter(u => u.content_type === 'scene').map(u => u.content_id) || [],
      records: unlocked?.filter(u => u.content_type === 'record').map(u => u.content_id) || [],
    }

    return NextResponse.json({
      session,
      discoveredFacts: facts || [],
      chatMessages: messages || [],
      theorySubmissions: theories || [],
      unlockedContent,
    })
  } catch (error) {
    console.error('Error fetching game state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    )
  }
}

// POST - Create or update game state
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { caseId: caseSlug, detectivePoints, isCompleted, isSolvedCorrectly } = body

    if (!caseSlug) {
      return NextResponse.json(
        { error: 'caseId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // First, look up the case UUID by slug
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('slug', caseSlug)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const caseId = caseData.id

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('case_id', caseId)
      .single()

    if (existingSession) {
      // Update existing session
      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          detective_points: detectivePoints,
          is_completed: isCompleted || false,
          is_solved_correctly: isSolvedCorrectly,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSession.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ session: data })
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          case_id: caseId,
          detective_points: detectivePoints || 25,
          is_completed: false,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ session: data })
    }
  } catch (error) {
    console.error('Error saving game state:', error)
    return NextResponse.json(
      { error: 'Failed to save game state' },
      { status: 500 }
    )
  }
}

// PUT - Sync specific game data (facts, messages, theories)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const {
      sessionId,
      newFacts,
      newMessages,
      newTheories,
      unlockedContent,
      currentStage,
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update stage if provided
    if (currentStage) {
      await supabase
        .from('game_sessions')
        .update({
          current_stage: currentStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
    }

    // Insert new facts
    if (newFacts && newFacts.length > 0) {
      await supabase.from('discovered_facts').insert(
        newFacts.map((fact: any) => ({
          game_session_id: sessionId,
          fact_key: fact.id,
          fact_content: fact.content,
          source: fact.source,
        }))
      )
    }

    // Insert new messages
    if (newMessages && newMessages.length > 0) {
      await supabase.from('chat_messages').insert(
        newMessages.map((msg: any) => ({
          game_session_id: sessionId,
          suspect_id: msg.suspectId,
          role: msg.role,
          content: msg.content,
        }))
      )
    }

    // Insert new theories
    if (newTheories && newTheories.length > 0) {
      await supabase.from('theory_submissions').insert(
        newTheories.map((theory: any) => ({
          game_session_id: sessionId,
          theory_description: theory.description,
          artifact_ids: theory.artifactIds,
          result: theory.result,
          feedback: theory.feedback,
          unlocked_content: theory.unlockedContent,
        }))
      )
    }

    // Insert unlocked content
    if (unlockedContent) {
      const contentToInsert = []
      
      if (unlockedContent.suspects) {
        contentToInsert.push(...unlockedContent.suspects.map((id: string) => ({
          game_session_id: sessionId,
          content_type: 'suspect',
          content_id: id,
        })))
      }
      
      if (unlockedContent.scenes) {
        contentToInsert.push(...unlockedContent.scenes.map((id: string) => ({
          game_session_id: sessionId,
          content_type: 'scene',
          content_id: id,
        })))
      }
      
      if (unlockedContent.records) {
        contentToInsert.push(...unlockedContent.records.map((id: string) => ({
          game_session_id: sessionId,
          content_type: 'record',
          content_id: id,
        })))
      }

      if (contentToInsert.length > 0) {
        await supabase.from('unlocked_content').upsert(contentToInsert, {
          onConflict: 'game_session_id,content_type,content_id',
          ignoreDuplicates: true,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing game data:', error)
    return NextResponse.json(
      { error: 'Failed to sync game data' },
      { status: 500 }
    )
  }
}

// DELETE - Reset game state to initial state
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const caseSlug = searchParams.get('caseId') // This is actually a slug like "case01"

    if (!caseSlug) {
      return NextResponse.json(
        { error: 'caseId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // First, look up the case UUID by slug
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('slug', caseSlug)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const caseId = caseData.id

    // Fetch game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('case_id', caseId)
      .single()

    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError
    }

    // If no session exists, nothing to reset
    if (!session) {
      return NextResponse.json({ success: true, message: 'No session to reset' })
    }

    const sessionId = session.id

    // Delete all unlocked content
    await supabase
      .from('unlocked_content')
      .delete()
      .eq('game_session_id', sessionId)

    // Delete all discovered facts
    await supabase
      .from('discovered_facts')
      .delete()
      .eq('game_session_id', sessionId)

    // Delete all chat messages
    await supabase
      .from('chat_messages')
      .delete()
      .eq('game_session_id', sessionId)

    // Delete all theory submissions
    await supabase
      .from('theory_submissions')
      .delete()
      .eq('game_session_id', sessionId)

    // Delete all evidence presentations
    await supabase
      .from('evidence_presentations')
      .delete()
      .eq('game_session_id', sessionId)

    // Reset session to initial state
    await supabase
      .from('game_sessions')
      .update({
        current_stage: 'start',
        detective_points: 25,
        is_completed: false,
        is_solved_correctly: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    return NextResponse.json({ success: true, message: 'Game state reset to initial state' })
  } catch (error) {
    console.error('Error resetting game state:', error)
    return NextResponse.json(
      { error: 'Failed to reset game state' },
      { status: 500 }
    )
  }
}