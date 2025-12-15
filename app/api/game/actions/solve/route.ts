import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/game/actions/solve
 * Handle final solution submission
 * Cost: Free (0 DP)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId, caseId, solution } = body

    if (!sessionId || !caseId || !solution) {
      return NextResponse.json(
        { error: 'sessionId, caseId, and solution are required' },
        { status: 400 }
      )
    }

    const { killer, motive, keyEvidence, explanation } = solution

    if (!killer || !motive || !keyEvidence) {
      return NextResponse.json(
        { error: 'killer, motive, and keyEvidence are required in solution' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if case is already completed
    if (session.is_completed) {
      return NextResponse.json(
        { error: 'This case has already been completed' },
        { status: 400 }
      )
    }

    // Get case data with correct solution
    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Evaluate solution using AI
    const isCorrect = await evaluateSolution(
      {
        killer,
        motive,
        keyEvidence,
        explanation: explanation || '',
      },
      {
        correctKiller: caseData.correct_killer || '',
        correctMotive: caseData.correct_motive || '',
        correctEvidence: caseData.correct_evidence || [],
        solutionDescription: caseData.solution_description || '',
      }
    )

    // Generate narrative explanation
    const narrative = await generateNarrative(
      isCorrect,
      {
        killer,
        motive,
        keyEvidence,
      },
      {
        correctKiller: caseData.correct_killer || '',
        correctMotive: caseData.correct_motive || '',
        solutionDescription: caseData.solution_description || '',
      }
    )

    // Update session as completed
    await supabase
      .from('game_sessions')
      .update({
        is_completed: true,
        is_solved_correctly: isCorrect,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Save solution submission
    await supabase
      .from('solution_submissions')
      .insert({
        game_session_id: sessionId,
        killer_accused: killer,
        motive_provided: motive,
        key_evidence: keyEvidence,
        explanation: explanation || null,
        is_correct: isCorrect,
        narrative_feedback: narrative,
      })

    return NextResponse.json({
      success: true,
      isCorrect,
      narrative,
    })
  } catch (error) {
    console.error('Error submitting solution:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit solution' },
      { status: 500 }
    )
  }
}

/**
 * Evaluate if the submitted solution is correct
 */
async function evaluateSolution(
  submission: {
    killer: string
    motive: string
    keyEvidence: string
    explanation: string
  },
  correctSolution: {
    correctKiller: string
    correctMotive: string
    correctEvidence: string[]
    solutionDescription: string
  }
): Promise<boolean> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are evaluating a detective's solution to a murder mystery case.

Correct Solution:
- Killer: ${correctSolution.correctKiller}
- Motive: ${correctSolution.correctMotive}
- Key Evidence: ${correctSolution.correctEvidence.join(', ')}
- Description: ${correctSolution.solutionDescription}

Detective's Submission:
- Accused: ${submission.killer}
- Motive: ${submission.motive}
- Evidence: ${submission.keyEvidence}
- Explanation: ${submission.explanation}

Evaluate if the detective's solution is essentially correct. They don't need to match word-for-word, 
but the killer should be the same person and the motive should be substantially correct.

Respond with ONLY "CORRECT" or "INCORRECT"`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim().toUpperCase()

    return text.includes('CORRECT') && !text.includes('INCORRECT')
  } catch (error) {
    console.error('Error evaluating solution:', error)
    // Fallback to simple string matching
    return (
      submission.killer.toLowerCase() === correctSolution.correctKiller.toLowerCase()
    )
  }
}

/**
 * Generate narrative explanation of the solution
 */
async function generateNarrative(
  isCorrect: boolean,
  submission: {
    killer: string
    motive: string
    keyEvidence: string
  },
  correctSolution: {
    correctKiller: string
    correctMotive: string
    solutionDescription: string
  }
): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    if (isCorrect) {
      const prompt = `Generate a narrative explanation (2-3 paragraphs) that reveals the true solution to a murder mystery case.
The detective correctly solved it!

Correct Solution: ${correctSolution.solutionDescription}

Detective's Answer:
- Killer: ${submission.killer}
- Motive: ${submission.motive}

Write an engaging, noir-style narrative that:
1. Congratulates the detective
2. Explains what really happened
3. Reveals how the killer was caught
4. Maintains the mystery/detective story atmosphere

Keep it concise but satisfying.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } else {
      const prompt = `Generate a narrative explanation (2-3 paragraphs) that reveals the true solution to a murder mystery case.
Unfortunately, the detective got it wrong.

Correct Solution: ${correctSolution.solutionDescription}

Correct Killer: ${correctSolution.correctKiller}
Correct Motive: ${correctSolution.correctMotive}

Detective's Wrong Answer:
- Accused: ${submission.killer}
- Claimed Motive: ${submission.motive}

Write an engaging, noir-style narrative that:
1. Gently reveals the detective was wrong
2. Explains what really happened
3. Reveals the true killer and motive
4. Maintains the mystery/detective story atmosphere

Keep it concise but informative.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    }
  } catch (error) {
    console.error('Error generating narrative:', error)
    
    if (isCorrect) {
      return `Congratulations, Detective! You've successfully solved the case. ${correctSolution.correctKiller} was indeed the murderer, driven by ${correctSolution.correctMotive}. Your keen investigative skills and attention to detail led you to the truth. Justice will be served.`
    } else {
      return `Unfortunately, your accusation was incorrect. The real killer was ${correctSolution.correctKiller}, motivated by ${correctSolution.correctMotive}. ${correctSolution.solutionDescription} Sometimes even the best detectives miss crucial details. The case remains on your desk, unsolved.`
    }
  }
}

