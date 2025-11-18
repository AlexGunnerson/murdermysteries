import { renderHook, act } from '@testing-library/react'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useGameStore())
    act(() => {
      result.current.resetGame()
    })
  })

  describe('initializeGame', () => {
    it('initializes game with correct starting values', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame('case01')
      })

      expect(result.current.caseId).toBe('case01')
      expect(result.current.detectivePoints).toBe(25)
      expect(result.current.discoveredFacts).toHaveLength(0)
      expect(result.current.isCompleted).toBe(false)
    })

    it('generates a session ID', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame('case01')
      })

      expect(result.current.sessionId).toMatch(/^session_\d+$/)
    })
  })

  describe('Detective Points management', () => {
    it('sets detective points correctly', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setDetectivePoints(15)
      })

      expect(result.current.detectivePoints).toBe(15)
    })

    it('prevents negative detective points', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setDetectivePoints(-5)
      })

      expect(result.current.detectivePoints).toBe(0)
    })

    it('adds detective points correctly', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setDetectivePoints(20)
        result.current.addDetectivePoints(5)
      })

      expect(result.current.detectivePoints).toBe(25)
    })

    it('subtracts detective points correctly', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setDetectivePoints(25)
        result.current.subtractDetectivePoints(3)
      })

      expect(result.current.detectivePoints).toBe(22)
    })

    it('never goes below 0 when subtracting', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setDetectivePoints(5)
        result.current.subtractDetectivePoints(10)
      })

      expect(result.current.detectivePoints).toBe(0)
    })
  })

  describe('Discovered facts', () => {
    it('adds discovered fact with generated ID', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.addDiscoveredFact({
          content: 'Test fact',
          source: 'chat',
          sourceId: 'suspect_01',
        })
      })

      expect(result.current.discoveredFacts).toHaveLength(1)
      expect(result.current.discoveredFacts[0].content).toBe('Test fact')
      expect(result.current.discoveredFacts[0].id).toMatch(/^fact_/)
    })

    it('maintains order of discovered facts', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.addDiscoveredFact({
          content: 'Fact 1',
          source: 'chat',
          sourceId: 'suspect_01',
        })
        result.current.addDiscoveredFact({
          content: 'Fact 2',
          source: 'record',
          sourceId: 'record_01',
        })
      })

      expect(result.current.discoveredFacts).toHaveLength(2)
      expect(result.current.discoveredFacts[0].content).toBe('Fact 1')
      expect(result.current.discoveredFacts[1].content).toBe('Fact 2')
    })
  })

  describe('Chat history', () => {
    it('adds chat message with generated ID', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.addChatMessage({
          suspectId: 'suspect_01',
          role: 'user',
          content: 'Hello',
        })
      })

      expect(result.current.chatHistory).toHaveLength(1)
      expect(result.current.chatHistory[0].content).toBe('Hello')
      expect(result.current.chatHistory[0].id).toMatch(/^msg_/)
    })
  })

  describe('Theory submissions', () => {
    it('adds theory submission', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.addTheorySubmission({
          description: 'Test theory',
          artifactIds: ['fact_01', 'fact_02'],
          result: 'correct',
        })
      })

      expect(result.current.theoryHistory).toHaveLength(1)
      expect(result.current.theoryHistory[0].description).toBe('Test theory')
    })

    it('unlocks content from correct theory', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.addTheorySubmission({
          description: 'Test theory',
          artifactIds: ['fact_01'],
          result: 'correct',
          unlockedContent: {
            suspects: ['suspect_02'],
            scenes: ['scene_02'],
          },
        })
      })

      expect(result.current.unlockedContent.suspects.has('suspect_02')).toBe(true)
      expect(result.current.unlockedContent.scenes.has('scene_02')).toBe(true)
    })
  })

  describe('Unlocked content', () => {
    it('unlocks suspects', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.unlockSuspect('suspect_01')
        result.current.unlockSuspect('suspect_02')
      })

      expect(result.current.unlockedContent.suspects.has('suspect_01')).toBe(true)
      expect(result.current.unlockedContent.suspects.has('suspect_02')).toBe(true)
    })

    it('unlocks scenes', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.unlockScene('scene_01')
      })

      expect(result.current.unlockedContent.scenes.has('scene_01')).toBe(true)
    })

    it('unlocks records', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.unlockRecord('record_01')
      })

      expect(result.current.unlockedContent.records.has('record_01')).toBe(true)
    })
  })

  describe('Game completion', () => {
    it('marks game as completed', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.completeGame(true)
      })

      expect(result.current.isCompleted).toBe(true)
      expect(result.current.isSolvedCorrectly).toBe(true)
    })

    it('records incorrect solution', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.completeGame(false)
      })

      expect(result.current.isCompleted).toBe(true)
      expect(result.current.isSolvedCorrectly).toBe(false)
    })
  })

  describe('Loading and syncing states', () => {
    it('sets loading state', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('sets syncing state', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.setSyncing(true)
      })

      expect(result.current.isSyncing).toBe(true)
    })
  })

  describe('resetGame', () => {
    it('resets all game state', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame('case01')
        result.current.setDetectivePoints(10)
        result.current.addDiscoveredFact({
          content: 'Test',
          source: 'chat',
          sourceId: 'suspect_01',
        })
        result.current.resetGame()
      })

      expect(result.current.caseId).toBeNull()
      expect(result.current.detectivePoints).toBe(25)
      expect(result.current.discoveredFacts).toHaveLength(0)
    })
  })
})

