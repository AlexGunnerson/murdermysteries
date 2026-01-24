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
 * Victim in center, facts on left, suspects on right
 */
export function calculateInitialLayout(
  facts: FactNodeData[],
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
  
  // Victim in center
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  
  nodes.push({
    id: victim.id,
    type: 'victim',
    position: { x: centerX - 60, y: centerY - 80 },
    data: { ...victim, isVictim: true },
  })
  
  // Facts on the left side - staggered vertically
  const factStartX = 50
  const factStartY = 50
  const factSpacingY = 140
  const factSpacingX = 220
  const factsPerColumn = Math.ceil(canvasHeight / factSpacingY) - 1
  
  facts.forEach((fact, index) => {
    const column = Math.floor(index / factsPerColumn)
    const row = index % factsPerColumn
    const offsetX = (row % 2) * 20 // Slight horizontal stagger
    const offsetY = (column % 2) * 30 // Slight vertical stagger
    
    nodes.push({
      id: fact.id,
      type: 'fact',
      position: {
        x: factStartX + column * factSpacingX + offsetX,
        y: factStartY + row * factSpacingY + offsetY,
      },
      data: fact,
    })
  })
  
  // Suspects on the right side
  const suspectStartX = canvasWidth - 180
  const suspectStartY = 80
  const suspectSpacingY = 150
  
  suspects.forEach((suspect, index) => {
    const offsetX = (index % 2) * -30 // Slight horizontal stagger
    
    nodes.push({
      id: suspect.id,
      type: 'suspect',
      position: {
        x: suspectStartX + offsetX,
        y: suspectStartY + index * suspectSpacingY,
      },
      data: suspect,
    })
  })
  
  return nodes
}

/**
 * Generate a unique ID for connections
 */
export function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
