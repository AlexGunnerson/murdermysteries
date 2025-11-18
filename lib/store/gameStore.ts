import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types for game state
export interface DiscoveredFact {
  id: string
  content: string
  source: 'chat' | 'record' | 'scene' | 'clue'
  sourceId: string
  discoveredAt: Date
}

export interface ChatMessage {
  id: string
  suspectId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface TheorySubmission {
  id: string
  description: string
  artifactIds: string[]
  result: 'correct' | 'partial' | 'incorrect'
  feedback?: string
  unlockedContent?: {
    suspects?: string[]
    scenes?: string[]
    records?: string[]
  }
  submittedAt: Date
}

export interface UnlockedContent {
  suspects: Set<string>
  scenes: Set<string>
  records: Set<string>
}

export interface GameState {
  // Game session info
  caseId: string | null
  sessionId: string | null
  
  // Detective Points
  detectivePoints: number
  
  // Discovered information
  discoveredFacts: DiscoveredFact[]
  chatHistory: ChatMessage[]
  theoryHistory: TheorySubmission[]
  
  // Unlocked content
  unlockedContent: UnlockedContent
  
  // Game status
  isCompleted: boolean
  isSolvedCorrectly: boolean | null
  
  // Loading states
  isLoading: boolean
  isSyncing: boolean
  
  // Actions
  initializeGame: (caseId: string) => void
  setDetectivePoints: (points: number) => void
  addDetectivePoints: (points: number) => void
  subtractDetectivePoints: (points: number) => void
  
  addDiscoveredFact: (fact: Omit<DiscoveredFact, 'id' | 'discoveredAt'>) => void
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  addTheorySubmission: (theory: Omit<TheorySubmission, 'id' | 'submittedAt'>) => void
  
  unlockSuspect: (suspectId: string) => void
  unlockScene: (sceneId: string) => void
  unlockRecord: (recordId: string) => void
  
  completeGame: (isCorrect: boolean) => void
  resetGame: () => void
  
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void
}

const initialState = {
  caseId: null,
  sessionId: null,
  detectivePoints: 25,
  discoveredFacts: [],
  chatHistory: [],
  theoryHistory: [],
  unlockedContent: {
    suspects: new Set<string>(),
    scenes: new Set<string>(),
    records: new Set<string>(),
  },
  isCompleted: false,
  isSolvedCorrectly: null,
  isLoading: false,
  isSyncing: false,
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initializeGame: (caseId: string) => {
          set({
            caseId,
            sessionId: `session_${Date.now()}`,
            detectivePoints: 25,
            discoveredFacts: [],
            chatHistory: [],
            theoryHistory: [],
            unlockedContent: {
              suspects: new Set<string>(),
              scenes: new Set<string>(),
              records: new Set<string>(),
            },
            isCompleted: false,
            isSolvedCorrectly: null,
          })
        },

        setDetectivePoints: (points: number) => {
          set({ detectivePoints: Math.max(0, points) })
        },

        addDetectivePoints: (points: number) => {
          const currentPoints = get().detectivePoints
          set({ detectivePoints: currentPoints + points })
        },

        subtractDetectivePoints: (points: number) => {
          const currentPoints = get().detectivePoints
          set({ detectivePoints: Math.max(0, currentPoints - points) })
        },

        addDiscoveredFact: (fact) => {
          const newFact: DiscoveredFact = {
            ...fact,
            id: `fact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            discoveredAt: new Date(),
          }
          set((state) => ({
            discoveredFacts: [...state.discoveredFacts, newFact],
          }))
        },

        addChatMessage: (message) => {
          const newMessage: ChatMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
          }
          set((state) => ({
            chatHistory: [...state.chatHistory, newMessage],
          }))
        },

        addTheorySubmission: (theory) => {
          const newTheory: TheorySubmission = {
            ...theory,
            id: `theory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            submittedAt: new Date(),
          }
          
          // If theory unlocks new content, add it to unlocked content
          if (theory.unlockedContent) {
            const state = get()
            const updatedUnlockedContent = {
              suspects: new Set(state.unlockedContent.suspects),
              scenes: new Set(state.unlockedContent.scenes),
              records: new Set(state.unlockedContent.records),
            }
            
            theory.unlockedContent.suspects?.forEach((id) => updatedUnlockedContent.suspects.add(id))
            theory.unlockedContent.scenes?.forEach((id) => updatedUnlockedContent.scenes.add(id))
            theory.unlockedContent.records?.forEach((id) => updatedUnlockedContent.records.add(id))
            
            set((state) => ({
              theoryHistory: [...state.theoryHistory, newTheory],
              unlockedContent: updatedUnlockedContent,
            }))
          } else {
            set((state) => ({
              theoryHistory: [...state.theoryHistory, newTheory],
            }))
          }
        },

        unlockSuspect: (suspectId: string) => {
          set((state) => {
            const newSuspects = new Set(state.unlockedContent.suspects)
            newSuspects.add(suspectId)
            return {
              unlockedContent: {
                ...state.unlockedContent,
                suspects: newSuspects,
              },
            }
          })
        },

        unlockScene: (sceneId: string) => {
          set((state) => {
            const newScenes = new Set(state.unlockedContent.scenes)
            newScenes.add(sceneId)
            return {
              unlockedContent: {
                ...state.unlockedContent,
                scenes: newScenes,
              },
            }
          })
        },

        unlockRecord: (recordId: string) => {
          set((state) => {
            const newRecords = new Set(state.unlockedContent.records)
            newRecords.add(recordId)
            return {
              unlockedContent: {
                ...state.unlockedContent,
                records: newRecords,
              },
            }
          })
        },

        completeGame: (isCorrect: boolean) => {
          set({
            isCompleted: true,
            isSolvedCorrectly: isCorrect,
          })
        },

        resetGame: () => {
          set(initialState)
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        setSyncing: (syncing: boolean) => {
          set({ isSyncing: syncing })
        },
      }),
      {
        name: 'murder-mystery-game-storage',
        // Serialize Sets to arrays for storage
        partialize: (state) => ({
          ...state,
          unlockedContent: {
            suspects: Array.from(state.unlockedContent.suspects),
            scenes: Array.from(state.unlockedContent.scenes),
            records: Array.from(state.unlockedContent.records),
          },
        }),
      }
    ),
    {
      name: 'GameStore',
    }
  )
)

