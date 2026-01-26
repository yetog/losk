# LOSK Creative Studio - Project Context

## Quick Overview

This is **LOSK Creative Studio**, a React/TypeScript web app for authoring and reviewing the "Legend of the Soul King" light novel series. It was refactored from a fighting game MVP to focus on manuscript editing and visual planning.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn-ui + GSAP

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx         # Landing menu (Read Story, Characters, Gallery, Dashboard)
│   ├── Story.tsx        # Manuscript reader with TTS, notes, progress tracking
│   ├── Characters.tsx   # Character encyclopedia (bios, stats, abilities)
│   ├── Gallery.tsx      # Mood board placeholder (future: @xyflow/react)
│   └── Dashboard.tsx    # Analytics, word counts, issue detection
├── game/data/
│   ├── characterData.ts # 6 characters: Ren, Kira, Liora, Bradley, Dante, King Fasa
│   └── storyContent.ts  # Story structure (content loaded dynamically)
├── components/ui/       # shadcn-ui components (48 files)
└── utils/               # TTS, notes manager, markdown parser
```

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/Home.tsx` | Main landing page with menu |
| `src/pages/Story.tsx` | Manuscript reader (volumes → chapters → content) |
| `src/pages/Characters.tsx` | Character bios and stats |
| `src/pages/Dashboard.tsx` | Word counts, issues, progress |
| `src/game/data/storyContent.ts` | Story structure (chapters need content) |
| `src/game/data/characterData.ts` | Character info with images from object storage |

## Routes

- `/` - Home (menu)
- `/story` - Read manuscripts
- `/characters` - Character encyclopedia
- `/gallery` - Mood board (placeholder)
- `/dashboard` - Analytics

## Related Project Locations

| Location | Contents |
|----------|----------|
| `/Volumes/mb/LOSK /02_Manuscripts/` | Actual manuscript markdown files |
| `/Volumes/mb/LOSK /00_World_Building/` | Losk Bible, plot maps, allegory maps |
| `/Volumes/mb/LOSK /04_Scripts/` | Python analysis scripts |
| `/Volumes/mb/LOSK /06_Work_Sessions/` | Session documentation |
| `/Volumes/mb/LOSK /fire-agent-hub-main/` | Node graph UI to port for mood board |

## Manuscript Structure

```
/02_Manuscripts/
├── Volume_01/  # 6 chapters (Act1_Ch01 through Act2_Ch02)
├── Volume_02/  # 7 chapters (Act2_Ch03 through Act2_Ch09)
└── Volume_03/  # 9 chapters (Act3_Ch01 through Act3_Ch09)
```

## Current State

- **UI:** Working but needs fixes (scrolling, photo cropping)
- **Content:** Placeholder - needs manuscript loading script
- **Characters:** 6 characters with stats, bios, abilities
- **Dashboard:** Functional analytics view

## Common Tasks

1. **Run dev server:** `cd "/Volumes/mb/LOSK /project-losk-main 4" && npm run dev`
2. **Build:** `npm run build`
3. **Run manuscript analysis:** `cd "/Volumes/mb/LOSK /04_Scripts" && python3 analyze_manuscript.py --volume 1`

## UI Theme

- Dark mode: black/gray gradients
- Accent: yellow-400/yellow-300
- Components: shadcn-ui with Tailwind
- Animations: GSAP

## Important Notes

- Phaser game engine was REMOVED (no fighting game code)
- Story content in storyContent.ts is PLACEHOLDER (needs loading)
- Character images load from `/images/characters/` or object storage
- Progress/notes saved to localStorage
