# LOSK Creative Studio - Completion Checklist

## Priority 1: UI Fixes (Immediate)

### Characters Page
- [ ] **Fix photo cropping** - Images are poorly cropped in character cards
- [ ] **Add image position controls** - Allow adjusting crop/position via UI
  - Consider: object-position CSS with UI sliders
  - Or: Click-drag to reposition within frame
- [ ] **Support multiple images per character** - Gallery/carousel for each character

### Gallery Page
- [ ] **Fix scrolling** - Content is cut off, can't scroll down
  - Issue: Likely `overflow-hidden` or fixed height container
  - Fix: Add `overflow-y-auto` or use ScrollArea component

### Dashboard Page
- [ ] **Remove "Game" button** - No longer relevant after fighting game removal
- [ ] **Ensure all content fits** - Check responsive layout

---

## Priority 2: Content Loading (Critical)

### Manuscript Loading Script
- [ ] **Create build script** to read `/02_Manuscripts/` and generate content
  - Parse markdown files from Volume_01, Volume_02, Volume_03
  - Extract chapter titles from filenames
  - Calculate word counts automatically
  - Preserve scene markers
  - Output to storyContent.ts or separate JSON

### Chapter Mapping
- [ ] **Volume 1** (6 chapters)
  - Act1_Ch01_Date_Nights_A_Smash.md
  - Act1_Ch02_Void.md
  - Act1_Ch03_Street_Level_Trial.md
  - Act1_Ch04_Guilded_in_Shadows.md
  - Act2_Ch01_Trial_by_Ice_and_Flame.md
  - Act2_Ch02_A_Memory_That_Wasnt_Mine.md

- [ ] **Volume 2** (7 chapters)
  - Act2_Ch03_Trial_by_Firelight.md
  - Act2_Ch04_Steel_and_Sound.md
  - Act2_Ch05_Sigma_13.md
  - Act2_Ch06_Sweat_and_Scars.md
  - Act2_Ch07_Refinement_Solanas_Legacy.md
  - Act2_Ch08_Pregame_Death_of_Leader.md
  - Act2_Ch09_After_Party_Initiation.md

- [ ] **Volume 3** (9 chapters)
  - Act3_Ch01_Beasts_Dont_Knock.md
  - Act3_Ch02_Spies_and_Sisters.md
  - Act3_Ch03_Glyph_Below.md
  - Act3_Ch04_Kingdom_of_Teeth_and_Flame.md
  - Act3_Ch05_The_Rite_Part_I.md
  - Act3_Ch06_The_Rite_Part_II.md
  - Act3_Ch07_Echoes_in_Stone.md
  - Act3_Ch08_Fangs_at_the_Gate.md
  - Act3_Ch09_Ashes_of_Allegiance.md

---

## Priority 3: Feature Completion

### Story Reader
- [ ] **Load actual manuscript content** (depends on Priority 2)
- [ ] **Scene navigation** - Jump to specific scenes within chapters
- [ ] **Search functionality** - Search across all chapters
- [ ] **Bookmark system** - Save specific locations

### Characters Page
- [ ] **Add more character details**
  - Backstory/lore section
  - Relationships to other characters
  - Chapter appearances
- [ ] **Character image gallery** - Multiple images per character
- [ ] **Edit mode** - Update character info from UI

### Dashboard
- [ ] **Real analytics** (depends on content loading)
  - Actual word counts from manuscripts
  - Scene counts per chapter
  - Issue detection (short scenes, etc.)
- [ ] **Progress tracking** - Editing status per chapter
- [ ] **Export reports** - Generate analysis reports

### Gallery (Mood Board)
- [ ] **Port @xyflow/react** from fire-agent-hub
- [ ] **Create node types:**
  - ImageNode - For reference images
  - SceneNode - For chapter/scene cards
  - NoteNode - For text annotations
  - CharacterNode - For character cards
- [ ] **Drag-and-drop from sidebar**
- [ ] **Connection lines** between nodes
- [ ] **Save/load boards** to localStorage or file

---

## Priority 4: Polish

### General UI
- [ ] **Consistent scrolling** across all pages
- [ ] **Loading states** for async operations
- [ ] **Error boundaries** for graceful failures
- [ ] **Keyboard navigation** improvements

### Performance
- [ ] **Lazy load chapters** - Don't load all content at once
- [ ] **Image optimization** - Compress character images
- [ ] **Code splitting** - Separate routes into chunks

### Accessibility
- [ ] **ARIA labels** on interactive elements
- [ ] **Focus management** for keyboard users
- [ ] **Color contrast** verification

---

## Priority 5: Future Features

### Mini Games Hub (Future)
- [ ] **Create games landing page** at `/games`
- [ ] **Link from home menu** (currently has placeholder)
- [ ] **LOSK-themed mini games** (future development)

### Sora AI Integration
- [ ] **Extract fight scenes** for video prompts
- [ ] **Generate scene descriptions** for Sora
- [ ] **Preview panel** in Gallery

### Cloud Sync (Future)
- [ ] **Backend API** for data persistence
- [ ] **User authentication** (optional)
- [ ] **Cross-device sync** for notes and progress

---

## Quick Wins (Can Do Now)

1. ✅ Remove Game button from Dashboard
2. ✅ Fix Gallery scrolling
3. ✅ Improve character image cropping
4. ⏳ Create manuscript loading script

---

## Technical Debt

- [ ] Remove unused components in `/components/game/`
- [ ] Clean up unused imports
- [ ] Add TypeScript strict mode
- [ ] Add unit tests for critical functions

---

## Session Notes

**Last Updated:** 2026-01-21
**Current Status:** UI functional, content not loaded
**Next Session:** Fix UI issues, then build manuscript loader
