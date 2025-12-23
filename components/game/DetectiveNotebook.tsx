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
import { DocumentCard } from "./detective-board/DocumentCard"
import { StickyNote } from "./detective-board/StickyNote"
import { SuspectCard } from "./detective-board/SuspectCard"
import { VictimCard } from "./detective-board/VictimCard"
import { SceneViewer } from "./detective-board/SceneViewer"
import { DocumentViewer } from "./detective-board/DocumentViewer"
import { DocumentHTMLViewer } from "./detective-board/DocumentHTMLViewer"
import { BlackmailViewer } from "./detective-board/BlackmailViewer"
import { BlackmailSceneViewer } from "./detective-board/BlackmailSceneViewer"
import { ValeNotesPage1, ValeNotesPage2 } from "./documents/ValeNotesDocs"

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
  const [showValeNotes, setShowValeNotes] = useState(false)
  const [showCallLog, setShowCallLog] = useState(false)
  const [showSpeechNotes, setShowSpeechNotes] = useState(false)

  // Load suspect and scene data from metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const response = await fetch('/cases/case01/metadata.json')
        const data = await response.json()
        
        // Get all suspects including Veronica
        const allSuspects = data.suspects.map((s: any) => {
          const ageMatch = s.bio.match(/(\d+) years old/)
          return {
            id: s.id,
            name: s.name,
            age: ageMatch ? parseInt(ageMatch[1]) : 0,
            role: s.role,
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
    return <VeronicaThankYouNote onClose={() => setShowThankYouNote(false)} />
  }

  if (showCallLog) {
    return <CallLog onClose={() => setShowCallLog(false)} />
  }

  if (showSpeechNotes) {
    return <SpeechNotes onClose={() => setShowSpeechNotes(false)} />
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
        onSolveMurder={() => onAction('solve')}
      />

      {/* Board */}
      <div 
        className="min-h-screen p-4 md:p-6 overflow-y-auto"
        style={{
          backgroundColor: '#8B7355',
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0,0,0,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,0,0,0.03) 0%, transparent 50%),
            url("/cases/case01/images/ui/corkboard_1.jpg")
          `,
          backgroundSize: '512px 512px',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="max-w-7xl mx-auto">

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
            className="text-3xl text-gray-800 mb-4 flex items-center gap-3"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            <span className="text-4xl">🎯</span> Your Objective
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
          
          {/* The Victim */}
          <BoardSection 
            title="The Victim" 
            icon="💀" 
            rotating={0.8}
          >
            <div className="grid grid-cols-1 gap-3 max-w-[200px] mx-auto">
              <PortraitFrame
                imageUrl="/cases/case01/images/portraits/reginald.png"
                name="Reginald"
                role="The Victim"
                onClick={handleVictimClick}
                rotating={-1}
                isRevealed={revealedContent.suspects.has('victim_reginald')}
              />
            </div>
          </BoardSection>

          {/* People of Interest */}
          <BoardSection 
            title="People of Interest" 
            icon="👥"
            rotating={-0.8}
            className="md:col-span-2"
          >
            {suspects.length === 0 ? (
              <p className="text-gray-600 text-center py-8 italic">Loading suspects...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {suspects.slice(0, 5).map((suspect, idx) => (
                  <PortraitFrame
                    key={suspect.id}
                    imageUrl={suspect.portraitUrl}
                    name={suspect.name.split(' ')[0]}
                    role={suspect.role}
                    rotating={[-1.5, 1, -0.5, 1.5, -1][idx % 5]}
                    isRevealed={revealedContent.suspects.has(suspect.id)}
                    onClick={() => handleSuspectClick(suspect)}
                  />
                ))}
              </div>
            )}
          </BoardSection>

          {/* Documents */}
          <BoardSection 
            title="Documents" 
            icon="📄"
            rotating={0.3}
          >
            <div className="space-y-2">
              <DocumentCard
                title="Veronica's Letter"
                preview="May 11th, 1986 - Ashcombe Manor"
                onClick={() => setShowVeronicaLetter(true)}
                rotating={-0.5}
              />
              {unlockedDocuments.map((doc, idx) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.name}
                  preview={doc.description}
                  onClick={() => {
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
                  }}
                  rotating={[-0.5, 1, -0.5, 0.5][idx % 4]}
                />
              ))}
            </div>
          </BoardSection>

          {/* Scenes */}
          <BoardSection 
            title="Investigate Scenes" 
            icon="🔍"
            onClick={() => onAction('scenes')}
            rotating={0.5}
            className="md:col-span-2 md:row-span-2 relative group"
          >
            {/* DP Cost Badge */}
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              -3 DP
            </div>

            {unlockedScenes.length === 0 ? (
              <p className="text-gray-600 text-center py-8 italic">
                No scenes investigated yet. Click this section to explore locations.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" onClick={(e) => e.stopPropagation()}>
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
          </BoardSection>

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
          onClose={() => setSelectedScene(null)}
        />
      )}

      {/* Document Viewer with Navigation */}
      {selectedDocument && selectedDocument.images && selectedDocument.images.length > 0 && (
        <DocumentViewer
          documentName={selectedDocument.name}
          images={selectedDocument.images}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Blackmail Document Viewer (Portrait - Complete) */}
      {showBlackmailViewer && (
        <BlackmailViewer
          onClose={() => setShowBlackmailViewer(false)}
        />
      )}

      {/* Blackmail Document Viewer (Scene - Missing Vale) */}
      {showBlackmailSceneViewer && (
        <BlackmailSceneViewer
          onClose={() => setShowBlackmailSceneViewer(false)}
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
          onClose={() => setShowValeNotes(false)}
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
    </>
  )
}
