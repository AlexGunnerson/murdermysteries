"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useGameState, useSuspectChatHistory } from '@/lib/hooks/useGameState'
import { extractFactsFromResponse } from '@/lib/services/aiService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { smartConcat } from '@/lib/utils/textUtils'

interface ChatInterfaceProps {
  suspectId: string
  suspectName: string
  suspectRole: string
  suspectPersonality: string
  systemPrompt: string
  suspectAvatarUrl?: string
  onFactDiscovered?: (fact: string) => void
  onUnlockQueued?: (notification: string) => void
}

interface AttachedItem {
  id: string
  title: string
  type: 'document' | 'photo' | 'scene'
  thumbnailUrl?: string
  location?: string
}

export function ChatInterfaceWithAttachments({
  suspectId,
  suspectName,
  suspectRole,
  suspectPersonality,
  systemPrompt,
  suspectAvatarUrl,
  onFactDiscovered,
  onUnlockQueued,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [showAttachments, setShowAttachments] = useState(false)
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([])
  const [availableItems, setAvailableItems] = useState<{
    documents: AttachedItem[]
    photos: AttachedItem[]
    scenes: AttachedItem[]
  }>({
    documents: [],
    photos: [],
    scenes: []
  })
  const [documentsExpanded, setDocumentsExpanded] = useState(false)
  const [photosExpanded, setPhotosExpanded] = useState(false)
  const [photoLocationFilter, setPhotoLocationFilter] = useState<string>('all')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const { addChatMessage, discoveredFacts, addDiscoveredFact, unlockedContent, sessionId, fetchGameState, markGameAsCompleted, isGameCompleted, caseId } = useGameState()
  const chatHistory = useSuspectChatHistory(suspectId)

  // Load available items from game state
  useEffect(() => {
    async function loadAvailableItems() {
      try {
        const response = await fetch('/cases/case01/metadata.json')
        const data = await response.json()
        
        // Load documents (records)
        const docs = data.records
          .filter((doc: any) => doc.initiallyAvailable || unlockedContent.records.has(doc.id))
          .map((doc: any) => ({
            id: doc.id,
            title: doc.name,
            type: 'document' as const,
            thumbnailUrl: doc.documentUrl || (doc.images && doc.images[0])
          }))
        
        // Add Veronica's Letter
        const allDocs = [
          {
            id: 'veronica_letter',
            title: "Veronica's Letter",
            type: 'document' as const,
          },
          ...docs
        ]
        
        // Load photos from scenes with location metadata
        const scenePhotos = data.locations
          .filter((scene: any) => scene.initiallyAvailable || unlockedContent.scenes.has(scene.id))
          .flatMap((scene: any) => {
            const images = scene.images || [scene.imageUrl]
            const investigationPhotos = images.map((imageUrl: string, idx: number) => ({
              id: `${scene.id}_img_${idx}`,
              title: `${scene.name}${images.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              type: 'photo' as const,
              thumbnailUrl: imageUrl,
              location: scene.name // Add location for filtering
            }))
            
            // Also load gala photos if they exist
            const galaPhotos = (scene.galaImages || []).map((imageUrl: string, idx: number) => {
              const filename = imageUrl.split('/').pop()
              const photoTitle = scene.galaAnnotations?.[filename] 
                ? `${scene.name} - Gala Photo ${idx + 1}` 
                : `${scene.name} - Gala Photo ${idx + 1}`
              return {
                id: `${scene.id}_gala_img_${idx}`,
                title: photoTitle,
                type: 'photo' as const,
                thumbnailUrl: imageUrl,
                location: `${scene.name} (Gala Night)` // Add gala location for filtering
              }
            })
            
            return [...investigationPhotos, ...galaPhotos]
          })
        
        // Load photos from records with location metadata
        const recordPhotos = data.records
          .filter((doc: any) => (doc.initiallyAvailable || unlockedContent.records.has(doc.id)) && doc.images && doc.images.length > 0)
          .flatMap((doc: any) => {
            return doc.images.map((imageUrl: string, idx: number) => ({
              id: `${doc.id}_img_${idx}`,
              title: `${doc.name}${doc.images.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              type: 'photo' as const,
              thumbnailUrl: imageUrl,
              location: doc.name // Add record name as location
            }))
          })
        
        const allPhotos = [...scenePhotos, ...recordPhotos]
        
        // Load scenes
        const scenes = data.locations
          .filter((scene: any) => scene.initiallyAvailable || unlockedContent.scenes.has(scene.id))
          .map((scene: any) => ({
            id: scene.id,
            title: scene.name,
            type: 'scene' as const,
            thumbnailUrl: scene.imageUrl
          }))
        
        setAvailableItems({
          documents: allDocs,
          photos: allPhotos,
          scenes: scenes
        })
      } catch (error) {
        console.error('Error loading available items:', error)
      }
    }
    
    loadAvailableItems()
  }, [unlockedContent])

  // Get unique photo locations for filtering
  const photoLocations = Array.from(
    new Set(
      availableItems.photos
        .map((p: any) => p.location)
        .filter(Boolean)
    )
  ).sort()

  // Filter photos based on selected location
  const filteredPhotos = photoLocationFilter === 'all' 
    ? availableItems.photos 
    : availableItems.photos.filter((p: any) => p.location === photoLocationFilter)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, currentResponse])

  const handleAttachItem = (item: AttachedItem) => {
    if (!attachedItems.find(i => i.id === item.id)) {
      setAttachedItems([...attachedItems, item])
      setShowAttachments(false) // Close the attachment panel after selecting
    }
  }

  const handleToggleAttachments = () => {
    if (!showAttachments) {
      // Reset to initial state when opening
      setDocumentsExpanded(false)
      setPhotosExpanded(false)
      setPhotoLocationFilter('all')
      setShowAllFilters(false)
    }
    setShowAttachments(!showAttachments)
  }

  const handleRemoveAttachment = (itemId: string) => {
    setAttachedItems(attachedItems.filter(i => i.id !== itemId))
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || isGameCompleted) return

    const userMessage = inputMessage.trim()
    const messageAttachments = [...attachedItems]
    
    setInputMessage('')
    setAttachedItems([])
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
        attachedItems: messageAttachments.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type
        }))
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
          sessionId,
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

              // Handle unlock events
              if (data.unlock) {
                const unlockData = data.unlock
                
                // Check if game was completed
                if (unlockData.gameCompleted) {
                  markGameAsCompleted('Case Solved')
                  
                  // Complete the response streaming
                  if (fullResponse) {
                    addChatMessage({
                      suspectId,
                      role: 'assistant',
                      content: fullResponse,
                    })
                  }
                  
                  setCurrentResponse('')
                  setIsStreaming(false)
                  
                  // Redirect to victory page
                  if (caseId) {
                    router.push(`/game/${caseId}/victory`)
                  }
                  return
                }
                
                let unlockMessage = unlockData.message || 'New content unlocked!'
                
                // Queue notification to show after chat closes
                if (onUnlockQueued) {
                  onUnlockQueued(unlockMessage)
                }
                
                // Refresh game state to get new unlocked content
                if (fetchGameState) {
                  fetchGameState()
                }
                
                continue
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
    <div className="flex flex-col h-full bg-[#1a1a1a] text-gray-100 relative">
      {/* Unlock Notification */}
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

      {/* Attachments Preview (if any selected) */}
      {attachedItems.length > 0 && (
        <div className="bg-[#0f0f0f] border-t border-[#d4af37]/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Paperclip className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs text-[#c5a065]" style={{ fontFamily: 'Courier, monospace' }}>
              Attached Evidence ({attachedItems.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-[#d4af37]/30 rounded px-2 py-1"
              >
                {item.type === 'document' ? (
                  <FileText className="h-3 w-3 text-[#d4af37]" />
                ) : (
                  <ImageIcon className="h-3 w-3 text-[#d4af37]" />
                )}
                <span className="text-xs text-gray-300">{item.title}</span>
                <button
                  onClick={() => handleRemoveAttachment(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Selector (collapsible) */}
      {showAttachments && (
        <div className="bg-[#0f0f0f] border-t border-[#d4af37]/20 max-h-[400px] overflow-y-auto chat-scrollbar">
          <div className="p-4 space-y-3">
            {/* Documents Section */}
            {availableItems.documents.length > 0 && (
              <div className="border border-gray-700 rounded">
                <button
                  onClick={() => setDocumentsExpanded(!documentsExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-[#1a1a1a] hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#d4af37]" />
                    <h4 className="text-sm font-semibold text-[#d4af37]" style={{ fontFamily: 'Courier, monospace' }}>
                      Documents ({availableItems.documents.length})
                    </h4>
                  </div>
                  {documentsExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#d4af37]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#d4af37]" />
                  )}
                </button>
                
                {documentsExpanded && (
                  <div className="p-3 bg-[#0a0a0a]">
                    <div className="grid grid-cols-2 gap-2">
                      {availableItems.documents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAttachItem(item)}
                          disabled={attachedItems.some(i => i.id === item.id)}
                          className={`flex items-center gap-2 p-2 rounded border text-left transition-colors ${
                            attachedItems.some(i => i.id === item.id)
                              ? 'bg-[#2a2520] border-[#d4af37] opacity-50 cursor-not-allowed'
                              : 'bg-[#1a1a1a] border-gray-700 hover:border-[#d4af37]/50'
                          }`}
                        >
                          <FileText className="h-4 w-4 text-[#d4af37] flex-shrink-0" />
                          <span className="text-xs text-gray-300 truncate">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Photos Section */}
            {availableItems.photos.length > 0 && (
              <div className="border border-gray-700 rounded">
                <button
                  onClick={() => setPhotosExpanded(!photosExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-[#1a1a1a] hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#d4af37]" />
                    <h4 className="text-sm font-semibold text-[#d4af37]" style={{ fontFamily: 'Courier, monospace' }}>
                      Photos & Scenes ({availableItems.photos.length})
                    </h4>
                  </div>
                  {photosExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#d4af37]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#d4af37]" />
                  )}
                </button>
                
                {photosExpanded && (
                  <div className="p-3 bg-[#0a0a0a] space-y-3">
                    {/* Location Filters */}
                    {photoLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {/* All button - always visible */}
                        <button
                          onClick={() => setPhotoLocationFilter('all')}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            photoLocationFilter === 'all'
                              ? 'bg-[#d4af37] text-black font-semibold'
                              : 'bg-[#1a1a1a] text-gray-400 border border-gray-700 hover:border-[#d4af37]/50'
                          }`}
                          style={{ fontFamily: 'Courier, monospace' }}
                        >
                          All ({availableItems.photos.length})
                        </button>
                        
                        {/* Show first 3 locations or all if expanded */}
                        {(showAllFilters ? photoLocations : photoLocations.slice(0, 3)).map((location) => {
                          const count = availableItems.photos.filter((p: any) => p.location === location).length
                          return (
                            <button
                              key={location}
                              onClick={() => setPhotoLocationFilter(location)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                photoLocationFilter === location
                                  ? 'bg-[#d4af37] text-black font-semibold'
                                  : 'bg-[#1a1a1a] text-gray-400 border border-gray-700 hover:border-[#d4af37]/50'
                              }`}
                              style={{ fontFamily: 'Courier, monospace' }}
                            >
                              {location} ({count})
                            </button>
                          )
                        })}
                        
                        {/* More/Less button if there are more than 3 locations */}
                        {photoLocations.length > 3 && (
                          <button
                            onClick={() => setShowAllFilters(!showAllFilters)}
                            className="px-2 py-1 text-xs rounded transition-colors bg-[#1a1a1a] text-gray-400 border border-gray-700 hover:border-[#d4af37]/50"
                            style={{ fontFamily: 'Courier, monospace' }}
                          >
                            {showAllFilters ? '▲ Less Filters' : `▼ More Filters (${photoLocations.length - 3})`}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Photo Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {filteredPhotos.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAttachItem(item)}
                          disabled={attachedItems.some(i => i.id === item.id)}
                          className={`relative aspect-square rounded border overflow-hidden transition-all ${
                            attachedItems.some(i => i.id === item.id)
                              ? 'border-[#d4af37] opacity-50 cursor-not-allowed'
                              : 'border-gray-700 hover:border-[#d4af37]/50'
                          }`}
                        >
                          {item.thumbnailUrl && (
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {filteredPhotos.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-4">
                        No photos in this location
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input - Dark Inset */}
      <div 
        className="bg-[#121212] p-4 border-t" 
        style={{
          borderImage: 'linear-gradient(to right, rgba(197, 160, 101, 0.2), rgba(197, 160, 101, 0.4), rgba(197, 160, 101, 0.2)) 1',
        }}
      >
        <div className="flex gap-2">
          <Button
            onClick={handleToggleAttachments}
            className="bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 rounded-sm transition-colors flex-shrink-0"
            style={{
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), 0 0 8px rgba(212, 175, 55, 0.2)',
            }}
            title={showAttachments ? "Hide attachments" : "Show attachments"}
          >
            {showAttachments ? <ChevronDown className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
          </Button>
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isStreaming || isGameCompleted}
            className="flex-1 resize-none bg-transparent border border-[#d4af37]/30 text-gray-300 placeholder-gray-600 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/40 rounded-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isStreaming || isGameCompleted}
            className="bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        {attachedItems.length > 0 && (
          <p 
            className="text-xs text-gray-600 mt-2" 
            style={{ fontFamily: 'Courier, monospace' }}
          >
            <span className="text-[#d4af37] mr-2">
              📎 {attachedItems.length} attached
            </span>
          </p>
        )}
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
    </div>
  )
}

