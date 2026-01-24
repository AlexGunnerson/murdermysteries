"use client"

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, FileText, MessageSquare, MapPin, Folder, StickyNote, ZoomIn, ZoomOut, Maximize2, Image } from 'lucide-react'
import { DiscoveredFact } from '@/lib/store/gameStore'
import { getFriendlySourceName } from './types'

type FactSource = 'all' | 'chat' | 'record' | 'scene' | 'clue'

interface LeftPanelProps {
  discoveredFacts: DiscoveredFact[]
  onFactDragStart: (fact: DiscoveredFact, event: React.DragEvent) => void
  placedFactIds: Set<string>
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onPhotoClick: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function LeftPanel({ 
  discoveredFacts, 
  onFactDragStart, 
  placedFactIds,
  onZoomIn,
  onZoomOut,
  onFitView,
  onPhotoClick,
  isOpen,
  setIsOpen,
}: LeftPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<FactSource>('all')
  
  // Filter facts based on selected filter
  const filteredFacts = useMemo(() => {
    if (selectedFilter === 'all') {
      return discoveredFacts
    }
    return discoveredFacts.filter(fact => fact.source === selectedFilter)
  }, [discoveredFacts, selectedFilter])
  
  // Get icon for source type
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'chat':
        return <MessageSquare className="w-3 h-3" />
      case 'record':
      case 'clue':
        return <FileText className="w-3 h-3" />
      case 'scene':
        return <MapPin className="w-3 h-3" />
      default:
        return <FileText className="w-3 h-3" />
    }
  }
  
  // Count facts by source
  const factCounts = useMemo(() => {
    const counts = {
      all: discoveredFacts.length,
      chat: 0,
      record: 0,
      scene: 0,
      clue: 0,
    }
    
    discoveredFacts.forEach(fact => {
      if (fact.source in counts) {
        counts[fact.source as keyof typeof counts]++
      }
    })
    
    return counts
  }, [discoveredFacts])
  
  if (!isOpen) {
    // Collapsed state - just toolbar icons including folder icon
    return (
      <div
        className="absolute top-1/2 left-4 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 p-2.5 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
          border: '1px solid #d4af37',
          boxShadow: '4px 0 16px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15)',
        }}
      >
        {/* Note button */}
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/note', 'new-note')
            e.dataTransfer.effectAllowed = 'copy'
          }}
          className="cursor-grab active:cursor-grabbing"
          title="Drag to add note"
        >
          <ToolbarButton>
            <StickyNote className="w-5 h-5" />
          </ToolbarButton>
        </div>
        
        {/* Facts toggle button */}
        <ToolbarButton
          onClick={() => setIsOpen(true)}
          title={`Discovered Facts (${discoveredFacts.length})`}
        >
          <Folder className="w-6 h-6" />
        </ToolbarButton>
        
        {/* Photo button */}
        <ToolbarButton
          onClick={onPhotoClick}
          title="Open Photo Gallery"
        >
          <Image className="w-5 h-5" />
        </ToolbarButton>
        
        <div className="w-full h-px bg-gray-600 my-0.5" />
        
        <ToolbarButton
          onClick={onZoomOut}
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={onZoomIn}
          title="Zoom In (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={onFitView}
          title="Fit to View (F)"
        >
          <Maximize2 className="w-5 h-5" />
        </ToolbarButton>
      </div>
    )
  }
  
  // Open state - full panel with facts as overlay
  return (
    <div
      className="absolute top-4 left-4 h-[calc(100%-2rem)] z-40 flex flex-col rounded-lg"
      style={{
        width: '380px',
        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '1px solid rgba(107, 114, 128, 0.5)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
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
          DISCOVERED FACTS
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded hover:bg-gray-700/50 transition-colors"
          title="Close Panel"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 p-3 border-b" style={{ borderColor: 'rgba(107, 114, 128, 0.5)' }}>
        <FilterButton
          active={selectedFilter === 'all'}
          onClick={() => setSelectedFilter('all')}
          count={factCounts.all}
        >
          All
        </FilterButton>
        <FilterButton
          active={selectedFilter === 'chat'}
          onClick={() => setSelectedFilter('chat')}
          count={factCounts.chat}
          icon={<MessageSquare className="w-3 h-3" />}
        >
          Chat
        </FilterButton>
        <FilterButton
          active={selectedFilter === 'record'}
          onClick={() => setSelectedFilter('record')}
          count={factCounts.record + factCounts.clue}
          icon={<FileText className="w-3 h-3" />}
        >
          Records
        </FilterButton>
        <FilterButton
          active={selectedFilter === 'scene'}
          onClick={() => setSelectedFilter('scene')}
          count={factCounts.scene}
          icon={<MapPin className="w-3 h-3" />}
        >
          Scenes
        </FilterButton>
      </div>
      
      {/* Facts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {filteredFacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p 
              className="text-sm"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              {discoveredFacts.length === 0 
                ? 'No facts discovered yet.\nStart investigating!'
                : 'No facts match this filter.'}
            </p>
          </div>
        ) : (
          filteredFacts.map(fact => (
            <FactCard
              key={fact.id}
              fact={fact}
              onDragStart={(e) => onFactDragStart(fact, e)}
              isPlaced={placedFactIds.has(fact.id)}
              getSourceIcon={getSourceIcon}
            />
          ))
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
        Drag facts onto the board to organize your investigation
      </div>
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  count: number
  icon?: React.ReactNode
  children: React.ReactNode
}

function FilterButton({ active, onClick, count, icon, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all duration-200
        ${active 
          ? 'bg-gray-600/30 text-gray-200 shadow-inner border border-gray-600/50' 
          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-gray-200 border border-gray-700'
        }
      `}
      style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
    >
      {icon && <span className="scale-105">{icon}</span>}
      <span>{children}</span>
      <span className="ml-1 opacity-70">({count})</span>
    </button>
  )
}

interface FactCardProps {
  fact: DiscoveredFact
  onDragStart: (event: React.DragEvent) => void
  isPlaced: boolean
  getSourceIcon: (source: string) => React.ReactNode
}

function FactCard({ fact, onDragStart, isPlaced, getSourceIcon }: FactCardProps) {
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
        relative p-3 rounded cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : isPlaced ? 'opacity-50' : 'opacity-100 scale-100'}
        ${isPlaced ? 'border-gray-600/30' : 'border-gray-600/50'}
        hover:border-gray-400 hover:shadow-lg
      `}
      style={{
        background: 'rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        border: '1px solid',
      }}
    >
      {/* Content */}
      <p 
        className="text-xs text-gray-300 leading-relaxed mb-2 line-clamp-3"
        style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
      >
        {fact.content}
      </p>
      
      {/* Source */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
        <span className="scale-105">{getSourceIcon(fact.source)}</span>
        <span style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}>
          {getFriendlySourceName(fact.sourceId)}
        </span>
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
}

function ToolbarButton({ children, active, disabled, onClick, title }: ToolbarButtonProps) {
  return (
    <button
      className={`
        flex items-center justify-center p-2 rounded transition-all duration-200
        ${disabled 
          ? 'opacity-40 cursor-not-allowed text-gray-500' 
          : active
            ? 'bg-gray-600/30 text-gray-200 shadow-inner'
            : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
        }
      `}
      style={{
        fontFamily: "'Courier Prime', 'Courier New', monospace",
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}
