// Utility to parse markdown chapter files and extract clean content

export function parseMarkdownChapter(markdown: string): string {
  let content = markdown;
  
  // Remove title header (# Act X, Chapter Y: Title)
  content = content.replace(/^#\s+Act\s+\d+,\s+Chapter\s+\d+:[^\n]+\n*/gim, '');
  
  // Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove scene headers (## INT./EXT. LOCATION -- TIME)
  content = content.replace(/^##\s+(INT\.|EXT\.)[^\n]+\n*/gim, '');
  
  // Remove markdown headers that remain
  content = content.replace(/^#+\s+/gm, '');
  
  // Remove horizontal rules
  content = content.replace(/^-{3,}$/gm, '');
  
  // Remove bold/italic markdown
  content = content.replace(/\*\*([^*]+)\*\*/g, '$1');
  content = content.replace(/\*([^*]+)\*/g, '$1');
  
  // Clean up excessive whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.trim();
  
  return content;
}

export function calculateWordCount(text: string): number {
  const words = text
    .split(/\s+/)
    .filter(word => word.length > 0);
  return words.length;
}

export function estimateReadTime(wordCount: number): number {
  // Average reading speed: 225 words per minute
  return Math.ceil(wordCount / 225);
}
