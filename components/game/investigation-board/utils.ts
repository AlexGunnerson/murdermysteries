// Utility functions for the Investigation Board

import { DiscoveredFact } from '@/lib/store/gameStore'
import { FactNodeData, getFriendlySourceName } from './types'

/**
 * Generate a short summary of a fact (first few meaningful words)
 * This helps users quickly identify facts when truncated
 */
export function summarizeFact(content: string, maxWords: number = 6): string {
  // Remove common starting phrases
  let text = content
    .replace(/^(The |A |An |It |He |She |They |This |That |There )/i, '')
    .trim()
  
  // Split into words and take first N
  const words = text.split(/\s+/)
  if (words.length <= maxWords) {
    return text
  }
  
  return words.slice(0, maxWords).join(' ') + '...'
}

/**
 * Detect suspect names mentioned in a fact's content
 */
export function detectMentionedSuspects(content: string): string[] {
  const suspectPatterns = [
    { id: 'suspect_colin', patterns: ['Colin', 'colin'] },
    { id: 'suspect_lydia', patterns: ['Lydia', 'lydia'] },
    { id: 'suspect_vale', patterns: ['Vale', 'vale', 'Dr. Vale', 'Dr Vale', 'Edmund'] },
    { id: 'suspect_martin', patterns: ['Martin', 'martin'] },
    { id: 'suspect_veronica', patterns: ['Veronica', 'veronica', 'Mrs. Ashcombe'] },
    { id: 'victim_reginald', patterns: ['Reginald', 'reginald', 'Mr. Ashcombe', 'the victim'] },
  ]
  
  const mentioned: string[] = []
  
  for (const suspect of suspectPatterns) {
    for (const pattern of suspect.patterns) {
      if (content.includes(pattern)) {
        mentioned.push(suspect.id)
        break
      }
    }
  }
  
  return mentioned
}

/**
 * Convert a DiscoveredFact to FactNodeData
 */
export function factToNodeData(fact: DiscoveredFact): FactNodeData {
  return {
    id: fact.id,
    content: fact.content,
    summary: summarizeFact(fact.content),
    source: fact.source,
    sourceId: fact.sourceId,
    friendlySourceName: getFriendlySourceName(fact.sourceId),
    discoveredAt: fact.discoveredAt,
  }
}

/**
 * Calculate initial positions for board elements
 * Default positions based on user's preferred layout
 * Facts are no longer placed automatically - they must be dragged from the panel
 */
export function calculateInitialLayout(
  suspects: { id: string; name: string; portraitUrl: string }[],
  victim: { id: string; name: string; portraitUrl: string },
  canvasWidth: number = 1200,
  canvasHeight: number = 800
) {
  const nodes: Array<{
    id: string
    type: 'fact' | 'suspect' | 'victim'
    position: { x: number; y: number }
    data: any
  }> = []
  
  // Victim - center-top area
  nodes.push({
    id: victim.id,
    type: 'victim',
    position: { x: 640, y: 370 },
    data: { ...victim, isVictim: true },
  })
  
  // Map of suspect IDs to their default positions
  const suspectPositions: Record<string, { x: number; y: number }> = {
    'suspect_veronica': { x: 798, y: 395 },
    'suspect_martin': { x: 494, y: 568 },
    'suspect_colin': { x: 987, y: 565 },
    'suspect_lydia': { x: 645, y: 605 },
    'suspect_vale': { x: 812, y: 596 },
  }
  
  // Place suspects using the predefined positions
  suspects.forEach((suspect) => {
    const position = suspectPositions[suspect.id] || { x: 700, y: 400 }
    
    nodes.push({
      id: suspect.id,
      type: 'suspect',
      position,
      data: suspect,
    })
  })
  
  return nodes
}

/**
 * Create a fact node at the dropped position
 */
export function createFactNode(
  fact: FactNodeData,
  position: { x: number; y: number }
) {
  return {
    id: fact.id,
    type: 'fact' as const,
    position,
    data: fact,
    draggable: true,
  }
}

/**
 * Generate a unique ID for connections
 */
export function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
