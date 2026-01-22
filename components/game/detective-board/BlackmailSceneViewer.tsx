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
  color: string
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
      color: 'bg-red-900',
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
      color: 'bg-blue-900',
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
      color: 'bg-purple-900',
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

  // Selection screen
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-full pt-2 pb-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-[900px] mx-auto mt-2 mb-8" onClick={(e) => e.stopPropagation()}>
          {/* Back button */}
          <button
            onClick={onClose}
            className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Document title label */}
          <div 
            className="label"
            style={{
              background: '#1a1a1a',
              color: '#ffffff',
              padding: '12px 20px',
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '20px',
              width: '100%',
              borderRadius: '2px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
              border: '1px solid #333',
              textTransform: 'uppercase',
              fontSize: '14px'
            }}
          >
            BLACKMAIL PAPERS - FOUND NEAR BODY
          </div>

          {/* Main Container */}
          <div className="bg-[#f4f1ea] rounded-xl shadow-2xl border border-[#d1ccc0] overflow-hidden">

          {/* Evidence Note */}
          <div className="p-6 bg-[#fff8e7] border-b-2 border-[#d97706]">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-bold text-gray-800 mb-1">Evidence Overview</p>
                <p className="text-sm text-gray-700">
                  These documents were found scattered near Reginald&apos;s body at the crime scene. Each contains incriminating evidence on the suspects.
                </p>
              </div>
            </div>
          </div>

          {/* Selection cards - 3 column layout */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suspects.map((suspect) => (
                <button
                  key={suspect.id}
                  onClick={() => setSelectedSuspect(suspect.id)}
                  className="relative p-6 bg-white rounded-lg border-2 border-[#d1ccc0] hover:border-[#d97706] hover:shadow-xl transition-all group text-left"
                >
                  <div className={`absolute top-0 left-0 w-full h-2 rounded-t-lg ${suspect.color}`} />
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-1 mt-2 group-hover:text-[#d97706]">
                    {suspect.name}
                  </h4>
                  
                  <p className="text-xs text-gray-600 mb-4">{suspect.role}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      📎 {suspect.pageCount} {suspect.pageCount === 1 ? 'document' : 'documents'}
                    </span>
                    
                    <span className="text-[#d97706] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      View →
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





