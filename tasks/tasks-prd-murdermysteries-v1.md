# Task List: MurderMysteries.AI

Generated from: `prd-murdermysteries-v1.md`

---

## Relevant Files

- `app/page.tsx` - Landing page with game overview and "Start Investigation" CTA.
- `app/auth/login/page.tsx` - Login page with email/password and Google OAuth.
- `app/auth/signup/page.tsx` - Sign-up page with email/password and Google OAuth.
- `app/auth/reset-password/page.tsx` - Password reset flow.
- `app/game/[caseId]/page.tsx` - Main game interface with two-panel layout.
- `app/game/[caseId]/page.test.tsx` - Unit tests for main game page.
- `components/ui/ActionPanel.tsx` - Left-side persistent action panel component.
- `components/ui/ActionPanel.test.tsx` - Unit tests for ActionPanel.
- `components/ui/MainContentPanel.tsx` - Right-side dynamic content panel.
- `components/ui/MainContentPanel.test.tsx` - Unit tests for MainContentPanel.
- `components/game/ChatInterface.tsx` - AI-driven suspect chat interface.
- `components/game/ChatInterface.test.tsx` - Unit tests for ChatInterface.
- `components/game/RecordViewer.tsx` - Component for viewing official documents.
- `components/game/RecordViewer.test.tsx` - Unit tests for RecordViewer.
- `components/game/SceneViewer.tsx` - Component for viewing scene descriptions and evidence.
- `components/game/SceneViewer.test.tsx` - Unit tests for SceneViewer.
- `components/game/TheorySubmission.tsx` - Theory validation interface with artifact selection.
- `components/game/TheorySubmission.test.tsx` - Unit tests for TheorySubmission.
- `components/game/DetectiveNotebook.tsx` - Information management UI (facts, people, records, scenes, theories).
- `components/game/DetectiveNotebook.test.tsx` - Unit tests for DetectiveNotebook.
- `components/game/SolutionSubmission.tsx` - Final murder solution submission interface.
- `components/game/SolutionSubmission.test.tsx` - Unit tests for SolutionSubmission.
- `components/game/IntroductoryBriefing.tsx` - Game start briefing modal/component.
- `components/game/FeedbackForm.tsx` - Feedback submission form.
- `lib/store/gameStore.ts` - Zustand store for game state (DP, facts, chat logs, theories).
- `lib/store/gameStore.test.ts` - Unit tests for game store.
- `lib/hooks/useGameState.ts` - Custom hook for accessing and updating game state.
- `lib/hooks/useGameState.test.ts` - Unit tests for useGameState hook.
- `lib/services/aiService.ts` - Service for AI Gateway interactions.
- `lib/services/aiService.test.ts` - Unit tests for aiService.
- `lib/services/gameService.ts` - Service for game logic, DP management, action validation.
- `lib/services/gameService.test.ts` - Unit tests for gameService.
- `lib/services/storyService.ts` - Service for case content, suspect definitions, fact trees.
- `lib/services/storyService.test.ts` - Unit tests for storyService.
- `lib/utils/dpCalculator.ts` - Utility functions for DP calculations and validation.
- `lib/utils/dpCalculator.test.ts` - Unit tests for dpCalculator.
- `lib/utils/factValidator.ts` - Utility for validating theories and fact discovery.
- `lib/utils/factValidator.test.ts` - Unit tests for factValidator.
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration for authentication.
- `app/api/game/state/route.ts` - API route for fetching/updating game state.
- `app/api/game/actions/question/route.ts` - API route for questioning suspects.
- `app/api/game/actions/records/route.ts` - API route for checking records.
- `app/api/game/actions/scenes/route.ts` - API route for investigating scenes.
- `app/api/game/actions/clue/route.ts` - API route for getting clues.
- `app/api/game/actions/validate-theory/route.ts` - API route for theory validation.
- `app/api/game/actions/solve/route.ts` - API route for final solution submission.
- `app/api/ai/chat/route.ts` - API route for AI chat streaming (SSE).
- `app/api/feedback/route.ts` - API route for feedback submission.
- `supabase/migrations/001_initial_schema.sql` - Initial database schema migration.
- `supabase/migrations/002_game_state_tables.sql` - Game state tables migration.
- `supabase/migrations/003_case_content_tables.sql` - Case content tables migration.
- `public/cases/case01/metadata.json` - Case metadata (title, description, suspects, locations).
- `public/cases/case01/story-config.json` - Story configuration (prompts, fact tree, solution validation).
- `public/cases/case01/images/` - Directory for case asset images.
- `.env.local.example` - Example environment variables file.
- `package.json` - Project dependencies and scripts.
- `tailwind.config.ts` - Tailwind CSS configuration.
- `next.config.js` - Next.js configuration.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Follow Next.js 13+ App Router conventions for routing and API routes.
- Use Supabase for authentication, database, and storage.
- Implement streaming for AI responses using Server-Sent Events (SSE).

---

## Tasks

- [x] 1.0 Project Setup, Infrastructure & Authentication
  - [x] 1.1 Initialize Next.js project with TypeScript, TailwindCSS, and ShadCN/UI
  - [x] 1.2 Set up Supabase project and configure environment variables
  - [x] 1.3 Create initial database schema migration for users and authentication
  - [x] 1.4 Configure NextAuth with email/password provider
  - [x] 1.5 Implement Google OAuth integration with NextAuth
  - [x] 1.6 Create authentication pages (login, signup, password reset)
  - [x] 1.7 Implement secure session management and protected routes
  - [x] 1.8 Set up Vercel deployment configuration
  - [x] 1.9 Configure Sentry for error monitoring
  - [x] 1.10 Configure PostHog for analytics
  - [x] 1.11 Create `.env.local.example` file with required environment variables

- [x] 2.0 Core Game UI & Two-Panel Layout
  - [x] 2.1 Create main game page component at `app/game/[caseId]/page.tsx`
  - [x] 2.2 Implement left-side ActionPanel component with persistent action buttons
  - [x] 2.3 Add Detective Points (DP) display to ActionPanel
  - [x] 2.4 Implement "How to Play" button and modal in ActionPanel
  - [x] 2.5 Create MainContentPanel component for dynamic content display
  - [x] 2.6 Implement responsive two-panel layout with proper spacing and styling
  - [x] 2.7 Create IntroductoryBriefing component that displays on game start
  - [x] 2.8 Add navigation and menu structure for accessing different game sections
  - [x] 2.9 Style UI with TailwindCSS to match modern, immersive mystery theme
  - [x] 2.10 Write unit tests for ActionPanel and MainContentPanel components

- [x] 3.0 Game State Management & Detective Points System
  - [x] 3.1 Create Zustand store (`lib/store/gameStore.ts`) for game state management
  - [x] 3.2 Define state shape (DP, discovered facts, chat logs, unlocked suspects/scenes, theory history)
  - [x] 3.3 Implement DP initialization (starting at 25 DP per case)
  - [x] 3.4 Create `dpCalculator` utility for DP cost calculations and validation
  - [x] 3.5 Implement state actions for updating DP after each game action
  - [x] 3.6 Create custom hook `useGameState` for components to access game state
  - [x] 3.7 Implement game state persistence to Supabase database
  - [x] 3.8 Create API route for fetching and updating game state (`app/api/game/state/route.ts`)
  - [x] 3.9 Implement state synchronization between client and server
  - [x] 3.10 Write unit tests for gameStore, dpCalculator, and useGameState hook

- [x] 4.0 AI Integration & Suspect Dialogue System
  - [x] 4.1 Create AI Gateway Service (`lib/services/aiService.ts`) for secure LLM proxy
  - [x] 4.2 Set up Gemini API integration with API key management
  - [x] 4.3 Implement streaming response handling using Server-Sent Events (SSE)
  - [x] 4.4 Create API route for AI chat (`app/api/ai/chat/route.ts`) with streaming support
  - [x] 4.5 Design and implement dynamic prompt generation based on discovered facts
  - [x] 4.6 Create ChatInterface component for suspect questioning
  - [x] 4.7 Implement real-time typing effect for AI responses in ChatInterface
  - [x] 4.8 Create fact extraction logic to identify new facts from AI responses
  - [x] 4.9 Implement automatic DP reward (+1 DP per new fact) in chat flow
  - [x] 4.10 Add chat history tracking and display in ChatInterface
  - [x] 4.11 Ensure AI system prompts are never exposed to frontend
  - [x] 4.12 Write unit tests for aiService and ChatInterface component

- [x] 5.0 Investigation Actions & Evidence Collection
  - [x] 5.1 Create API route for "Question Suspects" action (`app/api/game/actions/question/route.ts`)
  - [x] 5.2 Create API route for "Check Records" action (cost: -2 DP)
  - [x] 5.3 Implement RecordViewer component to display official documents
  - [x] 5.4 Create API route for "Investigate Scenes" action (cost: -3 DP)
  - [x] 5.5 Implement SceneViewer component to display scene descriptions and evidence
  - [x] 5.6 Create API route for "Get Clue" action (cost: -2 DP)
  - [x] 5.7 Implement contextual clue generation logic (subtle hints, no direct answers)
  - [x] 5.8 Add fact discovery tracking across all investigation actions
  - [x] 5.9 Implement conditional unlocking of records/scenes based on discovered facts
  - [x] 5.10 Create DetectiveNotebook component for managing discovered information
  - [x] 5.11 Implement tabs/sections: Discovered Facts, Key People, Records View, Scene View
  - [x] 5.12 Write unit tests for all investigation action API routes and viewer components

- [ ] 6.0 Theory Validation & Detective's Notebook
  - [ ] 6.1 Create TheorySubmission component with artifact selection interface
  - [ ] 6.2 Implement multi-select functionality for artifacts from Facts, Records, and Scenes
  - [ ] 6.3 Add theory description text box to TheorySubmission component
  - [ ] 6.4 Create API route for theory validation (`app/api/game/actions/validate-theory/route.ts`)
  - [ ] 6.5 Implement theory validation logic using case-specific fact trees and rules
  - [ ] 6.6 Create `factValidator` utility for evaluating theory correctness
  - [ ] 6.7 Implement feedback display (Correct / Partial / Incorrect) in UI
  - [ ] 6.8 Add Theory Submission History section to DetectiveNotebook
  - [ ] 6.9 Implement chronological display of past theory submissions with results
  - [ ] 6.10 Create logic for unlocking new evidence/locations/suspects on correct theories
  - [ ] 6.11 Implement DP cost deduction for theory validation (-3 DP)
  - [ ] 6.12 Write unit tests for TheorySubmission component and factValidator utility

- [ ] 7.0 Final Solution Submission & Game Completion
  - [ ] 7.1 Create SolutionSubmission component with fields for killer, motive, and key evidence
  - [ ] 7.2 Implement final solution form with dropdowns/inputs for required elements
  - [ ] 7.3 Create API route for solution submission (`app/api/game/actions/solve/route.ts`)
  - [ ] 7.4 Implement solution validation against case's correct solution
  - [ ] 7.5 Generate narrative explanation of the solution (correct or incorrect)
  - [ ] 7.6 Create game completion screen with solution feedback
  - [ ] 7.7 Display player's investigation summary (DP remaining, facts discovered, theories tested)
  - [ ] 7.8 Implement game state update to mark case as completed
  - [ ] 7.9 Add option to replay case or return to main menu
  - [ ] 7.10 Write unit tests for SolutionSubmission component and solution validation logic

- [ ] 8.0 First Case Content Creation & Additional Features
  - [ ] 8.1 Create modular case directory structure (`public/cases/case01/`)
  - [ ] 8.2 Write case metadata file (`metadata.json`) with title, description, suspects, locations
  - [ ] 8.3 Create story configuration file (`story-config.json`) with prompts, fact tree, solution
  - [ ] 8.4 Design and prepare case asset images (scenes, evidence, characters, documents)
  - [ ] 8.5 Implement Story Service (`lib/services/storyService.ts`) for loading case content
  - [ ] 8.6 Create database migration for case content tables
  - [ ] 8.7 Populate database with first case data (suspects, locations, facts, solution)
  - [ ] 8.8 Implement landing page (`app/page.tsx`) with game overview and "Start Investigation" CTA
  - [ ] 8.9 Create FeedbackForm component accessible from game menu
  - [ ] 8.10 Create API route for feedback submission (`app/api/feedback/route.ts`)
  - [ ] 8.11 Implement Row Level Security policies in Supabase for user data protection
  - [ ] 8.12 Test complete game flow end-to-end with first case
  - [ ] 8.13 Optimize database queries for performance
  - [ ] 8.14 Implement payment integration for $4.99 one-time purchase (e.g., Stripe)
  - [ ] 8.15 Write unit tests for storyService and landing page components

