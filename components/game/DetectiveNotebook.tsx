"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { SuspectDossierView } from "./detective-board/SuspectDossierView"
import { VictimCard } from "./detective-board/VictimCard"
import { SceneViewer } from "./detective-board/SceneViewer"
import { DocumentViewer } from "./detective-board/DocumentViewer"
import { DocumentHTMLViewer } from "./detective-board/DocumentHTMLViewer"
import { BlackmailViewer } from "./detective-board/BlackmailViewer"
import { BlackmailSceneViewer } from "./detective-board/BlackmailSceneViewer"
import { SecurityFootageViewer } from "./detective-board/SecurityFootageViewer"
import { PaintingBackViewer } from "./detective-board/PaintingBackViewer"
import { ValeNotesPage1, ValeNotesPage2 } from "./documents/ValeNotesDocs"
import { CoronerReportPage1, CoronerReportPage2, CoronerReportPage3 } from "./documents/CoronerReportDocs"
import { ValidateTheory } from "./ValidateTheory"

interface Suspect {
  id: string
  name: string
  age: number
  role: string
  bio: string
  portraitUrl: string
  avatarUrl?: string
  veronicaNote: string
}

interface StoryConfig {
  systemPrompt: string
  suspects: {
    [key: string]: {
      personality: string
      alibi: string
      secrets: string[]
      facts: { [key: string]: string }
    }
  }
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
  const router = useRouter()
  const { discoveredFacts, theoryHistory, chatHistory, unlockedContent, revealedContent, markLetterAsRead, detectivePoints, hasReadVeronicaLetter, revealSuspect, revealScene, addDiscoveredFact, viewedDocuments, markDocumentAsViewed, currentStage, sessionId, fetchGameState, caseId } = useGameState()
  const [showVeronicaLetter, setShowVeronicaLetter] = useState(false)
  const [showThankYouNote, setShowThankYouNote] = useState(false)
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedSuspectForReveal, setSelectedSuspectForReveal] = useState<Suspect | null>(null)
  const [showVictimCard, setShowVictimCard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [selectedSceneImageIndex, setSelectedSceneImageIndex] = useState<number>(0)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedDocumentImageIndex, setSelectedDocumentImageIndex] = useState<number>(0)
  const [showBlackmailViewer, setShowBlackmailViewer] = useState(false)
  const [showBlackmailSceneViewer, setShowBlackmailSceneViewer] = useState(false)
  const [showSecurityFootage, setShowSecurityFootage] = useState(false)
  const [securityFootageImages, setSecurityFootageImages] = useState<string[]>([])
  const [showValeNotes, setShowValeNotes] = useState(false)
  const [showCoronerReport, setShowCoronerReport] = useState(false)
  const [showCallLog, setShowCallLog] = useState(false)
  const [showSpeechNotes, setShowSpeechNotes] = useState(false)
  const [showValidateTheory, setShowValidateTheory] = useState(false)
  const [onPreviewClose, setOnPreviewClose] = useState<(() => void) | null>(null)
  const [showPaintingBack, setShowPaintingBack] = useState(false)
  const [storyConfig, setStoryConfig] = useState<StoryConfig | null>(null)
  const [documentStackMenuOpen, setDocumentStackMenuOpen] = useState(false)
  const [queuedNotifications, setQueuedNotifications] = useState<string[]>([])
  const [currentNotification, setCurrentNotification] = useState<string | null>(null)

  // Navigation stack for context-aware returns
  type ViewerContext = {
    type: 'scene' | 'document' | 'blackmail' | 'blackmail_scene' | 'footage' | 'painting' | 'vale_notes' | 'coroner_report' | 'call_log' | 'speech_notes' | 'document_stack'
    data: any
  }
  const [navigationStack, setNavigationStack] = useState<ViewerContext[]>([])

  // Helper function to close current viewer and restore previous context
  const handleNavigationClose = () => {
    if (navigationStack.length > 0) {
      const previousContext = navigationStack[navigationStack.length - 1]
      const newStack = navigationStack.slice(0, -1)
      setNavigationStack(newStack)
      
      // Restore the previous viewer based on its type
      switch (previousContext.type) {
        case 'scene':
          setSelectedScene(previousContext.data.scene)
          setSelectedSceneImageIndex(previousContext.data.imageIndex || 0)
          break
        case 'document':
          setSelectedDocument(previousContext.data)
          break
        case 'blackmail':
          setShowBlackmailViewer(true)
          break
        case 'blackmail_scene':
          setShowBlackmailSceneViewer(true)
          break
        case 'footage':
          setSecurityFootageImages(previousContext.data.images)
          setShowSecurityFootage(true)
          break
        case 'painting':
          setShowPaintingBack(true)
          break
        case 'vale_notes':
          setShowValeNotes(true)
          break
        case 'coroner_report':
          setShowCoronerReport(true)
          break
        case 'call_log':
          setShowCallLog(true)
          break
        case 'speech_notes':
          setShowSpeechNotes(true)
          break
        case 'document_stack':
          setDocumentStackMenuOpen(true)
          break
      }
    }
    // If no previous context, just close (return to board)
  }

  // Load suspect and scene data from metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        // Load both metadata and story config
        const [metadataResponse, storyConfigResponse] = await Promise.all([
          fetch('/cases/case01/metadata.json'),
          fetch('/cases/case01/story-config.json')
        ])
        
        const data = await metadataResponse.json()
        const storyData = await storyConfigResponse.json()
        
        setStoryConfig(storyData)
        
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
            bio: s.bio,
            portraitUrl: s.portraitUrl,
            avatarUrl: s.avatarUrl,
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

        const allDocuments = data.records
          .filter((r: any) => r.initiallyAvailable || unlockedContent.records.has(r.id))
          .map((r: any) => ({
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
  }, [unlockedContent.records])

  const handleCloseLetter = () => {
    setShowVeronicaLetter(false)
    markLetterAsRead()
    if (onPreviewClose) {
      onPreviewClose()
      setOnPreviewClose(null)
    }
    // Check for navigation stack and restore previous context
    handleNavigationClose()
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

  // Handle unlock notifications queued from chat
  const handleUnlocksQueued = (notifications: string[]) => {
    setQueuedNotifications(notifications)
  }

  // Display queued notifications sequentially with delay
  useEffect(() => {
    if (queuedNotifications.length > 0 && !currentNotification) {
      // Show first notification after 500ms delay
      const timer = setTimeout(() => {
        setCurrentNotification(queuedNotifications[0])
        setQueuedNotifications(prev => prev.slice(1))
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [queuedNotifications, currentNotification])

  // Clear current notification (manual dismissal only)
  const handleDismissNotification = () => {
    setCurrentNotification(null)
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

  return (
    <>
      {/* Header Bar */}
      <BoardHeader 
        detectivePoints={detectivePoints}
        hasUnreadMessage={!hasReadVeronicaLetter}
        onOpenMessage={() => setShowVeronicaLetter(true)}
        onOpenMenu={onOpenMenu}
        onOpenHelp={() => onAction('help')}
        onOpenInvestigationBoard={() => router.push(`/game/${caseId || 'case01'}/investigation`)}
        onGetClue={() => onAction('clue')}
        onQuestionSuspects={() => onAction('question')}
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
            {currentStage === 'act_ii' ? (
              <>
                You&apos;ve proven that Reginald&apos;s death was <span className="font-bold text-red-700">not an accident</span>. 
                Now you must identify <span className="font-bold text-blue-800">who committed the murder</span> and determine 
                their <span className="font-bold text-blue-800">motive</span>.
              </>
            ) : (
              <>
                Veronica Ashcombe believes her husband&apos;s death was <span className="font-bold text-red-700">not an accident</span>. 
                Your task is to investigate and provide <span className="font-bold text-blue-800">evidence or develop a theory</span> that 
                supports her suspicion of foul play.
              </>
            )}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* The Victim - Pinned Photo */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <TypewrittenLabel text="THE VICTIM" rotating={-1} />
            <PinnedPhoto
              imageUrl="/cases/case01/images/portraits/reginald.jpg"
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
              viewedDocuments={viewedDocuments}
              isOpen={documentStackMenuOpen}
              onOpenChange={setDocumentStackMenuOpen}
              documents={[
                {
                  id: 'veronica_letter',
                  name: "Veronica's Letter",
                  description: "May 12th, 1986 - Ashcombe Manor",
                  onClick: () => {
                    markDocumentAsViewed('veronica_letter')
                    // Store document stack context in navigation
                    setNavigationStack([...navigationStack, { type: 'document_stack', data: null }])
                    setShowVeronicaLetter(true)
                  }
                },
                ...unlockedDocuments
                  .map(doc => ({
                  id: doc.id,
                  name: doc.name,
                  description: doc.description,
                  onClick: () => {
                    // Mark document as viewed
                    markDocumentAsViewed(doc.id)
                    
                    // Store document stack context in navigation
                    setNavigationStack([...navigationStack, { type: 'document_stack', data: null }])
                    
                    // Check if it's Veronica's thank you note
                    if (doc.id === 'record_veronica_thankyou') {
                      setShowThankYouNote(true)
                    }
                    // Check if it's Dr. Vale's medical notes
                    else if (doc.id === 'record_vale_notes') {
                      setShowValeNotes(true)
                    }
                    // Check if it's the coroner's report
                    else if (doc.id === 'record_coroner') {
                      setShowCoronerReport(true)
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
                    onClick={() => {
                      setSelectedScene(scene)
                      // Mark scene as viewed when opened
                      if (!revealedContent.scenes.has(scene.id)) {
                        revealScene(scene.id)
                      }
                    }}
                    rotating={[-2, 1, -1, 2, -1.5, 1.5][idx % 6]}
                    isViewed={revealedContent.scenes.has(scene.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Facts Summary - Call to Action for Investigation Board */}
          <BoardSection 
            title="Facts Discovered" 
            icon="📋"
            rotating={-0.3}
            className="md:col-span-2"
          >
            <div className="text-center py-6">
              <p 
                className="text-gray-700 mb-4"
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
              >
                You have discovered <span className="font-bold text-amber-700">{discoveredFacts.length}</span> facts.
              </p>
              <button
                onClick={() => router.push(`/game/${caseId || 'case01'}/investigation`)}
                className="px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(to bottom, #d4af37, #8c701c)',
                  color: '#1a0f0a',
                  fontFamily: "'Courier Prime', 'Courier New', monospace",
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                  border: '2px solid #5c4a16',
                }}
              >
                🔍 Open Investigation Board
              </button>
              <p 
                className="text-gray-600 mt-4 text-sm italic"
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
              >
                Connect facts, suspects, and clues to solve the mystery
              </p>
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
          initialIndex={selectedSceneImageIndex}
          unlockedContent={Array.from(unlockedContent.records)}
          onClose={() => {
            setSelectedScene(null)
            setSelectedSceneImageIndex(0)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
          onOpenDocument={async (documentId) => {
            // Unlock button-click records in the database
            if (documentId === 'record_security_footage' && sessionId) {
              try {
                const response = await fetch('/api/game/actions/unlock', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    sessionId,
                    contentType: 'record',
                    contentId: 'record_greenhouse_footage',
                  }),
                })

                if (response.ok) {
                  // Refresh game state to reflect the new unlock
                  await fetchGameState()
                }
              } catch (error) {
                console.error('Error unlocking security footage:', error)
              }
            }

            // Store current scene in navigation stack before opening document
            if (selectedScene) {
              setNavigationStack([...navigationStack, { 
                type: 'scene', 
                data: { scene: selectedScene, imageIndex: selectedSceneImageIndex }
              }])
            }
            
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
          initialIndex={selectedDocumentImageIndex}
          onClose={() => {
            setSelectedDocument(null)
            setSelectedDocumentImageIndex(0)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
        />
      )}

      {/* Blackmail Document Viewer (Found Behind Painting - Complete) */}
      {showBlackmailViewer && (
        <BlackmailViewer
          onClose={() => {
            setShowBlackmailViewer(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            // Check for navigation stack and restore previous context
            handleNavigationClose()
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
            // Check for navigation stack and restore previous context
            handleNavigationClose()
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
            // Check for navigation stack and restore previous context
            handleNavigationClose()
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
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
          onOpenBlackmail={async () => {
            // Open the blackmail viewer immediately for better UX
            // Note: We don't add painting to navigation stack - we want to skip it and return directly to the scene
            setShowPaintingBack(false)
            setShowBlackmailViewer(true)

            // Unlock the blackmail record in the database (in background)
            if (sessionId) {
              try {
                const response = await fetch('/api/game/actions/unlock', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    sessionId,
                    contentType: 'record',
                    contentId: 'record_blackmail_portrait',
                  }),
                })

                if (response.ok) {
                  // Refresh game state to reflect the new unlock
                  await fetchGameState()
                }
              } catch (error) {
                console.error('Error unlocking blackmail:', error)
              }
            }
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
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
        />
      )}

      {/* Coroner's Report Viewer */}
      {showCoronerReport && (
        <DocumentHTMLViewer
          documentName="Coroner's Report"
          pages={[
            {
              label: "PAGE 1 OF 3",
              content: <CoronerReportPage1 />
            },
            {
              label: "PAGE 2 OF 3",
              content: <CoronerReportPage2 />
            },
            {
              label: "PAGE 3 OF 3",
              content: <CoronerReportPage3 />
            }
          ]}
          onClose={() => {
            setShowCoronerReport(false)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
        />
      )}

      {/* Suspect Dossier Split-Screen Modal */}
      {selectedSuspectForReveal && storyConfig && (
        <SuspectDossierView
          suspect={selectedSuspectForReveal}
          suspectPersonality={storyConfig.suspects[selectedSuspectForReveal.id]?.personality || ''}
          suspectAlibi={storyConfig.suspects[selectedSuspectForReveal.id]?.alibi || ''}
          systemPrompt={storyConfig.systemPrompt
            .replace('{suspect_name}', selectedSuspectForReveal.name)
            .replace('{suspect_role}', selectedSuspectForReveal.role)
            .replace('{suspect_bio}', selectedSuspectForReveal.bio)
            .replace('{suspect_personality}', storyConfig.suspects[selectedSuspectForReveal.id]?.personality || '')
            .replace('{suspect_alibi}', storyConfig.suspects[selectedSuspectForReveal.id]?.alibi || '')
            .replace('{suspect_secrets}', storyConfig.suspects[selectedSuspectForReveal.id]?.secrets?.join('\n') || '')
            .replace('{dynamic_knowledge}', discoveredFacts.map(f => f.content).join('\n'))
          }
          onClose={handleCloseSuspectCard}
          onUnlocksQueued={handleUnlocksQueued}
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
          onPreviewDocument={(docId, onCloseCallback, imageIndex = 0) => {
            setOnPreviewClose(() => onCloseCallback)
            // Handle different document types
            if (docId === 'veronica_letter') {
              setShowVeronicaLetter(true)
            } else if (docId === 'record_veronica_thankyou') {
              setShowThankYouNote(true)
            } else if (docId === 'record_vale_notes') {
              setShowValeNotes(true)
            } else if (docId === 'record_coroner') {
              setShowCoronerReport(true)
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
                setSelectedDocumentImageIndex(imageIndex)
              }
            }
          }}
          onPreviewScene={(sceneId, onCloseCallback, imageIndex = 0) => {
            setOnPreviewClose(() => onCloseCallback)
            const scene = scenes.find(s => s.id === sceneId)
            if (scene) {
              setSelectedScene(scene)
              setSelectedSceneImageIndex(imageIndex)
            }
          }}
        />
      )}

      {/* Additional Previews */}
      {showVeronicaLetter && (
        <VeronicaLetter onBeginInvestigation={handleCloseLetter} isFirstView={false} />
      )}

      {showThankYouNote && (
        <VeronicaThankYouNote onClose={() => {
          setShowThankYouNote(false)
          if (onPreviewClose) {
            onPreviewClose()
            setOnPreviewClose(null)
          }
          handleNavigationClose()
        }} />
      )}

      {showCallLog && (
        <CallLog onClose={() => {
          setShowCallLog(false)
          if (onPreviewClose) {
            onPreviewClose()
            setOnPreviewClose(null)
          }
          handleNavigationClose()
        }} />
      )}

      {showSpeechNotes && (
        <SpeechNotes onClose={() => {
          setShowSpeechNotes(false)
          if (onPreviewClose) {
            onPreviewClose()
            setOnPreviewClose(null)
          }
          handleNavigationClose()
        }} />
      )}

      {/* Unlock Notification (shown after chat closes) */}
      {currentNotification && (
        <>
          <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
          `}</style>
          <div 
            className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4"
            onClick={handleDismissNotification}
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(10,10,10,0.5) 0%, rgba(0,0,0,0.7) 100%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
              `,
            }}
          >
            <div 
              className="relative w-full max-w-lg mx-auto rounded-sm overflow-hidden"
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
              {/* Enhanced grain overlay */}
              <div 
                className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundSize: '120px 120px',
                }}
              />

              {/* Close button */}
              <button
                onClick={handleDismissNotification}
                className="absolute top-4 right-4 z-[60] p-2 bg-[#0a0a0a]/95 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-sm transition-all duration-200 border border-[#d4af37]/40"
                aria-label="Close"
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

              {/* Modal Content */}
              <div 
                className="bg-[#1a1a1a] p-8 relative"
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
                {/* Notification Message */}
                <div className="mb-6">
                  <p 
                    className="text-[#d4af37] text-2xl font-bold leading-relaxed text-center uppercase tracking-wider"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {currentNotification}
                  </p>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleDismissNotification}
                    className="px-8 py-3 rounded-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border-[#d4af37]"
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      boxShadow: '0 0 15px rgba(212, 175, 55, 0.2), inset 0 0 8px rgba(212, 175, 55, 0.1)',
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
