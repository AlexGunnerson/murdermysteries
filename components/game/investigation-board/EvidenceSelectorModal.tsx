"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { X, Image as ImageIcon, FileText } from 'lucide-react'
import { useGameState } from '@/lib/hooks/useGameState'

interface PhotoItem {
  id: string
  title: string
  imageUrl: string
  images: string[]
  sceneId?: string
  docId?: string
  category: 'scene' | 'document'
}

interface DocumentItem {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  images?: string[]
  documentUrl?: string
  isLetter?: boolean
  isHTML?: boolean
}

interface UnlockedContent {
  scenes: Set<string>
  records: Set<string>
}

interface EvidenceSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'photos' | 'documents'
  unlockedContent: UnlockedContent
  caseId: string
}

export function EvidenceSelectorModal({ isOpen, onClose, initialTab = 'photos', unlockedContent, caseId }: EvidenceSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'documents'>(initialTab)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [photoFilter, setPhotoFilter] = useState<string>('all')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const { viewedDocuments } = useGameState()

  // Reset to initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Load photos and documents from metadata
  useEffect(() => {
    if (!isOpen) return

    async function loadEvidence() {
      try {
        const response = await fetch(`/cases/${caseId}/metadata.json`)
        const data = await response.json()

        // Load scene photos
        const scenePhotos = data.locations
          .filter((scene: any) => scene.initiallyAvailable || unlockedContent.scenes.has(scene.id))
          .flatMap((scene: any) => {
            const sceneImages = scene.images || [scene.imageUrl]
            return sceneImages.map((imageUrl: string, idx: number) => ({
              id: `${scene.id}_img_${idx}`,
              title: `${scene.name}${sceneImages.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              imageUrl: imageUrl,
              images: sceneImages,
              sceneId: scene.id,
              category: 'scene' as const,
            }))
          })

        // Load document photos (image-based documents like gala photos)
        const documentPhotos = data.records
          .filter((doc: any) => (doc.initiallyAvailable || unlockedContent.records.has(doc.id)) && doc.images && doc.images.length > 0)
          .flatMap((doc: any) => {
            return doc.images.map((imageUrl: string, idx: number) => ({
              id: `${doc.id}_img_${idx}`,
              title: `${doc.name}${doc.images.length > 1 ? ` - Image ${idx + 1}` : ''}`,
              imageUrl: imageUrl,
              images: doc.images,
              docId: doc.id,
              category: 'document' as const,
            }))
          })

        setPhotos([...scenePhotos, ...documentPhotos])

        // Load documents (exclude photo-only documents)
        const docItems = data.records
          .filter((doc: any) => {
            // Include if initially available or unlocked
            const isAvailable = doc.initiallyAvailable || unlockedContent.records.has(doc.id) || viewedDocuments.has(doc.id)
            // Exclude if it's only a photo gallery (multiple images but no other content)
            const isPhotoOnly = doc.images && doc.images.length > 1 && !doc.content && !doc.isLetter && !doc.isHTML && !doc.documentUrl
            return isAvailable && !isPhotoOnly
          })
          .map((doc: any) => ({
            id: doc.id,
            title: doc.name,
            description: doc.description,
            thumbnailUrl: doc.images?.[0] || doc.documentUrl,
            images: doc.images,
            documentUrl: doc.documentUrl,
            isLetter: doc.isLetter,
            isHTML: doc.isHTML,
          }))

        setDocuments(docItems)
      } catch (error) {
        console.error('Error loading evidence:', error)
      }
    }

    loadEvidence()
  }, [isOpen, unlockedContent, caseId, viewedDocuments])

  // Get unique locations for filtering
  const photoLocations = useMemo(() => {
    return Array.from(new Set(photos.map(p => {
      // Extract base location name (remove " - Image X" suffix)
      return p.title.replace(/ - Image \d+$/, '')
    }))).sort()
  }, [photos])

  // Filter photos based on selected filter
  const filteredPhotos = useMemo(() => {
    if (photoFilter === 'all') {
      return photos
    }
    return photos.filter(p => {
      const baseTitle = p.title.replace(/ - Image \d+$/, '')
      return baseTitle === photoFilter
    })
  }, [photos, photoFilter])

  const handlePhotoDragStart = (photo: PhotoItem, e: React.DragEvent) => {
    e.dataTransfer.setData('application/photo', JSON.stringify({
      id: photo.id,
      imageUrl: photo.imageUrl,
      title: photo.title,
      sceneId: photo.sceneId,
      docId: photo.docId,
      category: photo.category,
    }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDocumentDragStart = (doc: DocumentItem, e: React.DragEvent) => {
    e.dataTransfer.setData('application/document', JSON.stringify({
      documentId: doc.id,
      title: doc.title,
      description: doc.description,
      thumbnailUrl: doc.thumbnailUrl,
      images: doc.images,
      documentUrl: doc.documentUrl,
      isLetter: doc.isLetter,
      isHTML: doc.isHTML,
    }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-start"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal Panel */}
      <div
        className="relative h-full w-[400px] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
          borderRight: '1px solid rgba(107, 114, 128, 0.5)',
          boxShadow: '4px 0 16px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(107, 114, 128, 0.5)' }}
        >
          <h2
            className="text-lg font-semibold text-gray-300"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            EVIDENCE GALLERY
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-700/50 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'rgba(107, 114, 128, 0.5)' }}>
          {(['photos', 'documents'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                if (tab === 'photos') setPhotoFilter('all')
              }}
              className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors relative
                ${activeTab === tab
                  ? 'bg-gray-700/50 text-gray-200'
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/30 hover:text-gray-300'
                }`}
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              <div className="flex items-center justify-center gap-2">
                {tab === 'photos' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {tab}
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Photos Tab Content */}
        {activeTab === 'photos' && (
          <>
            {/* Photo Filters */}
            {photoLocations.length > 0 && (
              <div className="p-3 border-b" style={{ borderColor: 'rgba(107, 114, 128, 0.5)' }}>
                <div className="flex flex-wrap gap-2">
                  {/* All button - always visible */}
                  <button
                    onClick={() => setPhotoFilter('all')}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors
                      ${photoFilter === 'all'
                        ? 'bg-gray-600/30 text-gray-200 shadow-inner border border-gray-600/50'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-gray-200 border border-gray-700'
                      }`}
                  >
                    All ({photos.length})
                  </button>

                  {/* Show first 3 locations or all if expanded */}
                  {(showAllFilters ? photoLocations : photoLocations.slice(0, 3)).map(location => {
                    const count = photos.filter(p => {
                      const baseTitle = p.title.replace(/ - Image \d+$/, '')
                      return baseTitle === location
                    }).length

                    return (
                      <button
                        key={location}
                        onClick={() => setPhotoFilter(location)}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors
                          ${photoFilter === location
                            ? 'bg-gray-600/30 text-gray-200 shadow-inner border border-gray-600/50'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-gray-200 border border-gray-700'
                          }`}
                      >
                        {location} ({count})
                      </button>
                    )
                  })}

                  {/* More/Less button if there are more than 3 locations */}
                  {photoLocations.length > 3 && (
                    <button
                      onClick={() => setShowAllFilters(!showAllFilters)}
                      className="px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-gray-200 border border-gray-700"
                    >
                      {showAllFilters ? '▲ Less' : `▼ More (${photoLocations.length - 3})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Photos List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 custom-scrollbar">
              {filteredPhotos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-14 h-14 mx-auto mb-3 opacity-30" />
                  <p
                    className="text-sm"
                    style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
                  >
                    {photos.length === 0
                      ? 'No photos discovered yet.\nKeep investigating!'
                      : 'No photos match this filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPhotos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onDragStart={(e) => handlePhotoDragStart(photo, e)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div
              className="p-3 border-t text-xs text-gray-400"
              style={{
                borderColor: 'rgba(107, 114, 128, 0.5)',
                fontFamily: "'Courier Prime', 'Courier New', monospace"
              }}
            >
              Drag photos onto the board to add them to your investigation
            </div>
          </>
        )}

        {/* Documents Tab Content */}
        {activeTab === 'documents' && (
          <>
            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 custom-scrollbar">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-14 h-14 mx-auto mb-3 opacity-30" />
                  <p
                    className="text-sm"
                    style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
                  >
                    No documents discovered yet.\nKeep investigating!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onDragStart={(e) => handleDocumentDragStart(doc, e)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div
              className="p-3 border-t text-xs text-gray-400"
              style={{
                borderColor: 'rgba(107, 114, 128, 0.5)',
                fontFamily: "'Courier Prime', 'Courier New', monospace"
              }}
            >
              Drag documents onto the board to organize your evidence
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  )
}

interface PhotoCardProps {
  photo: PhotoItem
  onDragStart: (event: React.DragEvent) => void
}

function PhotoCard({ photo, onDragStart }: PhotoCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(e)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        group relative rounded cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        border-2 border-gray-600/50 hover:border-gray-400 hover:shadow-lg
      `}
      style={{
        background: 'rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Photo thumbnail */}
      <div className="relative w-full aspect-[3/2] bg-gray-800">
        <Image
          src={photo.imageUrl}
          alt={photo.title}
          fill
          className="object-cover object-center"
          sizes="400px"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
      </div>

      {/* Title below */}
      <div className="p-3 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-bold text-gray-200 font-mono text-sm line-clamp-2">{photo.title}</span>
        </div>
      </div>
    </div>
  )
}

interface DocumentCardProps {
  document: DocumentItem
  onDragStart: (event: React.DragEvent) => void
}

function DocumentCard({ document, onDragStart }: DocumentCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(e)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        group relative rounded cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        border-2 border-gray-600/50 hover:border-gray-400 hover:shadow-lg
      `}
      style={{
        background: 'rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Document thumbnail or icon */}
      <div className="relative w-full aspect-[3/2] bg-gray-800 flex items-center justify-center">
        {document.thumbnailUrl ? (
          <Image
            src={document.thumbnailUrl}
            alt={document.title}
            fill
            className="object-cover object-top"
            sizes="400px"
          />
        ) : (
          <FileText className="w-16 h-16 text-gray-500" />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
      </div>

      {/* Title and description below */}
      <div className="p-3 bg-gray-900/50">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-200 font-mono text-sm line-clamp-1">{document.title}</div>
            <div className="text-xs text-gray-400 font-mono line-clamp-2 mt-1">{document.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
