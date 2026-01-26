/**
 * loadFightScenes.cjs
 *
 * Parses fight scene data from LOSK_Fight_Scenes.md and generates fightSceneData.ts
 * Run with: npm run load-fights
 */

const fs = require('fs');
const path = require('path');

// Configuration
const FIGHT_SCENES_FILE = '/Volumes/mb/LOSK /00_World_Building/LOSK_Fight_Scenes.md';
const OUTPUT_FILE = path.resolve(__dirname, '../src/game/data/fightSceneData.ts');

// Parse duration string "M:SS" to seconds
function parseDuration(durationStr) {
  if (!durationStr || durationStr === 'Unknown') return 0;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

// Parse markdown table rows
function parseTableRow(row) {
  // Split by | and clean up
  const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
  if (cells.length < 6) return null;

  const [chapter, scene, title, characters, duration, location] = cells;

  // Skip header rows
  if (chapter === 'Chapter' || chapter.includes('---')) return null;

  return {
    chapter: chapter.trim(),
    sceneNumber: parseInt(scene) || 0,
    title: title.trim(),
    characters: characters.split(',').map(c => c.trim()).filter(c => c),
    durationStr: duration.trim(),
    durationSeconds: parseDuration(duration.trim()),
    location: location.trim()
  };
}

// Determine priority tier based on workflow document
function getPriorityTier(title, chapter, durationSeconds) {
  // Tier 1: Marquee Fights
  const tier1 = [
    'Trial by Combat',
    'The Beast and the Blade',
    'Solana Falls'
  ];
  if (tier1.some(t => title.includes(t))) return 1;

  // Tier 2: Character Showcases (longer scenes)
  if (durationSeconds > 300) return 2; // > 5 minutes

  // Tier 3: World-Building
  if (durationSeconds > 180) return 3; // > 3 minutes

  // Tier 4: Supporting scenes
  return 4;
}

// Generate Sora prompt template for a scene
function generatePromptTemplate(scene, volumeId) {
  const characterList = scene.characters.join(', ') || 'Unknown characters';
  const location = scene.location || 'Unknown location';

  return `[SCENE: ${scene.title}]
[VOLUME: ${volumeId}]
[CHAPTER: ${scene.chapter}]
[LOCATION: ${location}]
[CHARACTERS: ${characterList}]
[DURATION: ${scene.durationStr}]

VISUAL DESCRIPTION:
{Describe the key visual moment from this scene}

CAMERA:
- Opening: Wide establishing shot of ${location}
- Action: Dynamic tracking shot following combat
- Close-up: Character reaction/transformation moment

STYLE NOTES:
- Anime aesthetic, dark fantasy
- Ufotable animation style reference
- High contrast lighting with elemental effects
- Dynamic motion blur on combat impacts

SORA PROMPT DRAFT:
[SHOT TYPE] [CHARACTER] [ACTION] in [ENVIRONMENT]. [LIGHTING]. [CAMERA MOVEMENT]. Anime-inspired, dark fantasy aesthetic, Ufotable animation style.`;
}

function generateFightSceneData() {
  console.log('Reading fight scenes from:', FIGHT_SCENES_FILE);
  console.log('');

  if (!fs.existsSync(FIGHT_SCENES_FILE)) {
    console.error('Error: Fight scenes file not found:', FIGHT_SCENES_FILE);
    process.exit(1);
  }

  const content = fs.readFileSync(FIGHT_SCENES_FILE, 'utf-8');
  const lines = content.split('\n');

  const scenes = [];
  let currentVolume = 0;

  for (const line of lines) {
    // Detect volume headers
    if (line.startsWith('## Volume ')) {
      currentVolume = parseInt(line.replace('## Volume ', ''));
      continue;
    }

    // Parse table rows
    if (line.startsWith('|') && !line.includes('---')) {
      const parsed = parseTableRow(line);
      if (parsed) {
        const scene = {
          id: `fight-v${currentVolume}-${parsed.chapter.replace(/_/g, '-')}-s${parsed.sceneNumber}`,
          volumeId: currentVolume,
          chapter: parsed.chapter,
          sceneNumber: parsed.sceneNumber,
          title: parsed.title,
          characters: parsed.characters,
          durationStr: parsed.durationStr,
          durationSeconds: parsed.durationSeconds,
          location: parsed.location,
          priorityTier: getPriorityTier(parsed.title, parsed.chapter, parsed.durationSeconds),
          promptTemplate: generatePromptTemplate(parsed, currentVolume)
        };
        scenes.push(scene);
      }
    }
  }

  // Sort by priority tier, then by duration (longer first)
  scenes.sort((a, b) => {
    if (a.priorityTier !== b.priorityTier) return a.priorityTier - b.priorityTier;
    return b.durationSeconds - a.durationSeconds;
  });

  // Log summary
  console.log(`Parsed ${scenes.length} fight scenes:`);
  console.log(`  Volume 1: ${scenes.filter(s => s.volumeId === 1).length} scenes`);
  console.log(`  Volume 2: ${scenes.filter(s => s.volumeId === 2).length} scenes`);
  console.log(`  Volume 3: ${scenes.filter(s => s.volumeId === 3).length} scenes`);
  console.log('');
  console.log('Priority Tiers:');
  console.log(`  Tier 1 (Marquee): ${scenes.filter(s => s.priorityTier === 1).length}`);
  console.log(`  Tier 2 (Showcase): ${scenes.filter(s => s.priorityTier === 2).length}`);
  console.log(`  Tier 3 (World-Building): ${scenes.filter(s => s.priorityTier === 3).length}`);
  console.log(`  Tier 4 (Supporting): ${scenes.filter(s => s.priorityTier === 4).length}`);
  console.log('');

  // Generate TypeScript file
  const output = generateTypeScriptFile(scenes);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log('Generated:', OUTPUT_FILE);
}

function generateTypeScriptFile(scenes) {
  const scenesJson = scenes.map(scene => `  {
    id: "${scene.id}",
    volumeId: ${scene.volumeId},
    chapter: "${scene.chapter}",
    sceneNumber: ${scene.sceneNumber},
    title: "${scene.title.replace(/"/g, '\\"')}",
    characters: [${scene.characters.map(c => `"${c}"`).join(', ')}],
    durationStr: "${scene.durationStr}",
    durationSeconds: ${scene.durationSeconds},
    location: "${scene.location.replace(/"/g, '\\"')}",
    priorityTier: ${scene.priorityTier} as const,
    promptTemplate: \`${scene.promptTemplate.replace(/`/g, '\\`')}\`
  }`).join(',\n');

  return `// Fight Scene Data - AUTO-GENERATED by scripts/loadFightScenes.cjs
// Run: npm run load-fights

export interface FightScene {
  id: string;
  volumeId: number;
  chapter: string;
  sceneNumber: number;
  title: string;
  characters: string[];
  durationStr: string;
  durationSeconds: number;
  location: string;
  priorityTier: 1 | 2 | 3 | 4;
  promptTemplate: string;
}

export const fightScenes: FightScene[] = [
${scenesJson}
];

// Helper functions
export function getFightScenesByVolume(volumeId: number): FightScene[] {
  return fightScenes.filter(scene => scene.volumeId === volumeId);
}

export function getFightScenesByTier(tier: 1 | 2 | 3 | 4): FightScene[] {
  return fightScenes.filter(scene => scene.priorityTier === tier);
}

export function getFightScenesByCharacter(character: string): FightScene[] {
  const lowerChar = character.toLowerCase();
  return fightScenes.filter(scene =>
    scene.characters.some(c => c.toLowerCase().includes(lowerChar))
  );
}

export function getTopFightScenes(count: number = 10): FightScene[] {
  return fightScenes.slice(0, count);
}

export function getTotalFightDuration(): { minutes: number; formatted: string } {
  const totalSeconds = fightScenes.reduce((sum, s) => sum + s.durationSeconds, 0);
  const minutes = Math.floor(totalSeconds / 60);
  return {
    minutes,
    formatted: \`\${minutes} minutes\`
  };
}
`;
}

// Run
console.log('');
console.log('='.repeat(50));
console.log('  LOSK Fight Scene Loader');
console.log('='.repeat(50));
console.log('');
generateFightSceneData();
console.log('');
console.log('Done!');
