"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FileText, Image as ImageIcon, CheckCircle, ChevronRight, X } from 'lucide-react'
import { useGameState } from '@/lib/hooks/useGameState'

interface ValidateTheoryProps {
  isOpen: boolean
  onClose: () => void
  onPreviewDocument?: (docId: string, onClosePreview: () => void) => void
  onPreviewScene?: (sceneId: string, onClosePreview: () => void) => void
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

export function ValidateTheory({ isOpen, onClose, onPreviewDocument, onPreviewScene }: ValidateTheoryProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'photos'>('documents')
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [theoryText, setTheoryText] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [expandedTheoryId, setExpandedTheoryId] = useState<string | null>(null)
  const { theoryHistory, addTheorySubmission, unlockedContent } = useGameState()
  
  // Evidence data - this will be populated from the game state
  const [evidenceData, setEvidenceData] = useState<{
    documents: EvidenceItem[]
    photos: EvidenceItem[]
  }>({
    documents: [],
    photos: []
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
            const sceneImages = scene.images || [scene.imageUrl]
            return sceneImages.map((imageUrl: string, idx: number) => ({
              id: `${scene.id}_img_${idx}`,
              title: `${scene.name}${sceneImages.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              type: 'photo' as const,
              desc: scene.description,
              imageUrl: imageUrl,
              images: sceneImages,
              sceneId: scene.id,
              category: 'scene'
            }))
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
        
        setEvidenceData({ documents: docs, photos })
      } catch (error) {
        console.error('Error loading evidence:', error)
      }
    }
    
    loadEvidence()
  }, [isOpen, unlockedContent])

  const toggleEvidence = (id: string) => {
    setSelectedEvidence(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
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
    if (!theoryText.trim()) {
      alert('Please write your theory before submitting.')
      return
    }
    
    if (selectedEvidence.length === 0) {
      alert('Please select at least one document or photo as evidence for your theory.')
      return
    }
    
    // For now, all theories are marked as "incorrect" until we implement validation logic
    // TODO: Implement actual theory validation against the correct solution
    addTheorySubmission({
      description: theoryText,
      artifactIds: selectedEvidence,
      result: 'incorrect',
      feedback: 'Theory recorded. Keep investigating to find more evidence.'
    })
    
    // Clear the form
    setTheoryText('')
    setSelectedEvidence([])
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ${isPreviewOpen ? 'invisible' : ''}`}
      onClick={onClose}
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Courier+Prime:wght@400;700&display=swap');
        
        .font-handwriting {
          font-family: 'Patrick Hand', cursive;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1ccc0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        .bg-noise {
           background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Main Container */}
      <div 
        className="max-w-6xl w-full bg-[#f4f1ea] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] border border-[#d1ccc0]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* LEFT SIDE: Evidence Selector (40%) */}
        <div className="w-full md:w-[40%] bg-[#e8e4da] border-r border-[#d1ccc0] flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-[#2c3e50] text-[#f4f1ea] flex justify-between items-center shadow-md z-10">
            <div>
              <h2 className="text-xl font-bold tracking-wider font-mono">CASE FILE: ASHCOMBE</h2>
              <p className="text-xs text-gray-400 mt-1 font-mono">HER-1886-0510-RA</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#dcd8ce] border-b border-[#d1ccc0]">
            {(['documents', 'photos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-200
                  ${activeTab === tab 
                    ? 'bg-[#e8e4da] text-[#d97706] border-b-2 border-[#d97706]' 
                    : 'text-[#5a6b7c] hover:bg-[#e0dcd4]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Evidence List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {evidenceData[activeTab].length === 0 ? (
              <p className="text-center text-[#5a6b7c] py-8 italic">No {activeTab} available yet</p>
            ) : activeTab === 'photos' ? (
              // Single column layout for photos with larger thumbnails
              <div className="space-y-3">
                {evidenceData.photos.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setIsPreviewOpen(true)
                      const onClosePreview = () => setIsPreviewOpen(false)
                      const itemData = item as any
                      
                      // Open scene viewer or document viewer based on category
                      if (itemData.category === 'scene' && onPreviewScene) {
                        onPreviewScene(itemData.sceneId, onClosePreview)
                      } else if (itemData.category === 'document' && onPreviewDocument) {
                        onPreviewDocument(itemData.docId, onClosePreview)
                      }
                    }}
                    className={`group relative rounded border-2 transition-all duration-200 cursor-pointer overflow-hidden
                      ${selectedEvidence.includes(item.id) 
                        ? 'border-[#d97706] shadow-md ring-2 ring-[#d97706]/30' 
                        : 'border-[#d1ccc0] hover:border-[#a0aec0]'}`}
                  >
                    {/* Checkbox overlay */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleEvidence(item.id)
                      }}
                      className="absolute top-3 left-3 z-10"
                    >
                      <div className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-colors cursor-pointer shadow-md
                        ${selectedEvidence.includes(item.id) ? 'bg-[#d97706] border-[#d97706]' : 'border-white bg-black/40 backdrop-blur-sm'}`}>
                        {selectedEvidence.includes(item.id) && <CheckCircle className="w-5 h-5 text-white" />}
                      </div>
                    </div>

                    {/* Photo thumbnail */}
                    <div className="relative w-full aspect-[3/2] bg-gray-200">
                      <Image
                        src={item.imageUrl || '/placeholder.jpg'}
                        alt={item.title}
                        fill
                        className="object-cover object-bottom"
                        sizes="400px"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                    </div>

                    {/* Title below */}
                    <div className={`p-3 transition-colors ${selectedEvidence.includes(item.id) ? 'bg-[#fffdf5]' : 'bg-[#f4f1ea]'}`}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#5a6b7c] flex-shrink-0" />
                        <span className="font-bold text-[#2c3e50] font-mono text-sm">{item.title}</span>
                      </div>
                    </div>
                    
                    {/* Vintage texture overlay effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-noise"></div>
                  </div>
                ))}
              </div>
            ) : (
              // List layout for documents (keep original)
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
                    className={`group relative p-4 rounded border-2 transition-all duration-200 cursor-pointer
                      ${selectedEvidence.includes(item.id) 
                        ? 'bg-[#fffdf5] border-[#d97706] shadow-md' 
                        : 'bg-[#f4f1ea] border-[#d1ccc0] hover:border-[#a0aec0]'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleEvidence(item.id)
                        }}
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer
                        ${selectedEvidence.includes(item.id) ? 'bg-[#d97706] border-[#d97706]' : 'border-[#a0aec0] bg-white'}`}>
                        {selectedEvidence.includes(item.id) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-[#5a6b7c]" />
                          <span className="font-bold text-[#2c3e50] font-mono text-sm flex-1">{item.title}</span>
                        </div>
                        <p className="text-xs text-[#5a6b7c] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    
                    {/* Vintage texture overlay effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-noise"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-[#d1ccc0] bg-[#e0dcd4] text-xs text-[#5a6b7c] font-mono flex justify-between">
            <span>EVIDENCE SELECTED: {selectedEvidence.length}</span>
            <span>STATUS: OPEN</span>
          </div>
        </div>

        {/* RIGHT SIDE: Theory & Submissions (60%) */}
        <div className="w-full md:w-[60%] flex flex-col bg-[#f4f1ea] relative">
          
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`}}>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Theory Input Section */}
            <div className="p-8 relative z-10">
              <h2 className="text-2xl font-bold text-[#2c3e50] mb-4 flex items-center gap-2 font-mono">
                <FileText className="w-5 h-5 text-[#d97706]" />
                DETECTIVE&apos;S LOG
              </h2>
              
              <div className="relative w-full transform -rotate-1 transition-transform hover:rotate-0 duration-300" style={{ minHeight: '450px' }}>
              {/* Paper Shadow */}
              <div className="absolute inset-0 bg-black/10 rounded-sm translate-y-2 translate-x-2 blur-sm"></div>
              
              {/* The Paper */}
              <div className="relative bg-[#fffdf5] border border-[#e2e8f0] shadow-sm p-8 rounded-sm overflow-hidden flex flex-col" style={{ minHeight: '450px' }}>
                {/* Paper Lines */}
                <div className="absolute inset-0 pointer-events-none" 
                     style={{
                       backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                       backgroundSize: '100% 2rem',
                       marginTop: '2.5rem'
                     }}>
                </div>
                
                {/* Red Margin Line */}
                <div className="absolute left-12 top-0 bottom-0 w-px bg-red-200 pointer-events-none"></div>

                <textarea
                  value={theoryText}
                  onChange={(e) => setTheoryText(e.target.value)}
                  placeholder="Enter your theory here... Who had the means, motive, and opportunity?"
                  className="flex-1 bg-transparent resize-none border-none focus:ring-0 text-[#2c3e50] text-xl leading-8 pl-6 font-handwriting placeholder:text-gray-300 relative z-10 outline-none"
                  style={{ minHeight: '300px' }}
                />

                {/* Selected Artifacts Section - Same Paper */}
                {selectedEvidence.length > 0 && (
                  <div className="relative z-10 pl-6 mt-4 pt-4">
                    <h4 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wider mb-3 font-mono">
                      Evidence Selected ({selectedEvidence.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedEvidence.map((artifactId, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className="text-[#d97706] font-bold">•</span>
                          <span className="text-[#2c3e50] font-mono">{getArtifactName(artifactId)}</span>
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
            <div className="min-h-[450px] bg-[#e8e4da] border-t border-[#d1ccc0] p-6 flex flex-col relative z-10">
              <h3 className="text-sm font-bold text-[#5a6b7c] uppercase tracking-widest mb-4 font-mono">Previous Theories</h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[375px]">
                {theoryHistory.slice().reverse().map((sub, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-sm border border-[#d1ccc0] shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-gray-400">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border
                        ${sub.result === 'incorrect' ? 'bg-red-50 text-red-700 border-red-200' : 
                          sub.result === 'partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-green-50 text-green-700 border-green-200'}`}>
                        {sub.result}
                      </div>
                    </div>
                    <p className="text-[#2c3e50] font-serif italic text-sm border-l-2 border-gray-200 pl-3 mb-2">&quot;{sub.description}&quot;</p>
                    
                    {/* Artifacts Badge */}
                    {sub.artifactIds && sub.artifactIds.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setExpandedTheoryId(expandedTheoryId === sub.id ? null : sub.id)}
                          className="flex items-center gap-2 text-xs font-mono text-[#5a6b7c] hover:text-[#d97706] transition-colors"
                        >
                          <span className="px-2 py-1 bg-[#e8e4da] border border-[#d1ccc0] rounded">
                            📎 {sub.artifactIds.length} {sub.artifactIds.length === 1 ? 'artifact' : 'artifacts'}
                          </span>
                          <span className="text-[10px]">{expandedTheoryId === sub.id ? '▼' : '▶'}</span>
                        </button>
                        
                        {/* Expanded Artifacts List */}
                        {expandedTheoryId === sub.id && (
                          <div className="mt-2 pl-4 space-y-1">
                            {sub.artifactIds.map((artifactId, i) => (
                              <div key={i} className="text-xs font-mono text-[#5a6b7c] flex items-start gap-2">
                                <span className="text-[#d97706] mt-0.5">•</span>
                                <span>{getArtifactName(artifactId)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Verdict Stamp Effect */}
                    <div className={`absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 font-black text-6xl uppercase pointer-events-none
                      ${sub.result === 'incorrect' ? 'text-red-900' : 
                        sub.result === 'partial' ? 'text-yellow-900' : 'text-green-900'}`}>
                      {sub.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Submit Button Area - Always Visible */}
          <div className="p-6 border-t border-[#d1ccc0] bg-[#e8e4da] flex justify-between items-center relative z-10">
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded shadow-lg font-bold tracking-wider transition-all"
            >
              Close
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-3 rounded shadow-lg flex items-center gap-2 font-bold tracking-wider transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <span>SUBMIT THEORY</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

