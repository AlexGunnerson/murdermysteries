# Development Guide

## Best Practices & Lessons Learned

This document captures important patterns and anti-patterns discovered while building MurderMysteries.AI.

## State Management with Zustand

### Persisted State Preservation
When using Zustand with persistence, be careful about state reinitialization.

**✅ DO:**
```typescript
// Preserve UI-only state during reinitialization
const currentState = get()
set({
  // Reset game data
  sessionId: newSessionId,
  gameData: newData,
  
  // Preserve UI state
  tutorialCompleted: currentState.tutorialCompleted,
  userPreferences: currentState.userPreferences,
})
```

**❌ DON'T:**
```typescript
// This will lose persisted state!
set({
  sessionId: newSessionId,
  gameData: newData,
  // Missing: tutorialCompleted, preferences, etc.
})
```

### State Categories
- **Game Data**: Resets on new session (session ID, progress, unlocked content)
- **UI State**: Persists across sessions (tutorial completion, preferences)
- **Temporary State**: Not persisted (loading states, modal visibility)

Document which category each state belongs to in the store definition.

## React Patterns

### useEffect and Expensive Resources

**❌ BAD: Resource recreates on every state change**
```typescript
const [step, setStep] = useState(0)

useEffect(() => {
  const expensiveLib = initializeLibrary({
    onNext: () => setStep(s => s + 1)
  })
  return () => expensiveLib.cleanup()
}, [step]) // Recreates library on every step!
```

**✅ GOOD: Use refs to avoid recreation**
```typescript
const stepRef = useRef(0)
const [step, setStep] = useState(0)

useEffect(() => {
  const expensiveLib = initializeLibrary({
    onNext: () => {
      stepRef.current += 1
      setStep(stepRef.current) // Optional UI update
    }
  })
  return () => expensiveLib.cleanup()
}, []) // Only creates once
```

### When to Use Refs vs State
- **Use State**: When changes should trigger re-renders (UI updates)
- **Use Refs**: When you need to track values without triggering re-renders (counters, callbacks)

## Third-Party Library Integration

### Verify Library Behavior
Don't assume third-party library APIs work as documented. Always test.

**Example: Driver.js Step Tracking**
```typescript
// Documentation says step.popover.currentStep tracks the step
// Reality: It always returned 0!

// ❌ BAD: Trust the library
onNext: (element, step) => {
  const current = step.popover.currentStep // Always 0!
}

// ✅ GOOD: Track it yourself
const stepRef = useRef(0)
onNext: () => {
  const current = stepRef.current
  stepRef.current += 1
}
```

### Testing Integration Points
When integrating third-party libraries:
1. Test initialization and cleanup
2. Test state transitions and callbacks
3. Test edge cases (first step, last step, cancellation)
4. Test with navigation (mount/unmount cycles)

## Navigation & State Persistence

### Critical Test Pattern
Always test state persistence across navigation:

```typescript
// 1. Set up state
await completeFlow()
expect(store.completed).toBe(true)

// 2. Navigate away
router.push('/other-page')
await waitFor(() => expect(router.pathname).toBe('/other-page'))

// 3. Navigate back
router.push('/original-page')
await waitFor(() => expect(router.pathname).toBe('/original-page'))

// 4. Verify state persisted
expect(store.completed).toBe(true)
expect(flowShouldNotRestart()).toBe(true)
```

## Debugging Patterns

### Console Logging Strategy
When debugging complex state flows:

1. **Log at entry/exit of effects**
```typescript
useEffect(() => {
  console.log('[COMPONENT] Effect triggered:', { state1, state2 })
  // ... logic
  return () => console.log('[COMPONENT] Effect cleanup')
}, [deps])
```

2. **Log state transitions**
```typescript
set({ newState })
console.log('[STORE] State updated:', get())
```

3. **Log key decision points**
```typescript
if (shouldComplete) {
  console.log('[FLOW] Completing flow:', { context })
  complete()
}
```

4. **Remove logs after fixing** - Keep code clean

## Common Bugs & Solutions

### Bug: Feature Restarts After Navigation
**Symptoms:** Tutorial/onboarding shows again after navigating away
**Root Cause:** State not preserved during reinitialization
**Solution:** Explicitly preserve UI state in initialization logic

### Bug: useEffect Runs Too Often
**Symptoms:** Performance issues, unexpected behavior, logs showing constant re-runs
**Root Cause:** Too many or wrong dependencies in dependency array
**Solution:** Use refs for values that don't need to trigger re-renders, verify each dependency is necessary

### Bug: Library Callback Has Stale Data
**Symptoms:** Callbacks reference old state values
**Root Cause:** Closure capturing old values, effect recreating with new closure
**Solution:** Use refs for mutable values accessed in callbacks, minimize effect dependencies

### Bug: Completion Logic Not Triggered
**Symptoms:** Flow completes but state doesn't update
**Root Cause:** Unreliable library parameters, logic in wrong callback
**Solution:** Track state manually, implement redundant completion checks

## Code Review Checklist

When reviewing state-related code:

- [ ] Is state properly categorized (game data vs UI state)?
- [ ] Are UI states preserved during reinitialization?
- [ ] Are useEffect dependencies minimal and correct?
- [ ] Are refs used appropriately (values that shouldn't trigger re-renders)?
- [ ] Are third-party library integrations tested thoroughly?
- [ ] Is there navigation testing for stateful features?
- [ ] Are completion/edge cases handled?
- [ ] Are debug logs removed?

## Resources

- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/best-practices)
- [React useEffect Complete Guide](https://overreacted.io/a-complete-guide-to-useeffect/)
- [When to use useRef](https://react.dev/reference/react/useRef)
- Project-specific: `.cursor/rules/react-state-management.mdc`
- Project-specific: `components/game/tutorial/ONBOARDING_IMPLEMENTATION.md`
