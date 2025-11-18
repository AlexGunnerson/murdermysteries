import { createClient } from '@/lib/supabase/server'

// Type definitions
export interface Suspect {
  id: string
  name: string
  role: string
  bio: string
  portraitUrl: string
  initiallyAvailable: boolean
}

export interface Location {
  id: string
  name: string
  description: string
  imageUrl: string
  dpCost: number
  initiallyAvailable: boolean
  unlockConditions?: {
    requiredFacts: string[]
  }
}

export interface Record {
  id: string
  name: string
  description: string
  documentUrl?: string
  content?: string
  dpCost: number
  initiallyAvailable: boolean
  unlockConditions?: {
    requiredFacts: string[]
  }
}

export interface CaseMetadata {
  id: string
  title: string
  slug: string
  description: string
  difficulty: string
  estimatedTime: string
  suspects: Suspect[]
  locations: Location[]
  records: Record[]
}

export interface Fact {
  id: string
  content: string
  category: string
  importance: number
  sources: string[]
}

export interface TheoryRule {
  id: string
  requiredFacts: string[]
  result: 'correct' | 'partial' | 'incorrect'
  feedback: string
  unlocks?: {
    suspects?: string[]
    scenes?: string[]
    records?: string[]
  }
}

export interface Solution {
  killer: string
  killerName: string
  motive: string
  method: string
  requiredEvidence: string[]
  narrativeCorrect: string
  narrativeIncorrect: string
}

export interface SuspectConfig {
  personality: string
  alibi: string
  secrets: string[]
  facts: Record<string, string>
}

export interface StoryConfig {
  caseId: string
  briefing: {
    title: string
    content: string
  }
  systemPrompt: string
  suspects: Record<string, SuspectConfig>
  factTree: Fact[]
  theoryRules: TheoryRule[]
  solution: Solution
  clues: Array<{
    context: any
    text: string
    priority: number
  }>
}

export class StoryService {
  private caseId: string
  private metadata: CaseMetadata | null = null
  private storyConfig: StoryConfig | null = null

  constructor(caseId: string) {
    this.caseId = caseId
  }

  /**
   * Load case metadata from JSON file
   */
  async loadMetadata(): Promise<CaseMetadata> {
    if (this.metadata) {
      return this.metadata
    }

    try {
      // In development, load from public/cases directory
      const response = await fetch(`/cases/${this.caseId}/metadata.json`)
      if (!response.ok) {
        throw new Error(`Failed to load case metadata: ${response.statusText}`)
      }
      this.metadata = await response.json()
      return this.metadata
    } catch (error) {
      console.error('Error loading case metadata:', error)
      throw new Error(`Case ${this.caseId} not found`)
    }
  }

  /**
   * Load story configuration from JSON file
   */
  async loadStoryConfig(): Promise<StoryConfig> {
    if (this.storyConfig) {
      return this.storyConfig
    }

    try {
      const response = await fetch(`/cases/${this.caseId}/story-config.json`)
      if (!response.ok) {
        throw new Error(`Failed to load story config: ${response.statusText}`)
      }
      this.storyConfig = await response.json()
      return this.storyConfig
    } catch (error) {
      console.error('Error loading story config:', error)
      throw new Error(`Story config for ${this.caseId} not found`)
    }
  }

  /**
   * Get all suspects for this case
   */
  async getSuspects(): Promise<Suspect[]> {
    const metadata = await this.loadMetadata()
    return metadata.suspects
  }

  /**
   * Get a specific suspect by ID
   */
  async getSuspect(suspectId: string): Promise<Suspect | null> {
    const suspects = await this.getSuspects()
    return suspects.find(s => s.id === suspectId) || null
  }

  /**
   * Get all locations/scenes for this case
   */
  async getLocations(): Promise<Location[]> {
    const metadata = await this.loadMetadata()
    return metadata.locations
  }

  /**
   * Get a specific location by ID
   */
  async getLocation(locationId: string): Promise<Location | null> {
    const locations = await this.getLocations()
    return locations.find(l => l.id === locationId) || null
  }

  /**
   * Get all records for this case
   */
  async getRecords(): Promise<Record[]> {
    const metadata = await this.loadMetadata()
    return metadata.records
  }

  /**
   * Get a specific record by ID
   */
  async getRecord(recordId: string): Promise<Record | null> {
    const records = await this.getRecords()
    return records.find(r => r.id === recordId) || null
  }

  /**
   * Get the case briefing
   */
  async getBriefing(): Promise<{ title: string; content: string }> {
    const config = await this.loadStoryConfig()
    return config.briefing
  }

  /**
   * Get AI system prompt for a suspect
   */
  async getSuspectPrompt(
    suspectId: string,
    discoveredFacts: string[]
  ): Promise<string> {
    const config = await this.loadStoryConfig()
    const metadata = await this.loadMetadata()
    
    const suspect = metadata.suspects.find(s => s.id === suspectId)
    const suspectConfig = config.suspects[suspectId]

    if (!suspect || !suspectConfig) {
      throw new Error(`Suspect ${suspectId} not found`)
    }

    // Build dynamic knowledge based on discovered facts
    const relevantFacts = discoveredFacts.filter(factId => {
      const fact = config.factTree.find(f => f.id === factId)
      return fact && fact.sources.includes(suspectId)
    })

    const dynamicKnowledge = relevantFacts.length > 0
      ? `The detective has discovered: ${relevantFacts.join(', ')}`
      : 'The detective is just beginning their investigation.'

    // Replace template variables in system prompt
    let prompt = config.systemPrompt
      .replace('{suspect_name}', suspect.name)
      .replace('{suspect_role}', suspect.role)
      .replace('{suspect_bio}', suspect.bio)
      .replace('{suspect_personality}', suspectConfig.personality)
      .replace('{suspect_alibi}', suspectConfig.alibi)
      .replace('{dynamic_knowledge}', dynamicKnowledge)

    return prompt
  }

  /**
   * Get all facts in the fact tree
   */
  async getFactTree(): Promise<Fact[]> {
    const config = await this.loadStoryConfig()
    return config.factTree
  }

  /**
   * Check if a fact can be discovered from a source
   */
  async canDiscoverFact(factId: string, sourceId: string): Promise<boolean> {
    const config = await this.loadStoryConfig()
    const fact = config.factTree.find(f => f.id === factId)
    return fact ? fact.sources.includes(sourceId) : false
  }

  /**
   * Validate a theory against defined rules
   */
  async validateTheory(factIds: string[]): Promise<TheoryRule | null> {
    const config = await this.loadStoryConfig()
    
    // Find matching theory rule
    for (const rule of config.theoryRules) {
      const hasAllFacts = rule.requiredFacts.every(factId => 
        factIds.includes(factId)
      )
      if (hasAllFacts) {
        return rule
      }
    }

    return null
  }

  /**
   * Validate the final solution
   */
  async validateSolution(
    killer: string,
    evidence: string[]
  ): Promise<{
    isCorrect: boolean
    narrative: string
    solution: Solution
  }> {
    const config = await this.loadStoryConfig()
    const solution = config.solution

    const isCorrectKiller = killer === solution.killer
    const hasRequiredEvidence = solution.requiredEvidence.every(factId =>
      evidence.includes(factId)
    )

    const isCorrect = isCorrectKiller && hasRequiredEvidence

    let narrative = isCorrect 
      ? solution.narrativeCorrect 
      : solution.narrativeIncorrect

    // Replace placeholder in incorrect narrative
    if (!isCorrect && killer !== solution.killer) {
      const suspects = await this.getSuspects()
      const accusedSuspect = suspects.find(s => s.id === killer)
      narrative = narrative.replace(
        '{incorrect_accusation_feedback}',
        `You accused ${accusedSuspect?.name || 'the wrong person'}, but they were innocent.`
      )
    }

    return {
      isCorrect,
      narrative,
      solution
    }
  }

  /**
   * Get contextual clue based on game state
   */
  async getContextualClue(
    actionCount: number,
    discoveredFacts: string[]
  ): Promise<string | null> {
    const config = await this.loadStoryConfig()

    // Sort clues by priority
    const sortedClues = [...config.clues].sort((a, b) => b.priority - a.priority)

    for (const clue of sortedClues) {
      const context = clue.context

      // Check action count condition
      if (context.minActions && actionCount < context.minActions) {
        continue
      }

      // Check discovered facts count range
      if (context.discoveredFactsCount) {
        const factCount = discoveredFacts.length
        if (factCount < context.discoveredFactsCount.min || 
            factCount > context.discoveredFactsCount.max) {
          continue
        }
      }

      // Check required discovered facts
      if (context.discoveredFacts) {
        const hasRequired = context.discoveredFacts.every((factId: string) =>
          discoveredFacts.includes(factId)
        )
        if (!hasRequired) {
          continue
        }
      }

      // Check missing facts (clue only shown if these facts NOT discovered)
      if (context.missingFacts) {
        const hasMissing = context.missingFacts.some((factId: string) =>
          discoveredFacts.includes(factId)
        )
        if (hasMissing) {
          continue
        }
      }

      // All conditions met, return this clue
      return clue.text
    }

    return null
  }

  /**
   * Check if content should be unlocked based on discovered facts
   */
  async shouldUnlock(
    unlockConditions: { requiredFacts: string[] } | undefined,
    discoveredFacts: string[]
  ): Promise<boolean> {
    if (!unlockConditions) {
      return true
    }

    return unlockConditions.requiredFacts.every(factId =>
      discoveredFacts.includes(factId)
    )
  }
}

/**
 * Create a story service instance for a case
 */
export function createStoryService(caseId: string): StoryService {
  return new StoryService(caseId)
}

