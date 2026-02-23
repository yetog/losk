import { Node, Edge } from '@xyflow/react';

// Initial nodes for a new mood board
export const initialNodes: Node[] = [
  {
    id: 'welcome-text',
    type: 'text',
    position: { x: 250, y: 50 },
    data: {
      label: 'Welcome to LOSK Mood Board',
      content: 'Drag nodes from the sidebar to start building your visual story plan.\n\nConnect nodes by dragging from the handles.',
      color: 'yellow'
    }
  },
  {
    id: 'sample-chapter',
    type: 'chapter',
    position: { x: 50, y: 200 },
    data: {
      chapterId: 'v1c1',
      title: "Date Night's A Smash",
      volumeId: 1,
      chapterNumber: 1,
      summary: "Ren's journey begins with an unexpected encounter...",
      wordCount: 2500
    }
  },
  {
    id: 'sample-character',
    type: 'character',
    position: { x: 300, y: 200 },
    data: {
      characterId: 'ren',
      name: 'Ren',
      portrait: '/losk/images/characters/Ren.jpg',
      role: 'protagonist',
      species: 'Demon',
      icon: '🔥'
    }
  },
  {
    id: 'sample-scene',
    type: 'scene',
    position: { x: 520, y: 200 },
    data: {
      sceneId: 'scene-1',
      title: 'The Awakening',
      location: 'Shadow Guild Headquarters',
      characters: ['Ren', 'Kira'],
      mood: 'dramatic',
      description: 'Ren discovers his true nature'
    }
  }
];

// Initial edges connecting the sample nodes
export const initialEdges: Edge[] = [
  {
    id: 'e-chapter-character',
    source: 'sample-chapter',
    target: 'sample-character',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#fbbf24' }
  },
  {
    id: 'e-character-scene',
    source: 'sample-character',
    target: 'sample-scene',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#fbbf24' }
  }
];

// Empty state for new boards
export const emptyNodes: Node[] = [];
export const emptyEdges: Edge[] = [];
