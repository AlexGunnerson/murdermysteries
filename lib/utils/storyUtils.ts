/**
 * Utility functions for processing story configuration and character data
 */

export type GameStage = 'start' | 'act_i' | 'act_ii'

/**
 * Filters character secrets based on the current game stage.
 * 
 * Secrets can be prefixed with stage markers:
 * - "BEFORE ACT I IS COMPLETE:" - Only included in 'start' and 'act_i' stages
 * - "AFTER ACT I IS COMPLETE:" - Only included in 'act_ii' stage
 * - No prefix - Included in all stages
 * 
 * Stage markers are stripped from the output.
 * 
 * @param secrets - Array of secret strings from story-config.json
 * @param currentStage - The current game stage
 * @returns Filtered and cleaned array of secrets appropriate for the current stage
 */
export function filterSecretsByStage(secrets: string[], currentStage: GameStage): string[] {
  return secrets
    .filter(secret => {
      const upperSecret = secret.toUpperCase()
      
      // Check for stage markers
      const hasBeforeActI = upperSecret.includes('BEFORE ACT I IS COMPLETE')
      const hasAfterActI = upperSecret.includes('AFTER ACT I IS COMPLETE')
      
      // If no stage marker, include in all stages
      if (!hasBeforeActI && !hasAfterActI) {
        return true
      }
      
      // Apply stage-based filtering
      if (currentStage === 'start' || currentStage === 'act_i') {
        return hasBeforeActI && !hasAfterActI
      } else if (currentStage === 'act_ii') {
        return hasAfterActI && !hasBeforeActI
      }
      
      return false
    })
    .map(secret => {
      // Strip out stage markers for cleaner AI prompts
      let cleaned = secret
        .replace(/BEFORE ACT I IS COMPLETE:\s*/i, '')
        .replace(/AFTER ACT I IS COMPLETE:\s*/i, '')
        .replace(/After Act I is complete,\s*/i, '') // Also handle narrative versions
      
      return cleaned.trim()
    })
}
