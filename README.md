# MurderMysteries.AI

An immersive, narrative-driven, AI-powered murder mystery game built with Next.js.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + ShadCN/UI
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Backend**: Next.js API Routes + Supabase
- **AI**: Gemini API
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your actual credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
murdermysteries/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── game/              # Game pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── game/             # Game-specific components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic services
│   ├── store/            # Zustand stores
│   └── utils/            # Helper functions
├── public/               # Static assets
│   └── cases/           # Case content and images
├── supabase/            # Database migrations
└── tasks/               # Development task tracking
```

## Development Workflow

See `tasks/tasks-prd-murdermysteries-v1.md` for the complete task list and implementation plan.

## Development Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Best practices, patterns, and lessons learned
- **[.cursor/rules/react-state-management.mdc](./.cursor/rules/react-state-management.mdc)** - React & Zustand guidelines for AI coding assistant
- **[components/game/tutorial/ONBOARDING_IMPLEMENTATION.md](./components/game/tutorial/ONBOARDING_IMPLEMENTATION.md)** - Onboarding tour architecture and debugging guide

## License

Private - All Rights Reserved

