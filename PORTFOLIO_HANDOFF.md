# LOSK Creative Studio - Portfolio Integration Handoff

## Project Overview

**LOSK Creative Studio** is a React web application for authoring, reviewing, and visualizing the "Legend of the Soul King" dark isekai light novel series. It demonstrates full-stack creative tooling with AI integration.

## Live Demo

- **GitHub Pages**: https://yetog.github.io/losk/
- **Repository**: https://github.com/yetog/losk

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | GSAP |
| Node Graph | @xyflow/react |
| AI Integration | IONOS Inference API (Llama 3.1 8B) |
| Deployment | GitHub Pages via Actions |

## Key Features to Highlight

### 1. Manuscript Reader with TTS
- Text-to-speech with paragraph highlighting
- Scene navigation sidebar
- Reading progress tracking
- Personal notes per chapter

### 2. Visual Planning Tools
- **Mood Board**: Drag-and-drop node canvas (ReactFlow)
- **Storyboard Timeline**: Scene-by-scene visual planning
- **AI Prompt Generator**: Sora video prompt creator

### 3. Context-Aware AI Assistant
- Floating chat widget on all pages
- Knows current page, chapter, and selected text
- LOSK Bible knowledge base (characters, lore, plot)
- Quick actions: Improve text, check consistency, character help

### 4. Character Encyclopedia
- 6 characters with stats, abilities, portraits
- Image position adjustment controls
- Fighting style and special moves

### 5. Analytics Dashboard
- Word counts by volume/chapter
- Content issue detection
- Reading progress visualization

## Portfolio Entry Suggestions

### Short Description
> A creative studio app for managing a light novel series. Features include a manuscript reader with TTS, node-based mood board, character encyclopedia, and an AI assistant with world-lore knowledge.

### Project Tags
`React` `TypeScript` `Tailwind CSS` `AI Integration` `Creative Tools` `ReactFlow` `TTS` `GSAP`

### Key Technical Highlights
1. **AI Context System**: React Context API passes page-aware data to AI prompts
2. **Node-Based Canvas**: Custom ReactFlow nodes for visual storyboarding
3. **Web Speech API**: TTS with paragraph sync and playback controls
4. **Responsive Design**: Full mobile support with dark theme

## Screenshots to Capture

1. **Home Page** - Landing menu with navigation cards
2. **Story Reader** - TTS panel open, paragraph highlighted
3. **Characters** - Character selected with stats panel
4. **Mood Board** - Canvas with connected nodes
5. **AI Assistant** - Chat open with context indicator

## Setup Instructions for Demo

```bash
# Clone repository
git clone https://github.com/yetog/losk.git
cd losk

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables (Optional)

For local development with AI features:
```env
# Currently hardcoded in src/services/ionosAI.ts
# Future: Move to environment variable
VITE_IONOS_API_TOKEN=your_token_here
```

## CI/CD Pipeline

The repository includes GitHub Actions workflow (`.github/workflows/deploy.yml`):
- Runs on push/PR to main
- Type checks with TypeScript
- Builds with Vite
- Deploys to GitHub Pages

## Security Notes

The IONOS API token is currently hardcoded in `src/services/ionosAI.ts`. For production:
1. Move token to environment variable
2. Create a backend proxy to hide the API key
3. Add rate limiting

## Future Enhancements (if continuing development)

- [ ] Inline editing while reading
- [ ] Annotations/comments on paragraphs
- [ ] Backend API for manuscript storage
- [ ] Multi-user collaboration
- [ ] Export to EPUB/PDF

## Contact / Attribution

Built with assistance from Claude Code (Anthropic).

---

**Last Updated**: January 2026
