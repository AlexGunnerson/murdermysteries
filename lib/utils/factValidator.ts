/**
 * Utility functions for validating theories and fact discovery
 */

export interface TheoryValidationRules {
  requiredFacts: string[] // Fact IDs that must be included
  correctConcept: string // The correct conclusion or insight
  keywords: string[] // Keywords that should be present in correct theories
  prohibitedKeywords?: string[] // Keywords that indicate incorrect direction
}

export interface ValidationResult {
  result: 'correct' | 'partial' | 'incorrect'
  feedback: string
  matchedFacts: string[]
  unlockedContent?: {
    suspects?: string[]
    scenes?: string[]
    records?: string[]
  }
}

/**
 * Validate a theory against predefined rules
 */
export function validateTheory(
  theoryDescription: string,
  selectedArtifactIds: string[],
  rules: TheoryValidationRules
): ValidationResult {
  const description = theoryDescription.toLowerCase()
  const matchedFacts: string[] = []

  // Check for required facts
  const hasRequiredFacts = rules.requiredFacts.every(factId => {
    const isIncluded = selectedArtifactIds.includes(factId)
    if (isIncluded) {
      matchedFacts.push(factId)
    }
    return isIncluded
  })

  // Check for correct keywords
  const hasCorrectKeywords = rules.keywords.some(keyword =>
    description.includes(keyword.toLowerCase())
  )

  // Check for prohibited keywords (incorrect direction)
  const hasProhibitedKeywords = rules.prohibitedKeywords?.some(keyword =>
    description.includes(keyword.toLowerCase())
  ) || false

  // Determine result
  if (hasProhibitedKeywords) {
    return {
      result: 'incorrect',
      feedback: 'Your theory seems to be heading in the wrong direction. Consider reviewing the evidence more carefully.',
      matchedFacts,
    }
  }

  if (hasRequiredFacts && hasCorrectKeywords) {
    return {
      result: 'correct',
      feedback: 'Excellent deduction! Your theory aligns with the evidence. You may have unlocked new investigation opportunities.',
      matchedFacts,
      unlockedContent: {
        // This would be defined per-theory in the case configuration
        // For now, return empty to be populated by API
      },
    }
  }

  if (hasRequiredFacts || hasCorrectKeywords) {
    return {
      result: 'partial',
      feedback: "You're on the right track, but your theory is incomplete. Keep investigating to gather more evidence.",
      matchedFacts,
    }
  }

  return {
    result: 'incorrect',
    feedback: 'This theory doesn\'t align well with the known evidence. Try reviewing what you\'ve discovered so far.',
    matchedFacts,
  }
}

/**
 * Simple scoring system for theories
 * Higher score = better theory
 */
export function scoreTheory(
  theoryDescription: string,
  selectedArtifactIds: string[],
  correctFactIds: string[],
  correctKeywords: string[]
): number {
  let score = 0
  const description = theoryDescription.toLowerCase()

  // Points for including correct facts
  const correctFactsIncluded = selectedArtifactIds.filter(id =>
    correctFactIds.includes(id)
  )
  score += correctFactsIncluded.length * 10

  // Points for keywords
  const keywordsMatched = correctKeywords.filter(keyword =>
    description.includes(keyword.toLowerCase())
  )
  score += keywordsMatched.length * 5

  // Bonus for having detailed description
  const wordCount = theoryDescription.split(/\s+/).length
  if (wordCount > 50) {
    score += 5
  }

  return score
}

/**
 * Check if a fact should be unlocked based on current progress
 */
export function shouldUnlockContent(
  discoveredFactIds: string[],
  requiredFactIds: string[]
): boolean {
  return requiredFactIds.every(id => discoveredFactIds.includes(id))
}

/**
 * Get hints for improving a theory
 */
export function generateTheoryHints(
  currentTheory: string,
  selectedArtifactIds: string[],
  rules: TheoryValidationRules
): string[] {
  const hints: string[] = []
  const description = currentTheory.toLowerCase()

  // Check missing required facts
  const missingFacts = rules.requiredFacts.filter(
    factId => !selectedArtifactIds.includes(factId)
  )

  if (missingFacts.length > 0) {
    hints.push('You may be missing some key evidence. Have you investigated all available scenes and records?')
  }

  // Check for keywords
  const hasKeywords = rules.keywords.some(keyword =>
    description.includes(keyword.toLowerCase())
  )

  if (!hasKeywords) {
    hints.push('Consider focusing on the motive and means. What was the killer trying to achieve?')
  }

  // Check if theory is too vague
  if (currentTheory.split(/\s+/).length < 20) {
    hints.push('Try to be more specific in your theory. Include details about who, what, when, where, and why.')
  }

  return hints
}

