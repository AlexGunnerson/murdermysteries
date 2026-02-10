export interface QuickNote {
  id: string
  content: string
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'noir'
  createdAt: number
}

/**
 * Retrieves all quick notes for a specific case from localStorage
 * @param caseId - The case ID to retrieve notes for
 * @returns Array of QuickNote objects sorted by creation date (newest first)
 */
export function getQuickNotes(caseId: string): QuickNote[] {
  if (typeof window === 'undefined') return []
  
  try {
    const storageKey = `investigation-board-state-${caseId}`
    const stored = localStorage.getItem(storageKey)
    
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    const nodes = parsed.nodes || []
    
    // Filter for note nodes and extract their data
    const noteNodes = nodes.filter((node: any) => node.id.startsWith('note_'))
    
    // Map to QuickNote format with timestamp extraction
    const quickNotes: QuickNote[] = noteNodes.map((node: any) => {
      // Extract timestamp from ID pattern: note_${timestamp}_${random}
      const timestampMatch = node.id.match(/^note_(\d+)_/)
      const createdAt = timestampMatch ? parseInt(timestampMatch[1], 10) : Date.now()
      
      return {
        id: node.id,
        content: node.data?.content || '',
        color: node.data?.color || 'noir',
        createdAt,
      }
    })
    
    // Sort by creation date descending (newest first)
    return quickNotes.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('Failed to load quick notes:', error)
    return []
  }
}
