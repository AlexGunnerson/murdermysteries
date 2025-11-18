# Case 01: The Midnight Manor Mystery

This directory contains all content and assets for Case 01.

## Directory Structure

```
case01/
├── metadata.json           # Case metadata, suspects, locations, records
├── story-config.json       # AI prompts, fact tree, solution logic
├── images/
│   ├── scenes/            # Crime scene images
│   ├── portraits/         # Character portrait images
│   ├── evidence/          # Evidence item images
│   └── documents/         # Document/record images
└── README.md              # This file
```

## File Formats

### metadata.json

Defines the case overview and all investigable elements:
- **Case info**: title, description, difficulty, estimated time
- **Suspects**: List of people to question (with bios, portraits, availability)
- **Locations**: Crime scenes and investigable areas
- **Records**: Official documents and files

### story-config.json

Defines the game logic and AI behavior:
- **Briefing**: Initial case briefing text shown to player
- **System Prompt**: Base AI prompt template for suspect conversations
- **Suspects**: Per-suspect configuration (personality, alibi, secrets, facts)
- **Fact Tree**: All discoverable facts with categories and importance
- **Theory Rules**: Rules for validating player theories
- **Solution**: The correct solution and win/lose narratives
- **Clues**: Contextual hints that can be shown to players

## Image Assets

### Required Images

Place your images in the appropriate subdirectories:

**Portraits** (suspects):
- `images/portraits/victoria.jpg`
- `images/portraits/marcus.jpg`
- `images/portraits/james.jpg`

**Scenes**:
- `images/scenes/study.jpg`
- `images/scenes/bedroom.jpg`

**Documents**:
- `images/documents/will.jpg`
- `images/documents/financial.jpg`

### Image Guidelines

- **Format**: JPG or PNG
- **Portraits**: 400x400px (square), clear face shot
- **Scenes**: 1200x800px (landscape), atmospheric/noir style
- **Documents**: 800x1000px (portrait), readable text if applicable
- **Evidence**: Various sizes, clear and detailed

## Customizing Your Case

1. **Replace `metadata.json`** with your case details
2. **Replace `story-config.json`** with your story logic
3. **Add your images** to the appropriate folders
4. **Update image paths** in the JSON files to match your filenames

## Testing Your Case

After adding your content:

1. Visit: http://localhost:3000/game/case01
2. The game will load your case data automatically
3. Test all investigation paths
4. Verify all facts can be discovered
5. Test theory validation
6. Test the final solution

## Notes

- The template provided is a complete working example
- You can add more suspects, scenes, records as needed
- The fact tree can be expanded with more complex prerequisite chains
- Theory rules can unlock additional content progressively
- Clues are shown contextually based on player progress

