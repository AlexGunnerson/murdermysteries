"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGameState } from "@/lib/hooks/useGameState"
import { filterSecretsByStage } from "@/lib/utils/storyUtils"
import { VeronicaLetter } from "@/components/game/VeronicaLetter"
import { LetterNotificationModal } from "@/components/game/LetterNotificationModal"
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
import { SceneTypeSelector } from "./detective-board/SceneTypeSelector"
import { DocumentViewer } from "./detective-board/DocumentViewer"
import { DocumentHTMLViewer } from "./detective-board/DocumentHTMLViewer"
import { BlackmailViewer } from "./detective-board/BlackmailViewer"
import { BlackmailSceneViewer } from "./detective-board/BlackmailSceneViewer"
import { SecurityFootageViewer } from "./detective-board/SecurityFootageViewer"
import { PaintingBackViewer } from "./detective-board/PaintingBackViewer"
import { VeronicaCommentaryModal } from "./detective-board/VeronicaCommentaryModal"
import { ValeNotesPage1, ValeNotesPage2 } from "./documents/ValeNotesDocs"
import { CoronerReportPage1, CoronerReportPage2, CoronerReportPage3 } from "./documents/CoronerReportDocs"
import { ValidateTheory } from "./ValidateTheory"
import { QuickNoteButton } from "./QuickNoteButton"
import { GetClueModal } from "./GetClueModal"
import { LoadingModal } from "./LoadingModal"
import { TheoryResultModal } from "./detective-board/TheoryResultModal"
import OnboardingTour from "./tutorial/OnboardingTour"
import ProgressChecklist from "./tutorial/ProgressChecklist"

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
  galaImages?: string[]
  galaAnnotations?: Record<string, string>
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
  annotations?: Record<string, string>
}

interface DetectiveNotebookProps {
  onAction: (action: string) => void
  onOpenMenu: () => void
}

export function DetectiveNotebook({ onAction, onOpenMenu }: DetectiveNotebookProps) {
  const router = useRouter()
  const { discoveredFacts, theoryHistory, chatHistory, unlockedContent, revealedContent, markLetterAsRead, hasReadVeronicaLetter, hasSeenBlackmailCommentary, markBlackmailCommentaryAsSeen, revealSuspect, revealScene, addDiscoveredFact, viewedDocuments, markDocumentAsViewed, currentStage, sessionId, fetchGameState, caseId, isGameCompleted, startTutorial, tutorialStarted, tutorialCompleted, tutorialDismissedAt } = useGameState()
  const [showLetterNotification, setShowLetterNotification] = useState(false)
  const [showVeronicaLetter, setShowVeronicaLetter] = useState(false)
  const [showThankYouNoteNotification, setShowThankYouNoteNotification] = useState(false)
  const [showThankYouNote, setShowThankYouNote] = useState(false)
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedSuspectForReveal, setSelectedSuspectForReveal] = useState<Suspect | null>(null)
  const [showVictimCard, setShowVictimCard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoadingInvestigation, setIsLoadingInvestigation] = useState(false)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [selectedSceneImageIndex, setSelectedSceneImageIndex] = useState<number>(0)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedDocumentImageIndex, setSelectedDocumentImageIndex] = useState<number>(0)
  const [showBlackmailViewer, setShowBlackmailViewer] = useState(false)
  const [showBlackmailSceneViewer, setShowBlackmailSceneViewer] = useState(false)
  const [blackmailSuspectId, setBlackmailSuspectId] = useState<string | undefined>(undefined)
  const [showVeronicaCommentary, setShowVeronicaCommentary] = useState(false)
  const [showSecurityFootage, setShowSecurityFootage] = useState(false)
  const [securityFootageImages, setSecurityFootageImages] = useState<string[]>([])
  const [showValeNotes, setShowValeNotes] = useState(false)
  const [showCoronerReport, setShowCoronerReport] = useState(false)
  const [showCallLog, setShowCallLog] = useState(false)
  const [showSpeechNotes, setShowSpeechNotes] = useState(false)
  const [showValidateTheory, setShowValidateTheory] = useState(false)
  const [showClueModal, setShowClueModal] = useState(false)
  const [onPreviewClose, setOnPreviewClose] = useState<(() => void) | null>(null)
  const [showPaintingBack, setShowPaintingBack] = useState(false)
  const [storyConfig, setStoryConfig] = useState<StoryConfig | null>(null)
  const [documentStackMenuOpen, setDocumentStackMenuOpen] = useState(false)
  
  interface UnlockData {
    suspects?: string[]
    scenes?: string[]
    records?: string[]
    stage?: string
    message?: string
    gameCompleted?: boolean
  }
  
  const [queuedUnlocks, setQueuedUnlocks] = useState<UnlockData[]>([])
  const [currentNotification, setCurrentNotification] = useState<string | null>(null)
  const [currentTheoryResult, setCurrentTheoryResult] = useState<{result: 'correct' | 'incorrect', feedback: string} | null>(null)
  const [actIUnlockData, setActIUnlockData] = useState<any>(null)
  const [showActIUnlockModal, setShowActIUnlockModal] = useState(false)
  const [showSceneSelector, setShowSceneSelector] = useState(false)
  const [selectedSceneForSelector, setSelectedSceneForSelector] = useState<Scene | null>(null)
  const [selectedPhotoType, setSelectedPhotoType] = useState<'investigation' | 'gala'>('investigation')
  const [isUnlockingFootage, setIsUnlockingFootage] = useState(false)
  const [footageUnlocked, setFootageUnlocked] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Loading...")
  const [zoomLevel, setZoomLevel] = useState(100) // Zoom percentage (100 = 100%)

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
          initiallyAvailable: s.initiallyAvailable,
          galaImages: s.galaImages,
          galaAnnotations: s.galaAnnotations
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
            initiallyAvailable: r.initiallyAvailable,
            annotations: r.annotations
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

  // Auto-show letter notification for first-time players (with 2-second delay)
  useEffect(() => {
    if (!hasReadVeronicaLetter && !loading) {
      const timer = setTimeout(() => {
        setShowLetterNotification(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasReadVeronicaLetter, loading])

  // Auto-start onboarding tour when player has read Veronica's letter (mandatory, 1.5s delay after letter closes)
  useEffect(() => {
    if (
      hasReadVeronicaLetter &&
      !tutorialStarted &&
      !tutorialCompleted &&
      !tutorialDismissedAt &&
      !loading
    ) {
      const timer = setTimeout(() => {
        startTutorial()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasReadVeronicaLetter, tutorialStarted, tutorialCompleted, tutorialDismissedAt, loading, startTutorial])

  // Debug: Monitor showThankYouNoteNotification state
  useEffect(() => {
    console.log('[THANK-YOU-NOTE-NOTIFICATION] State changed:', showThankYouNoteNotification)
  }, [showThankYouNoteNotification])

  // Zoom keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command (Mac) or Ctrl (Windows/Linux)
      const isModifierPressed = e.metaKey || e.ctrlKey
      
      if (isModifierPressed) {
        if (e.key === '=' || e.key === '+') {
          // Zoom in
          e.preventDefault()
          setZoomLevel(prev => Math.min(prev + 10, 150)) // Max 150%
        } else if (e.key === '-' || e.key === '_') {
          // Zoom out
          e.preventDefault()
          setZoomLevel(prev => Math.max(prev - 10, 50)) // Min 50%
        } else if (e.key === '0') {
          // Reset zoom
          e.preventDefault()
          setZoomLevel(100)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Preload security footage when study scene is opened
  useEffect(() => {
    const preloadSecurityFootage = async () => {
      // Only preload if:
      // 1. Study scene is opened
      // 2. Not already unlocked/unlocking
      // 3. Have a valid session
      if (
        selectedScene?.id === 'scene_study' && 
        !footageUnlocked && 
        !isUnlockingFootage && 
        sessionId
      ) {
        setIsUnlockingFootage(true)
        
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
            setFootageUnlocked(true)
            // Refresh game state in background (don't await)
            fetchGameState()
          }
        } catch (error) {
          console.error('Error preloading security footage:', error)
        } finally {
          setIsUnlockingFootage(false)
        }
      }
    }

    preloadSecurityFootage()
  }, [selectedScene, footageUnlocked, isUnlockingFootage, sessionId, fetchGameState])

  const handleOpenLetter = () => {
    setShowLetterNotification(false)
    setShowVeronicaLetter(true)
    // Mark the letter as viewed so it appears red in documents
    markDocumentAsViewed('veronica_letter')
  }

  const handleOpenThankYouNote = () => {
    setShowThankYouNoteNotification(false)
    setShowThankYouNote(true)
    // Mark the thank you note as viewed so it appears red in documents
    markDocumentAsViewed('record_veronica_thankyou')
  }

  const handleCloseLetter = () => {
    setShowVeronicaLetter(false)
    markLetterAsRead()
    // Mark the letter as viewed so it appears red in documents
    markDocumentAsViewed('veronica_letter')
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
  const handleUnlocksQueued = (unlocks: UnlockData[]) => {
    setQueuedUnlocks(unlocks)
  }

  // Display queued unlocks sequentially with delay
  useEffect(() => {
    if (queuedUnlocks.length > 0 && !currentNotification && !currentTheoryResult) {
      // Show first unlock after 500ms delay
      const timer = setTimeout(() => {
        const unlock = queuedUnlocks[0]
        
        // Check if this is Act II progression - show TheoryResultModal
        if (unlock.stage === 'act_ii') {
          setCurrentTheoryResult({
            result: 'correct',
            feedback: unlock.message || 'The contradiction has been proven!'
          })
        } else {
          // Show simple notification for other unlocks
          setCurrentNotification(unlock.message || 'New content unlocked!')
        }
        
        setQueuedUnlocks(prev => prev.slice(1))
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [queuedUnlocks, currentNotification, currentTheoryResult])

  // Clear current notification (manual dismissal only)
  const handleDismissNotification = () => {
    setCurrentNotification(null)
  }
  
  // Clear current theory result (manual dismissal only)
  const handleDismissTheoryResult = () => {
    setCurrentTheoryResult(null)
  }

  // Handle Act I success sequence
  const handleActISuccess = (unlockedContent: any) => {
    console.log('[ACT-I-SUCCESS] Starting sequence with unlocked content:', unlockedContent)
    setActIUnlockData(unlockedContent)
    
    // Wait 2 seconds, then show the thank you note notification
    console.log('[ACT-I-SUCCESS] Setting timeout for thank you note notification')
    setTimeout(() => {
      console.log('[ACT-I-SUCCESS] Timeout fired! Setting showThankYouNoteNotification to true')
      setShowThankYouNoteNotification(true)
    }, 2000)
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
  // BUT exclude individual blackmail pieces (keep only full sets for document viewer)
  // AND exclude security footage (only accessible through scene viewer button)
  const unlockedDocuments = documents.filter(doc => {
    const isUnlocked = doc.initiallyAvailable || unlockedContent.records.has(doc.id)
    const isIndividualBlackmail = doc.id.startsWith('record_blackmail_floor_') || 
                                   doc.id.startsWith('record_blackmail_portrait_')
    const isSecurityFootage = doc.id === 'record_security_footage' || 
                              doc.id === 'record_greenhouse_footage'
    return isUnlocked && !isIndividualBlackmail && !isSecurityFootage
  })
  const chatSuspects = Array.from(new Set(chatHistory.map(msg => msg.suspectId)))

  return (
    <>
      {/* Header Bar */}
      <BoardHeader 
        onOpenMenu={onOpenMenu}
        onOpenInvestigationBoard={() => {
          setIsLoadingInvestigation(true)
          router.push(`/game/${caseId || 'case01'}/investigation`)
        }}
        isLoadingInvestigation={isLoadingInvestigation}
        onGetClue={() => setShowClueModal(true)}
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
            url("/cases/case01/images/ui/corkboard-optimized.jpg")
          `,
          backgroundSize: '512px 512px',
          backgroundRepeat: 'repeat'
        }}
      >
        <div 
          className="max-w-7xl mx-auto transition-transform duration-200 origin-top"
          style={{
            transform: `scale(${zoomLevel / 100})`,
          }}
        >
        {/* Objective Banner */}
        <div 
          data-tour-objective
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
                Your task is to investigate and provide <span className="font-bold text-blue-800">evidence</span> that 
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
              <div data-tour-suspects className="flex flex-wrap justify-center gap-x-8 gap-y-16 py-8">
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
                      priority={idx === 0}
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
              data-tour-documents
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
                    // Check if it's blackmail documents (scene version - full set or individual)
                    else if (doc.id === 'record_blackmail_floor' || doc.id.startsWith('record_blackmail_floor_')) {
                      // Extract suspect ID if it's an individual piece
                      const suspectId = doc.id.startsWith('record_blackmail_floor_') 
                        ? doc.id.replace('record_blackmail_floor_', '') 
                        : undefined
                      setBlackmailSuspectId(suspectId)
                      setShowBlackmailSceneViewer(true)
                    }
                    // Check if it's blackmail documents (portrait version - full set or individual)
                    else if (doc.id === 'record_blackmail_portrait' || doc.id.startsWith('record_blackmail_portrait_')) {
                      // Extract suspect ID if it's an individual piece
                      const suspectId = doc.id.startsWith('record_blackmail_portrait_') 
                        ? doc.id.replace('record_blackmail_portrait_', '') 
                        : undefined
                      setBlackmailSuspectId(suspectId)
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
              <div data-tour-scenes className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-6xl mx-auto">
                {unlockedScenes.map((scene, idx) => (
                  <PolaroidPhoto
                    key={scene.id}
                    imageUrl={scene.imageUrl}
                    title={scene.name}
                    onClick={() => {
                      // Check if scene has gala photos
                      if (scene.galaImages && scene.galaImages.length > 0) {
                        // Show selector
                        setSelectedSceneForSelector(scene)
                        setShowSceneSelector(true)
                      } else {
                        // Go directly to investigation photos
                        setSelectedScene(scene)
                        setSelectedPhotoType('investigation')
                      }
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
        </div>
      </div>
      </div>

      {/* Scene Type Selector */}
      {showSceneSelector && selectedSceneForSelector && (
        <SceneTypeSelector
          sceneName={selectedSceneForSelector.name}
          hasGalaPhotos={!!selectedSceneForSelector.galaImages && selectedSceneForSelector.galaImages.length > 0}
          onSelectGala={() => {
            setShowSceneSelector(false)
            setSelectedPhotoType('gala')
            setSelectedScene(selectedSceneForSelector)
            setSelectedSceneImageIndex(0)
          }}
          onSelectInvestigation={() => {
            setShowSceneSelector(false)
            setSelectedPhotoType('investigation')
            setSelectedScene(selectedSceneForSelector)
            setSelectedSceneImageIndex(0)
          }}
          onClose={() => {
            setShowSceneSelector(false)
            setSelectedSceneForSelector(null)
          }}
        />
      )}

      {/* Scene Viewer with Navigation */}
      {selectedScene && !showSceneSelector && (
        <SceneViewer
          sceneName={selectedScene.name}
          images={selectedPhotoType === 'gala' && selectedScene.galaImages ? selectedScene.galaImages : selectedScene.images}
          sceneId={selectedScene.id}
          initialIndex={selectedSceneImageIndex}
          unlockedContent={Array.from(unlockedContent.records)}
          photoType={selectedPhotoType}
          annotations={selectedPhotoType === 'gala' ? selectedScene.galaAnnotations : undefined}
          onClose={() => {
            // Check if this scene has gala photos (meaning it came from a selector)
            if (selectedScene.galaImages && selectedScene.galaImages.length > 0) {
              // Go back to the folder selector instead of closing completely
              setSelectedSceneForSelector(selectedScene)
              setShowSceneSelector(true)
              setSelectedScene(null)
              setSelectedSceneImageIndex(0)
              setSelectedPhotoType('investigation')
            } else {
              // No selector involved, close normally
              setSelectedScene(null)
              setSelectedSceneImageIndex(0)
              setSelectedPhotoType('investigation')
              if (onPreviewClose) {
                onPreviewClose()
                setOnPreviewClose(null)
              }
              // Check for navigation stack and restore previous context
              handleNavigationClose()
            }
          }}
          onOpenDocument={async (documentId) => {
            // Handle security footage
            if (documentId === 'record_security_footage' && sessionId) {
              // If not yet unlocked, unlock now with loading modal
              // The preload in the background should have already started this,
              // but we handle it here in case the user clicks very quickly
              if (!footageUnlocked) {
                setLoadingMessage("Loading Security Footage...")
                setShowLoadingModal(true)
                
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
                    setFootageUnlocked(true)
                    // Refresh game state in background (don't await)
                    fetchGameState()
                  }
                } catch (error) {
                  console.error('Error unlocking security footage:', error)
                } finally {
                  setShowLoadingModal(false)
                }
              }

              // Store current scene in navigation stack before opening footage
              // This keeps the scene viewer in the stack so we can return to it
              if (selectedScene) {
                setNavigationStack([...navigationStack, { 
                  type: 'scene', 
                  data: { scene: selectedScene, imageIndex: selectedSceneImageIndex }
                }])
              }
              
              // Open security footage with hardcoded images
              const footageImages = [
                "/cases/case01/images/evidence/securityfootage/cam1.1.jpg",
                "/cases/case01/images/evidence/securityfootage/cam1.2.jpg",
                "/cases/case01/images/evidence/securityfootage/cam1.3.png",
                "/cases/case01/images/evidence/securityfootage/cam1.4.png",
                "/cases/case01/images/evidence/securityfootage/cam1.5.jpg",
                "/cases/case01/images/evidence/securityfootage/cam2.1.png",
                "/cases/case01/images/evidence/securityfootage/cam2.2.png",
                "/cases/case01/images/evidence/securityfootage/cam2.3.png",
                "/cases/case01/images/evidence/securityfootage/cam2.4.png",
                "/cases/case01/images/evidence/securityfootage/cam2.5.png",
                "/cases/case01/images/evidence/securityfootage/cam2.6.png",
                "/cases/case01/images/evidence/securityfootage/cam2.7.jpg",
                "/cases/case01/images/evidence/securityfootage/cam2.8.jpg",
                "/cases/case01/images/evidence/securityfootage/cam3.1.jpg",
                "/cases/case01/images/evidence/securityfootage/cam3.2.jpg",
                "/cases/case01/images/evidence/securityfootage/cam3.3.jpg",
                "/cases/case01/images/evidence/securityfootage/cam3.4.jpg",
                "/cases/case01/images/evidence/securityfootage/cam3.5.jpg"
              ]
              setSecurityFootageImages(footageImages)
              setShowSecurityFootage(true)
              
              // Close scene viewer AFTER opening footage (this creates the "on top" effect)
              setSelectedScene(null)
            } else if (documentId === 'painting_back') {
              // Store current scene in navigation stack before opening painting
              if (selectedScene) {
                setNavigationStack([...navigationStack, { 
                  type: 'scene', 
                  data: { scene: selectedScene, imageIndex: selectedSceneImageIndex }
                }])
              }
              
              // Open the painting back viewer
              setShowPaintingBack(true)
              
              // Close scene viewer
              setSelectedScene(null)
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
          annotations={selectedDocument.annotations}
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
          suspectId={blackmailSuspectId}
          onClose={() => {
            setShowBlackmailViewer(false)
            setBlackmailSuspectId(undefined)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
          onSuspectClick={() => {
            // Close Veronica's commentary modal when a suspect is clicked
            if (showVeronicaCommentary) {
              setShowVeronicaCommentary(false)
              markBlackmailCommentaryAsSeen()
            }
          }}
        />
      )}

      {/* Veronica Commentary Modal - appears above blackmail viewer */}
      {showVeronicaCommentary && (
        <VeronicaCommentaryModal
          onClose={() => {
            setShowVeronicaCommentary(false)
            markBlackmailCommentaryAsSeen()
          }}
        />
      )}

      {/* Blackmail Document Viewer (Scene - Missing Vale) */}
      {showBlackmailSceneViewer && (
        <BlackmailSceneViewer
          suspectId={blackmailSuspectId}
          onClose={() => {
            setShowBlackmailSceneViewer(false)
            setBlackmailSuspectId(undefined)
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            // Check for navigation stack and restore previous context
            handleNavigationClose()
          }}
          onSuspectClick={() => {
            // Close Veronica's commentary modal when a suspect is clicked
            if (showVeronicaCommentary) {
              setShowVeronicaCommentary(false)
              markBlackmailCommentaryAsSeen()
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

            // Show Veronica's commentary after 0.5s delay if not seen before
            if (!hasSeenBlackmailCommentary) {
              setTimeout(() => {
                setShowVeronicaCommentary(true)
              }, 500)
            }

            // Add facts to inform Veronica that blackmail has been retrieved and master bedroom visited
            addDiscoveredFact({
              content: 'Retrieved the complete blackmail papers from behind the painting in the master bedroom',
              source: 'scene',
              sourceId: 'scene_master_bedroom',
            })
            
            addDiscoveredFact({
              content: 'Visited the master bedroom and examined the painting',
              source: 'scene',
              sourceId: 'scene_master_bedroom',
            })

            // Unlock all blackmail records in the database (main set + all individual documents)
            if (sessionId) {
              try {
                // Unlock all documents as specified in unlock rule: blackmail_set_2
                const documentsToUnlock = [
                  'record_blackmail_portrait',
                  'record_blackmail_portrait_colin',
                  'record_blackmail_portrait_martin',
                  'record_blackmail_portrait_lydia',
                  'record_blackmail_portrait_vale'
                ]

                // Unlock each document
                await Promise.all(
                  documentsToUnlock.map(contentId =>
                    fetch('/api/game/actions/unlock', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        sessionId,
                        contentType: 'record',
                        contentId,
                      }),
                    })
                  )
                )

                // Refresh game state to reflect the new unlocks
                await fetchGameState()
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
            .replace('{suspect_secrets}', 
              filterSecretsByStage(
                storyConfig.suspects[selectedSuspectForReveal.id]?.secrets || [],
                currentStage
              ).join('\n')
            )
            .replace('{dynamic_knowledge}', discoveredFacts.map(f => f.content).join('\n'))
          }
          onClose={handleCloseSuspectCard}
          onUnlocksQueued={handleUnlocksQueued}
          onActIIComplete={selectedSuspectForReveal.id === 'suspect_veronica' ? (unlockData: any) => {
            console.log('[DETECTIVE-NOTEBOOK] Act II completion callback triggered with unlock data:', unlockData)
            // Store the unlock data (same as handleActISuccess)
            setActIUnlockData(unlockData)
            
            setTimeout(() => {
              console.log('[DETECTIVE-NOTEBOOK] Showing thank you note notification')
              setShowThankYouNoteNotification(true)
            }, 500)
          } : undefined}
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
          onActISuccess={handleActISuccess}
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
            } else if (docId === 'record_blackmail_portrait' || docId.startsWith('record_blackmail_portrait_')) {
              // Extract suspect ID if it's an individual piece
              const suspectId = docId.startsWith('record_blackmail_portrait_') 
                ? docId.replace('record_blackmail_portrait_', '') 
                : undefined
              setBlackmailSuspectId(suspectId)
              setShowBlackmailViewer(true)
            } else if (docId === 'record_blackmail_floor' || docId.startsWith('record_blackmail_floor_')) {
              // Extract suspect ID if it's an individual piece
              const suspectId = docId.startsWith('record_blackmail_floor_') 
                ? docId.replace('record_blackmail_floor_', '') 
                : undefined
              setBlackmailSuspectId(suspectId)
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

      {/* Letter Notification Modal */}
      {showLetterNotification && (
        <LetterNotificationModal onOpenLetter={handleOpenLetter} />
      )}

      {/* Thank You Note Notification Modal */}
      {showThankYouNoteNotification && (
        <LetterNotificationModal onOpenLetter={handleOpenThankYouNote} />
      )}

      {/* Additional Previews */}
      {showVeronicaLetter && (
        <VeronicaLetter onBeginInvestigation={handleCloseLetter} isFirstView={false} />
      )}

      {showThankYouNote && (
        <VeronicaThankYouNote onClose={() => {
          setShowThankYouNote(false)
          
          // If this is part of Act I success sequence, show unlock modal after 1 second
          if (actIUnlockData) {
            setTimeout(() => {
              setShowActIUnlockModal(true)
            }, 1000)
          } else {
            // Otherwise handle normal close flow
            if (onPreviewClose) {
              onPreviewClose()
              setOnPreviewClose(null)
            }
            handleNavigationClose()
          }
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

      {/* Theory Result Modal for Act II progression via chat */}
      {currentTheoryResult && (
        <TheoryResultModal
          result={currentTheoryResult.result}
          feedback={currentTheoryResult.feedback}
          onClose={handleDismissTheoryResult}
        />
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

      {/* Act I Success Unlock Modal */}
      {showActIUnlockModal && actIUnlockData && (
        <>
          <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap');
          `}</style>
          <div 
            className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4"
            onClick={() => {
              setShowActIUnlockModal(false)
              setActIUnlockData(null)
            }}
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
                onClick={() => {
                  setShowActIUnlockModal(false)
                  setActIUnlockData(null)
                }}
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
                {/* Header */}
                <h2 
                  className="text-3xl font-bold mb-6 text-[#d4af37] text-center"
                  style={{ 
                    fontFamily: "'Playfair Display', serif",
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  NEW EVIDENCE UNLOCKED
                </h2>

                {/* Unlocked Content */}
                <div className="space-y-4 mb-6">
                  {actIUnlockData.suspects && actIUnlockData.suspects.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="text-[#d4af37] text-xl">👥</span>
                      <div>
                        <p 
                          className="text-[#d4af37] font-bold text-sm uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          Suspects Available for Questioning:
                        </p>
                        <p 
                          className="text-[#c5a065] text-base"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          {actIUnlockData.suspects.length} new suspect(s)
                        </p>
                      </div>
                    </div>
                  )}

                  {actIUnlockData.records && actIUnlockData.records.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="text-[#d4af37] text-xl">📄</span>
                      <div>
                        <p 
                          className="text-[#d4af37] font-bold text-sm uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          New Documents:
                        </p>
                        <p 
                          className="text-[#c5a065] text-base"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          {actIUnlockData.records.length} new document(s)
                        </p>
                      </div>
                    </div>
                  )}

                  {actIUnlockData.stage && (
                    <div className="flex items-start gap-3">
                      <span className="text-[#d4af37] text-xl">🎭</span>
                      <div>
                        <p 
                          className="text-[#d4af37] font-bold text-sm uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          Case Stage:
                        </p>
                        <p 
                          className="text-[#c5a065] text-base"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          Advanced to {actIUnlockData.stage.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setShowActIUnlockModal(false)
                      setActIUnlockData(null)
                    }}
                    className="px-8 py-3 rounded-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border-[#d4af37]"
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      boxShadow: '0 0 15px rgba(212, 175, 55, 0.2), inset 0 0 8px rgba(212, 175, 55, 0.1)',
                    }}
                  >
                    Continue Investigation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Get Hint Modal */}
      <GetClueModal
        isOpen={showClueModal}
        onClose={() => setShowClueModal(false)}
        currentStage={currentStage}
        sessionId={sessionId}
      />

      {/* Quick Note Button */}
      <QuickNoteButton />

      {/* Loading Modal */}
      {showLoadingModal && (
        <LoadingModal message={loadingMessage} />
      )}

      {/* Tour Components */}
      <OnboardingTour />
      <ProgressChecklist />

      {/* Zoom Indicator */}
      {zoomLevel !== 100 && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-black/80 text-[#d4af37] px-4 py-2 rounded-sm border border-[#d4af37]/40 shadow-lg"
          style={{
            fontFamily: "'Courier Prime', monospace",
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">Zoom: {zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(100)}
              className="text-xs px-2 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 rounded-sm transition-colors"
              title="Reset zoom (Cmd/Ctrl + 0)"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </>
  )
}
