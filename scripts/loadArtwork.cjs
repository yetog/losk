/**
 * loadArtwork.cjs
 *
 * Build script to scan artwork folder and generate artworkData.ts
 * Run with: npm run load-artwork
 */

const fs = require('fs');
const path = require('path');

// Configuration
// Note: The LOSK folder has a trailing space in its name
const ARTWORK_DIR = '/Volumes/mb/LOSK /04_Artwork/Artwork - Model Traiing LOSK';
const OUTPUT_FILE = path.resolve(__dirname, '../src/game/data/artworkData.ts');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Category detection based on folder structure
function detectCategory(relativePath) {
  const lowerPath = relativePath.toLowerCase();
  // Check for folder names (may or may not have leading slash)
  if (lowerPath.includes('character')) return 'character';
  if (lowerPath.includes('location')) return 'location';
  if (lowerPath.includes('reference')) return 'reference';
  return 'other';
}

// Detect character name from path
function detectCharacter(relativePath) {
  const lowerPath = relativePath.toLowerCase();
  const filename = path.basename(relativePath).toLowerCase();

  // Check known character names
  const characters = ['ren', 'kira', 'liora', 'bradley', 'dante', 'fasa', 'queen', 'cassius', 'kale', 'monica'];

  for (const char of characters) {
    if (lowerPath.includes(`/${char}/`) || lowerPath.includes(`/${char}.`) || filename.includes(char)) {
      return char.charAt(0).toUpperCase() + char.slice(1);
    }
  }

  // Check for "First Demon King" or "Demon Queen"
  if (filename.includes('demon king') || filename.includes('first demon')) return 'First Demon King';
  if (filename.includes('demon queen') || filename.includes('queen')) return 'Queen';

  return null;
}

// Generate a clean ID from filename
function generateId(filepath) {
  const filename = path.basename(filepath, path.extname(filepath));
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

// Scan directory recursively
function scanDirectory(dir, basePath = '') {
  const results = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        results.push(...scanDirectory(fullPath, relativePath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          results.push({
            fullPath,
            relativePath,
            filename: entry.name
          });
        }
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
  }

  return results;
}

function generateArtworkData() {
  console.log('Scanning artwork directory:', ARTWORK_DIR);
  console.log('');

  if (!fs.existsSync(ARTWORK_DIR)) {
    console.error('Error: Artwork directory not found:', ARTWORK_DIR);
    process.exit(1);
  }

  const imageFiles = scanDirectory(ARTWORK_DIR);
  console.log(`Found ${imageFiles.length} images`);
  console.log('');

  // Process images into artwork items
  const artworkItems = imageFiles.map((file, index) => {
    const category = detectCategory(file.relativePath);
    const character = detectCharacter(file.relativePath);
    const id = `artwork_${index}_${generateId(file.filename)}`;

    // Generate tags based on path and filename
    const tags = [];
    if (category) tags.push(category);
    if (character) tags.push(character.toLowerCase());

    // Extract additional tags from filename
    const filename = file.filename.toLowerCase();
    if (filename.includes('anime')) tags.push('anime');
    if (filename.includes('cinematic')) tags.push('cinematic');
    if (filename.includes('temple')) tags.push('temple');
    if (filename.includes('fire') || filename.includes('flame')) tags.push('fire');
    if (filename.includes('ice')) tags.push('ice');

    return {
      id,
      filename: file.filename,
      path: file.fullPath,
      relativePath: file.relativePath,
      category,
      character,
      tags: [...new Set(tags)] // Remove duplicates
    };
  });

  // Group by category for reporting
  const byCategory = {};
  artworkItems.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });

  console.log('Categories:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} images`);
  });
  console.log('');

  // Generate TypeScript file
  const output = generateTypeScriptFile(artworkItems);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log('Generated:', OUTPUT_FILE);
  console.log(`Total: ${artworkItems.length} artwork items`);
}

function generateTypeScriptFile(items) {
  const itemsJson = items.map(item => `  {
    id: "${item.id}",
    filename: "${item.filename.replace(/"/g, '\\"')}",
    path: "${item.path.replace(/"/g, '\\"')}",
    relativePath: "${item.relativePath.replace(/"/g, '\\"')}",
    category: "${item.category}" as const,
    character: ${item.character ? `"${item.character}"` : 'null'},
    tags: [${item.tags.map(t => `"${t}"`).join(', ')}]
  }`).join(',\n');

  return `// Artwork catalog - AUTO-GENERATED by scripts/loadArtwork.cjs
// Run: npm run load-artwork

export type ArtworkCategory = 'character' | 'location' | 'reference' | 'other';

export interface ArtworkItem {
  id: string;
  filename: string;
  path: string;
  relativePath: string;
  category: ArtworkCategory;
  character: string | null;
  tags: string[];
}

export const artworkCatalog: ArtworkItem[] = [
${itemsJson}
];

// Helper functions
export function getArtworkByCategory(category: ArtworkCategory): ArtworkItem[] {
  return artworkCatalog.filter(item => item.category === category);
}

export function getArtworkByCharacter(character: string): ArtworkItem[] {
  return artworkCatalog.filter(item =>
    item.character?.toLowerCase() === character.toLowerCase()
  );
}

export function getArtworkByTag(tag: string): ArtworkItem[] {
  return artworkCatalog.filter(item =>
    item.tags.includes(tag.toLowerCase())
  );
}

export function searchArtwork(query: string): ArtworkItem[] {
  const lowerQuery = query.toLowerCase();
  return artworkCatalog.filter(item =>
    item.filename.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.includes(lowerQuery)) ||
    (item.character && item.character.toLowerCase().includes(lowerQuery))
  );
}
`;
}

// Run the script
console.log('');
console.log('='.repeat(50));
console.log('  LOSK Artwork Loader');
console.log('='.repeat(50));
console.log('');
generateArtworkData();
console.log('');
console.log('Done!');
