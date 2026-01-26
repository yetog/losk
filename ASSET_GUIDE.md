
# Asset Integration Guide

## Quick Start
1. Replace .placeholder files with actual assets (same name, remove .placeholder)
2. The game will automatically detect and use your custom assets
3. Missing assets will fallback to generated placeholders

## Audio Assets

### Background Music (BGM)
- **Location:** `public/audio/bgm/`
- **Format:** MP3 (recommended for web compatibility)
- **Volume:** Will be automatically managed by the game

### Sound Effects (SFX)
- **Location:** `public/audio/sfx/`
- **Format:** MP3
- **Keep short:** Most SFX should be under 1 second

## Image Assets

### Character Images
- **Location:** `public/images/characters/`
- **Format:** PNG with transparency preferred
- **Size:** 200x300px for portraits, can be larger for battle sprites
- **Naming:** Must match character IDs (ren, liora, king_fasa, kira, bradley, dante)

### Stage Backgrounds
- **Location:** `public/images/stages/`
- **Format:** JPG or PNG
- **Size:** 1280x720px (game resolution)

### UI Elements
- **Location:** `public/images/ui/`
- **Format:** PNG with transparency
- **Various sizes** depending on usage

## Integration Process

1. **Add your assets** to the appropriate folders
2. **Remove .placeholder** extensions from files you want to replace
3. **Test in game** - the game will automatically load your assets
4. **Fallback behavior** - missing assets won't break the game

## Next Steps

After adding assets, you can:
- Modify character system to use custom images instead of emoji
- Add more sound effects for enhanced feedback
- Create animated sprite sheets for character animations
- Add multiple stage backgrounds with selection options

## Asset Sources

Consider using:
- **Freesound.org** for sound effects
- **Pixabay** or **Unsplash** for backgrounds
- **OpenGameArt.org** for game-specific assets
- Custom artwork commissioned for your characters

Remember: All assets should be royalty-free or properly licensed for your use case.
