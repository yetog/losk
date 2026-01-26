# LOSK Creative Studio

[![Deploy to GitHub Pages](https://github.com/yetog/losk/actions/workflows/deploy.yml/badge.svg)](https://github.com/yetog/losk/actions/workflows/deploy.yml)

A creative studio application for authoring, reviewing, and visualizing the **Legend of the Soul King** dark isekai light novel series.

**Live Demo**: [https://yetog.github.io/losk/](https://yetog.github.io/losk/)

![LOSK Creative Studio](https://via.placeholder.com/800x400/1a1a2e/fbbf24?text=LOSK+Creative+Studio)

## Features

### Manuscript Reader
- Text-to-speech with paragraph-by-paragraph highlighting
- Scene navigation sidebar
- Reading progress tracking
- Personal notes per chapter

### Visual Studio
- **Mood Board**: Drag-and-drop node canvas for visual planning
- **Storyboard Timeline**: Scene-by-scene organization
- **AI Prompt Generator**: Create prompts for Sora video generation

### Character Encyclopedia
- 6 main characters with stats, abilities, and portraits
- Interactive image positioning
- Fighting styles and special moves

### AI Assistant
- Context-aware chatbot knows current page/chapter/character
- LOSK Bible knowledge base (characters, lore, world rules)
- Quick actions: improve text, check consistency, character help

### Analytics Dashboard
- Word counts by volume and chapter
- Content issue detection
- Reading progress visualization

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | GSAP |
| Node Graph | @xyflow/react |
| AI | IONOS Inference API (Llama 3.1 8B) |
| CI/CD | GitHub Actions |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yetog/losk.git
cd losk

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── pages/           # Route pages (Home, Story, Characters, Gallery, Dashboard)
├── components/
│   ├── ai/          # AI Assistant chatbot
│   ├── moodboard/   # Visual planning components (ReactFlow nodes)
│   ├── game/        # Character/story components
│   └── ui/          # shadcn-ui components
├── context/         # React Context (AI context provider)
├── services/        # API services (IONOS AI)
├── game/data/       # Story content, character data, fight scenes
└── utils/           # TTS, notes manager, markdown parser
```

## Deployment

This project automatically deploys to GitHub Pages via GitHub Actions when pushing to `main`.

To enable GitHub Pages:
1. Go to repository Settings > Pages
2. Under "Build and deployment", select **GitHub Actions** as source
3. Push to main branch to trigger deployment

## License

This project is for portfolio demonstration purposes.

---

Built with [Claude Code](https://claude.ai/code)
