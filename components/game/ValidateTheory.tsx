"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FileText, Image as ImageIcon, CheckCircle, ChevronRight, X } from 'lucide-react'
import { useGameState } from '@/lib/hooks/useGameState'
import { TheoryResultModal } from './detective-board/TheoryResultModal'
import { ErrorNotification } from './detective-board/ErrorNotification'
import { QuickNoteButton } from './QuickNoteButton'

interface ValidateTheoryProps {
  isOpen: boolean
  onClose: () => void
  onPreviewDocument?: (docId: string, onClosePreview: () => void, imageIndex?: number) => void
  onPreviewScene?: (sceneId: string, onClosePreview: () => void, imageIndex?: number) => void
  onActISuccess?: (unlockedContent: any) => void
}

interface EvidenceItem {
  id: string
  title: string
  type: 'doc' | 'photo'
  desc: string
  imageUrl?: string
  images?: string[]
  sceneId?: string
  docId?: string
  category?: 'scene' | 'document'
}

export function ValidateTheory({ isOpen, onClose, onPreviewDocument, onPreviewScene, onActISuccess }: ValidateTheoryProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'documents' | 'photos'>('documents')
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [theoryText, setTheoryText] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [expandedTheoryId, setExpandedTheoryId] = useState<string | null>(null)
  const [photoFilter, setPhotoFilter] = useState<string>('all')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultModal, setResultModal] = useState<{result: 'correct' | 'incorrect', feedback: string, unlockedContent?: any} | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const { theoryHistory, addTheorySubmission, unlockedContent, sessionId, fetchGameState, currentStage, markGameAsCompleted, isGameCompleted, caseId } = useGameState()
  
  // Evidence data - this will be populated from the game state
  const [evidenceData, setEvidenceData] = useState<{
    documents: EvidenceItem[]
    photos: EvidenceItem[]
  }>({
    documents: [],
    photos: []
  })
  
  // Get unique locations for filtering
  const photoLocations = Array.from(new Set(evidenceData.photos.map(p => {
    // Extract base location name (remove " - Image X" suffix)
    return p.title.replace(/ - Image \d+$/, '')
  }))).sort()
  
  // Filter photos based on selected filter
  const filteredPhotos = photoFilter === 'all' 
    ? evidenceData.photos 
    : evidenceData.photos.filter(p => {
        const baseTitle = p.title.replace(/ - Image \d+$/, '')
        return baseTitle === photoFilter
      })

  // Load evidence from game state
  useEffect(() => {
    if (!isOpen) return
    
    async function loadEvidence() {
      try {
        const response = await fetch('/cases/case01/metadata.json')
        const data = await response.json()
        
        // Load documents (records) - show if initially available OR unlocked
        const allDocs = data.records
          .filter((doc: any) => doc.initiallyAvailable || unlockedContent.records.has(doc.id))
          .map((doc: any) => ({
            id: doc.id,
            title: doc.name,
            type: 'doc' as const,
            desc: doc.description,
            images: doc.images || (doc.documentUrl ? [doc.documentUrl] : [])
          }))
        
        // Add Veronica's Letter as the first document (always available)
        const docs = [
          {
            id: 'veronica_letter',
            title: "Veronica's Letter",
            type: 'doc' as const,
            desc: "12th, 1986 - Ashcombe Manor",
            images: []
          },
          ...allDocs
        ]
        
        // Load ALL photos - scenes and documents with images
        const scenePhotos = data.locations
          .filter((scene: any) => scene.initiallyAvailable || unlockedContent.scenes.has(scene.id))
          .flatMap((scene: any) => {
            const investigationImages = scene.images || [scene.imageUrl]
            const galaImages = scene.galaImages || []
            
            // Investigation photos
            const investigationPhotos = investigationImages.map((imageUrl: string, idx: number) => ({
              id: `${scene.id}_img_${idx}`,
              title: `${scene.name}${investigationImages.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              type: 'photo' as const,
              desc: scene.description,
              imageUrl: imageUrl,
              images: investigationImages,
              sceneId: scene.id,
              category: 'scene'
            }))
            
            // Gala photos
            const galaPhotos = galaImages.map((imageUrl: string, idx: number) => ({
              id: `${scene.id}_gala_img_${idx}`,
              title: `${scene.name}${galaImages.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              type: 'photo' as const,
              desc: scene.galaAnnotations?.[imageUrl.split('/').pop() || ''] || scene.description,
              imageUrl: imageUrl,
              images: galaImages,
              sceneId: scene.id,
              category: 'scene'
            }))
            
            return [...investigationPhotos, ...galaPhotos]
          })
        
        // Load image-based documents (like gala photos)
        const documentPhotos = data.records
          .filter((doc: any) => (doc.initiallyAvailable || unlockedContent.records.has(doc.id)) && doc.images && doc.images.length > 0)
          .flatMap((doc: any) => {
            return doc.images.map((imageUrl: string, idx: number) => ({
              id: `${doc.id}_img_${idx}`,
              title: `${doc.name}${doc.images.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              type: 'photo' as const,
              desc: doc.description,
              imageUrl: imageUrl,
              images: doc.images,
              docId: doc.id,
              category: 'document'
            }))
          })
        
        const photos = [...scenePhotos, ...documentPhotos]
        
        // Debug: Log staircase photos
        const staircasePhotos = photos.filter(p => p.id && p.id.includes('staircase'))
        console.log('[VALIDATE-THEORY] Staircase photos loaded:', staircasePhotos.map(p => ({ id: p.id, title: p.title })))
        
        setEvidenceData({ documents: docs, photos })
      } catch (error) {
        console.error('Error loading evidence:', error)
      }
    }
    
    loadEvidence()
  }, [isOpen, unlockedContent])

  const toggleEvidence = (id: string) => {
    setSelectedEvidence(prev => {
      const newSelection = prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
      console.log('[VALIDATE-THEORY] Evidence toggled:', id, 'New selection:', newSelection)
      return newSelection
    })
  }

  const getArtifactName = (artifactId: string): string => {
    // Check in documents
    const doc = evidenceData.documents.find(d => d.id === artifactId)
    if (doc) return doc.title
    
    // Check in photos
    const photo = evidenceData.photos.find(p => p.id === artifactId)
    if (photo) return photo.title
    
    return artifactId
  }

  const handleSubmit = async () => {
    if (isGameCompleted) {
      return
    }
    
    if (!theoryText.trim()) {
      setErrorModal('Please write your theory before submitting.')
      return
    }
    
    // During Act I (or before Act II), require exactly 2 artifacts
    // Act I is the default state before reaching Act II
    if (currentStage !== 'act_ii') {
      if (selectedEvidence.length !== 2) {
        setErrorModal('Please select exactly two artifacts as evidence for your theory.')
        return
      }
    }
    // Note: Act II validation is handled by the unlock rules system in the backend

    if (!sessionId) {
      setErrorModal('Game session not initialized. Please refresh the page.')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/game/actions/validate-theory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          description: theoryText.trim(),
          artifactIds: selectedEvidence,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit theory')
      }

      const data = await response.json()

      console.log('\n[VALIDATE-THEORY-UI] ═══════════════════════════════════')
      console.log('[VALIDATE-THEORY-UI] Theory submission response received')
      console.log('[VALIDATE-THEORY-UI] Submitted artifact IDs:', selectedEvidence)
      console.log('[VALIDATE-THEORY-UI] Full response:', data)
      console.log('[VALIDATE-THEORY-UI] Result:', data.result)
      console.log('[VALIDATE-THEORY-UI] Game completed?', data.gameCompleted)
      console.log('[VALIDATE-THEORY-UI] ═══════════════════════════════════\n')

      // Check if game was completed
      if (data.gameCompleted) {
        console.log('[VALIDATE-THEORY-UI] 🎉🎉🎉 VICTORY DETECTED!')
        console.log('[VALIDATE-THEORY-UI] Marking game as completed...')
        markGameAsCompleted('Case Solved')
        
        // Add theory to history
        console.log('[VALIDATE-THEORY-UI] Adding theory to history...')
        addTheorySubmission({
          description: theoryText.trim(),
          artifactIds: selectedEvidence,
          result: data.result,
          feedback: data.feedback,
          unlockedContent: data.unlockedContent,
        })
        
        // Redirect to victory page
        console.log('[VALIDATE-THEORY-UI] Redirecting to victory page:', `/game/${caseId}/victory`)
        router.push(`/game/${caseId}/victory`)
        return
      }

      // Add theory to history
      addTheorySubmission({
        description: theoryText.trim(),
        artifactIds: selectedEvidence,
        result: data.result,
        feedback: data.feedback,
        unlockedContent: data.unlockedContent,
      })

      // Show result modal
      setResultModal({
        result: data.result,
        feedback: data.feedback,
        unlockedContent: data.unlockedContent,
      })

      console.log('[VALIDATE-THEORY-UI] Checking unlocked content:', data.unlockedContent)

      // Refresh game state to get new unlocked content if anything was unlocked
      if (data.unlockedContent && fetchGameState) {
        await fetchGameState()
      }

      // Clear the form
      setTheoryText('')
      setSelectedEvidence([])
    } catch (error) {
      console.error('Error submitting theory:', error)
      setErrorModal(error instanceof Error ? error.message : 'Failed to submit theory')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Result Modal */}
      {resultModal && (
        <TheoryResultModal
          result={resultModal.result}
          feedback={resultModal.feedback}
          onClose={() => {
            // Check if this is Act I success by looking at the unlocked content
            // We check if we're unlocking Act II content (stage === 'act_ii')
            const isActISuccess = resultModal.result === 'correct' && 
                                  resultModal.unlockedContent?.stage === 'act_ii'
            
            console.log('[THEORY-RESULT-MODAL] Closing with:', {
              result: resultModal.result,
              unlockedStage: resultModal.unlockedContent?.stage,
              currentStage,
              isActISuccess
            })
            
            setResultModal(null)
            
            // If Act I success (proving contradiction), trigger the special sequence
            if (isActISuccess && onActISuccess) {
              console.log('[THEORY-RESULT-MODAL] Calling onActISuccess')
              onClose() // Close ValidateTheory modal
              onActISuccess(resultModal.unlockedContent) // Trigger sequence in parent
            } else if (resultModal.result === 'correct') {
              // For any other correct result, close the ValidateTheory modal
              onClose()
            }
          }}
        />
      )}

      {/* Error Modal */}
      {errorModal && (
        <ErrorNotification
          message={errorModal}
          onClose={() => setErrorModal(null)}
        />
      )}

      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(10,10,10,0.85) 0%, rgba(0,0,0,0.98) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
          `,
        }}
      >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>

      {/* Main Container */}
      <div 
        className="max-w-6xl w-full rounded-sm overflow-hidden flex flex-col md:flex-row h-[95vh] relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(212, 175, 55, 0.15),
            inset 0 0 1px rgba(212, 175, 55, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.03)
          `,
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Film grain overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />
        
        {/* LEFT SIDE: Evidence Selector (40%) */}
        <div 
          className="w-full md:w-[40%] bg-[#1a1a1a] flex flex-col h-full relative"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(18, 18, 18, 1) 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 12px,
                rgba(0, 0, 0, 0.15) 12px,
                rgba(0, 0, 0, 0.15) 13px
              )
            `,
            boxShadow: 'inset -3px 0 12px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Gold divider line */}
          <div 
            className="absolute top-0 right-0 bottom-0 w-[2px] z-10"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  transparent 0%,
                  rgba(197, 160, 101, 0.3) 5%,
                  rgba(197, 160, 101, 0.8) 20%,
                  rgba(197, 160, 101, 1) 50%,
                  rgba(197, 160, 101, 0.8) 80%,
                  rgba(197, 160, 101, 0.3) 95%,
                  transparent 100%
                )
              `,
              boxShadow: `0 0 8px rgba(197, 160, 101, 0.6), 0 0 16px rgba(197, 160, 101, 0.4)`,
            }}
          />
          
          {/* Header */}
          <div 
            className="p-6 bg-[#121212] flex justify-between items-center z-10 relative"
            style={{
              borderBottom: '1px solid rgba(197, 160, 101, 0.3)',
              boxShadow: '0 2px 12px rgba(197, 160, 101, 0.15)',
            }}
          >
            <div>
              <h2 
                className="text-xl font-bold tracking-wider text-[#d4af37]"
                style={{ 
                  fontFamily: "'Courier Prime', monospace",
                  textShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                CASE FILE: ASHCOMBE
              </h2>
              <p 
                className="text-xs text-[#c5a065] mt-1"
                style={{ 
                  fontFamily: "'Courier Prime', monospace",
                  textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                }}
              >
                HER-1886-0510-RA
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-[#0a0a0a]/95 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-sm transition-all duration-200 border border-[#d4af37]/40"
              title="Close"
              style={{
                boxShadow: `
                  0 2px 10px rgba(0, 0, 0, 0.8),
                  0 0 12px rgba(212, 175, 55, 0.3),
                  inset 0 0 8px rgba(212, 175, 55, 0.1)
                `,
              }}
            >
              <X 
                className="w-5 h-5"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))',
                }}
              />
            </button>
          </div>

          {/* Tabs */}
          <div 
            className="flex bg-[#121212]"
            style={{
              borderBottom: '1px solid rgba(197, 160, 101, 0.2)',
            }}
          >
            {(['documents', 'photos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  if (tab === 'photos') {
                    setPhotoFilter('all')
                    setShowAllFilters(false)
                  }
                }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-200
                  ${activeTab === tab 
                    ? 'bg-[#1a1a1a] text-[#d4af37]' 
                    : 'text-gray-500 hover:bg-[#0f0f0f] hover:text-[#c5a065]'}`}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  ...(activeTab === tab ? {
                    borderBottom: '2px solid #d4af37',
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                  } : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Photo Filters (only show on photos tab) */}
          {activeTab === 'photos' && photoLocations.length > 0 && (
            <div 
              className="p-3 bg-[#0f0f0f]"
              style={{
                borderBottom: '1px solid rgba(197, 160, 101, 0.2)',
              }}
            >
              <div className="flex flex-wrap gap-2">
                {/* All button - always visible */}
                <button
                  onClick={() => setPhotoFilter('all')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200
                    ${photoFilter === 'all'
                      ? 'bg-[#d4af37]/20 text-[#d4af37] border-2 border-[#d4af37]'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2520] hover:text-[#c5a065] border border-[#d4af37]/30'}`}
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    ...(photoFilter === 'all' ? {
                      boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
                      textShadow: '0 0 6px rgba(212, 175, 55, 0.4)',
                    } : {}),
                  }}
                >
                  All ({evidenceData.photos.length})
                </button>
                
                {/* Show first 3 locations or all if expanded */}
                {(showAllFilters ? photoLocations : photoLocations.slice(0, 3)).map(location => {
                  const count = evidenceData.photos.filter(p => {
                    const baseTitle = p.title.replace(/ - Image \d+$/, '')
                    return baseTitle === location
                  }).length
                  
                  return (
                    <button
                      key={location}
                      onClick={() => setPhotoFilter(location)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200
                        ${photoFilter === location
                          ? 'bg-[#d4af37]/20 text-[#d4af37] border-2 border-[#d4af37]'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2520] hover:text-[#c5a065] border border-[#d4af37]/30'}`}
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        ...(photoFilter === location ? {
                          boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
                          textShadow: '0 0 6px rgba(212, 175, 55, 0.4)',
                        } : {}),
                      }}
                    >
                      {location} ({count})
                    </button>
                  )
                })}
                
                {/* More/Less button if there are more than 3 locations */}
                {photoLocations.length > 3 && (
                  <button
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200 bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2520] hover:text-[#c5a065] border border-[#d4af37]/30"
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                    }}
                  >
                    {showAllFilters ? '▲ Less Filters' : `▼ More Filters (${photoLocations.length - 3})`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Evidence List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 relative z-10">
            {evidenceData[activeTab].length === 0 ? (
              <p 
                className="text-center text-gray-500 py-8 italic"
                style={{ fontFamily: "'Courier Prime', monospace" }}
              >
                No {activeTab} available yet
              </p>
            ) : activeTab === 'photos' ? (
              // Single column layout for photos with larger thumbnails
              filteredPhotos.length === 0 ? (
                <p 
                  className="text-center text-gray-500 py-8 italic"
                  style={{ fontFamily: "'Courier Prime', monospace" }}
                >
                  No photos match this filter
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredPhotos.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setIsPreviewOpen(true)
                      const onClosePreview = () => setIsPreviewOpen(false)
                      const itemData = item as any
                      
                      // Open scene viewer or document viewer based on category
                      if (itemData.category === 'scene' && onPreviewScene) {
                        // Extract image index from the item id (format: sceneId_img_index)
                        const imageIndex = parseInt(itemData.id.split('_img_')[1] || '0')
                        onPreviewScene(itemData.sceneId, onClosePreview, imageIndex)
                      } else if (itemData.category === 'document' && onPreviewDocument) {
                        // Extract image index from the item id (format: docId_img_index)
                        const imageIndex = parseInt(itemData.id.split('_img_')[1] || '0')
                        onPreviewDocument(itemData.docId, onClosePreview, imageIndex)
                      }
                    }}
                    className={`group relative rounded-sm transition-all duration-200 cursor-pointer overflow-hidden
                      ${selectedEvidence.includes(item.id) 
                        ? 'ring-2 ring-[#d4af37]' 
                        : 'hover:ring-1 hover:ring-[#d4af37]/50'}`}
                    style={{
                      border: selectedEvidence.includes(item.id) 
                        ? '2px solid #d4af37' 
                        : '1px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: selectedEvidence.includes(item.id)
                        ? '0 0 20px rgba(212, 175, 55, 0.4)'
                        : '0 2px 8px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {/* Checkbox overlay */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleEvidence(item.id)
                      }}
                      className="absolute top-3 left-3 z-10"
                    >
                      <div 
                        className={`w-7 h-7 rounded-sm flex items-center justify-center transition-all cursor-pointer
                          ${selectedEvidence.includes(item.id) 
                            ? 'bg-[#d4af37] border-2 border-[#d4af37]' 
                            : 'border-2 border-white/80 bg-black/60 backdrop-blur-sm'}`}
                        style={{
                          boxShadow: selectedEvidence.includes(item.id)
                            ? '0 0 12px rgba(212, 175, 55, 0.6)'
                            : '0 2px 8px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {selectedEvidence.includes(item.id) && <CheckCircle className="w-5 h-5 text-black" />}
                      </div>
                    </div>

                    {/* Photo thumbnail */}
                    <div className="relative w-full aspect-[3/2] bg-[#0f0f0f]">
                      <Image
                        src={item.imageUrl || '/placeholder.jpg'}
                        alt={item.title}
                        fill
                        className="object-cover object-bottom"
                        sizes="400px"
                      />
                      {/* Hover overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
                        style={{
                          background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0.4) 100%)',
                        }}
                      />
                    </div>

                    {/* Title below */}
                    <div 
                      className={`p-3 transition-colors ${selectedEvidence.includes(item.id) ? 'bg-[#2a2520]' : 'bg-[#0f0f0f]'}`}
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon 
                          className={`w-4 h-4 flex-shrink-0 ${selectedEvidence.includes(item.id) ? 'text-[#d4af37]' : 'text-gray-500'}`}
                          style={{
                            filter: selectedEvidence.includes(item.id) ? 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))' : 'none',
                          }}
                        />
                        <span 
                          className={`font-bold text-sm ${selectedEvidence.includes(item.id) ? 'text-[#d4af37]' : 'text-gray-300'}`}
                          style={{ 
                            fontFamily: "'Courier Prime', monospace",
                            ...(selectedEvidence.includes(item.id) ? {
                              textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                            } : {}),
                          }}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )
            ) : (
              // List layout for documents
              <div className="space-y-3">
                {evidenceData.documents.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setIsPreviewOpen(true)
                      const onClosePreview = () => setIsPreviewOpen(false)
                      if (onPreviewDocument) {
                        onPreviewDocument(item.id, onClosePreview)
                      }
                    }}
                    className={`group relative p-4 rounded-sm transition-all duration-200 cursor-pointer
                      ${selectedEvidence.includes(item.id) 
                        ? 'bg-[#2a2520] ring-2 ring-[#d4af37]' 
                        : 'bg-[#0f0f0f] hover:bg-[#1a1a1a] hover:ring-1 hover:ring-[#d4af37]/50'}`}
                    style={{
                      border: selectedEvidence.includes(item.id) 
                        ? '2px solid #d4af37' 
                        : '1px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: selectedEvidence.includes(item.id)
                        ? '0 0 20px rgba(212, 175, 55, 0.4)'
                        : '0 2px 8px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleEvidence(item.id)
                        }}
                        className={`mt-1 w-5 h-5 rounded-sm flex items-center justify-center transition-all cursor-pointer
                        ${selectedEvidence.includes(item.id) 
                          ? 'bg-[#d4af37] border-2 border-[#d4af37]' 
                          : 'border-2 border-[#d4af37]/40 bg-[#1a1a1a]'}`}
                        style={{
                          boxShadow: selectedEvidence.includes(item.id)
                            ? '0 0 12px rgba(212, 175, 55, 0.6)'
                            : 'none',
                        }}
                      >
                        {selectedEvidence.includes(item.id) && <CheckCircle className="w-3 h-3 text-black" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText 
                            className={`w-4 h-4 ${selectedEvidence.includes(item.id) ? 'text-[#d4af37]' : 'text-gray-500'}`}
                            style={{
                              filter: selectedEvidence.includes(item.id) ? 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))' : 'none',
                            }}
                          />
                          <span 
                            className={`font-bold text-sm flex-1 ${selectedEvidence.includes(item.id) ? 'text-[#d4af37]' : 'text-gray-300'}`}
                            style={{ 
                              fontFamily: "'Courier Prime', monospace",
                              ...(selectedEvidence.includes(item.id) ? {
                                textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                              } : {}),
                            }}
                          >
                            {item.title}
                          </span>
                        </div>
                        <p 
                          className={`text-xs leading-relaxed ${selectedEvidence.includes(item.id) ? 'text-[#c5a065]' : 'text-gray-500'}`}
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div 
            className="p-4 bg-[#0f0f0f] text-xs text-[#c5a065] flex justify-between relative z-10"
            style={{
              fontFamily: "'Courier Prime', monospace",
              borderTop: '1px solid rgba(197, 160, 101, 0.3)',
              textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
            }}
          >
            <span>EVIDENCE SELECTED: {selectedEvidence.length}</span>
            <span>STATUS: OPEN</span>
          </div>
        </div>

        {/* RIGHT SIDE: Theory & Submissions (60%) */}
        <div 
          className="w-full md:w-[60%] flex flex-col bg-[#1a1a1a] relative h-full"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(18, 18, 18, 1) 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 12px,
                rgba(0, 0, 0, 0.15) 12px,
                rgba(0, 0, 0, 0.15) 13px
              )
            `,
          }}
        >

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Theory Input Section */}
            <div className="p-8 relative z-10">
              <h2 
                className="text-3xl font-bold text-[#d4af37] mb-6 flex items-center gap-3"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 8px rgba(212, 175, 55, 0.3)',
                  letterSpacing: '0.05em',
                }}
              >
                <FileText 
                  className="w-7 h-7 text-[#d4af37]" 
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))',
                  }}
                />
                DETECTIVE&apos;S LOG
              </h2>
              
              <p 
                className="text-sm text-[#c5a065] mb-6 leading-relaxed"
                style={{ 
                  fontFamily: "'Courier Prime', monospace",
                  textShadow: '0 0 4px rgba(197, 160, 101, 0.3)',
                }}
              >
                {currentStage === 'act_ii' 
                  ? 'Submit at least four artifacts that prove who committed the murder, where they did it and why.'
                  : 'Submit two artifacts that validate your theory proving Reginald\'s death was not an accident.'}
              </p>
              
              <div className="relative w-full" style={{ minHeight: '450px' }}>
                {/* The Input Container */}
                <div 
                  className="relative bg-[#0f0f0f] border-2 rounded-sm overflow-hidden flex flex-col p-6"
                  style={{ 
                    minHeight: '450px',
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6), 0 2px 12px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <textarea
                    value={theoryText}
                    onChange={(e) => setTheoryText(e.target.value)}
                    placeholder="Enter your theory here..."
                    className="flex-1 bg-transparent resize-none border-none focus:ring-0 text-[#e8e4da] text-base leading-7 placeholder:text-gray-600 relative z-10 outline-none"
                    style={{ 
                      minHeight: '300px',
                      fontFamily: "'Courier Prime', monospace",
                    }}
                  />

                  {/* Selected Artifacts Section */}
                  {selectedEvidence.length > 0 && (
                    <div className="relative z-10 mt-4 pt-4 border-t border-[#d4af37]/20">
                      <h4 
                        className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-3"
                        style={{ 
                          fontFamily: "'Courier Prime', monospace",
                          textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                        }}
                      >
                        Evidence Selected ({selectedEvidence.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedEvidence.map((artifactId, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm">
                            <span className="text-[#d4af37] font-bold">•</span>
                            <span 
                              className="text-[#c5a065]"
                              style={{ fontFamily: "'Courier Prime', monospace" }}
                            >
                              {getArtifactName(artifactId)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Previous Submissions */}
          {theoryHistory.length > 0 && (
            <div 
              className="min-h-[450px] bg-[#121212] p-6 flex flex-col relative z-10"
              style={{
                borderTop: '1px solid rgba(197, 160, 101, 0.3)',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3 
                className="text-sm font-bold text-[#d4af37] uppercase tracking-widest mb-4"
                style={{ 
                  fontFamily: "'Courier Prime', monospace",
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                }}
              >
                Previous Theories
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[375px]">
                {theoryHistory.slice().reverse().map((sub, idx) => (
                  <div 
                    key={idx} 
                    className="bg-[#0f0f0f] p-4 rounded-sm border-2 relative overflow-hidden group"
                    style={{
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span 
                        className="text-xs text-gray-500"
                        style={{ fontFamily: "'Courier Prime', monospace" }}
                      >
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                      <div 
                        className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border-2
                          ${sub.result === 'incorrect' ? 'bg-red-900/20 text-red-400 border-red-400' : 
                            sub.result === 'partial' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-400' : 
                            'bg-green-900/20 text-[#d4af37] border-[#d4af37]'}`}
                        style={{
                          fontFamily: "'Courier Prime', monospace",
                          boxShadow: sub.result === 'incorrect' 
                            ? '0 0 8px rgba(220, 38, 38, 0.3)'
                            : sub.result === 'partial'
                            ? '0 0 8px rgba(202, 138, 4, 0.3)'
                            : '0 0 8px rgba(212, 175, 55, 0.3)',
                        }}
                      >
                        {sub.result}
                      </div>
                    </div>
                    <p 
                      className="text-[#e8e4da] italic text-sm border-l-2 border-[#d4af37]/40 pl-3 mb-2"
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      &quot;{sub.description}&quot;
                    </p>
                    
                    {/* Artifacts Badge */}
                    {sub.artifactIds && sub.artifactIds.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setExpandedTheoryId(expandedTheoryId === sub.id ? null : sub.id)}
                          className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          <span 
                            className="px-2 py-1 bg-[#1a1a1a] border border-[#d4af37]/30 rounded-sm"
                            style={{
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
                            }}
                          >
                            📎 {sub.artifactIds.length} {sub.artifactIds.length === 1 ? 'artifact' : 'artifacts'}
                          </span>
                          <span className="text-[10px]">{expandedTheoryId === sub.id ? '▼' : '▶'}</span>
                        </button>
                        
                        {/* Expanded Artifacts List */}
                        {expandedTheoryId === sub.id && (
                          <div className="mt-2 pl-4 space-y-1">
                            {sub.artifactIds.map((artifactId, i) => (
                              <div 
                                key={i} 
                                className="text-xs text-gray-400 flex items-start gap-2"
                                style={{ fontFamily: "'Courier Prime', monospace" }}
                              >
                                <span className="text-[#d4af37] mt-0.5">•</span>
                                <span>{getArtifactName(artifactId)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Verdict Stamp Effect */}
                    <div 
                      className={`absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 font-black text-6xl uppercase pointer-events-none
                        ${sub.result === 'incorrect' ? 'text-red-400' : 
                          sub.result === 'partial' ? 'text-yellow-400' : 'text-[#d4af37]'}`}
                      style={{ fontFamily: "'Courier Prime', monospace" }}
                    >
                      {sub.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Submit Button Area - Always Visible */}
          <div 
            className="p-6 bg-[#0f0f0f] flex justify-between items-center relative z-10"
            style={{
              borderTop: '1px solid rgba(197, 160, 101, 0.3)',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            <button 
              onClick={onClose}
              className="bg-[#1a1a1a] hover:bg-[#2a2520] text-gray-400 hover:text-[#c5a065] px-6 py-3 rounded-sm font-bold tracking-wider transition-all duration-200 border-2 border-gray-700 hover:border-[#d4af37]/40"
              style={{
                fontFamily: "'Courier Prime', monospace",
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              Close
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || isGameCompleted}
              className="bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border-2 border-[#d4af37] px-8 py-3 rounded-sm flex items-center gap-2 font-bold tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'Courier Prime', monospace",
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(212, 175, 55, 0.1)',
                textShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
              }}
            >
              <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT THEORY'}</span>
              <ChevronRight 
                className="w-5 h-5"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))',
                }}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Quick Note Button */}
      <QuickNoteButton />
    </div>
    </>
  )
}

