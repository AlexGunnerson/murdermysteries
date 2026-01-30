"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useGameState, useSuspectChatHistory } from '@/lib/hooks/useGameState'
import { extractFactsFromResponse } from '@/lib/services/aiService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { QuickNoteButton } from './QuickNoteButton'
import { smartConcat } from '@/lib/utils/textUtils'

interface ChatInterfaceProps {
  suspectId: string
  suspectName: string
  suspectRole: string
  suspectPersonality: string
  systemPrompt: string
  suspectAvatarUrl?: string
  onFactDiscovered?: (fact: string) => void
}

export function ChatInterface({
  suspectId,
  suspectName,
  suspectRole,
  suspectPersonality,
  systemPrompt,
  suspectAvatarUrl,
  onFactDiscovered,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { addChatMessage, discoveredFacts, addDiscoveredFact } = useGameState()
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

                // Add discovered facts
                if (newFacts.length > 0) {
                  newFacts.forEach((factContent) => {
                    addDiscoveredFact({
                      content: factContent,
                      source: 'chat',
                      sourceId: suspectId,
                    })
                  })

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
                fullResponse = smartConcat(fullResponse, data.text)
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
    <div className="flex flex-col h-full bg-[#1a1a1a] text-gray-100">
      {/* Header - Subtle Dark */}
      <div 
        className="bg-[#121212] p-4 border-b" 
        style={{
          borderImage: 'linear-gradient(to right, rgba(197, 160, 101, 0.2), rgba(197, 160, 101, 0.4), rgba(197, 160, 101, 0.2)) 1',
        }}
      >
        <h2 
          className="text-2xl font-semibold text-[#d4af37]"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            textShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
          }}
        >
          {suspectName}
        </h2>
        <p 
          className="text-base text-[#c5a065] mt-0.5"
          style={{ 
            fontFamily: 'Courier, monospace',
            textShadow: '0 0 4px rgba(197, 160, 101, 0.2)',
          }}
        >
          {suspectRole}
        </p>
      </div>

      {/* Messages - Custom Scrollbar */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a2a #1a1a1a',
        }}
      >
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar for suspect messages */}
            {msg.role === 'assistant' && suspectAvatarUrl && (
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border border-[#d4af37] mt-1"
                style={{
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                <Image
                  src={suspectAvatarUrl}
                  alt={suspectName}
                  width={64}
                  height={64}
                  unoptimized
                  className="w-full h-full object-cover scale-[2]"
                />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-sm p-3 ${
                msg.role === 'user'
                  ? 'bg-[#2a2520] text-[#dcd0b8] border border-[#d4af37]/30'
                  : 'bg-[#0f0f0f] text-gray-300 border border-gray-800'
              }`}
              style={{
                boxShadow: msg.role === 'user' 
                  ? '0 2px 8px rgba(0, 0, 0, 0.4)' 
                  : '0 1px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed">{msg.content}</p>
              <span className="text-xs opacity-40 mt-2 block" style={{ fontFamily: 'Courier, monospace' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator - shows when streaming but no response yet */}
        {isStreaming && !currentResponse && (
          <div className="flex gap-3 justify-start">
            {/* Avatar for loading suspect message */}
            {suspectAvatarUrl && (
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border border-[#d4af37] mt-1"
                style={{
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                <Image
                  src={suspectAvatarUrl}
                  alt={suspectName}
                  width={64}
                  height={64}
                  unoptimized
                  className="w-full h-full object-cover scale-[2]"
                />
              </div>
            )}
            
            <div 
              className="max-w-[80%] rounded-sm p-3 bg-[#0f0f0f] text-gray-300 border border-gray-800"
              style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#d4af37]" />
                <span className="text-sm text-gray-400 italic" style={{ fontFamily: 'Courier, monospace' }}>
                  {suspectName} is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Streaming response */}
        {currentResponse && (
          <div className="flex gap-3 justify-start">
            {/* Avatar for streaming suspect message */}
            {suspectAvatarUrl && (
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border border-[#d4af37] mt-1"
                style={{
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                <Image
                  src={suspectAvatarUrl}
                  alt={suspectName}
                  width={64}
                  height={64}
                  unoptimized
                  className="w-full h-full object-cover scale-[2]"
                />
              </div>
            )}
            
            <div 
              className="max-w-[80%] rounded-sm p-3 bg-[#0f0f0f] text-gray-300 border border-gray-800"
              style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed">{currentResponse}</p>
              <span className="inline-block w-2 h-4 bg-[#d4af37] animate-pulse ml-1" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Dark Inset */}
      <div 
        className="bg-[#121212] p-4 border-t" 
        style={{
          borderImage: 'linear-gradient(to right, rgba(197, 160, 101, 0.2), rgba(197, 160, 101, 0.4), rgba(197, 160, 101, 0.2)) 1',
        }}
      >
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isStreaming}
            className="flex-1 resize-none bg-transparent border border-[#d4af37]/30 text-gray-300 placeholder-gray-600 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/40 rounded-sm text-base"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isStreaming}
            className="bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 rounded-sm transition-colors"
            style={{
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), 0 0 8px rgba(212, 175, 55, 0.2)',
            }}
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
  )
}

