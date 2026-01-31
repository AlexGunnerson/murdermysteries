/**
 * Test-friendly Story Service wrapper
 * Loads story config directly from file system instead of using fetch()
 */

import fs from 'fs/promises'
import path from 'path'

export interface StoryConfig {
  caseId: string
  briefing: {
    title: string
    content: string
  }
  systemPrompt: string
  suspects: Record<string, any>
  factTree: any[]
  theoryRules: any[]
  solution: any
  clues: any[]
}

export interface CaseMetadata {
  id: string
  title: string
  slug: string
  description: string
  difficulty: string
  estimatedTime: string
  suspects: any[]
  locations: any[]
  records: any[]
}

export class TestStoryService {
  private caseId: string
  private metadata: CaseMetadata | null = null
  private storyConfig: StoryConfig | null = null
  private basePath: string

  constructor(caseId: string) {
    this.caseId = caseId
    this.basePath = path.join(process.cwd(), 'public', 'cases', caseId)
  }

  async loadMetadata(): Promise<CaseMetadata> {
    if (this.metadata) {
      return this.metadata
    }

    const metadataPath = path.join(this.basePath, 'metadata.json')
    const content = await fs.readFile(metadataPath, 'utf-8')
    this.metadata = JSON.parse(content)
    return this.metadata!
  }

  async loadStoryConfig(): Promise<StoryConfig> {
    if (this.storyConfig) {
      return this.storyConfig
    }

    const configPath = path.join(this.basePath, 'story-config.json')
    const content = await fs.readFile(configPath, 'utf-8')
    this.storyConfig = JSON.parse(content)
    return this.storyConfig!
  }

  async getSuspect(suspectId: string) {
    const metadata = await this.loadMetadata()
    return metadata.suspects.find((s: any) => s.id === suspectId) || null
  }

  async getSuspects() {
    const metadata = await this.loadMetadata()
    return metadata.suspects
  }

  async getBriefing() {
    const config = await this.loadStoryConfig()
    return config.briefing
  }

  async getSuspectPrompt(suspectId: string, discoveredFacts: string[]) {
    const config = await this.storyConfig || await this.loadStoryConfig()
    const metadata = await this.metadata || await this.loadMetadata()
    
    const suspectMeta = metadata.suspects.find((s: any) => s.id === suspectId)
    const suspectConfig = config.suspects[suspectId]
    
    if (!suspectMeta || !suspectConfig) {
      throw new Error(`Suspect ${suspectId} not found`)
    }

    // Build dynamic knowledge string
    let dynamicKnowledge = 'just beginning their investigation'
    if (discoveredFacts.length > 0) {
      dynamicKnowledge = `discovered the following: ${discoveredFacts.join(', ')}`
    }

    // Replace template variables
    let prompt = config.systemPrompt
    prompt = prompt.replace(/{suspect_name}/g, suspectMeta.name)
    prompt = prompt.replace(/{suspect_role}/g, suspectMeta.role)
    prompt = prompt.replace(/{suspect_bio}/g, suspectMeta.bio)
    prompt = prompt.replace(/{suspect_personality}/g, suspectConfig.personality)
    prompt = prompt.replace(/{suspect_alibi}/g, suspectConfig.alibi)
    prompt = prompt.replace(/{suspect_secrets}/g, suspectConfig.secrets.join('\n'))
    prompt = prompt.replace(/{dynamic_knowledge}/g, dynamicKnowledge)

    return prompt
  }

  async getFactTree() {
    const config = await this.loadStoryConfig()
    return config.factTree
  }

  async canDiscoverFact(factId: string, sourceId: string) {
    const facts = await this.getFactTree()
    const fact = facts.find((f: any) => f.id === factId)
    return fact?.sources.includes(sourceId) || false
  }

  async validateTheory(artifactIds: string[]) {
    const config = await this.loadStoryConfig()
    
    for (const rule of config.theoryRules) {
      const hasAllFacts = rule.requiredFacts.every((f: string) => 
        artifactIds.includes(f)
      )
      if (hasAllFacts) {
        return rule
      }
    }
    
    return null
  }

  async validateSolution(killer: string, evidenceIds: string[]) {
    const config = await this.loadStoryConfig()
    const solution = config.solution
    
    const isCorrectKiller = killer === solution.killer
    const hasRequiredEvidence = solution.requiredEvidence.every((e: string) =>
      evidenceIds.includes(e)
    )
    
    return {
      isCorrect: isCorrectKiller && hasRequiredEvidence,
      narrative: isCorrectKiller && hasRequiredEvidence 
        ? solution.narrativeCorrect 
        : solution.narrativeIncorrect,
    }
  }

  async getContextualClue(actionCount: number, discoveredFacts: string[]) {
    const config = await this.loadStoryConfig()
    
    for (const clue of config.clues) {
      const { context } = clue
      
      // Check action count
      if (context.minActions && actionCount < context.minActions) {
        continue
      }
      
      // Check discovered facts count
      if (context.discoveredFactsCount) {
        const factCount = discoveredFacts.length
        if (factCount < context.discoveredFactsCount.min || 
            factCount > context.discoveredFactsCount.max) {
          continue
        }
      }
      
      // Check required discovered facts
      if (context.discoveredFacts) {
        const hasAllFacts = context.discoveredFacts.every((f: string) =>
          discoveredFacts.includes(f)
        )
        if (!hasAllFacts) continue
      }
      
      // Check missing facts
      if (context.missingFacts) {
        const hasMissingFact = context.missingFacts.some((f: string) =>
          discoveredFacts.includes(f)
        )
        if (hasMissingFact) continue
      }
      
      return clue.text
    }
    
    return null
  }

  async shouldUnlock(unlockConditions: any, discoveredFacts: string[]) {
    if (!unlockConditions || !unlockConditions.requiredFacts) {
      return true
    }
    
    return unlockConditions.requiredFacts.every((f: string) =>
      discoveredFacts.includes(f)
    )
  }
}
