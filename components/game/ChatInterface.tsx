"use client"

import { useState, useRef, useEffect } from 'react'
import { useGameState, useSuspectChatHistory } from '@/lib/hooks/useGameState'
import { extractFactsFromResponse } from '@/lib/services/aiService'
import { calculateFactReward } from '@/lib/utils/dpCalculator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  suspectId: string
  suspectName: string
  suspectRole: string
  suspectPersonality: string
  systemPrompt: string
  onFactDiscovered?: (fact: string) => void
}

export function ChatInterface({
  suspectId,
  suspectName,
  suspectRole,
  suspectPersonality,
  systemPrompt,
  onFactDiscovered,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { addChatMessage, discoveredFacts, addDiscoveredFact, addDetectivePoints } = useGameState()
  const chatHistory = useSuspectChatHistory(suspectId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, currentResponse])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsStreaming(true)

    // Add user message to chat history
    addChatMessage({
      suspectId,
      role: 'user',
      content: userMessage,
    })

    try {
      // Build context for AI
      const context = {
        systemPrompt,
        conversationHistory: chatHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.content,
        })),
        discoveredFacts: discoveredFacts.map((f) => f.content),
        suspectProfile: {
          id: suspectId,
          name: suspectName,
          role: suspectRole,
          personality: suspectPersonality,
        },
      }

      // Start streaming response
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      // Handle SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream available')
      }

      let fullResponse = ''

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
                console.error('Stream error:', data.error)
                setIsStreaming(false)
                return
              }

              if (data.done) {
                // Save complete response to chat history
                addChatMessage({
                  suspectId,
                  role: 'assistant',
                  content: fullResponse,
                })

                // Extract new facts from response
                const knownFactContents = discoveredFacts.map(f => f.content)
                const newFacts = extractFactsFromResponse(fullResponse, knownFactContents)

                // Add discovered facts and reward DP
                if (newFacts.length > 0) {
                  newFacts.forEach((factContent) => {
                    addDiscoveredFact({
                      content: factContent,
                      source: 'chat',
                      sourceId: suspectId,
                    })
                  })

                  // Reward +1 DP per new fact
                  const dpReward = calculateFactReward(newFacts.length)
                  addDetectivePoints(dpReward)

                  // Notify parent component if callback provided
                  if (onFactDiscovered) {
                    newFacts.forEach(fact => onFactDiscovered(fact))
                  }
                }

                setCurrentResponse('')
                setIsStreaming(false)
                return
              }

              if (data.text) {
                fullResponse += data.text
                setCurrentResponse(fullResponse)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsStreaming(false)
      setCurrentResponse('')
      
      // Add error message
      addChatMessage({
        suspectId,
        role: 'assistant',
        content: 'I apologize, but I seem to be having trouble responding right now. Please try again.',
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-amber-400">{suspectName}</h2>
        <p className="text-sm text-gray-400">{suspectRole}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-amber-700 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-800 text-gray-100">
              <p className="whitespace-pre-wrap">{currentResponse}</p>
              <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-1" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isStreaming}
            className="flex-1 resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isStreaming}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}

