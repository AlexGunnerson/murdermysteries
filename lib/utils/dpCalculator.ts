// Detective Points (DP) cost and validation utilities

export const DP_COSTS = {
  QUESTION_SUSPECTS: 0,
  CHECK_RECORDS: -2,
  INVESTIGATE_SCENES: -3,
  VALIDATE_THEORY: -3,
  GET_CLUE: -2,
  SOLVE_MURDER: 0,
} as const

export const DP_REWARDS = {
  NEW_FACT_DISCOVERED: 1,
} as const

export const INITIAL_DP = 25

/**
 * Calculate if player has enough DP for an action
 */
export function canAffordAction(
  currentDP: number,
  actionCost: number
): boolean {
  if (actionCost >= 0) return true // Free or rewarding actions
  return currentDP >= Math.abs(actionCost)
}

/**
 * Calculate new DP after an action
 */
export function calculateNewDP(
  currentDP: number,
  actionCost: number
): number {
  const newDP = currentDP + actionCost
  return Math.max(0, newDP) // DP can't go below 0
}

/**
 * Get DP cost for a specific action
 */
export function getActionCost(action: string): number {
  const actionUpper = action.toUpperCase().replace('-', '_')
  return DP_COSTS[actionUpper as keyof typeof DP_COSTS] ?? 0
}

/**
 * Calculate DP reward for discovering new facts
 */
export function calculateFactReward(newFactsCount: number): number {
  return newFactsCount * DP_REWARDS.NEW_FACT_DISCOVERED
}

/**
 * Validate if action is possible given current DP
 */
export function validateAction(
  action: string,
  currentDP: number
): { valid: boolean; reason?: string } {
  const cost = getActionCost(action)
  
  if (cost >= 0) {
    return { valid: true }
  }
  
  if (!canAffordAction(currentDP, cost)) {
    return {
      valid: false,
      reason: `Not enough Detective Points. This action costs ${Math.abs(cost)} DP, but you only have ${currentDP} DP.`,
    }
  }
  
  return { valid: true }
}

/**
 * Get formatted DP display string
 */
export function formatDPCost(cost: number): string {
  if (cost === 0) return 'Free'
  if (cost > 0) return `+${cost} DP`
  return `${cost} DP`
}

/**
 * Calculate DP efficiency score (for analytics/achievements)
 */
export function calculateDPEfficiency(
  initialDP: number,
  currentDP: number,
  factsDiscovered: number
): number {
  const dpUsed = initialDP - currentDP
  if (dpUsed === 0) return 0
  return factsDiscovered / dpUsed
}

