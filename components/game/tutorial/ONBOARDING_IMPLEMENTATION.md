# Onboarding Tour Implementation

## Overview
This directory contains the onboarding tutorial implementation using driver.js. This document explains the architecture and lessons learned from debugging the implementation.

## Architecture

### Key Components
- `OnboardingTour.tsx` - Main tour component that wraps driver.js
- `tourSteps.ts` - Defines the 7 steps of the tutorial
- `tourConfig.ts` - Driver.js configuration
- State managed via Zustand in `gameStore.ts`

### State Flow
```
1. User reads Veronica's Letter
2. hasReadVeronicaLetter → true
3. DetectiveNotebook starts tutorial after 1.5s delay
4. OnboardingTour component initializes driver.js
5. User progresses through steps 0-6
6. On step 6 (final step), completeTutorial() is called
7. tutorialCompleted → true, tutorialStarted → false
8. State persists in localStorage via Zustand
9. On navigation back, tutorial won't restart (tutorialCompleted check)
```

## Key Implementation Details

### 1. Manual Step Tracking with Refs
**Why:** driver.js's `step.popover?.currentStep` was unreliable and always returned 0.

```typescript
const currentStepRef = useRef<number>(0)

onNextClick: () => {
  const currentIndex = currentStepRef.current
  
  // Check if on last step before incrementing
  if (currentIndex === totalSteps - 1) {
    completeTutorial()
  }
  
  // Increment AFTER checking for completion
  currentStepRef.current = currentIndex + 1
}
```

### 2. Controlled Dependency Array
**Why:** Including `tutorialStep` in useEffect dependencies caused driver to recreate on every step change.

```typescript
useEffect(() => {
  if (tutorialCompleted || !tutorialStarted) return
  
  const driverObj = driver({ ...config })
  currentStepRef.current = 0 // Reset on mount
  
  return () => driverObj.destroy()
}, [
  tutorialStarted,
  tutorialCompleted,
  // NOT tutorialStep - would cause recreation!
])
```

### 3. State Preservation During Navigation
**Why:** `initializeGame()` was resetting tutorial state when navigating back from InvestigationBoard.

```typescript
// In gameStore.ts
const currentState = get()
set({
  // ... other state ...
  
  // Preserve tutorial state
  tutorialCompleted: currentState.tutorialCompleted,
  tutorialStarted: currentState.tutorialStarted,
  tutorialStep: currentState.tutorialStep,
  tutorialDismissedAt: currentState.tutorialDismissedAt,
  checklistProgress: currentState.checklistProgress,
})
```

### 4. Dual Completion Detection
**Why:** Redundancy ensures completion is always detected.

```typescript
// Method 1: Detect on last step click
onNextClick: () => {
  if (currentStepRef.current === totalSteps - 1) {
    completeTutorial() // Call before moveNext()
  }
  driverObj.moveNext()
}

// Method 2: Detect when driver destroys after all steps
onDestroyed: () => {
  if (currentStepRef.current >= totalSteps) {
    completeTutorial() // Safety net
  }
}
```

## Common Pitfalls & Solutions

### Pitfall 1: Driver Recreating on Every Step
**Symptom:** Step counter always shows 0, callbacks receive stale data
**Solution:** Remove state variables from useEffect dependencies, use refs instead

### Pitfall 2: Tutorial Restarting After Navigation
**Symptom:** Tutorial shows again after navigating away and back
**Solution:** Preserve tutorial state in `initializeGame()` function

### Pitfall 3: Completion Not Detected
**Symptom:** Tutorial can be completed but never marks as done
**Solution:** Don't trust library parameters, track steps manually with refs

### Pitfall 4: State Updates Causing Re-renders
**Symptom:** Performance issues, driver behaving erratically
**Solution:** Use refs for values that don't need to trigger re-renders

## Testing Checklist

When modifying the tutorial:

- [ ] Complete tutorial and verify `tutorialCompleted = true`
- [ ] Navigate to InvestigationBoard and back - tutorial should NOT restart
- [ ] Refresh page - tutorial should NOT restart
- [ ] Clear localStorage - tutorial SHOULD show after reading letter
- [ ] Verify all 7 steps display correctly
- [ ] Verify checklist items update at correct steps (1, 2, 3)
- [ ] Test "Back" button navigation through steps

## Future Improvements

1. Consider using a more reliable tour library if driver.js continues to have issues
2. Add analytics to track completion rates
3. Add ability to restart tutorial from settings
4. Consider splitting into multiple smaller tours (evidence, suspects, board)
