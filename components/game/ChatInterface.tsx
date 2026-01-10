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
    <div className="flex flex-col h-full bg-[#141414] text-gray-100">
      {/* Header - Subtle Dark */}
      <div className="bg-[#0a0a0a] p-4 border-b border-[#c5a065]/10">
        <h2 
          className="text-xl font-semibold text-[#c5a065]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {suspectName}
        </h2>
        <p 
          className="text-sm text-[#c5a065]/70 mt-0.5"
          style={{ fontFamily: 'Courier, monospace' }}
        >
          {suspectRole}
        </p>
      </div>

      {/* Messages - Custom Scrollbar */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a2a #141414',
        }}
      >
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-sm p-3 ${
                msg.role === 'user'
                  ? 'bg-[#2a2520] text-[#dcd0b8] border border-[#c5a065]/20'
                  : 'bg-[#1a1a1a] text-gray-300 border border-gray-800'
              }`}
              style={{
                boxShadow: msg.role === 'user' 
                  ? '0 2px 8px rgba(0, 0, 0, 0.4)' 
                  : '0 1px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              <span className="text-xs opacity-40 mt-2 block" style={{ fontFamily: 'Courier, monospace' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {currentResponse && (
          <div className="flex justify-start">
            <div 
              className="max-w-[80%] rounded-sm p-3 bg-[#1a1a1a] text-gray-300 border border-gray-800"
              style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentResponse}</p>
              <span className="inline-block w-2 h-4 bg-[#c5a065] animate-pulse ml-1" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Dark Inset */}
      <div className="bg-[#0a0a0a] p-4 border-t border-[#c5a065]/10">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isStreaming}
            className="flex-1 resize-none bg-transparent border border-[#c5a065]/30 text-gray-300 placeholder-gray-600 focus:border-[#c5a065]/50 focus:ring-1 focus:ring-[#c5a065]/30 rounded-sm"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isStreaming}
            className="bg-[#c5a065]/20 hover:bg-[#c5a065]/30 text-[#c5a065] border border-[#c5a065]/30 rounded-sm transition-colors"
            style={{
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            }}
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p 
          className="text-xs text-gray-600 mt-2" 
          style={{ fontFamily: 'Courier, monospace' }}
        >
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: #141414;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </div>
  )
}

