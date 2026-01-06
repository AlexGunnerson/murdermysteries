"use client"

import { useState, useEffect } from "react"
import { useGameState } from "@/lib/hooks/useGameState"
import { VeronicaLetter } from "@/components/game/VeronicaLetter"
import { VeronicaThankYouNote } from "@/components/game/VeronicaThankYouNote"
import { CallLog } from "@/components/game/CallLog"
import { SpeechNotes } from "@/components/game/SpeechNotes"
import { BoardHeader } from "@/components/game/BoardHeader"
import Image from "next/image"
import { X } from "lucide-react"
import { BoardSection } from "./detective-board/BoardSection"
import { PolaroidPhoto } from "./detective-board/PolaroidPhoto"
import { PortraitFrame } from "./detective-board/PortraitFrame"
import { PinnedPhoto } from "./detective-board/PinnedPhoto"
import { TypewrittenLabel } from "./detective-board/TypewrittenLabel"
import { DocumentCard } from "./detective-board/DocumentCard"
import { DocumentStack } from "./detective-board/DocumentStack"
import { StickyNote } from "./detective-board/StickyNote"
import { SuspectCard } from "./detective-board/SuspectCard"
import { VictimCard } from "./detective-board/VictimCard"
import { SceneViewer } from "./detective-board/SceneViewer"
import { DocumentViewer } from "./detective-board/DocumentViewer"
import { DocumentHTMLViewer } from "./detective-board/DocumentHTMLViewer"
import { BlackmailViewer } from "./detective-board/BlackmailViewer"
import { BlackmailSceneViewer } from "./detective-board/BlackmailSceneViewer"
import { SecurityFootageViewer } from "./detective-board/SecurityFootageViewer"
import { PaintingBackViewer } from "./detective-board/PaintingBackViewer"
import { ValeNotesPage1, ValeNotesPage2 } from "./documents/ValeNotesDocs"
import { ValidateTheory } from "./ValidateTheory"

interface Suspect {
  id: string
  name: string
  age: number
  role: string
  portraitUrl: string
  veronicaNote: string
}

interface Scene {
  id: string
  name: string
  description: string
  imageUrl: string
  images: string[]
  initiallyAvailable?: boolean
}

interface Document {
  id: string
  name: string
  description: string
  documentUrl?: string
  images?: string[]
  content?: string
  isLetter?: boolean
  initiallyAvailable?: boolean
}

interface DetectiveNotebookProps {
  onAction: (action: string) => void
  onOpenMenu: () => void
}

export function DetectiveNotebook({ onAction, onOpenMenu }: DetectiveNotebookProps) {
  const { discoveredFacts, theoryHistory, chatHistory, unlockedContent, revealedContent, markLetterAsRead, detectivePoints, hasReadVeronicaLetter, revealSuspect, addDiscoveredFact } = useGameState()
  const [showVeronicaLetter, setShowVeronicaLetter] = useState(false)
  const [showThankYouNote, setShowThankYouNote] = useState(false)
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedSuspectForReveal, setSelectedSuspectForReveal] = useState<Suspect | null>(null)
  const [showVictimCard, setShowVictimCard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showBlackmailViewer, setShowBlackmailViewer] = useState(false)
  const [showBlackmailSceneViewer, setShowBlackmailSceneViewer] = useState(false)
  const [showSecurityFootage, setShowSecurityFootage] = useState(false)
  const [securityFootageImages, setSecurityFootageImages] = useState<string[]>([])
  const [showValeNotes, setShowValeNotes] = useState(false)
  const [showCallLog, setShowCallLog] = useState(false)
  const [showSpeechNotes, setShowSpeechNotes] = useState(false)
  const [showValidateTheory, setShowValidateTheory] = useState(false)
  const [onPreviewClose, setOnPreviewClose] = useState<(() => void) | null>(null)
  const [showPaintingBack, setShowPaintingBack] = useState(false)

  // Load suspect and scene data from metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const response = await fetch('/cases/case01/metadata.json')
        const data = await response.json()
        
        // Get all suspects including Veronica
        const allSuspects = data.suspects.map((s: any) => {
          const ageMatch = s.bio.match(/(\d+) years old/)
          
          // Customize role for Martin
          let role = s.role
          if (s.id === 'suspect_martin') {
            role = 'The Brother'
          }
          
          return {
            id: s.id,
            name: s.name,
            age: ageMatch ? parseInt(ageMatch[1]) : 0,
            role: role,
            portraitUrl: s.portraitUrl,
            veronicaNote: s.veronicaNote
          }
        })
        
        const allScenes = data.locations.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl,
          images: s.images || [s.imageUrl],
          initiallyAvailable: s.initiallyAvailable
        }))

        const allDocuments = data.records.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          documentUrl: r.documentUrl,
          images: r.images || (r.documentUrl ? [r.documentUrl] : []),
          content: r.content,
          isLetter: r.isLetter,
          initiallyAvailable: r.initiallyAvailable
        }))
        
        setSuspects(allSuspects)
        setScenes(allScenes)
        setDocuments(allDocuments)
      } catch (error) {
        console.error('Failed to load metadata:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadMetadata()
  }, [])

  const handleCloseLetter = () => {
    setShowVeronicaLetter(false)
    markLetterAsRead()
    if (onPreviewClose) {
      onPreviewClose()
      setOnPreviewClose(null)
    }
  }

  const handleSuspectClick = (suspect: Suspect) => {
    setSelectedSuspectForReveal(suspect)
  }

  const handleCloseSuspectCard = () => {
    if (selectedSuspectForReveal && !revealedContent.suspects.has(selectedSuspectForReveal.id)) {
      // Mark as revealed
      revealSuspect(selectedSuspectForReveal.id)
      
      // Add suspect info to discovered facts
      addDiscoveredFact({
        content: `${selectedSuspectForReveal.name} - ${selectedSuspectForReveal.role}: ${selectedSuspectForReveal.veronicaNote}`,
        source: 'record',
        sourceId: selectedSuspectForReveal.id
      })
    }
    setSelectedSuspectForReveal(null)
  }

  const handleVictimClick = () => {
    setShowVictimCard(true)
  }

  const handleCloseVictimCard = () => {
    if (!revealedContent.suspects.has('victim_reginald')) {
      // Mark as revealed
      revealSuspect('victim_reginald')
      
      // Add victim info to discovered facts
      addDiscoveredFact({
        content: `Reginald Ashcombe (68) - Patriarch & Philanthropist: Built the Ashcombe fortune through strategic investments in global commodities. Known for his annual charity gala and quiet devotion to his wife, Veronica.`,
        source: 'record',
        sourceId: 'victim_reginald'
      })
    }
    setShowVictimCard(false)
  }

  // Show scenes that are either initially available OR have been unlocked
  const unlockedScenes = scenes.filter(scene => 
    scene.initiallyAvailable || unlockedContent.scenes.has(scene.id)
  )
  // Show documents that are either initially available OR have been unlocked
  const unlockedDocuments = documents.filter(doc => 
    doc.initiallyAvailable || unlockedContent.records.has(doc.id)
  )
  const chatSuspects = Array.from(new Set(chatHistory.map(msg => msg.suspectId)))

  if (showVeronicaLetter) {
    return (
      <div className="relative">
        <button
          onClick={handleCloseLetter}
          className="absolute top-4 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
        >
          ← Back to Board
        </button>
        <VeronicaLetter onBeginInvestigation={handleCloseLetter} />
      </div>
    )
  }

  if (showThankYouNote) {
    return <VeronicaThankYouNote onClose={() => {
      setShowThankYouNote(false)
      if (onPreviewClose) {
        onPreviewClose()
        setOnPreviewClose(null)
      }
    }} />
  }

  if (showCallLog) {
    return <CallLog onClose={() => {
      setShowCallLog(false)
      if (onPreviewClose) {
        onPreviewClose()
        setOnPreviewClose(null)
      }
    }} />
  }

  if (showSpeechNotes) {
    return <SpeechNotes onClose={() => {
      setShowSpeechNotes(false)
      if (onPreviewClose) {
        onPreviewClose()
        setOnPreviewClose(null)
      }
    }} />
  }

  return (
    <>
      {/* Header Bar */}
      <BoardHeader 
        detectivePoints={detectivePoints}
        hasUnreadMessage={!hasReadVeronicaLetter}
        onOpenMessage={() => setShowVeronicaLetter(true)}
        onOpenMenu={onOpenMenu}
        onOpenHelp={() => onAction('help')}
        onGetClue={() => onAction('clue')}
        onSolveMurder={() => setShowValidateTheory(true)}
      />

      {/* Board */}
      <div 
        className="min-h-screen p-4 md:p-6 overflow-y-auto"
        style={{
          backgroundColor: '#8B7355',
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0,0,0,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,0,0,0.03) 0%, transparent 50%),
            url("/cases/case01/images/ui/corkboard.jpg")
          `,
          backgroundSize: '512px 512px',
          backgroundRepeat: 'repeat'
        }}
      >
        <style jsx>{`
          .case-file-tab {
            background: linear-gradient(to bottom, #d4a574 0%, #c9995e 100%);
            border: 1px solid #8b6f47;
            border-radius: 8px 8px 0 0;
            padding: 12px 32px;
            display: inline-block;
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.3);
            position: relative;
            margin-left: 2rem;
            font-family: 'Courier Prime', 'Courier New', monospace;
          }
          
          .case-file-tab::before,
          .case-file-tab::after {
            content: '';
            position: absolute;
            bottom: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to bottom, #b8956a 0%, #a37f52 100%);
          }
          
          .case-file-tab::before {
            left: -20px;
            border-radius: 8px 0 0 0;
            transform: skewX(-10deg);
            border-left: 1px solid #8b6f47;
            border-top: 1px solid #8b6f47;
          }
          
          .case-file-tab::after {
            right: -20px;
            border-radius: 0 8px 0 0;
            transform: skewX(10deg);
            border-right: 1px solid #8b6f47;
            border-top: 1px solid #8b6f47;
          }
          
          .case-file-label {
            font-size: 0.7rem;
            letter-spacing: 2px;
            color: #3e2723;
            font-weight: 700;
            text-transform: uppercase;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          
          .case-file-title {
            font-size: 1.1rem;
            color: #2c1810;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          
          @media (max-width: 768px) {
            .case-file-tab {
              margin-left: 0.5rem;
              padding: 8px 20px;
            }
            
            .case-file-label {
              font-size: 0.6rem;
            }
            
            .case-file-title {
              font-size: 0.9rem;
            }
          }
        `}</style>

        <div className="max-w-7xl mx-auto">
          {/* Case File Tab */}
          <div className="case-file-tab mb-2">
            <div className="case-file-label">Case File:</div>
            <div className="case-file-title">The Final Gala at the Ashcombe Estate</div>
          </div>

        {/* Objective Banner */}
        <div 
          className="relative bg-[#fef8e0] p-8 mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          style={{ 
            transform: 'rotate(-0.8deg)',
            backgroundImage: `
              linear-gradient(to bottom, transparent 95%, rgba(150, 150, 150, 0.1) 100%),
              linear-gradient(to bottom, rgba(250, 240, 200, 0.5) 0%, transparent 100%)
            `
          }}
        >
          {/* Push pin at top */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full shadow-md"
            style={{
              boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 2px rgba(0,0,0,0.2)'
            }}
          />
          
          <h2 
            className="text-3xl text-gray-800 mb-4 font-bold"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Objective
          </h2>
          <p 
            className="text-2xl text-gray-900 leading-relaxed"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Veronica Ashcombe believes her husband&apos;s death was <span className="font-bold text-red-700">not an accident</span>. 
            Your task is to investigate and provide <span className="font-bold text-blue-800">evidence or develop a theory</span> that 
            supports her suspicion of foul play.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* The Victim - Pinned Photo */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <TypewrittenLabel text="THE VICTIM" rotating={-1} />
            <PinnedPhoto
              imageUrl="/cases/case01/images/portraits/reginald.png"
              name="Reginald"
              subtitle="The Victim"
              onClick={handleVictimClick}
              rotating={1.5}
              isRevealed={revealedContent.suspects.has('victim_reginald')}
              pushpinColor="black"
            />
          </div>

          {/* People of Interest - Pinned Photos */}
          <div className="md:col-span-2 mb-12">
            <div className="flex justify-center mb-6">
              <TypewrittenLabel text="PEOPLE OF INTEREST" rotating={0.5} />
            </div>
            {suspects.length === 0 ? (
              <p className="text-gray-600 text-center py-8 italic">Loading suspects...</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-16 py-8">
                {suspects.slice(0, 5).map((suspect, idx) => {
                  // Special handling for Dr. Vale to show "Dr. Vale" instead of just "Vale"
                  let displayName = suspect.name.split(' ')[0]
                  if (suspect.id === 'suspect_vale') {
                    displayName = 'Dr. Vale'
                  }
                  
                  return (
                    <PinnedPhoto
                      key={suspect.id}
                      imageUrl={suspect.portraitUrl}
                      name={displayName}
                      subtitle={suspect.role}
                      rotating={[-2, 1.5, -1, 2, -1.5][idx % 5]}
                      isRevealed={revealedContent.suspects.has(suspect.id)}
                      onClick={() => handleSuspectClick(suspect)}
                      pushpinColor="red"
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="flex flex-col items-center gap-4" style={{ marginTop: '-380px' }}>
            <TypewrittenLabel text="DOCUMENTS" rotating={1} />
            <DocumentStack
              documents={[
                {
                  id: 'veronica_letter',
                  name: "Veronica's Letter",
                  description: "May 11th, 1986 - Ashcombe Manor",
                  onClick: () => setShowVeronicaLetter(true)
                },
                ...unlockedDocuments.map(doc => ({
                  id: doc.id,
                  name: doc.name,
                  description: doc.description,
                  onClick: () => {
                    // Check if it's Veronica's thank you note
                    if (doc.id === 'record_veronica_thankyou') {
                      setShowThankYouNote(true)
                    }
                    // Check if it's Dr. Vale's medical notes
                    else if (doc.id === 'record_vale_notes') {
                      setShowValeNotes(true)
                    }
                    // Check if it's the call log
                    else if (doc.id === 'record_phone_logs') {
                      setShowCallLog(true)
                    }
                    // Check if it's speech notes
                    else if (doc.id === 'record_speech_notes') {
                      setShowSpeechNotes(true)
                    }
                    // Check if it's security footage
                    else if (doc.id === 'record_security_footage') {
                      setSecurityFootageImages(doc.images || [])
                      setShowSecurityFootage(true)
                    }
                    // Check if it's blackmail documents (scene version)
                    else if (doc.id === 'record_blackmail_floor') {
                      setShowBlackmailSceneViewer(true)
                    }
                    // Check if it's blackmail documents (portrait version)
                    else if (doc.id === 'record_blackmail_portrait') {
                      setShowBlackmailViewer(true)
                    }
                    // Otherwise open image viewer if document has images
                    else if (doc.images && doc.images.length > 0) {
                      setSelectedDocument(doc)
                    }
                  }
                }))
              ]}
              rotating={1.5}
            />
          </div>

          {/* Scenes */}
          <div className="col-span-full mb-12">
            <div className="flex justify-center mb-6">
              <TypewrittenLabel text="INVESTIGATE SCENES" rotating={-0.5} />
            </div>

            {unlockedScenes.length === 0 ? (
              <p className="text-gray-700 text-center py-8 italic font-['Courier_Prime']">
                No scenes investigated yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-6xl mx-auto">
                {unlockedScenes.map((scene, idx) => (
                  <PolaroidPhoto
                    key={scene.id}
                    imageUrl={scene.imageUrl}
                    title={scene.name}
                    onClick={() => setSelectedScene(scene)}
                    rotating={[-2, 1, -1, 2, -1.5, 1.5][idx % 6]}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Facts */}
          <BoardSection 
            title="Facts Discovered" 
            icon="📋"
            rotating={-0.3}
            className="md:col-span-2"
          >
            {discoveredFacts.length === 0 ? (
              <p className="text-gray-600 text-center py-8 italic">
                No facts discovered yet. Begin investigating to uncover clues!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {discoveredFacts.map((fact, idx) => (
                  <StickyNote
                    key={fact.id}
                    content={fact.content}
                    source={fact.sourceId === 'veronica_letter' ? "Veronica's Letter" : fact.sourceId}
                    rotating={[
                      -1.5, 0.5, -0.5, 1, -2, 1.5, -1, 0.5
                    ][idx % 8]}
                    color={['yellow', 'blue', 'pink', 'green'][idx % 4] as any}
                  />
                ))}
              </div>
            )}
          </BoardSection>

          {/* Theory Submission */}
          <BoardSection 
            title="Validate Theory" 
            icon="💭"
            onClick={() => onAction('validate')}
            rotating={0.7}
            className="relative group"
          >
            {/* DP Cost Badge */}
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              -3 DP
            </div>

            {/* Hover hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-gray-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                Click to Submit Theory
              </span>
            </div>

            <div className="text-center py-8">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-sm text-gray-700 mb-4">
                Submit your theory when ready
              </p>
              {theoryHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-xs text-gray-600">
                    Theories submitted: {theoryHistory.length}
                  </p>
                </div>
              )}
            </div>
          </BoardSection>
        </div>
      </div>
      </div>

      {/* Scene Viewer with Navigation */}
      {selectedScene && (
        <SceneViewer
          sceneName={selectedScene.name}
          images={selectedScene.images}
          sceneId={selectedScene.id}
          onClose={() => {
            setSelectedScene(null)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
          onOpenDocument={(documentId) => {
            // Close scene viewer
            setSelectedScene(null)
            
            // Open the requested document
            if (documentId === 'record_security_footage') {
              // Find and open the security footage with custom viewer
              const doc = documents.find(d => d.id === documentId)
              if (doc && doc.images) {
                setSecurityFootageImages(doc.images)
                setShowSecurityFootage(true)
              }
            } else if (documentId === 'painting_back') {
              // Open the painting back viewer
              setShowPaintingBack(true)
            }
          }}
        />
      )}

      {/* Document Viewer with Navigation */}
      {selectedDocument && selectedDocument.images && selectedDocument.images.length > 0 && (
        <DocumentViewer
          documentName={selectedDocument.name}
          images={selectedDocument.images}
          onClose={() => {
            setSelectedDocument(null)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
        />
      )}

      {/* Blackmail Document Viewer (Portrait - Complete) */}
      {showBlackmailViewer && (
        <BlackmailViewer
          onClose={() => {
            setShowBlackmailViewer(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
        />
      )}

      {/* Blackmail Document Viewer (Scene - Missing Vale) */}
      {showBlackmailSceneViewer && (
        <BlackmailSceneViewer
          onClose={() => {
            setShowBlackmailSceneViewer(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
        />
      )}

      {/* Security Footage Viewer */}
      {showSecurityFootage && (
        <SecurityFootageViewer
          images={securityFootageImages}
          onClose={() => {
            setShowSecurityFootage(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
        />
      )}

      {/* Painting Back Viewer */}
      {showPaintingBack && (
        <PaintingBackViewer
          imagePath="/cases/case01/images/scenes/Scene 5 - Master Bedroom/painting_back.png"
          onClose={() => {
            setShowPaintingBack(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
          onOpenBlackmail={() => {
            setShowPaintingBack(false)
            setShowBlackmailViewer(true)
          }}
        />
      )}

      {/* Dr. Vale's Medical Notes Viewer */}
      {showValeNotes && (
        <DocumentHTMLViewer
          documentName="Dr. Vale's Medical Notes"
          pages={[
            {
              label: "PAGE 1 OF 2",
              content: <ValeNotesPage1 />
            },
            {
              label: "PAGE 2 OF 2",
              content: <ValeNotesPage2 />
            }
          ]}
          onClose={() => {
            setShowValeNotes(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
          }}
        />
      )}

      {/* Suspect Reveal Card Modal */}
      {selectedSuspectForReveal && (
        <SuspectCard
          suspect={selectedSuspectForReveal}
          onClose={handleCloseSuspectCard}
        />
      )}

      {/* Victim Card Modal */}
      {showVictimCard && (
        <VictimCard
          onClose={handleCloseVictimCard}
        />
      )}

      {/* Validate Theory Modal */}
      {showValidateTheory && (
        <ValidateTheory
          isOpen={showValidateTheory}
          onClose={() => setShowValidateTheory(false)}
          onPreviewDocument={(docId, onCloseCallback) => {
            setOnPreviewClose(() => onCloseCallback)
            // Handle different document types
            if (docId === 'veronica_letter') {
              setShowVeronicaLetter(true)
            } else if (docId === 'record_veronica_thankyou') {
              setShowThankYouNote(true)
            } else if (docId === 'record_vale_notes') {
              setShowValeNotes(true)
            } else if (docId === 'record_security_footage') {
              const doc = documents.find(d => d.id === docId)
              if (doc && doc.images) {
                setSecurityFootageImages(doc.images)
                setShowSecurityFootage(true)
              }
            } else if (docId === 'record_blackmail_portrait') {
              setShowBlackmailViewer(true)
            } else if (docId === 'record_blackmail_floor') {
              setShowBlackmailSceneViewer(true)
            } else if (docId === 'record_phone_logs') {
              setShowCallLog(true)
            } else if (docId === 'record_speech_notes') {
              setShowSpeechNotes(true)
            } else {
              // Generic document viewer
              const doc = documents.find(d => d.id === docId)
              if (doc) {
                setSelectedDocument(doc)
              }
            }
          }}
          onPreviewScene={(sceneId, onCloseCallback) => {
            setOnPreviewClose(() => onCloseCallback)
            const scene = scenes.find(s => s.id === sceneId)
            if (scene) {
              setSelectedScene(scene)
            }
          }}
        />
      )}
    </>
  )
}
