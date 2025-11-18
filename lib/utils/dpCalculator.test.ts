import {
  canAffordAction,
  calculateNewDP,
  getActionCost,
  calculateFactReward,
  validateAction,
  formatDPCost,
  calculateDPEfficiency,
  DP_COSTS,
  DP_REWARDS,
  INITIAL_DP,
} from './dpCalculator'

describe('dpCalculator', () => {
  describe('canAffordAction', () => {
    it('returns true for free actions', () => {
      expect(canAffordAction(0, 0)).toBe(true)
      expect(canAffordAction(5, 0)).toBe(true)
    })

    it('returns true for rewarding actions', () => {
      expect(canAffordAction(5, 1)).toBe(true)
    })

    it('returns true when player has enough DP', () => {
      expect(canAffordAction(10, -5)).toBe(true)
      expect(canAffordAction(5, -5)).toBe(true)
    })

    it('returns false when player does not have enough DP', () => {
      expect(canAffordAction(2, -5)).toBe(false)
      expect(canAffordAction(0, -1)).toBe(false)
    })
  })

  describe('calculateNewDP', () => {
    it('calculates correct new DP for negative costs', () => {
      expect(calculateNewDP(25, -3)).toBe(22)
      expect(calculateNewDP(5, -2)).toBe(3)
    })

    it('calculates correct new DP for positive rewards', () => {
      expect(calculateNewDP(20, 1)).toBe(21)
      expect(calculateNewDP(10, 5)).toBe(15)
    })

    it('never goes below 0', () => {
      expect(calculateNewDP(2, -5)).toBe(0)
      expect(calculateNewDP(0, -1)).toBe(0)
    })

    it('handles zero cost', () => {
      expect(calculateNewDP(25, 0)).toBe(25)
    })
  })

  describe('getActionCost', () => {
    it('returns correct costs for known actions', () => {
      expect(getActionCost('QUESTION_SUSPECTS')).toBe(0)
      expect(getActionCost('CHECK_RECORDS')).toBe(-2)
      expect(getActionCost('INVESTIGATE_SCENES')).toBe(-3)
      expect(getActionCost('VALIDATE_THEORY')).toBe(-3)
      expect(getActionCost('GET_CLUE')).toBe(-2)
      expect(getActionCost('SOLVE_MURDER')).toBe(0)
    })

    it('handles lowercase and hyphenated action names', () => {
      expect(getActionCost('question_suspects')).toBe(0)
      expect(getActionCost('check-records')).toBe(-2)
    })

    it('returns 0 for unknown actions', () => {
      expect(getActionCost('UNKNOWN_ACTION')).toBe(0)
    })
  })

  describe('calculateFactReward', () => {
    it('calculates correct reward for facts', () => {
      expect(calculateFactReward(1)).toBe(1)
      expect(calculateFactReward(5)).toBe(5)
      expect(calculateFactReward(0)).toBe(0)
    })
  })

  describe('validateAction', () => {
    it('validates free actions', () => {
      const result = validateAction('QUESTION_SUSPECTS', 0)
      expect(result.valid).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('validates actions with sufficient DP', () => {
      const result = validateAction('CHECK_RECORDS', 5)
      expect(result.valid).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('invalidates actions with insufficient DP', () => {
      const result = validateAction('INVESTIGATE_SCENES', 2)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Not enough Detective Points')
      expect(result.reason).toContain('3 DP')
    })
  })

  describe('formatDPCost', () => {
    it('formats free actions', () => {
      expect(formatDPCost(0)).toBe('Free')
    })

    it('formats positive rewards', () => {
      expect(formatDPCost(1)).toBe('+1 DP')
      expect(formatDPCost(5)).toBe('+5 DP')
    })

    it('formats negative costs', () => {
      expect(formatDPCost(-2)).toBe('-2 DP')
      expect(formatDPCost(-3)).toBe('-3 DP')
    })
  })

  describe('calculateDPEfficiency', () => {
    it('calculates efficiency correctly', () => {
      expect(calculateDPEfficiency(25, 15, 10)).toBe(1) // 10 facts / 10 DP used = 1.0
      expect(calculateDPEfficiency(25, 20, 5)).toBe(1) // 5 facts / 5 DP used = 1.0
    })

    it('returns 0 when no DP used', () => {
      expect(calculateDPEfficiency(25, 25, 5)).toBe(0)
    })

    it('handles decimal efficiency', () => {
      expect(calculateDPEfficiency(25, 20, 10)).toBe(2) // 10 facts / 5 DP used = 2.0
    })
  })

  describe('Constants', () => {
    it('has correct DP_COSTS values', () => {
      expect(DP_COSTS.QUESTION_SUSPECTS).toBe(0)
      expect(DP_COSTS.CHECK_RECORDS).toBe(-2)
      expect(DP_COSTS.INVESTIGATE_SCENES).toBe(-3)
    })

    it('has correct DP_REWARDS values', () => {
      expect(DP_REWARDS.NEW_FACT_DISCOVERED).toBe(1)
    })

    it('has correct INITIAL_DP', () => {
      expect(INITIAL_DP).toBe(25)
    })
  })
})

