import { useGameStore, GameState } from '@/lib/store/gameStore'
import { useEffect } from 'react'

/**
 * Custom hook for accessing and updating game state
 */
export function useGameState() {
  const store = useGameStore()
  
  return {
    // State
    caseId: store.caseId,
    sessionId: store.sessionId,
    detectivePoints: store.detectivePoints,
    discoveredFacts: store.discoveredFacts,
    chatHistory: store.chatHistory,
    theoryHistory: store.theoryHistory,
    unlockedContent: store.unlockedContent,
    isCompleted: store.isCompleted,
    isSolvedCorrectly: store.isSolvedCorrectly,
    isLoading: store.isLoading,
    isSyncing: store.isSyncing,
    
    // Actions
    initializeGame: store.initializeGame,
    setDetectivePoints: store.setDetectivePoints,
    addDetectivePoints: store.addDetectivePoints,
    subtractDetectivePoints: store.subtractDetectivePoints,
    addDiscoveredFact: store.addDiscoveredFact,
    addChatMessage: store.addChatMessage,
    addTheorySubmission: store.addTheorySubmission,
    unlockSuspect: store.unlockSuspect,
    unlockScene: store.unlockScene,
    unlockRecord: store.unlockRecord,
    completeGame: store.completeGame,
    resetGame: store.resetGame,
    setLoading: store.setLoading,
    setSyncing: store.setSyncing,
  }
}

/**
 * Hook to initialize game on mount
 */
export function useInitializeGame(caseId: string) {
  const { initializeGame, caseId: currentCaseId } = useGameState()
  
  useEffect(() => {
    // Only initialize if this is a new case
    if (currentCaseId !== caseId) {
      initializeGame(caseId)
    }
  }, [caseId, currentCaseId, initializeGame])
}

/**
 * Hook to get specific chat history for a suspect
 */
export function useSuspectChatHistory(suspectId: string) {
  const { chatHistory } = useGameState()
  return chatHistory.filter(msg => msg.suspectId === suspectId)
}

/**
 * Hook to check if content is unlocked
 */
export function useIsUnlocked(type: 'suspect' | 'scene' | 'record', id: string) {
  const { unlockedContent } = useGameState()
  
  switch (type) {
    case 'suspect':
      return unlockedContent.suspects.has(id)
    case 'scene':
      return unlockedContent.scenes.has(id)
    case 'record':
      return unlockedContent.records.has(id)
    default:
      return false
  }
}

/**
 * Hook to get facts from a specific source
 */
export function useFactsBySource(source: 'chat' | 'record' | 'scene' | 'clue') {
  const { discoveredFacts } = useGameState()
  return discoveredFacts.filter(fact => fact.source === source)
}

