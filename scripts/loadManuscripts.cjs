/**
 * loadManuscripts.js
 *
 * Build script to populate storyContent.ts from manuscript files.
 * Run with: npm run load-content
 */

const fs = require('fs');
const path = require('path');

// Configuration
// Note: The LOSK folder has a trailing space in its name
const MANUSCRIPTS_DIR = '/Volumes/mb/LOSK /02_Manuscripts';
const OUTPUT_FILE = path.resolve(__dirname, '../src/game/data/storyContent.ts');

// Volume mapping - matches the existing storyContent.ts structure
const VOLUME_CONFIG = [
  {
    id: 1,
    title: "Volume One: The Demon Who Didn't Choose This",
    description: "Ren's journey from Earth to Valorant—from street fighter to Shadow Guild recruit",
    folder: 'Volume_01',
    chapters: [
      { filename: 'Act1_Ch01_Date_Nights_A_Smash.md', id: 'v1c1', chapterNumber: 1, title: "Date Night's A Smash" },
      { filename: 'Act1_Ch02_Void.md', id: 'v1c2', chapterNumber: 2, title: "Void" },
      { filename: 'Act1_Ch03_Street_Level_Trial.md', id: 'v1c3', chapterNumber: 3, title: "Street Level Trial" },
      { filename: 'Act1_Ch04_Guilded_in_Shadows.md', id: 'v1c4', chapterNumber: 4, title: "Guilded in Shadows" },
      { filename: 'Act2_Ch01_Trial_by_Ice_and_Flame.md', id: 'v1c5', chapterNumber: 5, title: "Trial by Ice and Flame" },
      { filename: 'Act2_Ch02_A_Memory_That_Wasnt_Mine.md', id: 'v1c6', chapterNumber: 6, title: "A Memory That Wasn't Mine" }
    ]
  },
  {
    id: 2,
    title: "Volume Two: Guilded Shadows",
    description: "Guild training intensifies as the Queen's plans unfold",
    folder: 'Volume_02',
    chapters: [
      { filename: 'Act2_Ch03_Trial_by_Firelight.md', id: 'v2c1', chapterNumber: 1, title: "Trial by Firelight" },
      { filename: 'Act2_Ch04_Steel_and_Sound.md', id: 'v2c2', chapterNumber: 2, title: "Steel and Sound" },
      { filename: 'Act2_Ch05_Sigma_13.md', id: 'v2c3', chapterNumber: 3, title: "Sigma-13" },
      { filename: 'Act2_Ch06_Sweat_and_Scars.md', id: 'v2c4', chapterNumber: 4, title: "Sweat and Scars" },
      { filename: 'Act2_Ch07_Refinement_Solanas_Legacy.md', id: 'v2c5', chapterNumber: 5, title: "Refinement: Solana's Legacy" },
      { filename: 'Act2_Ch08_Pregame_Death_of_Leader.md', id: 'v2c6', chapterNumber: 6, title: "Pregame: Death of a Leader" },
      { filename: 'Act2_Ch09_After_Party_Initiation.md', id: 'v2c7', chapterNumber: 7, title: "After Party: Initiation" }
    ]
  },
  {
    id: 3,
    title: "Volume Three: Beast Kingdom",
    description: "Ancient allies, family secrets, and the path to war",
    folder: 'Volume_03',
    chapters: [
      { filename: 'Act3_Ch01_Beasts_Dont_Knock.md', id: 'v3c1', chapterNumber: 1, title: "Beasts Don't Knock" },
      { filename: 'Act3_Ch02_Spies_and_Sisters.md', id: 'v3c2', chapterNumber: 2, title: "Spies and Sisters" },
      { filename: 'Act3_Ch03_Glyph_Below.md', id: 'v3c3', chapterNumber: 3, title: "Glyph Below" },
      { filename: 'Act3_Ch04_Kingdom_of_Teeth_and_Flame.md', id: 'v3c4', chapterNumber: 4, title: "Kingdom of Teeth and Flame" },
      { filename: 'Act3_Ch05_The_Rite_Part_I.md', id: 'v3c5', chapterNumber: 5, title: "The Rite - Part I" },
      { filename: 'Act3_Ch06_The_Rite_Part_II.md', id: 'v3c6', chapterNumber: 6, title: "The Rite - Part II" },
      { filename: 'Act3_Ch07_Echoes_in_Stone.md', id: 'v3c7', chapterNumber: 7, title: "Echoes in Stone" },
      { filename: 'Act3_Ch08_Fangs_at_the_Gate.md', id: 'v3c8', chapterNumber: 8, title: "Fangs at the Gate" },
      { filename: 'Act3_Ch09_Ashes_of_Allegiance.md', id: 'v3c9', chapterNumber: 9, title: "Ashes of Allegiance" }
    ]
  }
];

// Utility functions
function calculateWordCount(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function estimateReadTime(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 225));
}

// Extract scenes from raw content
function extractScenes(rawContent) {
  const scenes = [];
  // Match scene markers: <!-- SCENE N: Title -->
  const sceneRegex = /<!--\s*SCENE\s+(\d+):\s*(.+?)\s*-->/g;

  let match;
  while ((match = sceneRegex.exec(rawContent)) !== null) {
    const sceneNumber = parseInt(match[1]);
    const sceneTitle = match[2].trim();
    const markerPosition = match.index;

    // Find the location header that follows (## INT/EXT. LOCATION -- TIME)
    const afterMarker = rawContent.slice(markerPosition);
    const locationMatch = afterMarker.match(/##\s*(INT\.|EXT\.|INT\/EXT\.)\s*(.+?)\s*(?:--|—)\s*(.+?)(?:\n|$)/);

    let location = '';
    let timeOfDay = '';
    if (locationMatch) {
      location = `${locationMatch[1]} ${locationMatch[2]}`.trim();
      timeOfDay = locationMatch[3]?.trim() || '';
    }

    scenes.push({
      number: sceneNumber,
      title: sceneTitle,
      location,
      timeOfDay,
      // We'll use a marker ID that can be found in the cleaned content
      markerId: `scene-${sceneNumber}`
    });
  }

  return scenes;
}

// Clean content but insert scene marker anchors
function cleanContent(content) {
  let cleaned = content;

  // Replace scene markers with anchor markers (invisible in display but parseable)
  cleaned = cleaned.replace(
    /<!--\s*SCENE\s+(\d+):\s*.+?\s*-->/g,
    (match, num) => `{{SCENE_${num}}}`
  );

  // Remove the title line (first # heading) since it's displayed separately in the UI
  cleaned = cleaned.replace(/^#\s+.*$/m, '');

  // Remove *(FORMATTED VERSION)* annotations
  cleaned = cleaned.replace(/\*\(FORMATTED VERSION\)\*/g, '');

  // Clean up excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

function readManuscriptFile(volumeFolder, filename) {
  const filepath = path.join(MANUSCRIPTS_DIR, volumeFolder, filename);

  if (!fs.existsSync(filepath)) {
    console.warn(`  Warning: File not found: ${filename}`);
    return null;
  }

  return fs.readFileSync(filepath, 'utf-8');
}

function escapeForTemplate(content) {
  // Escape backticks and dollar signs for template literal
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function generateStoryContent() {
  console.log('Loading manuscripts from:', MANUSCRIPTS_DIR);
  console.log('');

  const volumes = [];
  let totalChapters = 0;
  let totalWords = 0;
  let totalScenes = 0;

  for (const volumeConfig of VOLUME_CONFIG) {
    console.log(`Volume ${volumeConfig.id}: ${volumeConfig.title}`);
    const chapters = [];

    for (const chapterConfig of volumeConfig.chapters) {
      const rawContent = readManuscriptFile(volumeConfig.folder, chapterConfig.filename);

      if (rawContent) {
        // Extract scenes before cleaning
        const scenes = extractScenes(rawContent);
        const cleanedContent = cleanContent(rawContent);
        const wordCount = calculateWordCount(cleanedContent);
        const estimatedReadTime = estimateReadTime(wordCount);

        chapters.push({
          id: chapterConfig.id,
          volumeId: volumeConfig.id,
          chapterNumber: chapterConfig.chapterNumber,
          title: chapterConfig.title,
          content: cleanedContent,
          scenes,
          wordCount,
          estimatedReadTime
        });

        totalWords += wordCount;
        totalScenes += scenes.length;
        console.log(`  ✓ ${chapterConfig.title} (${wordCount.toLocaleString()} words, ${scenes.length} scenes)`);
      } else {
        // Create placeholder for missing files
        chapters.push({
          id: chapterConfig.id,
          volumeId: volumeConfig.id,
          chapterNumber: chapterConfig.chapterNumber,
          title: chapterConfig.title,
          content: 'Content not yet available.',
          scenes: [],
          wordCount: 0,
          estimatedReadTime: 1
        });
        console.log(`  ✗ ${chapterConfig.title} (FILE NOT FOUND)`);
      }
    }

    volumes.push({
      id: volumeConfig.id,
      title: volumeConfig.title,
      description: volumeConfig.description,
      isLocked: false,
      chapters
    });

    totalChapters += chapters.length;
    console.log('');
  }

  // Generate TypeScript file content
  const output = generateTypeScriptFile(volumes);

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log('─'.repeat(50));
  console.log(`Generated: ${OUTPUT_FILE}`);
  console.log(`Total: ${totalChapters} chapters, ${totalScenes} scenes, ${totalWords.toLocaleString()} words`);
  console.log('');
}

function generateTypeScriptFile(volumes) {
  const chaptersCode = volumes.map(volume => {
    const chaptersStr = volume.chapters.map(ch => {
      const scenesStr = ch.scenes.map(s =>
        `{ number: ${s.number}, title: "${s.title.replace(/"/g, '\\"')}", location: "${s.location.replace(/"/g, '\\"')}", timeOfDay: "${s.timeOfDay.replace(/"/g, '\\"')}", markerId: "${s.markerId}" }`
      ).join(',\n            ');

      return `      {
        id: "${ch.id}",
        volumeId: ${ch.volumeId},
        chapterNumber: ${ch.chapterNumber},
        title: "${ch.title.replace(/"/g, '\\"')}",
        content: \`${escapeForTemplate(ch.content)}\`,
        scenes: [
            ${scenesStr}
        ],
        wordCount: ${ch.wordCount},
        estimatedReadTime: ${ch.estimatedReadTime}
      }`;
    }).join(',\n');

    return `  {
    id: ${volume.id},
    title: "${volume.title}",
    description: "${volume.description}",
    isLocked: ${volume.isLocked},
    chapters: [
${chaptersStr}
    ]
  }`;
  }).join(',\n');

  return `// Story content interfaces and data structure
// AUTO-GENERATED by scripts/loadManuscripts.js
// Run: npm run load-content

export interface Scene {
  number: number;
  title: string;
  location: string;
  timeOfDay: string;
  markerId: string;
}

export interface Chapter {
  id: string;
  volumeId: number;
  chapterNumber: number;
  title: string;
  content: string;
  scenes: Scene[];
  wordCount: number;
  estimatedReadTime: number;
}

export interface Volume {
  id: number;
  title: string;
  description: string;
  chapters: Chapter[];
  isLocked: boolean;
}

// Helper functions
export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\\s+/).filter(word => word.length > 0).length;
};

export const estimateReadTime = (wordCount: number): number => {
  return Math.max(1, Math.ceil(wordCount / 225));
};

// Story content - Generated from manuscript files
export const storyVolumes: Volume[] = [
${chaptersCode}
];

// Helper functions to access content
export function getVolumeById(id: number): Volume | undefined {
  return storyVolumes.find(volume => volume.id === id);
}

export function getChapterById(chapterId: string): Chapter | undefined {
  for (const volume of storyVolumes) {
    const chapter = volume.chapters.find(ch => ch.id === chapterId);
    if (chapter) return chapter;
  }
  return undefined;
}

export function getAllChapters(): Chapter[] {
  return storyVolumes.flatMap(v => v.chapters);
}

export function getTotalWordCount(): number {
  return getAllChapters().reduce((sum, ch) => sum + ch.wordCount, 0);
}
`;
}

// Run the script
console.log('');
console.log('═'.repeat(50));
console.log('  LOSK Manuscript Loader');
console.log('═'.repeat(50));
console.log('');
generateStoryContent();
console.log('Done!');
