import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { streamAIResponse, ChatContext, sanitizeResponseForClient } from '@/lib/services/aiService'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { evaluateUnlocks, applyUnlocks, saveEvidencePresentation, checkAndApplyActIUnlocks } from '@/lib/services/unlockService'
import { GameStage } from '@/lib/config/unlockRules'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/chat
 * Streaming AI chat endpoint using Server-Sent Events (SSE)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication (TEMPORARILY DISABLED FOR TESTING)
    // const user = await requireAuth()

    // Parse request body
    const body = await request.json()
    const { message, context, sessionId } = body as {
      message: string
      context: ChatContext
      sessionId?: string
    }

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Message and context are required' },
        { status: 400 }
      )
    }

    // Validate that system prompt is not exposed
    if (!context.systemPrompt) {
      return NextResponse.json(
        { error: 'System prompt is required for context' },
        { status: 400 }
      )
    }

    // Check for unlocks if evidence is attached
    let unlockResult = null
    if (sessionId && context.attachedItems && context.attachedItems.length > 0) {
      try {
        const supabase = createServiceRoleClient()
        
        // Get session data
        const { data: session } = await supabase
          .from('game_sessions')
          .select('current_stage')
          .eq('id', sessionId)
          .single()

        if (session) {
          // Save evidence presentation
          await saveEvidencePresentation({
            sessionId,
            suspectId: context.suspectProfile.id,
            evidenceIds: context.attachedItems.map(i => i.id)
          })

          // Evaluate unlocks
          unlockResult = await evaluateUnlocks({
            sessionId,
            suspectId: context.suspectProfile.id,
            evidenceIds: context.attachedItems.map(i => i.id),
            currentStage: (session.current_stage || 'start') as GameStage,
            trigger: 'chat'
          })

          // Apply unlocks if any
          if (unlockResult.hasUnlocks) {
            await applyUnlocks(sessionId, unlockResult)
            
            // Note: checkAndApplyActIUnlocks is deprecated (Act I no longer exists)
            // All unlocks are handled directly in unlock rules
            await checkAndApplyActIUnlocks(sessionId)
          }
        }
      } catch (error) {
        console.error('Error evaluating unlocks:', error)
        // Don't fail the chat if unlock evaluation fails
      }
    }

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send unlock event first if applicable
          if (unlockResult && unlockResult.hasUnlocks) {
            const unlockData = `data: ${JSON.stringify({ 
              unlock: {
                suspects: unlockResult.unlocks.suspects || [],
                scenes: unlockResult.unlocks.scenes || [],
                records: unlockResult.unlocks.records || [],
                stage: unlockResult.unlocks.stage,
                message: unlockResult.notificationMessage
              }
            })}\n\n`
            controller.enqueue(encoder.encode(unlockData))
          }

          // Stream AI response
          for await (const chunk of streamAIResponse(message, context)) {
            if (chunk.error) {
              const errorData = `data: ${JSON.stringify({ error: chunk.error })}\n\n`
              controller.enqueue(encoder.encode(errorData))
              controller.close()
              return
            }

            if (chunk.isComplete) {
              const completeData = `data: ${JSON.stringify({ done: true })}\n\n`
              controller.enqueue(encoder.encode(completeData))
              controller.close()
              return
            }

            // Sanitize chunk before sending to client
            const sanitizedText = sanitizeResponseForClient(chunk.text)
            
            if (sanitizedText) {
              const data = `data: ${JSON.stringify({ text: sanitizedText })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = `data: ${JSON.stringify({ 
            error: 'An error occurred while generating response' 
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    
    // Check if error is from requireAuth
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/chat/test
 * Test endpoint to verify SSE is working
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      let count = 0
      const interval = setInterval(() => {
        count++
        const data = `data: ${JSON.stringify({ message: `Test message ${count}` })}\n\n`
        controller.enqueue(encoder.encode(data))

        if (count >= 5) {
          clearInterval(interval)
          const done = `data: ${JSON.stringify({ done: true })}\n\n`
          controller.enqueue(encoder.encode(done))
          controller.close()
        }
      }, 500)
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

