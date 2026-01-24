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

export interface RevealedContent {
  suspects: Set<string>
  scenes: Set<string>
}

export interface GameState {
  // Game session info
  caseId: string | null
  sessionId: string | null
  currentStage: 'start' | 'act_i' | 'act_ii'
  
  // Detective Points
  detectivePoints: number
  
  // Discovered information
  discoveredFacts: DiscoveredFact[]
  chatHistory: ChatMessage[]
  theoryHistory: TheorySubmission[]
  
  // Unlocked content
  unlockedContent: UnlockedContent
  
  // Revealed content (suspects whose cards have been viewed)
  revealedContent: RevealedContent
  
  // Viewed documents
  viewedDocuments: Set<string>
  
  // Game status
  isCompleted: boolean
  isSolvedCorrectly: boolean | null
  hasReadVeronicaLetter: boolean
  
  // Loading states
  isLoading: boolean
  isSyncing: boolean
  
  // Actions
  initializeGame: (caseId: string, forceReinitialize?: boolean) => Promise<void>
  setSessionId: (sessionId: string) => void
  setCurrentStage: (stage: 'start' | 'act_i' | 'act_ii') => void
  setDetectivePoints: (points: number) => void
  addDetectivePoints: (points: number) => void
  subtractDetectivePoints: (points: number) => void
  fetchGameState: () => Promise<void>
  
  addDiscoveredFact: (fact: Omit<DiscoveredFact, 'id' | 'discoveredAt'>) => void
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  addTheorySubmission: (theory: Omit<TheorySubmission, 'id' | 'submittedAt'>) => void
  
  unlockSuspect: (suspectId: string) => void
  unlockScene: (sceneId: string) => void
  unlockRecord: (recordId: string) => void
  
  revealSuspect: (suspectId: string) => void
  revealScene: (sceneId: string) => void
  markDocumentAsViewed: (documentId: string) => void
  
  completeGame: (isCorrect: boolean) => void
  resetGame: () => void
  markLetterAsRead: () => void
  
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void
}

const initialState = {
  caseId: null,
  sessionId: null,
  currentStage: 'start' as const,
  detectivePoints: 25,
  discoveredFacts: [],
  chatHistory: [],
  theoryHistory: [],
  unlockedContent: {
    suspects: new Set<string>(),
    scenes: new Set<string>(),
    records: new Set<string>(),
  },
  revealedContent: {
    suspects: new Set<string>(),
    scenes: new Set<string>(),
  },
  viewedDocuments: new Set<string>(),
  isCompleted: false,
  isSolvedCorrectly: null,
  hasReadVeronicaLetter: false,
  isLoading: false,
  isSyncing: false,
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initializeGame: async (caseId: string, forceReinitialize = false) => {
          // Check if we already have a session for this case
          const currentState = get()
          if (!forceReinitialize && currentState.caseId === caseId && currentState.sessionId) {
            // Verify the session is still valid
            try {
              const verifyResponse = await fetch(`/api/game/state?caseId=${caseId}`)
              if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json()
                if (verifyData.session && verifyData.session.id === currentState.sessionId) {
                  // Session is valid, no need to reinitialize - but ensure loading is false
                  set({ isLoading: false })
                  return
                }
              }
              // If verification fails, continue to reinitialize
              console.log('Session verification failed, reinitializing...')
            } catch (error) {
              console.log('Session verification error, reinitializing...', error)
            }
          }

          // Set loading state
          set({ isLoading: true })

          try {
            // Try to fetch existing session or create a new one
            const response = await fetch('/api/game/state', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                caseId,
                detectivePoints: 25,
                isCompleted: false,
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to initialize game session')
            }

            const data = await response.json()
            
            // Set the state with the real database session ID
            set({
              caseId,
              sessionId: data.session.id,
              currentStage: data.session.current_stage || 'start',
              detectivePoints: data.session.detective_points,
              discoveredFacts: [],
              chatHistory: [],
              theoryHistory: [],
              unlockedContent: {
                suspects: new Set<string>(),
                scenes: new Set<string>(),
                records: new Set<string>(),
              },
              revealedContent: {
                suspects: new Set<string>(),
                scenes: new Set<string>(),
              },
              isCompleted: data.session.is_completed || false,
              isSolvedCorrectly: data.session.is_solved_correctly || null,
              isLoading: false,
            })

            // Load existing game state if session already exists
            const stateResponse = await fetch(`/api/game/state?caseId=${caseId}`)
            if (stateResponse.ok) {
              const stateData = await stateResponse.json()
              
              if (stateData.session) {
                // Restore unlocked content
                set({
                  currentStage: stateData.session.current_stage || 'start',
                  unlockedContent: {
                    suspects: new Set(stateData.unlockedContent.suspects || []),
                    scenes: new Set(stateData.unlockedContent.scenes || []),
                    records: new Set(stateData.unlockedContent.records || []),
                  },
                  revealedContent: {
                    suspects: new Set(stateData.revealedContent?.suspects || []),
                    scenes: new Set(stateData.revealedContent?.scenes || []),
                  },
                  detectivePoints: stateData.session.detective_points,
                })
              }
            }
          } catch (error) {
            console.error('Error initializing game:', error)
            // Fallback to local-only mode if API fails
            set({
              caseId,
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
              revealedContent: {
                suspects: new Set<string>(),
                scenes: new Set<string>(),
              },
              isCompleted: false,
              isSolvedCorrectly: null,
              isLoading: false,
            })
          }
        },

        setSessionId: (sessionId: string) => {
          set({ sessionId })
        },

        setCurrentStage: (stage: 'start' | 'act_i' | 'act_ii') => {
          set({ currentStage: stage })
        },

        setDetectivePoints: (points: number) => {
          set({ detectivePoints: Math.max(0, points) })
        },

        fetchGameState: async () => {
          const state = get()
          if (!state.caseId) return

          try {
            const response = await fetch(`/api/game/state?caseId=${state.caseId}`)
            if (response.ok) {
              const data = await response.json()
              
              if (data.session) {
                set({
                  currentStage: data.session.current_stage || 'start',
                  unlockedContent: {
                    suspects: new Set(data.unlockedContent.suspects || []),
                    scenes: new Set(data.unlockedContent.scenes || []),
                    records: new Set(data.unlockedContent.records || []),
                  },
                  revealedContent: {
                    suspects: new Set(data.revealedContent?.suspects || []),
                    scenes: new Set(data.revealedContent?.scenes || []),
                  },
                  detectivePoints: data.session.detective_points,
                })
              }
            }
          } catch (error) {
            console.error('Error fetching game state:', error)
          }
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

        revealSuspect: (suspectId: string) => {
          set((state) => {
            const newRevealed = new Set(state.revealedContent.suspects)
            newRevealed.add(suspectId)
            return {
              revealedContent: {
                ...state.revealedContent,
                suspects: newRevealed,
              },
            }
          })
        },

        revealScene: (sceneId: string) => {
          set((state) => {
            const newRevealed = new Set(state.revealedContent.scenes)
            newRevealed.add(sceneId)
            return {
              revealedContent: {
                ...state.revealedContent,
                scenes: newRevealed,
              },
            }
          })
        },

        markDocumentAsViewed: (documentId: string) => {
          set((state) => {
            const newViewed = new Set(state.viewedDocuments)
            newViewed.add(documentId)
            return {
              viewedDocuments: newViewed,
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

        markLetterAsRead: () => {
          const currentState = get()
          
          // Only add facts if letter hasn't been read before
          if (!currentState.hasReadVeronicaLetter) {
            const letterFacts: DiscoveredFact[] = [
              {
                id: `fact_letter_${Date.now()}_1`,
                content: "Reginald Ashcombe, Veronica's husband, is dead.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_2`,
                content: "He was found at the bottom of a grand staircase.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_3`,
                content: "The official ruling by the constable is that the death was an accident—a slip after too much wine and celebration.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_4`,
                content: "Veronica was the person who found Reginald's body.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_5`,
                content: "Veronica was seeking approval of a speech revision from Reginald. She left Mrs. Portwell in the Master bedroom to find him when she found his body at the bottom of the grand staircase.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_6`,
                content: "A wine glass was found near the body. Wine spilled next to it.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_7`,
                content: "Colin, Lydia, and Dr. Vale came running immediately after Veronica screamed.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
              {
                id: `fact_letter_${Date.now()}_8`,
                content: "Dr. Vale checked for a pulse and confirmed Reginald's death.",
                source: 'record',
                sourceId: 'veronica_letter',
                discoveredAt: new Date(),
              },
            ]
            
            set({ 
              hasReadVeronicaLetter: true,
              discoveredFacts: [...currentState.discoveredFacts, ...letterFacts]
            })
          } else {
            set({ hasReadVeronicaLetter: true })
          }
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
          revealedContent: {
            suspects: Array.from(state.revealedContent.suspects),
            scenes: Array.from(state.revealedContent.scenes),
          },
          viewedDocuments: Array.from(state.viewedDocuments),
        }),
        // Deserialize arrays back to Sets when loading from storage
        merge: (persistedState: any, currentState: GameState) => {
          const merged = {
            ...currentState,
            ...persistedState,
          }
          
          // Convert arrays back to Sets if they exist
          if (persistedState?.unlockedContent) {
            merged.unlockedContent = {
              suspects: new Set(persistedState.unlockedContent.suspects || []),
              scenes: new Set(persistedState.unlockedContent.scenes || []),
              records: new Set(persistedState.unlockedContent.records || []),
            }
          }
          
          if (persistedState?.revealedContent) {
            merged.revealedContent = {
              suspects: new Set(persistedState.revealedContent.suspects || []),
              scenes: new Set(persistedState.revealedContent.scenes || []),
            }
          }
          
          if (persistedState?.viewedDocuments) {
            merged.viewedDocuments = new Set(persistedState.viewedDocuments || [])
          }
          
          return merged
        },
      }
    ),
    {
      name: 'GameStore',
    }
  )
)

