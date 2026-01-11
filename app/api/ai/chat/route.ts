import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { streamAIResponse, ChatContext, sanitizeResponseForClient } from '@/lib/services/aiService'

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
    const { message, context } = body as {
      message: string
      context: ChatContext
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

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
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

