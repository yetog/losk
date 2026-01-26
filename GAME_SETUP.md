
# Project Losk - Fighting Game Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

3. **Open your browser to:**
   `http://localhost:5173`

## Game Controls

### Player 1 (Left Fighter)
- **Movement:** WASD keys
- **Attacks:** U (Light), I (Medium), O (Heavy)
- **Block:** Spacebar
- **Special (Ren Only):** S + U (Down + Light Attack)

### Player 2 (Right Fighter)  
- **Movement:** Arrow keys
- **Attacks:** Numpad 1 (Light), 2 (Medium), 3 (Heavy)
- **Block:** Numpad 0

### Menu Navigation
- **Arrow Keys:** Navigate menu options
- **Enter:** Select menu option
- **Mouse:** Click to select

## Current Game Features

✅ **Implemented:**
- Animated start menu with gold/black/silver theme
- Character selection for all 6 fighters
- Basic battle system with physics
- Health bars and damage system
- Hit effects and screen shake
- Keyboard controls for both players
- Character-specific stats and colors

🚧 **In Progress:**
- Audio system (currently runs in silent mode)
- Special move implementations
- Advanced visual effects

## Audio Setup (Optional)

To add audio, create these folders and add MP3 files:

```
public/
  audio/
    bgm/
      menu.mp3
      character_select.mp3
      battle.mp3
    sfx/
      menu_move.mp3
      menu_select.mp3
      character_select.mp3
      hit_light.mp3
      hit_medium.mp3
      hit_heavy.mp3
      block.mp3
```

The game will run in silent mode if audio files are missing.

## Character Roster

1. **Ren (Demon)** 🔥 - Fire-based attacks, high power
2. **Liora (Fairy)** 🧚 - Aerial specialist, high speed  
3. **King Fasa (Beast)** 🦁 - Tank character, massive strength
4. **Kira (Elf)** ⚔️ - Balanced blade master
5. **Bradley (Human)** 🔫 - Tactical all-rounder
6. **Dante (Elf)** 🗡️ - Precision-based duelist

## Troubleshooting

- **Build errors:** Make sure all dependencies are installed
- **Game not loading:** Check browser console for errors
- **Controls not working:** Ensure the game canvas has focus (click on it)
- **Performance issues:** Close other browser tabs, check for 60 FPS in dev tools

## Next Steps

1. Test the basic game flow
2. Add audio assets for better experience
3. Implement special moves for each character
4. Add more visual polish and effects
