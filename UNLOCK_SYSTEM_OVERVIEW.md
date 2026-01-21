# Unlock Mapping System - Implementation Overview

## Summary

The unlock mapping system has been fully implemented according to the plan. This system tracks player progression through stages (Start → Act I → Act II) and unlocks content based on evidence combinations shown in chat or submitted via theory validation.

## Key Features

✅ **Stage-Based Progression**: Game tracks player stage (start, act_i, act_ii) and applies rules accordingly
✅ **Chat Attachment Unlocks**: Showing specific evidence to specific suspects triggers unlocks
✅ **Theory Validation Unlocks**: Submitting correct artifact combinations unlocks content
✅ **Auto-Detection**: No AI text validation required - purely artifact-based
✅ **Real-Time Notifications**: Players receive instant feedback when content unlocks
✅ **Database Tracking**: All evidence presentations and unlocks are persisted

## Architecture

### 1. Database Layer
**Files**: `supabase/migrations/006_add_stage_tracking.sql`, `007_evidence_presentations.sql`

- **game_sessions.current_stage**: Tracks player progression (start/act_i/act_ii)
- **evidence_presentations**: Records when evidence is shown to suspects
  - Links session, suspect, and evidence IDs
  - Timestamps for historical tracking
  - RLS policies for data security

### 2. Configuration Layer
**File**: `lib/config/unlockRules.ts`

Defines all unlock rules from the CSV mapping:
- **The Contradiction**: Vale's notes + Wine photo → Act I
- **Master Bedroom**: Show blackmail to Veronica → Unlock bedroom
- **Vale Confrontation**: Phone records + Both blackmail sets → Unlock Study
- **Colin Accusation**: All evidence → Case solved (Act II)

Each rule specifies:
- Current stage requirement
- Trigger type (chat/theory)
- Required suspect (for chat)
- Required artifacts (evidence IDs)
- Logic operator (AND/OR)
- What to unlock (suspects/scenes/records/stage)

### 3. Service Layer
**File**: `lib/services/unlockService.ts`

Core unlock evaluation logic:
- `evaluateUnlocks()`: Checks if evidence combination matches any unlock rule
- `applyUnlocks()`: Persists unlocks to database
- `saveEvidencePresentation()`: Tracks evidence shown to suspects
- `checkAndApplyActIUnlocks()`: Auto-unlocks inner circle when Act I begins

### 4. API Layer
**Files**: `app/api/ai/chat/route.ts`, `app/api/game/actions/validate-theory/route.ts`

**Chat API**:
- Accepts `sessionId` and `attachedItems` in request
- Evaluates unlocks before streaming AI response
- Sends unlock event via SSE before chat response
- Tracks evidence presentation in database

**Theory Validation API**:
- Replaced placeholder unlock logic with unlock service
- Evaluates artifact combinations against rules
- Returns unlock results with theory feedback

### 5. Frontend Layer
**Files**: 
- `components/game/ChatInterfaceWithAttachments.tsx`
- `lib/store/gameStore.ts`
- `lib/hooks/useGameState.ts`

**ChatInterfaceWithAttachments**:
- Passes `sessionId` to chat API
- Listens for unlock events in SSE stream
- Shows golden notification toast when content unlocks
- Refreshes game state to display new content

**Game Store**:
- Added `currentStage` field
- Added `setCurrentStage()` action
- Added `fetchGameState()` to refresh from server
- Persists stage in local storage

## Unlock Rules (CSV Mapping)

### Start → Act I: The Contradiction
**Trigger**: Theory Validation
**Required**: Vale's Medical Notes + Crime Scene Photos (wine spill)
**Unlocks**: 
- Stage: Act I
- Status: "Murder Confirmed"
- Inner Circle: Martin, Colin, Lydia, Vale
- Records: Veronica's thank you, blackmail papers, phone logs

### Act I: Master Bedroom
**Trigger**: Chat (Veronica) OR Theory
**Required**: 
- Chat: Show blackmail papers to Veronica
- Theory: Blackmail papers + Veronica's note
**Unlocks**: Master Bedroom scene

### Act I: The Confrontation (Vale)
**Trigger**: Chat (Vale) OR Theory
**Required**: Phone records + Both blackmail sets
**Unlocks**: The Study scene

### Act I → Act II: Colin's Confession
**Trigger**: Chat (Colin) OR Theory
**Required**: Both blackmail sets + Gala photos (pocket square/gloves)
**Unlocks**: 
- Stage: Act II
- Status: "Case Solved"

## User Notifications

When content unlocks, players see a golden notification toast with:
- What was unlocked (suspects, scenes, records)
- Stage progression message if applicable
- Custom message from unlock rule

Example: *"Dr. Vale has confessed to stealing plants from the greenhouse! He mentions CCTV footage in the Study can prove his alibi."*

## Testing the System

### Test 1: The Contradiction
1. Start a new game
2. Open "Validate Theory"
3. Attach Vale's Medical Notes
4. Attach Crime Scene Photos
5. Submit theory
6. **Expected**: Act I unlocks, inner circle available

### Test 2: Master Bedroom Unlock
1. In Act I, talk to Veronica
2. Attach "Blackmail Papers (Floor)"
3. Send a message
4. **Expected**: Master Bedroom scene unlocks

### Test 3: Vale Confrontation
1. Unlock Master Bedroom, retrieve complete blackmail set
2. Talk to Dr. Vale
3. Attach: Phone Records + Blackmail (Floor) + Blackmail (Found Behind Painting)
4. Send a message
5. **Expected**: Study scene unlocks

### Test 4: Colin Accusation
1. Complete Vale confrontation, unlock Study
2. Talk to Colin
3. Attach: Both blackmail sets + Gala photos
4. Send a message
5. **Expected**: Case solved! Act II unlocked

## Button-Based Unlocks

Two existing buttons continue to work as before:
- **"Retrieve Blackmail!"** (Master Bedroom - painting that Elizabeth painted): Unlocks `record_blackmail_portrait`
- **"Security Footage Available"** (Study scene): Unlocks `record_greenhouse_footage`

These are naturally gated by location unlocks - players can't access them until the scenes are unlocked via the unlock system.

## Database Migration Required

⚠️ **IMPORTANT**: Apply the new database migrations before testing:
1. `supabase/migrations/006_add_stage_tracking.sql`
2. `supabase/migrations/007_evidence_presentations.sql`

See `MIGRATION_INSTRUCTIONS.md` for detailed steps.

## Files Created/Modified

### Created:
- `supabase/migrations/006_add_stage_tracking.sql`
- `supabase/migrations/007_evidence_presentations.sql`
- `lib/config/unlockRules.ts`
- `lib/services/unlockService.ts`
- `MIGRATION_INSTRUCTIONS.md`
- `UNLOCK_SYSTEM_OVERVIEW.md` (this file)

### Modified:
- `app/api/ai/chat/route.ts` - Added unlock evaluation for chat attachments
- `app/api/game/actions/validate-theory/route.ts` - Replaced placeholder with unlock service
- `components/game/ChatInterfaceWithAttachments.tsx` - Added unlock notifications
- `lib/store/gameStore.ts` - Added stage tracking and refresh functionality
- `lib/hooks/useGameState.ts` - Exposed new stage fields and actions

## Next Steps

1. **Apply Database Migrations** (see `MIGRATION_INSTRUCTIONS.md`)
2. **Test Each Unlock Scenario** (use test cases above)
3. **Adjust Unlock Messages** (edit `lib/config/unlockRules.ts` for custom messages)
4. **Add More Unlock Rules** (extend `UNLOCK_RULES` array as needed)

## Troubleshooting

### Unlocks not triggering
- Check that migrations were applied successfully
- Verify `sessionId` is being passed to chat API
- Check browser console for unlock events
- Verify artifact IDs match those in unlock rules

### Notifications not showing
- Check that `unlockNotification` state is updating
- Verify SSE stream is parsing unlock events
- Check browser console for errors

### Stage not updating
- Check that `current_stage` column exists in `game_sessions`
- Verify `fetchGameState()` is called after unlocks
- Check that `setCurrentStage()` is persisting to storage

## Support

For questions or issues, refer to:
- Implementation plan: `unlock_mapping_implementation_96274f17.plan.md`
- CSV mapping: `unlock mapping - murder mystery - Sheet1.csv`
- Codebase documentation: `README.md`, `SETUP.md`

