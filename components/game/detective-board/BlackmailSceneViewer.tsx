"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { DocumentHTMLViewer } from "./DocumentHTMLViewer"
import { MartinBlackmailPage1, MartinBlackmailPage2, MartinBlackmailPage3 } from "../documents/MartinBlackmailDocs"
import { ColinBlackmailScenePage1, ColinBlackmailScenePage2 } from "../documents/ColinBlackmailSceneDocs"
import { LydiaBlackmailPage1, LydiaBlackmailPage2, LydiaBlackmailPage3 } from "../documents/LydiaBlackmailDocs"

interface BlackmailSceneViewerProps {
  onClose: () => void
}

interface SuspectDocs {
  id: string
  name: string
  role: string
  pageCount: number
  accentColor: string
  pages: Array<{ label: string; content: React.ReactNode }>
}

export function BlackmailSceneViewer({ onClose }: BlackmailSceneViewerProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null)

  const suspects: SuspectDocs[] = [
    {
      id: 'martin',
      name: 'Martin Ashcombe',
      role: 'The Irresponsible Brother',
      pageCount: 3,
      accentColor: '#8b3a3a', // dark burgundy
      pages: [
        {
          label: "DOCUMENT 1 OF 3",
          content: <MartinBlackmailPage1 />
        },
        {
          label: "DOCUMENT 2 OF 3",
          content: <MartinBlackmailPage2 />
        },
        {
          label: "DOCUMENT 3 OF 3",
          content: <MartinBlackmailPage3 />
        }
      ]
    },
    {
      id: 'colin',
      name: 'Colin Dorsey',
      role: 'The Estate Manager',
      pageCount: 2,
      accentColor: '#2c4a6b', // dark navy
      pages: [
        {
          label: "DOCUMENT 1 OF 2",
          content: <ColinBlackmailScenePage1 />
        },
        {
          label: "DOCUMENT 2 OF 2",
          content: <ColinBlackmailScenePage2 />
        }
      ]
    },
    {
      id: 'lydia',
      name: 'Lydia Portwell',
      role: 'The Charity Director',
      pageCount: 3,
      accentColor: '#5a3d6b', // deep purple
      pages: [
        {
          label: "DOCUMENT 1 OF 3",
          content: <LydiaBlackmailPage1 />
        },
        {
          label: "DOCUMENT 2 OF 3",
          content: <LydiaBlackmailPage2 />
        },
        {
          label: "DOCUMENT 3 OF 3",
          content: <LydiaBlackmailPage3 />
        }
      ]
    }
  ]

  const selectedSuspectData = suspects.find(s => s.id === selectedSuspect)

  // If a suspect is selected, show their documents
  if (selectedSuspectData) {
    return (
      <div className="relative">
        {/* Back button overlay */}
        <button
          onClick={() => setSelectedSuspect(null)}
          className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <DocumentHTMLViewer
          documentName={`${selectedSuspectData.name} - Blackmail Evidence`}
          pages={selectedSuspectData.pages}
          onClose={() => setSelectedSuspect(null)}
        />
      </div>
    )
  }

  // Selection screen with noir aesthetic
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(10,10,10,0.85) 0%, rgba(0,0,0,0.98) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Centered modal container */}
      <div 
        className="relative w-full max-w-4xl mx-auto rounded-sm overflow-hidden"
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
        {/* Enhanced grain overlay for entire modal */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-35"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Back button - top left */}
        <button
          onClick={onClose}
          className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {/* Document title label - noir style */}
          <div 
            className="mb-6"
            style={{
              background: '#0a0a0a',
              color: '#d4af37',
              padding: '12px 20px',
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '2px',
              borderRadius: '2px',
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.1), 
                0 2px 4px rgba(0,0,0,0.4),
                0 0 12px rgba(212, 175, 55, 0.2)
              `,
              border: '1px solid rgba(212, 175, 55, 0.3)',
              textTransform: 'uppercase',
              fontSize: '14px',
              fontFamily: 'Courier, monospace',
              textShadow: '0 0 8px rgba(212, 175, 55, 0.5)'
            }}
          >
            BLACKMAIL PAPERS - FOUND NEAR BODY
          </div>

          {/* Main Container - dark parchment */}
          <div 
            className="bg-[#2c2418] rounded-sm overflow-hidden"
            style={{
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Evidence Note - warmer dark gray */}
            <div 
              className="p-6 border-b"
              style={{
                background: '#3a342a',
                borderColor: 'rgba(212, 175, 55, 0.2)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p 
                    className="font-bold mb-1"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Courier, monospace',
                      fontSize: '13px',
                      letterSpacing: '1px'
                    }}
                  >
                    EVIDENCE OVERVIEW
                  </p>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: '#c5a065' }}
                  >
                    These documents were found scattered near Reginald&apos;s body at the crime scene. Each contains incriminating evidence on the suspects.
                  </p>
                </div>
              </div>
            </div>

            {/* Selection cards - 3 column layout for 3 suspects */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suspects.map((suspect) => (
                  <button
                    key={suspect.id}
                    onClick={() => setSelectedSuspect(suspect.id)}
                    className="relative p-6 bg-[#f4f1ea] rounded-sm transition-all duration-200 group text-left overflow-hidden"
                    style={{
                      border: `2px solid ${suspect.accentColor}40`,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      transform: 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `2px solid ${suspect.accentColor}80`
                      e.currentTarget.style.boxShadow = `0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px ${suspect.accentColor}40`
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = `2px solid ${suspect.accentColor}40`
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {/* Grain texture overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '100px 100px',
                      }}
                    />

                    {/* Subtle top accent bar */}
                    <div 
                      className="absolute top-0 left-0 w-full h-1"
                      style={{ 
                        background: `linear-gradient(to right, ${suspect.accentColor}80, ${suspect.accentColor}40, ${suspect.accentColor}80)`
                      }}
                    />
                    
                    <h4 
                      className="text-lg font-bold mb-1 mt-2 transition-colors"
                      style={{ 
                        color: '#2c2a29',
                        fontFamily: "'Playfair Display', serif"
                      }}
                    >
                      {suspect.name}
                    </h4>
                    
                    <p 
                      className="text-xs mb-4"
                      style={{ 
                        color: '#5a5a5a',
                        fontFamily: 'Courier, monospace'
                      }}
                    >
                      {suspect.role}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs font-mono px-2 py-1 rounded"
                        style={{
                          color: '#5a5a5a',
                          background: 'rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        📎 {suspect.pageCount} {suspect.pageCount === 1 ? 'document' : 'documents'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





