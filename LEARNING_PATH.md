# Web Development Learning Path
## A Personalized Guide Using Your Murder Mysteries AI Codebase

**Created for:** Beginner web developer learning from their own codebase  
**Tech Stack:** Next.js 15, React 18, TypeScript, TailwindCSS, Supabase, Zustand

---

# Table of Contents

1. [Imports & Modules](#concept-1-imports--modules)
2. [TypeScript Basics](#concept-2-typescript-basics)
3. [React Components & JSX](#concept-3-react-components--jsx)
4. [Props](#concept-4-props)
5. ["use client" Directive](#concept-5-use-client-directive)
6. [useState (Local State)](#concept-6-usestate-local-state)
7. [Event Handlers](#concept-7-event-handlers)
8. [Conditional Rendering](#concept-8-conditional-rendering)
9. [useEffect Hook](#concept-9-useeffect-hook)
10. [Custom Hooks](#concept-10-custom-hooks)
11. [API Routes](#concept-11-api-routes)
12. [Async/Await & Fetching](#concept-12-asyncawait--fetching)
13. [Zustand (Global State)](#concept-13-zustand-global-state)
14. [TailwindCSS](#concept-14-tailwindcss)

---

# Concept 1: Imports & Modules

## What it is
Imports let you bring code from other files into your current file. This is how JavaScript/TypeScript organizes code into reusable pieces. Instead of writing everything in one giant file, you split code into **modules** (files) and import what you need.

## Why it matters
Every file in your project uses imports. Understanding them unlocks your ability to read any file and know where things come from.

---

## The 3 Types of Imports in Your Codebase

### Type 1: Library Imports (from node_modules)
These come from packages you installed via npm (listed in your `package.json`).

**File:** `app/page.tsx` (lines 3-6)
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Brain, Trophy, Target } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
```

| Import | Package | What it provides |
|--------|---------|-----------------|
| `Link` | `next/link` | Navigation without page reload |
| `Search, Brain...` | `lucide-react` | Icon components |
| `useSession, signOut` | `next-auth/react` | Authentication functions |

**Pattern:** Library imports use the package name directly (no `./` or `@/`).

---

### Type 2: Local Imports (your own files)
These are files YOU wrote, imported using path aliases.

**File:** `app/game/[caseId]/page.tsx` (lines 4-6)
```typescript
import { GameMenu } from "@/components/game/GameMenu"
import { DetectiveNotebook } from "@/components/game/DetectiveNotebook"
import { useGameState, useInitializeGame } from "@/lib/hooks/useGameState"
```

**The `@/` symbol** is a shortcut meaning "start from project root". So:
- `@/components/game/GameMenu` → `components/game/GameMenu.tsx`
- `@/lib/hooks/useGameState` → `lib/hooks/useGameState.ts`

This is configured in your `tsconfig.json` and is a **best practice** - it avoids ugly relative paths like `../../../components/game/GameMenu`.

---

### Type 3: React Imports
React functions you'll use constantly.

**File:** `components/game/FeedbackForm.tsx` (line 3)
```typescript
import { useState } from 'react'
```

Common React imports you'll see:

| Import | Purpose |
|--------|---------|
| `useState` | Store data that changes |
| `useEffect` | Run code on mount/update |
| `useRef` | Reference DOM elements |
| `use` | Unwrap promises (Next.js 15+) |

---

## Import Syntax Patterns

### Named Exports (curly braces)
```typescript
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
```
The file exports multiple things, you pick what you need.

### Default Exports (no curly braces)
```typescript
import Link from 'next/link'
import Image from 'next/image'
```
The file exports ONE main thing.

### Mixed
```typescript
import React, { useState, useEffect } from 'react'
//     ↑ default    ↑ named exports
```

---

## Quick Reference: Where Things Come From

| Path Pattern | Source | Example |
|-------------|--------|---------|
| `'react'` | React library | `useState`, `useEffect` |
| `'next/...'` | Next.js framework | `Link`, `Image`, `NextRequest` |
| `'@/components/...'` | Your components folder | `Button`, `GameMenu` |
| `'@/lib/...'` | Your lib folder | `useGameState`, `createServiceRoleClient` |
| `'lucide-react'` | Icon library | `Search`, `Brain`, `Star` |
| `'zustand'` | State management | `create` |

---

# Concept 2: TypeScript Basics

## What it is
TypeScript adds **type annotations** to JavaScript. Types tell the computer (and you) what kind of data something is - a string, number, object, etc. This catches errors before your code runs.

## Why it matters
Your entire codebase uses TypeScript. Understanding types helps you:
- Know what data a function expects
- Get better autocomplete in your editor
- Catch bugs before they happen

---

## Basic Type Annotations

### Variables
**File:** `components/game/FeedbackForm.tsx` (lines 14-18)
```typescript
const [rating, setRating] = useState<number>(0)
const [feedback, setFeedback] = useState('')
const [category, setCategory] = useState<string>('general')
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitted, setSubmitted] = useState(false)
```

The `<number>` and `<string>` tell TypeScript what type of value the state holds:
- `useState<number>(0)` - this state will always be a number
- `useState('')` - TypeScript infers this is a string (no annotation needed)
- `useState(false)` - TypeScript infers this is a boolean

---

## Interfaces: Defining Object Shapes

An **interface** describes what properties an object must have.

**File:** `components/game/detective-board/StickyNote.tsx` (lines 3-9)
```typescript
interface StickyNoteProps {
  content: string
  source?: string
  onClick?: () => void
  rotating?: number
  color?: 'yellow' | 'blue' | 'pink' | 'green'
}
```

Breaking it down:
| Property | Type | Meaning |
|----------|------|---------|
| `content: string` | Required string | The note's text |
| `source?: string` | Optional string | The `?` means it's optional |
| `onClick?: () => void` | Optional function | A function that returns nothing |
| `color?: 'yellow' \| 'blue'...` | Union type | Can ONLY be one of these 4 values |

---

## More Complex Types

**File:** `lib/store/gameStore.ts` (lines 5-19)
```typescript
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
```

Notice:
- `source: 'chat' | 'record' | 'scene' | 'clue'` - a **union type** (can only be one of these values)
- `discoveredAt: Date` - uses JavaScript's built-in Date type
- `export` makes the interface available to other files

---

## Function Type Annotations

**File:** `app/api/game/actions/question/route.ts` (line 12)
```typescript
export async function POST(request: NextRequest) {
```

- `request: NextRequest` - the parameter must be a NextRequest object
- The `async` keyword means this function returns a Promise

**File:** `lib/hooks/useGameState.ts` (line 80)
```typescript
export function useIsUnlocked(type: 'suspect' | 'scene' | 'record', id: string) {
```

- `type` must be one of three specific strings
- `id` must be a string

---

## Type Cheat Sheet

| Syntax | Meaning | Example |
|--------|---------|---------|
| `: string` | Text | `name: string` |
| `: number` | Number | `age: number` |
| `: boolean` | True/false | `isActive: boolean` |
| `: string[]` | Array of strings | `tags: string[]` |
| `?:` | Optional | `nickname?: string` |
| `\|` | Union (OR) | `status: 'on' \| 'off'` |
| `() => void` | Function returning nothing | `onClick: () => void` |
| `<T>` | Generic type | `useState<number>` |

---

# Concept 3: React Components & JSX

## What it is
A **component** is a reusable piece of UI. Think of it like a custom HTML tag you create. **JSX** is the syntax that looks like HTML but is actually JavaScript.

## Why it matters
Your entire UI is built from components. Every `.tsx` file in `components/` defines a component.

---

## Anatomy of a Component

**File:** `components/game/detective-board/StickyNote.tsx` (lines 18-66)
```typescript
export function StickyNote({ 
  content, 
  source, 
  onClick, 
  rotating = 0,
  color = 'yellow'
}: StickyNoteProps) {
  return (
    <div
      onClick={onClick}
      className={`${colorClasses[color]} p-3 shadow-md ...`}
      style={{ transform: `rotate(${rotating}deg)` }}
    >
      {/* Tape at top */}
      <div className="absolute -top-2 ..." />

      {/* Content */}
      <p className="text-sm text-gray-800">
        {content}
      </p>

      {/* Source */}
      {source && (
        <p className="text-xs text-gray-600 mt-2">
          {source}
        </p>
      )}
    </div>
  )
}
```

Key parts:
1. **Function declaration** - `export function StickyNote(...)` 
2. **Props** - data passed in (we'll cover this next)
3. **Return statement** - returns JSX (the UI)
4. **JSX** - HTML-like syntax with JavaScript embedded in `{}`

---

## JSX Rules

### 1. Use `className` instead of `class`
```jsx
// HTML
<div class="container">

// JSX (React)
<div className="container">
```

### 2. JavaScript goes in curly braces
```jsx
<p>{content}</p>
<div style={{ color: 'red' }}>
<button onClick={handleClick}>
```

### 3. Must return ONE parent element
```jsx
// ❌ Wrong - two siblings
return (
  <h1>Title</h1>
  <p>Text</p>
)

// ✅ Correct - wrapped in parent
return (
  <div>
    <h1>Title</h1>
    <p>Text</p>
  </div>
)

// ✅ Also correct - React Fragment
return (
  <>
    <h1>Title</h1>
    <p>Text</p>
  </>
)
```

### 4. Comments use JavaScript syntax
```jsx
{/* This is a JSX comment */}
```

---

## Component Patterns in Your Codebase

### Simple Display Component
**File:** `components/game/documents/ValeNotesDocs.tsx`
```typescript
export const ValeNotesPage1 = () => (
  <div className="journal-page">
    <div className="journal-header">Medical Log</div>
    ...
  </div>
)
```
Just displays static content - no state, no logic.

### Interactive Component
**File:** `components/game/FeedbackForm.tsx`
```typescript
export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0)
  // ... state and logic
  return (
    <div>
      {/* Interactive UI */}
    </div>
  )
}
```
Has state, handles user interactions.

### Page Component
**File:** `app/page.tsx`
```typescript
export default function Home() {
  const { data: session, status } = useSession()
  return (
    <div className="min-h-screen ...">
      {/* Full page layout */}
    </div>
  )
}
```
Uses `export default` - this is the main export for the file (required for Next.js pages).

---

# Concept 4: Props

## What it is
**Props** (short for properties) are how you pass data FROM a parent component TO a child component. Think of them like function arguments, but for components.

## Why it matters
Props are how components communicate. Without props, every component would be isolated and couldn't share data.

---

## Basic Props Example

**File:** `components/game/detective-board/StickyNote.tsx`

The interface defines WHAT props the component accepts:
```typescript
interface StickyNoteProps {
  content: string        // Required
  source?: string        // Optional (?)
  onClick?: () => void   // Optional function
  rotating?: number      // Optional, defaults to 0
  color?: 'yellow' | 'blue' | 'pink' | 'green'  // Optional, defaults to 'yellow'
}
```

The component RECEIVES the props:
```typescript
export function StickyNote({ 
  content, 
  source, 
  onClick, 
  rotating = 0,      // Default value if not provided
  color = 'yellow'   // Default value if not provided
}: StickyNoteProps) {
```

**Using the component** (passing props):
```jsx
<StickyNote 
  content="This is a clue!" 
  source="Found in study"
  color="blue"
  rotating={-3}
  onClick={() => console.log('clicked')}
/>
```

---

## Props Patterns

### Destructuring Props (Recommended)
**File:** `components/game/FeedbackForm.tsx` (line 13)
```typescript
export function FeedbackForm({ onClose }: FeedbackFormProps) {
```
Pulls `onClose` directly from props.

### Callback Props (Functions)
Props can be functions that the child calls to communicate back to the parent.

**File:** `app/game/[caseId]/page.tsx` (lines 31-32)
```typescript
<DetectiveNotebook onAction={handleAction} onOpenMenu={() => setIsMenuOpen(true)} />
<GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
```

- `onAction={handleAction}` - passes a function the child can call
- `onClose={() => setIsMenuOpen(false)}` - inline function that updates parent's state

### Children Props
Some components accept content between their tags.

**File:** `app/page.tsx` (lines 48-50)
```typescript
<Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
  Play Now
</Button>
```
"Play Now" is automatically passed as `children` prop to Button.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  GamePage (Parent)                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │ const [isMenuOpen, setIsMenuOpen] = useState(false) ││
│  └─────────────────────────────────────────────────────┘│
│                         │                                │
│         ┌───────────────┴───────────────┐               │
│         ▼                               ▼               │
│  ┌─────────────────┐           ┌─────────────────┐     │
│  │ DetectiveNotebook│           │    GameMenu     │     │
│  │                 │           │                 │     │
│  │ Props:          │           │ Props:          │     │
│  │ - onOpenMenu    │           │ - isOpen        │     │
│  │                 │           │ - onClose       │     │
│  └─────────────────┘           └─────────────────┘     │
└─────────────────────────────────────────────────────────┘

Data flows DOWN (parent → child) via props
Events flow UP (child → parent) via callback functions
```

---

# Concept 5: "use client" Directive

## What it is
The `"use client"` directive at the top of a file tells Next.js this component runs in the **browser** (client-side), not on the server.

## Why it matters
Next.js 13+ uses **Server Components** by default. Server Components are faster but can't use browser features. You need `"use client"` when your component needs interactivity.

---

## When You NEED "use client"

**File:** `components/game/FeedbackForm.tsx` (line 1)
```typescript
"use client"

import { useState } from 'react'
```

You need `"use client"` when using:
- `useState`, `useEffect`, `useRef` (React hooks)
- `onClick`, `onChange` (event handlers)
- Browser APIs (`window`, `localStorage`, `document`)
- Third-party libraries that use browser features

---

## When You DON'T Need "use client"

Components that only:
- Display static content
- Fetch data on the server
- Pass props to children

**Example:** A component that just renders HTML without interactivity doesn't need it.

---

## Examples from Your Codebase

### Needs "use client" ✓
**File:** `app/page.tsx`
```typescript
"use client"

import { useSession, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()  // Hook = needs client
```
Uses `useSession` hook → needs client.

### Needs "use client" ✓
**File:** `components/game/detective-board/SceneViewer.tsx`
```typescript
"use client"

import { useState, useEffect, useRef } from "react"
```
Uses multiple React hooks → needs client.

---

## Quick Rule

> **If your component uses hooks or event handlers, add `"use client"` at the very top of the file.**

---

## Server vs Client Components

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| Default in Next.js 13+ | Yes | No (need `"use client"`) |
| Can use hooks | No | Yes |
| Can use event handlers | No | Yes |
| Can access database directly | Yes | No |
| Faster initial load | Yes | No |
| Bundle size | Smaller | Larger |

---

# Concept 6: useState (Local State)

## What it is
`useState` is a React hook that lets you store data that can **change over time**. When state changes, React automatically re-renders the component to show the new data.

## Why it matters
State is how your UI becomes dynamic. Form inputs, toggles, counters, loading states - all use `useState`.

---

## Basic Syntax

```typescript
const [value, setValue] = useState(initialValue)
//     ↑        ↑                    ↑
//     │        │                    └── Starting value
//     │        └── Function to UPDATE the value
//     └── Current value
```

---

## Examples from Your Codebase

**File:** `components/game/FeedbackForm.tsx` (lines 14-18)
```typescript
const [rating, setRating] = useState<number>(0)
const [feedback, setFeedback] = useState('')
const [category, setCategory] = useState<string>('general')
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitted, setSubmitted] = useState(false)
```

| State | Type | Initial Value | Purpose |
|-------|------|---------------|---------|
| `rating` | number | `0` | Star rating (1-5) |
| `feedback` | string | `''` | User's text input |
| `category` | string | `'general'` | Selected category |
| `isSubmitting` | boolean | `false` | Loading state |
| `submitted` | boolean | `false` | Success state |

---

## Updating State

### Direct Value
```typescript
setRating(5)           // Set to 5
setSubmitted(true)     // Set to true
setFeedback('')        // Clear the text
```

### Based on Previous Value
```typescript
setRating(prev => prev + 1)  // Increment by 1
```

**File:** `components/game/FeedbackForm.tsx` (line 92)
```typescript
<button onClick={() => setRating(star)}>
```

---

## State with TypeScript

**Explicit type:**
```typescript
const [rating, setRating] = useState<number>(0)
```

**Inferred type (TypeScript figures it out):**
```typescript
const [feedback, setFeedback] = useState('')  // TypeScript knows it's a string
```

**Complex types:**
```typescript
const [user, setUser] = useState<User | null>(null)
```

---

## Common Patterns

### Toggle Boolean
**File:** `app/game/[caseId]/page.tsx` (line 10)
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false)

// Toggle it
setIsMenuOpen(true)   // Open
setIsMenuOpen(false)  // Close
```

### Form Input
**File:** `components/game/FeedbackForm.tsx` (lines 131-137)
```typescript
<Textarea
  value={feedback}
  onChange={(e) => setFeedback(e.target.value)}
  placeholder="Tell us what you think..."
/>
```

### Loading State
**File:** `components/game/FeedbackForm.tsx` (lines 27, 45, 55)
```typescript
setIsSubmitting(true)   // Start loading
// ... do async work ...
setIsSubmitting(false)  // Stop loading
```

---

## Key Rules

1. **Never modify state directly** - always use the setter function
   ```typescript
   // ❌ Wrong
   rating = 5
   
   // ✅ Correct
   setRating(5)
   ```

2. **State updates trigger re-renders** - React will re-run your component when state changes

3. **State is preserved between renders** - unlike regular variables

---

# Concept 7: Event Handlers

## What it is
Event handlers are functions that run when the user interacts with your UI - clicking buttons, typing in inputs, submitting forms, etc.

## Why it matters
Event handlers make your app interactive. Every button click, form submission, and keyboard press uses them.

---

## Basic Syntax

```jsx
<button onClick={handleClick}>Click me</button>
```

The naming convention is `onEventName` where EventName is:
- `Click` → `onClick`
- `Change` → `onChange`
- `Submit` → `onSubmit`
- `KeyDown` → `onKeyDown`

---

## Examples from Your Codebase

### Click Handler
**File:** `app/page.tsx` (lines 29-34)
```typescript
<button
  onClick={() => signOut({ callbackUrl: '/' })}
  className="text-sm text-gray-500 hover:text-gray-300 underline"
>
  Sign Out
</button>
```

### Click Handler with State
**File:** `components/game/FeedbackForm.tsx` (lines 90-103)
```typescript
{[1, 2, 3, 4, 5].map((star) => (
  <button
    key={star}
    onClick={() => setRating(star)}
    className="transition-transform hover:scale-110"
  >
    <Star className={`h-8 w-8 ${star <= rating ? 'fill-amber-400' : 'text-gray-600'}`} />
  </button>
))}
```

### Change Handler (Input)
**File:** `components/game/FeedbackForm.tsx` (lines 112-115)
```typescript
<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
```

### Change Handler (Textarea)
**File:** `components/game/FeedbackForm.tsx` (lines 131-137)
```typescript
<Textarea
  value={feedback}
  onChange={(e) => setFeedback(e.target.value)}
  placeholder="Tell us what you think..."
/>
```

---

## Handler Patterns

### Inline Function (Simple)
```jsx
<button onClick={() => setIsOpen(true)}>Open</button>
```
Good for simple, one-line actions.

### Named Function (Complex)
**File:** `components/game/FeedbackForm.tsx` (lines 20-57)
```typescript
const handleSubmit = async () => {
  if (!feedback.trim()) {
    alert('Please provide your feedback before submitting.')
    return
  }

  try {
    setIsSubmitting(true)
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback: feedback.trim(), category }),
    })
    // ... handle response
  } catch (error) {
    console.error('Error submitting feedback:', error)
  } finally {
    setIsSubmitting(false)
  }
}

// Used like:
<Button onClick={handleSubmit}>Submit Feedback</Button>
```
Good for complex logic that would be messy inline.

### Passing to Child Components
**File:** `app/game/[caseId]/page.tsx` (lines 31-32)
```typescript
<DetectiveNotebook onAction={handleAction} onOpenMenu={() => setIsMenuOpen(true)} />
<GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
```
The parent passes handlers as props; children call them to communicate back.

---

## The Event Object

When an event fires, you get an event object with information about what happened:

```typescript
onChange={(e) => setCategory(e.target.value)}
//         ↑              ↑
//         │              └── The input's current value
//         └── The event object
```

Common event properties:
- `e.target.value` - current value of input/select
- `e.preventDefault()` - stop default behavior (form submit, link navigation)
- `e.stopPropagation()` - stop event from bubbling up

---

## Event Types Reference

| Event | Trigger | Common Use |
|-------|---------|-----------|
| `onClick` | User clicks | Buttons, links, any clickable |
| `onChange` | Value changes | Inputs, selects, checkboxes |
| `onSubmit` | Form submitted | Forms |
| `onKeyDown` | Key pressed | Keyboard shortcuts |
| `onFocus` | Element focused | Input highlighting |
| `onBlur` | Element loses focus | Validation |
| `onMouseEnter` | Mouse enters | Hover effects |
| `onMouseLeave` | Mouse leaves | Hover effects |

---

# Concept 8: Conditional Rendering

## What it is
Showing or hiding parts of your UI based on conditions (state, props, etc.). This is how your app responds to different situations.

## Why it matters
Apps need to show different things in different situations: loading states, error messages, authenticated vs. guest users, etc.

---

## Pattern 1: && Operator (Show if true)

```jsx
{condition && <Component />}
```

If `condition` is true, show the component. If false, show nothing.

**File:** `app/page.tsx` (lines 24-36)
```typescript
{isAuthenticated && (
  <div className="mb-4 flex items-center justify-center gap-4">
    <p className="text-gray-400">
      Welcome back, <span className="text-amber-400">{session?.user?.name}</span>!
    </p>
    <button onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </button>
  </div>
)}
```
Only shows the welcome message if user is authenticated.

---

## Pattern 2: Ternary Operator (If/Else)

```jsx
{condition ? <ComponentA /> : <ComponentB />}
```

Show ComponentA if true, ComponentB if false.

**File:** `app/page.tsx` (lines 44-78)
```typescript
<div className="flex gap-4 justify-center">
  {isAuthenticated ? (
    <>
      <Link href="/game/case01">
        <Button>Play Now</Button>
      </Link>
      <Link href="/dashboard">
        <Button variant="outline">My Cases</Button>
      </Link>
    </>
  ) : (
    <>
      <Link href="/auth/signup">
        <Button>Start Investigation</Button>
      </Link>
      <Link href="/auth/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    </>
  )}
</div>
```
Shows different buttons based on authentication status.

---

## Pattern 3: Early Return

Return different JSX based on a condition before the main return.

**File:** `components/game/FeedbackForm.tsx` (lines 59-73)
```typescript
if (submitted) {
  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
      <div className="text-center py-8">
        <div className="text-green-400 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-green-400">Thank You!</h2>
        <p className="text-gray-300">Your feedback has been submitted.</p>
      </div>
    </div>
  )
}

// Main form JSX follows...
return (
  <div className="bg-gray-900 ...">
    {/* Form content */}
  </div>
)
```
If `submitted` is true, return early with success message. Otherwise, show the form.

---

## Pattern 4: Optional Chaining with &&

Show something only if a value exists:

**File:** `components/game/detective-board/StickyNote.tsx` (lines 59-63)
```typescript
{source && (
  <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-400/30">
    {source}
  </p>
)}
```
Only shows the source paragraph if `source` prop was provided.

---

## Quick Reference

| Pattern | Use When |
|---------|----------|
| `{x && <A />}` | Show A only if x is true |
| `{x ? <A /> : <B />}` | Show A if true, B if false |
| `if (x) return <A />` | Completely different UI based on condition |
| `{x?.prop}` | Safely access property that might not exist |

---

# Concept 9: useEffect Hook

## What it is
`useEffect` lets you run code as a **side effect** of rendering - things like fetching data, setting up subscriptions, or manually changing the DOM. It runs AFTER the component renders.

## Why it matters
Any code that needs to "sync" with something outside React (APIs, browser storage, timers) uses `useEffect`.

---

## Basic Syntax

```typescript
useEffect(() => {
  // Code to run
}, [dependencies])
```

The **dependency array** controls WHEN the effect runs:
- `[]` - Run once on mount (component first appears)
- `[value]` - Run when `value` changes
- No array - Run on every render (rarely what you want)

---

## Examples from Your Codebase

### Run Once on Mount
**File:** `components/game/detective-board/SceneViewer.tsx` (lines 24-26)
```typescript
// Auto-focus the container for keyboard navigation
useEffect(() => {
  containerRef.current?.focus()
}, [])
```
Empty `[]` = runs once when component mounts.

### Run When Value Changes
**File:** `components/game/detective-board/SceneViewer.tsx` (lines 28-31)
```typescript
// Reset zoom when changing images
useEffect(() => {
  setIsZoomed(false)
  setPanOffset({ x: 0, y: 0 })
}, [currentIndex])
```
Runs whenever `currentIndex` changes.

### Run on Mount with Cleanup (in custom hook)
**File:** `lib/hooks/useGameState.ts` (lines 56-67)
```typescript
export function useInitializeGame(caseId: string) {
  const { initializeGame, caseId: currentCaseId } = useGameState()
  
  useEffect(() => {
    // Only initialize if this is a new case
    if (currentCaseId !== caseId) {
      initializeGame(caseId).catch(error => {
        console.error('Failed to initialize game:', error)
      })
    }
  }, [caseId, currentCaseId, initializeGame])
}
```
Runs when any dependency changes.

---

## Common Patterns

### Fetching Data
```typescript
useEffect(() => {
  async function fetchData() {
    const response = await fetch('/api/data')
    const data = await response.json()
    setData(data)
  }
  fetchData()
}, [])  // Empty array = fetch once on mount
```

### Setting Up Listeners
```typescript
useEffect(() => {
  function handleKeyPress(e) {
    if (e.key === 'Escape') closeModal()
  }
  
  window.addEventListener('keydown', handleKeyPress)
  
  // Cleanup function - runs when component unmounts
  return () => {
    window.removeEventListener('keydown', handleKeyPress)
  }
}, [])
```

---

## Dependency Array Rules

| Array | When Effect Runs |
|-------|-----------------|
| `[]` | Once, on mount |
| `[a]` | On mount + when `a` changes |
| `[a, b]` | On mount + when `a` OR `b` changes |
| (none) | Every render (usually a bug) |

**Rule of thumb:** Include everything from component scope that the effect uses.

---

## Common Mistakes

### Missing Dependencies
```typescript
// ❌ Bug: effect uses 'count' but doesn't list it
useEffect(() => {
  console.log(count)
}, [])

// ✅ Correct
useEffect(() => {
  console.log(count)
}, [count])
```

### Infinite Loop
```typescript
// ❌ Bug: sets state on every render, causing re-render, causing effect...
useEffect(() => {
  setData(fetchData())
})  // No dependency array!

// ✅ Correct
useEffect(() => {
  setData(fetchData())
}, [])  // Run once
```

---

# Concept 10: Custom Hooks

## What it is
A custom hook is a function that uses React hooks and can be reused across components. By convention, custom hooks start with `use`.

## Why it matters
Custom hooks let you extract and reuse stateful logic. Instead of copying the same `useState` + `useEffect` pattern everywhere, you put it in a hook once.

---

## Examples from Your Codebase

### Basic Custom Hook
**File:** `lib/hooks/useGameState.ts` (lines 7-51)
```typescript
export function useGameState() {
  const store = useGameStore()
  
  return {
    // State
    caseId: store.caseId,
    sessionId: store.sessionId,
    detectivePoints: store.detectivePoints,
    discoveredFacts: store.discoveredFacts,
    // ... more state
    
    // Actions
    initializeGame: store.initializeGame,
    addDetectivePoints: store.addDetectivePoints,
    unlockSuspect: store.unlockSuspect,
    // ... more actions
  }
}
```
Wraps Zustand store and provides a clean interface.

### Hook with useEffect
**File:** `lib/hooks/useGameState.ts` (lines 56-67)
```typescript
export function useInitializeGame(caseId: string) {
  const { initializeGame, caseId: currentCaseId } = useGameState()
  
  useEffect(() => {
    if (currentCaseId !== caseId) {
      initializeGame(caseId).catch(error => {
        console.error('Failed to initialize game:', error)
      })
    }
  }, [caseId, currentCaseId, initializeGame])
}
```
Encapsulates the initialization logic - component just calls `useInitializeGame(caseId)`.

### Hook that Filters Data
**File:** `lib/hooks/useGameState.ts` (lines 72-75)
```typescript
export function useSuspectChatHistory(suspectId: string) {
  const { chatHistory } = useGameState()
  return chatHistory.filter(msg => msg.suspectId === suspectId)
}
```
Returns filtered chat history for a specific suspect.

### Hook that Returns Boolean
**File:** `lib/hooks/useGameState.ts` (lines 80-93)
```typescript
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
```
Checks if content is unlocked - returns true/false.

---

## Using Custom Hooks

**File:** `app/game/[caseId]/page.tsx` (lines 13-14)
```typescript
useInitializeGame(caseId)
const { detectivePoints, sessionId, isLoading } = useGameState()
```

That's it! All the complex logic is hidden inside the hooks.

---

## Custom Hook Rules

1. **Name starts with `use`** - `useGameState`, `useSuspectChat`, etc.
2. **Can use other hooks** - `useState`, `useEffect`, other custom hooks
3. **Can return anything** - objects, arrays, single values, nothing
4. **Must be called at top level** - not inside loops, conditions, or nested functions

---

## Why Create Custom Hooks?

| Without Custom Hook | With Custom Hook |
|--------------------|--------------------|
| Copy/paste same logic | Write once, use everywhere |
| Logic scattered in components | Logic centralized |
| Hard to test | Easy to test in isolation |
| Components bloated | Components focused on UI |

---

# Concept 11: API Routes

## What it is
API routes are server-side endpoints in your Next.js app. They handle HTTP requests (GET, POST, etc.) and run on the server, not in the browser. This is where you put code that talks to databases, external APIs, or handles sensitive operations.

## Why it matters
Your murder mystery game needs server code to:
- Save game state to the database
- Generate AI responses securely
- Verify user authentication
- Process sensitive operations

---

## File Structure

In Next.js App Router, API routes live in `app/api/` folders:

```
app/
  api/
    feedback/
      route.ts        → /api/feedback
    game/
      actions/
        question/
          route.ts    → /api/game/actions/question
        solve/
          route.ts    → /api/game/actions/solve
```

The file must be named `route.ts` (or `route.js`).

---

## Basic Structure

**File:** `app/api/game/actions/question/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Handle POST requests to /api/game/actions/question
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await requireAuth()
    
    // 2. Parse request body
    const body = await request.json()
    const { sessionId, suspectId, caseId } = body
    
    // 3. Validate input
    if (!sessionId || !suspectId) {
      return NextResponse.json(
        { error: 'sessionId and suspectId are required' },
        { status: 400 }
      )
    }
    
    // 4. Do server-side work (database queries, etc.)
    const supabase = createServiceRoleClient()
    // ... database operations
    
    // 5. Return response
    return NextResponse.json({
      success: true,
      data: { /* ... */ }
    })
    
  } catch (error) {
    // 6. Handle errors
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Handle GET requests to /api/game/actions/question
export async function GET(request: NextRequest) {
  // ... similar structure
}
```

---

## HTTP Methods

Each function name corresponds to an HTTP method:

| Function | HTTP Method | Typical Use |
|----------|-------------|-------------|
| `GET` | GET | Fetch data |
| `POST` | POST | Create/submit data |
| `PUT` | PUT | Update data (full replace) |
| `PATCH` | PATCH | Update data (partial) |
| `DELETE` | DELETE | Remove data |

---

## Request and Response

### Reading the Request
```typescript
// Get JSON body (POST/PUT)
const body = await request.json()

// Get URL parameters (GET)
const searchParams = request.nextUrl.searchParams
const sessionId = searchParams.get('sessionId')

// Get headers
const authHeader = request.headers.get('Authorization')
```

### Sending Responses
```typescript
// Success with data
return NextResponse.json({ success: true, data: result })

// Error with status code
return NextResponse.json(
  { error: 'Not found' },
  { status: 404 }
)

// Common status codes:
// 200 - OK
// 201 - Created
// 400 - Bad Request (client error)
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 500 - Server Error
```

---

## Your API Routes

| Route | Purpose |
|-------|---------|
| `/api/ai/chat` | Stream AI chat responses |
| `/api/auth/*` | Authentication (NextAuth) |
| `/api/feedback` | Submit user feedback |
| `/api/game/actions/question` | Get suspect info for chat |
| `/api/game/actions/solve` | Submit final accusation |
| `/api/game/actions/validate-theory` | Check theory correctness |
| `/api/game/state` | Get/update game state |

---

# Concept 12: Async/Await & Fetching

## What it is
`async/await` is syntax for handling **asynchronous** operations - code that takes time (like API calls, database queries). Instead of the program waiting and blocking, it can do other things while waiting.

## Why it matters
Almost everything that talks to a server is async:
- Fetching data from APIs
- Saving to databases
- AI responses
- Authentication checks

---

## Basic Syntax

```typescript
// Mark function as async
async function getData() {
  // 'await' pauses until the Promise resolves
  const response = await fetch('/api/data')
  const data = await response.json()
  return data
}
```

- `async` before function = this function returns a Promise
- `await` before call = wait for this to finish before continuing

---

## Examples from Your Codebase

### Fetching from API
**File:** `components/game/FeedbackForm.tsx` (lines 26-43)
```typescript
const handleSubmit = async () => {
  try {
    setIsSubmitting(true)

    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating,
        feedback: feedback.trim(),
        category,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit feedback')
    }

    setSubmitted(true)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    alert('Failed to submit feedback. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}
```

Key pattern:
1. `try` - attempt the operation
2. `catch` - handle errors
3. `finally` - always runs (cleanup)

### Server-Side Async
**File:** `app/api/game/actions/question/route.ts` (lines 12-40)
```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    const supabase = createServiceRoleClient()
    
    const { data: session, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

---

## The fetch() Function

`fetch` is the browser's built-in way to make HTTP requests:

### GET Request (fetch data)
```typescript
const response = await fetch('/api/suspects')
const data = await response.json()
```

### POST Request (send data)
```typescript
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ rating: 5, feedback: 'Great!' }),
})
```

### Check for Errors
```typescript
const response = await fetch('/api/data')

if (!response.ok) {
  // response.ok is false for 400-599 status codes
  throw new Error(`HTTP error! status: ${response.status}`)
}

const data = await response.json()
```

---

## Loading States Pattern

**File:** `components/game/FeedbackForm.tsx`
```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async () => {
  setIsSubmitting(true)      // 1. Start loading
  try {
    await fetch(...)          // 2. Do async work
    setSubmitted(true)        // 3. Success
  } catch (error) {
    alert('Error!')           // 3. Or handle error
  } finally {
    setIsSubmitting(false)    // 4. Always stop loading
  }
}

// In JSX:
<Button disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

---

## Quick Reference

| Syntax | Meaning |
|--------|---------|
| `async function` | Function returns a Promise |
| `await x` | Wait for Promise `x` to resolve |
| `try/catch` | Handle errors from async code |
| `finally` | Always runs after try/catch |
| `response.ok` | True if status 200-299 |
| `response.json()` | Parse JSON body (also async!) |

---

# Concept 13: Zustand (Global State)

## What it is
Zustand is a lightweight state management library. While `useState` manages state within ONE component, Zustand manages state that multiple components need to share.

## Why it matters
Your game has state that many components need:
- Detective points (shown in header, used in actions)
- Unlocked content (affects what's visible everywhere)
- Chat history (persists between screens)

Without global state, you'd have to pass this data through every component as props ("prop drilling").

---

## Your Store Structure

**File:** `lib/store/gameStore.ts` (lines 1-80)
```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Define the shape of your state
export interface GameState {
  // Data
  caseId: string | null
  sessionId: string | null
  detectivePoints: number
  discoveredFacts: DiscoveredFact[]
  unlockedContent: UnlockedContent
  
  // Actions (functions that modify state)
  initializeGame: (caseId: string) => Promise<void>
  addDetectivePoints: (points: number) => void
  unlockSuspect: (suspectId: string) => void
  // ... more actions
}

// Create the store
export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state values
        caseId: null,
        detectivePoints: 25,
        discoveredFacts: [],
        
        // Action implementations
        addDetectivePoints: (points) => {
          set((state) => ({
            detectivePoints: state.detectivePoints + points
          }))
        },
        
        unlockSuspect: (suspectId) => {
          set((state) => ({
            unlockedContent: {
              ...state.unlockedContent,
              suspects: new Set([...state.unlockedContent.suspects, suspectId])
            }
          }))
        },
        // ... more actions
      }),
      { name: 'game-storage' }  // Key for localStorage
    )
  )
)
```

---

## Using the Store in Components

### Direct Store Access
```typescript
import { useGameStore } from '@/lib/store/gameStore'

function MyComponent() {
  // Get specific values you need
  const detectivePoints = useGameStore((state) => state.detectivePoints)
  const addPoints = useGameStore((state) => state.addDetectivePoints)
  
  return (
    <div>
      <p>Points: {detectivePoints}</p>
      <button onClick={() => addPoints(5)}>Add 5 Points</button>
    </div>
  )
}
```

### Via Custom Hook (Your Pattern)
**File:** `lib/hooks/useGameState.ts`
```typescript
export function useGameState() {
  const store = useGameStore()
  
  return {
    detectivePoints: store.detectivePoints,
    addDetectivePoints: store.addDetectivePoints,
    // ... curated list of state and actions
  }
}
```

**Using it:**
**File:** `app/game/[caseId]/page.tsx` (line 14)
```typescript
const { detectivePoints, sessionId, isLoading } = useGameState()
```

---

## How State Updates Work

```typescript
// The 'set' function updates state
addDetectivePoints: (points) => {
  set((state) => ({
    detectivePoints: state.detectivePoints + points
  }))
}
```

1. `set()` receives current state
2. Return object with updated values
3. Zustand merges it with existing state
4. All components using that state re-render

---

## Zustand vs useState

| Feature | useState | Zustand |
|---------|----------|---------|
| Scope | One component | Entire app |
| Sharing data | Pass via props | Access from anywhere |
| Persistence | Lost on refresh | Can persist to localStorage |
| Complexity | Simple | More setup, but scales |

**Use `useState`** for: Form inputs, UI toggles, component-local data

**Use Zustand** for: User data, game state, anything multiple components need

---

## Key Features in Your Store

### Persistence
```typescript
persist(
  (set, get) => ({ /* store */ }),
  { name: 'game-storage' }
)
```
Automatically saves to localStorage and restores on page load.

### DevTools
```typescript
devtools(
  persist(/* ... */)
)
```
Enables Redux DevTools browser extension for debugging.

---

# Concept 14: TailwindCSS

## What it is
TailwindCSS is a "utility-first" CSS framework. Instead of writing CSS in separate files, you add small utility classes directly to your HTML/JSX elements.

## Why it matters
Every component in your app uses Tailwind for styling. Understanding these classes lets you modify the appearance of anything.

---

## Basic Pattern

Instead of:
```css
/* styles.css */
.button {
  background-color: blue;
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
}
```

You write:
```jsx
<button className="bg-blue-500 px-4 py-2 rounded text-white">
  Click me
</button>
```

---

## Examples from Your Codebase

**File:** `app/page.tsx` (lines 13-14)
```typescript
<div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
```

Breaking down:
| Class | Effect |
|-------|--------|
| `min-h-screen` | Minimum height = viewport height |
| `bg-gradient-to-b` | Background gradient going down |
| `from-gray-950` | Gradient starts dark gray |
| `via-gray-900` | Gradient middle slightly lighter |
| `to-gray-950` | Gradient ends dark gray |
| `text-gray-100` | Light gray text |

---

## Common Utility Categories

### Spacing (Padding & Margin)
| Class | Meaning |
|-------|---------|
| `p-4` | padding: 1rem (16px) all sides |
| `px-4` | padding left & right |
| `py-2` | padding top & bottom |
| `pt-4` | padding top only |
| `m-4` | margin: 1rem all sides |
| `mx-auto` | margin left & right auto (centers) |
| `gap-4` | gap between flex/grid children |

### Sizing
| Class | Meaning |
|-------|---------|
| `w-full` | width: 100% |
| `w-64` | width: 16rem (256px) |
| `h-screen` | height: 100vh |
| `max-w-7xl` | max-width: 80rem |
| `min-h-screen` | min-height: 100vh |

### Flexbox & Grid
| Class | Meaning |
|-------|---------|
| `flex` | display: flex |
| `flex-col` | flex-direction: column |
| `items-center` | align-items: center |
| `justify-center` | justify-content: center |
| `justify-between` | justify-content: space-between |
| `grid` | display: grid |
| `grid-cols-3` | 3 equal columns |

### Colors
| Class | Meaning |
|-------|---------|
| `bg-gray-900` | dark gray background |
| `text-amber-400` | amber/gold text |
| `border-gray-700` | gray border color |
| `hover:bg-amber-700` | darker on hover |

### Typography
| Class | Meaning |
|-------|---------|
| `text-sm` | small text |
| `text-xl` | extra large text |
| `text-6xl` | 6x large (huge) |
| `font-bold` | bold weight |
| `font-semibold` | semi-bold |

### Borders & Rounded
| Class | Meaning |
|-------|---------|
| `border` | 1px border |
| `border-2` | 2px border |
| `rounded` | small border radius |
| `rounded-lg` | larger radius |
| `rounded-full` | fully circular |

---

## Responsive Design

Add prefixes for different screen sizes:

```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-4">
```

| Prefix | Screen Width |
|--------|-------------|
| (none) | All sizes (mobile first) |
| `sm:` | ≥640px |
| `md:` | ≥768px |
| `lg:` | ≥1024px |
| `xl:` | ≥1280px |

**File:** `app/page.tsx` (line 82)
```typescript
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
```
- Mobile: 1 column (default)
- Tablet (md): 2 columns
- Desktop (lg): 4 columns

---

## Hover, Focus & State

```jsx
<button className="bg-amber-600 hover:bg-amber-700 focus:ring-2">
```

| Prefix | When Applied |
|--------|-------------|
| `hover:` | Mouse over |
| `focus:` | Element focused |
| `active:` | Being clicked |
| `disabled:` | When disabled |

---

## The cn() Utility

**File:** `lib/utils.ts`
```typescript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This helper combines and deduplicates Tailwind classes:

```typescript
cn(
  "px-4 py-2",                    // Base classes
  isActive && "bg-blue-500",      // Conditional
  className                        // Props override
)
```

---

## Quick Reference Card

```
SPACING          FLEXBOX           COLORS
p-{n}  padding   flex              bg-{color}-{shade}
m-{n}  margin    flex-col          text-{color}-{shade}
gap-{n} gap      items-center      border-{color}-{shade}
                 justify-center    

SIZING           TYPOGRAPHY        STATES
w-{n}  width     text-{size}       hover:
h-{n}  height    font-{weight}     focus:
                                   disabled:

RESPONSIVE
sm: md: lg: xl:
```

---

# Summary & Next Steps

## What You've Learned

1. **Imports** - How code is organized and shared between files
2. **TypeScript** - Type safety and interfaces
3. **Components** - Building blocks of React UIs
4. **Props** - Passing data between components
5. **"use client"** - Server vs client components in Next.js
6. **useState** - Managing local component state
7. **Event Handlers** - Making things interactive
8. **Conditional Rendering** - Showing/hiding based on conditions
9. **useEffect** - Side effects and lifecycle
10. **Custom Hooks** - Reusable stateful logic
11. **API Routes** - Server-side endpoints
12. **Async/Await** - Handling asynchronous operations
13. **Zustand** - Global state management
14. **TailwindCSS** - Utility-first styling

## Recommended Practice

1. **Read your existing components** with new understanding
2. **Make small changes** to see cause and effect
3. **Follow the data flow** from API → store → component → UI
4. **Use TypeScript errors** as learning opportunities

## Resources

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

*Generated from your Murder Mysteries AI codebase*
