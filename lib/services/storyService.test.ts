import { StoryService, createStoryService } from './storyService'

// Mock fetch
global.fetch = jest.fn()

const mockMetadata = {
  id: 'case01',
  title: 'Test Case',
  slug: 'case01',
  description: 'A test case',
  difficulty: 'medium',
  estimatedTime: '30 minutes',
  suspects: [
    {
      id: 'suspect_1',
      name: 'John Doe',
      role: 'suspect',
      bio: 'A suspicious person',
      portraitUrl: '/images/john.jpg',
      initiallyAvailable: true
    }
  ],
  locations: [
    {
      id: 'scene_1',
      name: 'Crime Scene',
      description: 'The place where it happened',
      imageUrl: '/images/scene.jpg',
      initiallyAvailable: true
    }
  ],
  records: [
    {
      id: 'record_1',
      name: 'Police Report',
      description: 'Official report',
      initiallyAvailable: true
    }
  ]
}

const mockStoryConfig = {
  caseId: 'case01',
  briefing: {
    title: 'Case Briefing',
    content: 'This is the briefing'
  },
  systemPrompt: 'You are {suspect_name}, {suspect_role}. Bio: {suspect_bio}. Personality: {suspect_personality}. Alibi: {suspect_alibi}. Knowledge: {dynamic_knowledge}',
  suspects: {
    suspect_1: {
      personality: 'Nervous',
      alibi: 'Was at home',
      secrets: ['Secret 1'],
      facts: {
        fact_1: 'Reveals when asked'
      }
    }
  },
  factTree: [
    {
      id: 'fact_1',
      content: 'Important fact',
      category: 'evidence',
      importance: 1,
      sources: ['suspect_1']
    },
    {
      id: 'fact_2',
      content: 'Another fact',
      category: 'motive',
      importance: 2,
      sources: ['scene_1']
    }
  ],
  theoryRules: [
    {
      id: 'theory_1',
      requiredFacts: ['fact_1', 'fact_2'],
      result: 'correct' as const,
      feedback: 'Good job!',
      unlocks: {
        scenes: ['scene_2']
      }
    }
  ],
  solution: {
    killer: 'suspect_1',
    killerName: 'John Doe',
    motive: 'Greed',
    method: 'Poisoning',
    requiredEvidence: ['fact_1', 'fact_2'],
    narrativeCorrect: 'You solved it!',
    narrativeIncorrect: 'Wrong answer. {incorrect_accusation_feedback}'
  },
  clues: [
    {
      context: {
        minActions: 5,
        discoveredFactsCount: { min: 0, max: 2 }
      },
      text: 'Consider checking the evidence',
      priority: 1
    }
  ]
}

describe('StoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('metadata.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMetadata)
        })
      }
      if (url.includes('story-config.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStoryConfig)
        })
      }
      return Promise.resolve({
        ok: false,
        statusText: 'Not Found'
      })
    })
  })

  describe('loadMetadata', () => {
    it('should load case metadata', async () => {
      const service = new StoryService('case01')
      const metadata = await service.loadMetadata()

      expect(metadata).toEqual(mockMetadata)
      expect(global.fetch).toHaveBeenCalledWith('/cases/case01/metadata.json')
    })

    it('should cache metadata after first load', async () => {
      const service = new StoryService('case01')
      await service.loadMetadata()
      await service.loadMetadata()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw error if metadata not found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      })

      const service = new StoryService('invalid')
      await expect(service.loadMetadata()).rejects.toThrow('Case invalid not found')
    })
  })

  describe('getSuspects', () => {
    it('should return all suspects', async () => {
      const service = new StoryService('case01')
      const suspects = await service.getSuspects()

      expect(suspects).toEqual(mockMetadata.suspects)
    })
  })

  describe('getSuspect', () => {
    it('should return a specific suspect', async () => {
      const service = new StoryService('case01')
      const suspect = await service.getSuspect('suspect_1')

      expect(suspect).toEqual(mockMetadata.suspects[0])
    })

    it('should return null for non-existent suspect', async () => {
      const service = new StoryService('case01')
      const suspect = await service.getSuspect('invalid')

      expect(suspect).toBeNull()
    })
  })

  describe('getBriefing', () => {
    it('should return case briefing', async () => {
      const service = new StoryService('case01')
      const briefing = await service.getBriefing()

      expect(briefing).toEqual(mockStoryConfig.briefing)
    })
  })

  describe('getSuspectPrompt', () => {
    it('should generate AI prompt with template variables replaced', async () => {
      const service = new StoryService('case01')
      const prompt = await service.getSuspectPrompt('suspect_1', [])

      expect(prompt).toContain('John Doe')
      expect(prompt).toContain('suspect')
      expect(prompt).toContain('A suspicious person')
      expect(prompt).toContain('Nervous')
      expect(prompt).toContain('Was at home')
      expect(prompt).toContain('just beginning their investigation')
    })

    it('should include discovered facts in prompt', async () => {
      const service = new StoryService('case01')
      const prompt = await service.getSuspectPrompt('suspect_1', ['fact_1'])

      expect(prompt).toContain('fact_1')
    })
  })

  describe('getFactTree', () => {
    it('should return all facts', async () => {
      const service = new StoryService('case01')
      const facts = await service.getFactTree()

      expect(facts).toEqual(mockStoryConfig.factTree)
    })
  })

  describe('canDiscoverFact', () => {
    it('should return true if source can reveal fact', async () => {
      const service = new StoryService('case01')
      const canDiscover = await service.canDiscoverFact('fact_1', 'suspect_1')

      expect(canDiscover).toBe(true)
    })

    it('should return false if source cannot reveal fact', async () => {
      const service = new StoryService('case01')
      const canDiscover = await service.canDiscoverFact('fact_1', 'scene_1')

      expect(canDiscover).toBe(false)
    })
  })

  describe('validateTheory', () => {
    it('should return matching theory rule', async () => {
      const service = new StoryService('case01')
      const result = await service.validateTheory(['fact_1', 'fact_2'])

      expect(result).toEqual(mockStoryConfig.theoryRules[0])
    })

    it('should return null if no theory matches', async () => {
      const service = new StoryService('case01')
      const result = await service.validateTheory(['fact_1'])

      expect(result).toBeNull()
    })
  })

  describe('validateSolution', () => {
    it('should validate correct solution', async () => {
      const service = new StoryService('case01')
      const result = await service.validateSolution('suspect_1', ['fact_1', 'fact_2'])

      expect(result.isCorrect).toBe(true)
      expect(result.narrative).toContain('You solved it!')
    })

    it('should reject incorrect killer', async () => {
      const service = new StoryService('case01')
      const result = await service.validateSolution('suspect_2', ['fact_1', 'fact_2'])

      expect(result.isCorrect).toBe(false)
      expect(result.narrative).toContain('Wrong answer')
    })

    it('should reject solution with missing evidence', async () => {
      const service = new StoryService('case01')
      const result = await service.validateSolution('suspect_1', ['fact_1'])

      expect(result.isCorrect).toBe(false)
    })
  })

  describe('getContextualClue', () => {
    it('should return clue when conditions are met', async () => {
      const service = new StoryService('case01')
      const clue = await service.getContextualClue(5, ['fact_1'])

      expect(clue).toBe('Consider checking the evidence')
    })

    it('should return null when action count is too low', async () => {
      const service = new StoryService('case01')
      const clue = await service.getContextualClue(3, ['fact_1'])

      expect(clue).toBeNull()
    })

    it('should return null when too many facts discovered', async () => {
      const service = new StoryService('case01')
      const clue = await service.getContextualClue(5, ['fact_1', 'fact_2', 'fact_3'])

      expect(clue).toBeNull()
    })
  })

  describe('shouldUnlock', () => {
    it('should return true if no unlock conditions', async () => {
      const service = new StoryService('case01')
      const shouldUnlock = await service.shouldUnlock(undefined, [])

      expect(shouldUnlock).toBe(true)
    })

    it('should return true if all required facts discovered', async () => {
      const service = new StoryService('case01')
      const shouldUnlock = await service.shouldUnlock(
        { requiredFacts: ['fact_1', 'fact_2'] },
        ['fact_1', 'fact_2', 'fact_3']
      )

      expect(shouldUnlock).toBe(true)
    })

    it('should return false if missing required facts', async () => {
      const service = new StoryService('case01')
      const shouldUnlock = await service.shouldUnlock(
        { requiredFacts: ['fact_1', 'fact_2'] },
        ['fact_1']
      )

      expect(shouldUnlock).toBe(false)
    })
  })

  describe('createStoryService', () => {
    it('should create a story service instance', () => {
      const service = createStoryService('case01')

      expect(service).toBeInstanceOf(StoryService)
    })
  })
})

