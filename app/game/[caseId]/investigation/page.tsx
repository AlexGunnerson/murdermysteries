"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"
import { InvestigationBoard } from "@/components/game/investigation-board"
import { useGameState, useInitializeGame } from "@/lib/hooks/useGameState"

interface Suspect {
  id: string
  name: string
  portraitUrl: string
}

export default function InvestigationPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const router = useRouter()
  
  // Initialize game state
  useInitializeGame(caseId)
  const { discoveredFacts } = useGameState()
  
  // Load suspects from metadata
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [victim, setVictim] = useState<Suspect | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(true)
  
  useEffect(() => {
    async function loadMetadata() {
      try {
        const response = await fetch(`/cases/${caseId}/metadata.json`)
        const data = await response.json()
        
        // Get suspects (first 5)
        const suspectData = data.suspects.slice(0, 5).map((s: any) => ({
          id: s.id,
          name: s.name,
          portraitUrl: s.portraitUrl,
        }))
        
        setSuspects(suspectData)
        
        // Set victim
        setVictim({
          id: 'victim_reginald',
          name: 'Reginald Ashcombe',
          portraitUrl: '/cases/case01/images/portraits/reginald.jpg',
        })
      } catch (error) {
        console.error('Failed to load metadata:', error)
      } finally {
        setMetadataLoading(false)
      }
    }
    
    loadMetadata()
  }, [caseId])
  
  const handleBack = () => {
    router.push(`/game/${caseId}`)
  }
  
  // Only show loading if metadata hasn't loaded yet (board can work without facts)
  if (metadataLoading || !victim) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: '#1a1a1a',
        }}
      >
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p 
            className="text-amber-400 text-lg"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            Loading Investigation Board...
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Header Bar */}
      <header 
        className="absolute top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{
          background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
          borderBottom: '2px solid #d4af37',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 text-gray-300 hover:text-amber-400 hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span 
            className="text-sm uppercase tracking-wider"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            Back to Case Board
          </span>
        </button>
        
        {/* Title */}
        <h1 
          className="text-amber-400 text-lg font-bold uppercase tracking-widest"
          style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
        >
          Investigation Board
        </h1>
        
        {/* Facts Counter */}
        <div className="flex items-center gap-2">
          <span 
            className="text-gray-400 text-sm"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            Facts: {discoveredFacts.length}
          </span>
        </div>
      </header>
      
      {/* Full-screen Investigation Board */}
      <div className="pt-14 h-full w-full">
        <InvestigationBoard
          caseId={caseId}
          discoveredFacts={discoveredFacts}
          suspects={suspects}
          victim={victim}
        />
      </div>
    </div>
  )
}
