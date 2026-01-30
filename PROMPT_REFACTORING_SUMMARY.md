# System Prompt Refactoring Summary

## Date: January 30, 2026

## Overview
Refactored all suspect system prompts in `story-config.json` to be more character-driven and immersive while maintaining the complex state logic required for the murder mystery game mechanics.

## Philosophy
**The feedback had valid points about tone and immersion, but underestimated the complexity of the state machine needed for game mechanics. The solution: Keep the structure, improve the prose.**

## Key Changes Made

### 1. Removed Technical Headers
**Before:**
- `FULL DAY TIMELINE (May 9, 1986 - Day of the Gala):`
- `BEHAVIORAL RULES - BEFORE ACT I COMPLETE:`
- `POST-REVEAL RESPONSE GUIDELINES:`
- `SCENARIO 1 - ONLY Phone Records shown:`

**After:**
- Integrated into natural narrative flow
- Framed as character knowledge and memory
- No ALL CAPS labels

### 2. Eliminated Meta-Instructions
**Before:**
- `"Do NOT mention the accountability files..."`
- `"IMPORTANT: If you mention the painting..."`
- `"you should react with GENUINE SURPRISE"`

**After:**
- Rewritten as character emotional states and knowledge
- Framed as what they know, remember, or will naturally do
- Example: `"You didn't notice the red wine near Reginald's body in your shock and grief. If the detective tells you..."`

### 3. Simplified Conditional Logic (Without Removing It)
**Before:**
```
"POST-REVEAL RESPONSE GUIDELINES (After Act I Complete): 
(1) TERMINOLOGY: ... 
(2) IF ASKED ABOUT THE PAPERS: ... 
(3) IF ASKED WHY YOU HID THEM: ..."
```

**After:**
```
"Once the detective proves the scene was staged (Act I complete), you'll drop your guard completely and become a partner in the investigation. You're relieved to finally have competent help..."
```

The conditional logic is maintained but framed as emotional journey and natural responses.

### 4. Moved System-Level Instructions
**Action:** Added item #10 to the base `systemPrompt` to handle stage direction restrictions that were previously embedded in individual character personalities.

**Rationale:** Instructions about how to format responses (no stage directions, no parentheticals) belong in the system-level prompt, not character-specific sections.

### 5. Maintained Critical Game Mechanics

**Preserved:**
- Hard state gates (Before/After Act I complete)
- Evidence-based confession triggers
- Conditional knowledge reveals
- Structured separation of personality/alibi/secrets

**Why:** These are puzzle mechanics essential to gameplay consistency. "Natural language" alone wouldn't ensure reliable behavior across different playthroughs.

## Specific Suspect Changes

### Veronica Ashcombe
- Removed ALL CAPS headers (FULL DAY TIMELINE, BEHAVIORAL RULES, etc.)
- Rewrote state transitions as emotional evolution based on detective's competence
- Maintained Act I gate but framed as trust-building process
- Simplified master bedroom access logic while keeping verification requirement

### Dr. Vale
- Condensed 5 separate SCENARIO sections into flowing narrative
- Maintained evidence-based confession trigger (phone records + blackmail Set 2)
- Kept response variations but framed as natural reactions to different evidence
- Removed IMPORTANT tags and meta-commentary

### Colin Dorsey
- Simplified CONFESSION TRIGGER from numbered list to natural condition
- Removed INTERACTION RULES numbering
- Maintained hard evidence requirements (3 pieces needed)
- Rewrote as character knowledge vs. AI instructions

### Martin Ashcombe
- Removed CRITICAL label from alibi contradiction handling
- Changed from meta-instruction to character memory state
- Maintained fuzzy timing logic for gameplay

### Lydia Portwell
- Removed THE BLACKMAIL DYNAMIC header
- Simplified financial defensive responses
- Maintained conditional reveals but framed as fear and motivation
- Converted numbered interaction responses to natural character knowledge

## What Was NOT Changed

### Kept the JSON Structure
The `personality` / `alibi` / `secrets` / `facts` separation is architecturally sound. It allows for:
- Independent updates to different aspects
- Clear separation of concerns
- Easy maintenance and debugging

### Kept State Gates
Hard transitions like "Before Act I Complete" and "After Act I Complete" are necessary for:
- Consistent gameplay progression
- Preventing premature reveals
- Maintaining mystery difficulty

### Kept Evidence-Based Triggers
Specific confession conditions (e.g., "ALL THREE pieces of evidence") ensure:
- Fair but challenging puzzles
- Predictable game logic
- Reliable testing and QA

### Kept Terminology
Terms like "inner circle" are period-appropriate and not actually problematic despite feedback claiming otherwise.

## Result

**Before:** Prompts read like technical API documentation with explicit AI-handling instructions
**After:** Prompts read as character knowledge, memories, and emotional states that naturally guide behavior

**Maintained:** All complex state logic, conditional triggers, and game mechanics remain functionally identical

## Testing Recommendations

1. **State Transition Testing:** Verify Veronica's behavior before/after Act I complete
2. **Confession Triggers:** Confirm Colin and Vale only confess when proper evidence is shown
3. **Knowledge Reveals:** Test that secrets are revealed at appropriate times
4. **Tone Consistency:** Verify responses feel more natural and less robotic
5. **No Instruction Leakage:** Check that phrases like "Do NOT" don't appear in actual responses

## Files Modified
- `/public/cases/case01/story-config.json` (all suspect sections)

## Files Created
- This summary document

## Conclusion

The refactoring successfully addresses the feedback's valid concerns about immersion and tone while maintaining the sophisticated game logic required for a complex mystery game. The prompts now feel like character profiles rather than AI instruction manuals, but still enforce the necessary behavioral rules for consistent gameplay.
