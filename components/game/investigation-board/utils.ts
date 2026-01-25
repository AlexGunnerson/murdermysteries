// Utility functions for the Investigation Board

import { getFriendlySourceName } from './types'

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
 * Calculate initial positions for board elements
 * Default positions based on user's preferred layout
 */
export function calculateInitialLayout(
  suspects: { id: string; name: string; portraitUrl: string }[],
  victim: { id: string; name: string; portraitUrl: string },
  canvasWidth: number = 1200,
  canvasHeight: number = 800
) {
  const nodes: Array<{
    id: string
    type: 'suspect' | 'victim'
    position: { x: number; y: number }
    data: any
  }> = []
  
  // Victim - center-top area
  nodes.push({
    id: victim.id,
    type: 'victim',
    position: { x: 622, y: 292 },
    data: { ...victim, suspectId: victim.id, isVictim: true },
  })
  
  // Map of suspect IDs to their default positions
  const suspectPositions: Record<string, { x: number; y: number }> = {
    'suspect_veronica': { x: 841, y: 320 },
    'suspect_martin': { x: 424, y: 510 },
    'suspect_colin': { x: 1086, y: 483 },
    'suspect_lydia': { x: 646, y: 554 },
    'suspect_vale': { x: 853, y: 591 },
  }
  
  // Place suspects using the predefined positions
  suspects.forEach((suspect) => {
    const position = suspectPositions[suspect.id] || { x: 700, y: 400 }
    
    nodes.push({
      id: suspect.id,
      type: 'suspect',
      position,
      data: { ...suspect, suspectId: suspect.id },
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
