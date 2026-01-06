"use client"

import { useState } from "react"
import { X, ArrowLeft } from "lucide-react"
import { DocumentHTMLViewer } from "./DocumentHTMLViewer"
import { MartinBlackmailPage1, MartinBlackmailPage2, MartinBlackmailPage3 } from "../documents/MartinBlackmailDocs"
import { ColinBlackmailPage1, ColinBlackmailPage2 } from "../documents/ColinBlackmailDocs"
import { LydiaBlackmailPage1, LydiaBlackmailPage2, LydiaBlackmailPage3 } from "../documents/LydiaBlackmailDocs"
import { ValeBlackmailPage1, ValeBlackmailPage2, ValeBlackmailPage3, ValeBlackmailPage4, ValeBlackmailPage5 } from "../documents/ValeBlackmailDocs"

interface BlackmailViewerProps {
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

export function BlackmailViewer({ onClose }: BlackmailViewerProps) {
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
          content: <ColinBlackmailPage1 />
        },
        {
          label: "DOCUMENT 2 OF 2",
          content: <ColinBlackmailPage2 />
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
    },
    {
      id: 'vale',
      name: 'Dr. Leonard Vale',
      role: 'The Physician',
      pageCount: 5,
      color: 'bg-green-900',
      pages: [
        {
          label: "DOCUMENT 1 OF 5",
          content: <ValeBlackmailPage1 />
        },
        {
          label: "DOCUMENT 2 OF 5",
          content: <ValeBlackmailPage2 />
        },
        {
          label: "DOCUMENT 3 OF 5",
          content: <ValeBlackmailPage3 />
        },
        {
          label: "DOCUMENT 4 OF 5",
          content: <ValeBlackmailPage4 />
        },
        {
          label: "DOCUMENT 5 OF 5",
          content: <ValeBlackmailPage5 />
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
          className="fixed top-20 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg flex items-center gap-2"
          aria-label="Back to selection"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back to List</span>
        </button>

        <DocumentHTMLViewer
          documentName={`${selectedSuspectData.name} - Blackmail Evidence`}
          pages={selectedSuspectData.pages}
          onClose={onClose}
        />
      </div>
    )
  }

  // Selection screen
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-colors z-10 shadow-lg"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main Container */}
        <div className="bg-[#f4f1ea] rounded-xl shadow-2xl border border-[#d1ccc0] overflow-hidden">
          {/* Header */}
          <div className="bg-[#2c3e50] text-white p-6">
            <h3 className="text-2xl font-bold mb-2">Blackmail Papers (Found Behind Painting)</h3>
            <p className="text-sm text-gray-300">Select a suspect to view their documents</p>
          </div>

          {/* Evidence Note */}
          <div className="p-6 bg-[#fff8e7] border-b-2 border-[#d97706]">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-bold text-gray-800 mb-1">Evidence Overview</p>
                <p className="text-sm text-gray-700">
                  These documents were found hidden behind a painting in the master bedroom. Each contains incriminating evidence that Reginald had collected on the suspects.
                </p>
              </div>
            </div>
          </div>

          {/* Selection cards - 4 column layout for 4 suspects */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  )
}

