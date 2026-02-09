import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { streamAIResponse, ChatContext, sanitizeResponseForClient } from '@/lib/services/aiService'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { evaluateUnlocks, applyUnlocks, saveEvidencePresentation, checkAndApplyActIUnlocks, getCumulativeEvidenceForSuspect } from '@/lib/services/unlockService'
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

    // Allow empty message if attachments are present
    const hasAttachments = context?.attachedItems && context.attachedItems.length > 0
    if ((!message && !hasAttachments) || !context) {
      return NextResponse.json(
        { error: 'Message or attachments are required' },
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

    // Get cumulative evidence for AI context (if chatting with a suspect)
    let cumulativeEvidence: string[] = []
    if (sessionId && context.suspectProfile?.id) {
      try {
        cumulativeEvidence = await getCumulativeEvidenceForSuspect({
          sessionId,
          suspectId: context.suspectProfile.id
        })
      } catch (error) {
        console.error('Error fetching cumulative evidence:', error)
        // Continue without cumulative evidence
      }
    }

    // Check for unlocks if evidence is attached
    let unlockResult = null
    if (sessionId && context.attachedItems && context.attachedItems.length > 0) {
      try {
        console.log('\n╔════════════════════════════════════════════════════════════╗')
        console.log('║                  CHAT API - EVIDENCE ATTACHED              ║')
        console.log('╚════════════════════════════════════════════════════════════╝')
        console.log('[CHAT-API] Session ID:', sessionId)
        console.log('[CHAT-API] Suspect ID:', context.suspectProfile?.id)
        console.log('[CHAT-API] Attached items this message:', context.attachedItems.map(i => i.id))
        console.log('[CHAT-API] Attached items count:', context.attachedItems.length)
        
        const supabase = createServiceRoleClient()
        
        // Get session data
        const { data: session } = await supabase
          .from('game_sessions')
          .select('current_stage')
          .eq('id', sessionId)
          .single()

        if (session) {
          console.log('[CHAT-API] Current game stage:', session.current_stage)
          
          // Save evidence presentation
          console.log('[CHAT-API] Saving evidence presentation to database...')
          await saveEvidencePresentation({
            sessionId,
            suspectId: context.suspectProfile.id,
            evidenceIds: context.attachedItems.map(i => i.id)
          })
          console.log('[CHAT-API] ✓ Evidence presentation saved')

          // Update cumulative evidence with newly attached items
          const updatedCumulativeEvidence = Array.from(
            new Set([...cumulativeEvidence, ...context.attachedItems.map(i => i.id)])
          )
          console.log('[CHAT-API] Updated cumulative evidence (count:', updatedCumulativeEvidence.length, '):', updatedCumulativeEvidence)

          // Evaluate unlocks (passing cumulative evidence for cumulative rules)
          console.log('[CHAT-API] Evaluating unlocks...')
          unlockResult = await evaluateUnlocks({
            sessionId,
            suspectId: context.suspectProfile.id,
            evidenceIds: context.attachedItems.map(i => i.id),
            currentStage: (session.current_stage || 'start') as GameStage,
            trigger: 'chat',
            cumulativeEvidence: updatedCumulativeEvidence
          })

          // Apply unlocks if any
          if (unlockResult.hasUnlocks) {
            console.log('[CHAT-API] ✓✓✓ UNLOCKS FOUND! Applying...')
            console.log('[CHAT-API] Matched rule:', unlockResult.matchedRule?.id)
            console.log('[CHAT-API] Unlocks:', unlockResult.unlocks)
            
            await applyUnlocks(sessionId, unlockResult)
            console.log('[CHAT-API] ✓ Unlocks applied to database')
            
            // Note: checkAndApplyActIUnlocks is deprecated (Act I no longer exists)
            // All unlocks are handled directly in unlock rules
            await checkAndApplyActIUnlocks(sessionId)
          } else {
            console.log('[CHAT-API] No unlocks triggered')
          }
        }
      } catch (error) {
        console.error('[CHAT-API] ✗ Error evaluating unlocks:', error)
        // Don't fail the chat if unlock evaluation fails
      }
    }

    // Add cumulative evidence to context for AI
    const enhancedContext: ChatContext = {
      ...context,
      cumulativeEvidence: cumulativeEvidence.length > 0 ? cumulativeEvidence : undefined
    }

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Check if game is completed BEFORE streaming AI response
          const gameCompleted = unlockResult && unlockResult.hasUnlocks && unlockResult.unlocks.statusUpdate === 'Case Solved'
          
          console.log('\n[CHAT-API-STREAM] Checking victory condition:')
          console.log('[CHAT-API-STREAM]   Has unlock result?', !!unlockResult)
          console.log('[CHAT-API-STREAM]   Has unlocks?', unlockResult?.hasUnlocks)
          console.log('[CHAT-API-STREAM]   Status update:', unlockResult?.unlocks.statusUpdate)
          console.log('[CHAT-API-STREAM]   Game completed?', gameCompleted)
          
          // Send unlock event first if applicable
          if (unlockResult && unlockResult.hasUnlocks) {
            console.log('[CHAT-API-STREAM] Sending unlock event to client...')
            const unlockData = `data: ${JSON.stringify({ 
              unlock: {
                suspects: unlockResult.unlocks.suspects || [],
                scenes: unlockResult.unlocks.scenes || [],
                records: unlockResult.unlocks.records || [],
                stage: unlockResult.unlocks.stage,
                message: unlockResult.notificationMessage,
                gameCompleted
              }
            })}\n\n`
            controller.enqueue(encoder.encode(unlockData))
            console.log('[CHAT-API-STREAM] ✓ Unlock event sent')
            
            // If game completed, send done event immediately and skip AI response
            if (gameCompleted) {
              console.log('[CHAT-API-STREAM] 🎉🎉🎉 VICTORY! Sending done event and skipping AI response')
              const completeData = `data: ${JSON.stringify({ done: true })}\n\n`
              controller.enqueue(encoder.encode(completeData))
              controller.close()
              console.log('[CHAT-API-STREAM] ✓ Stream closed - client should redirect to victory')
              return
            }
          }

          // Stream AI response
          for await (const chunk of streamAIResponse(message, enhancedContext)) {
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

