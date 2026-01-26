
export interface Character {
  id: string;
  name: string;
  species: string;
  icon: string;
  portrait: string;
  imagePosition?: string; // CSS object-position value, e.g., 'center 20%', 'top', 'center'
  stats: {
    power: number;
    speed: number;
    technique: number;
  };
  health: number;
  style: string;
  specialMoves: SpecialMove[];
  animations: CharacterAnimations;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface SpecialMove {
  name: string;
  input: string[];
  damage: number;
  startup: number;
  active: number;
  recovery: number;
  description: string;
}

export interface CharacterAnimations {
  idle: AnimationData;
  walk: AnimationData;
  jump: AnimationData;
  attack_light: AnimationData;
  attack_medium: AnimationData;
  attack_heavy: AnimationData;
  block: AnimationData;
  hit: AnimationData;
  victory: AnimationData;
  defeat: AnimationData;
}

export interface AnimationData {
  frames: number[];
  frameRate: number;
  loop?: boolean;
}

export const characterData: Record<string, Character> = {
  ren: {
    id: 'ren',
    name: 'REN',
    species: 'Demon',
    icon: '🔥',
    portrait: '/images/characters/Ren.jpg',
    imagePosition: 'center 15%',
    stats: { power: 9, speed: 6, technique: 6 },
    health: 100,
    style: 'Fire-infused martial arts with explosive mid-range spells. Can enter a partial demonic form for burst damage.',
    colors: { primary: '#ff4444', secondary: '#cc0000' },
    specialMoves: [
      {
        name: 'Flame Burst',
        input: ['down', 'down-forward', 'forward', 'punch'],
        damage: 25,
        startup: 15,
        active: 8,
        recovery: 22,
        description: 'Explosive fire projectile that travels across the screen'
      },
      {
        name: 'Demon Form',
        input: ['down', 'down-back', 'back', 'down', 'down-forward', 'forward', 'kick'],
        damage: 35,
        startup: 30,
        active: 10,
        recovery: 40,
        description: 'Temporary transformation increasing all stats'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 8, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 10, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 12 },
      attack_light: { frames: [11, 12, 13], frameRate: 15 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 12 },
      attack_heavy: { frames: [18, 19, 20, 21, 22], frameRate: 10 },
      block: { frames: [23, 24], frameRate: 8, loop: true },
      hit: { frames: [25, 26], frameRate: 12 },
      victory: { frames: [27, 28, 29, 30], frameRate: 8, loop: true },
      defeat: { frames: [31, 32, 33], frameRate: 6 }
    }
  },
  liora: {
    id: 'liora',
    name: 'LIORA',
    species: 'Fairy',
    icon: '🧚',
    portrait: '/images/characters/Liora.jpg',
    imagePosition: 'center 20%',
    stats: { power: 6, speed: 9, technique: 7 },
    health: 90,
    style: 'Aerial specialist using high-speed flight, magic arrows, and dazzling spell traps. Agile hit-and-run tactics.',
    colors: { primary: '#44ff44', secondary: '#00cc00' },
    specialMoves: [
      {
        name: 'Magic Arrow',
        input: ['down', 'down-forward', 'forward', 'punch'],
        damage: 18,
        startup: 12,
        active: 6,
        recovery: 18,
        description: 'Fast-traveling magical projectile'
      },
      {
        name: 'Fairy Dust',
        input: ['down', 'down-back', 'back', 'kick'],
        damage: 15,
        startup: 10,
        active: 15,
        recovery: 20,
        description: 'Area effect spell that slows opponent'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 10, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 12, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 15 },
      attack_light: { frames: [11, 12, 13], frameRate: 18 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 15 },
      attack_heavy: { frames: [18, 19, 20, 21], frameRate: 12 },
      block: { frames: [22, 23], frameRate: 10, loop: true },
      hit: { frames: [24, 25], frameRate: 15 },
      victory: { frames: [26, 27, 28, 29], frameRate: 10, loop: true },
      defeat: { frames: [30, 31, 32], frameRate: 8 }
    }
  },
  kingfasa: {
    id: 'kingfasa',
    name: 'KING FASA',
    species: 'Beast',
    icon: '🦁',
    portrait: '/images/characters/Fasa.jpg',
    imagePosition: 'center 25%',
    stats: { power: 10, speed: 4, technique: 5 },
    health: 120,
    style: 'Colossal strength-based combat. Uses claw strikes, shockwave stomps, and Overheat mode for power surges.',
    colors: { primary: '#ffaa00', secondary: '#cc8800' },
    specialMoves: [
      {
        name: 'Shockwave Stomp',
        input: ['down', 'down', 'kick'],
        damage: 30,
        startup: 20,
        active: 5,
        recovery: 30,
        description: 'Ground-shaking stomp that hits entire screen'
      },
      {
        name: 'Overheat Mode',
        input: ['down', 'down-forward', 'forward', 'down', 'down-forward', 'forward', 'punch'],
        damage: 0,
        startup: 25,
        active: 180,
        recovery: 10,
        description: 'Temporary mode increasing power and speed'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 6, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 8, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 10 },
      attack_light: { frames: [11, 12, 13], frameRate: 12 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 10 },
      attack_heavy: { frames: [18, 19, 20, 21, 22], frameRate: 8 },
      block: { frames: [23, 24], frameRate: 6, loop: true },
      hit: { frames: [25, 26], frameRate: 10 },
      victory: { frames: [27, 28, 29, 30], frameRate: 6, loop: true },
      defeat: { frames: [31, 32, 33], frameRate: 5 }
    }
  },
  kira: {
    id: 'kira',
    name: 'KIRA',
    species: 'Elf',
    icon: '⚔️',
    portrait: '/images/characters/Kira.jpg',
    imagePosition: 'center 15%',
    stats: { power: 7, speed: 7, technique: 9 },
    health: 95,
    style: 'Elegant blade master. Specializes in counters, evasive movement, and elemental sword techniques (ice, lightning).',
    colors: { primary: '#4444ff', secondary: '#0000cc' },
    specialMoves: [
      {
        name: 'Ice Blade',
        input: ['down', 'down-forward', 'forward', 'punch'],
        damage: 22,
        startup: 14,
        active: 8,
        recovery: 20,
        description: 'Freezing sword strike that slows opponent'
      },
      {
        name: 'Lightning Counter',
        input: ['down', 'down-back', 'back', 'punch'],
        damage: 28,
        startup: 8,
        active: 6,
        recovery: 25,
        description: 'Counter attack with electric damage'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 8, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 12, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 14 },
      attack_light: { frames: [11, 12, 13], frameRate: 16 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 14 },
      attack_heavy: { frames: [18, 19, 20, 21], frameRate: 12 },
      block: { frames: [22, 23], frameRate: 8, loop: true },
      hit: { frames: [24, 25], frameRate: 12 },
      victory: { frames: [26, 27, 28, 29], frameRate: 8, loop: true },
      defeat: { frames: [30, 31, 32], frameRate: 6 }
    }
  },
  bradley: {
    id: 'bradley',
    name: 'BRADLEY',
    species: 'Human',
    icon: '🔫',
    portrait: '/images/characters/Bradley.jpg',
    imagePosition: 'center 20%',
    stats: { power: 7, speed: 7, technique: 7 },
    health: 100,
    style: 'Tactical all-rounder. Mixes tech gadgets, ranged weapons, and calculated melee strikes. Great for adaptive playstyles.',
    colors: { primary: '#888888', secondary: '#555555' },
    specialMoves: [
      {
        name: 'Plasma Shot',
        input: ['down', 'down-forward', 'forward', 'punch'],
        damage: 20,
        startup: 12,
        active: 8,
        recovery: 18,
        description: 'High-tech energy projectile'
      },
      {
        name: 'Tactical Strike',
        input: ['down', 'down-back', 'back', 'forward', 'kick'],
        damage: 26,
        startup: 16,
        active: 10,
        recovery: 22,
        description: 'Multi-hit combo using various gadgets'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 8, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 10, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 12 },
      attack_light: { frames: [11, 12, 13], frameRate: 14 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 12 },
      attack_heavy: { frames: [18, 19, 20, 21], frameRate: 10 },
      block: { frames: [22, 23], frameRate: 8, loop: true },
      hit: { frames: [24, 25], frameRate: 12 },
      victory: { frames: [26, 27, 28, 29], frameRate: 8, loop: true },
      defeat: { frames: [30, 31, 32], frameRate: 6 }
    }
  },
  dante: {
    id: 'dante',
    name: 'DANTE',
    species: 'Elf',
    icon: '🗡️',
    portrait: '/images/characters/Dante.jpg',
    imagePosition: 'center 20%',
    stats: { power: 9, speed: 6, technique: 9 },
    health: 105,
    style: 'Precision-based duelist. Expert in counters, pressure reads, and chaining defensive moves into brutal finishers.',
    colors: { primary: '#cc44cc', secondary: '#990099' },
    specialMoves: [
      {
        name: 'Precision Strike',
        input: ['down', 'down-forward', 'forward', 'punch'],
        damage: 32,
        startup: 18,
        active: 6,
        recovery: 28,
        description: 'Perfectly timed strike with maximum damage'
      },
      {
        name: 'Counter Stance',
        input: ['down', 'down-back', 'back', 'kick'],
        damage: 35,
        startup: 5,
        active: 20,
        recovery: 15,
        description: 'Defensive stance that counters any attack'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 7, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 10, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 12 },
      attack_light: { frames: [11, 12, 13], frameRate: 14 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 12 },
      attack_heavy: { frames: [18, 19, 20, 21, 22], frameRate: 10 },
      block: { frames: [23, 24], frameRate: 7, loop: true },
      hit: { frames: [25, 26], frameRate: 12 },
      victory: { frames: [27, 28, 29, 30], frameRate: 7, loop: true },
      defeat: { frames: [31, 32, 33], frameRate: 6 }
    }
  },
  // Add alias for "fasa" to "kingfasa" for consistency
  fasa: {
    id: 'fasa',
    name: 'KING FASA',
    species: 'Beast',
    icon: '🦁',
    portrait: '/images/characters/Fasa.jpg',
    imagePosition: 'center 25%',
    stats: { power: 10, speed: 4, technique: 5 },
    health: 120,
    style: 'Colossal strength-based combat. Uses claw strikes, shockwave stomps, and Overheat mode for power surges.',
    colors: { primary: '#ffaa00', secondary: '#cc8800' },
    specialMoves: [
      {
        name: 'Shockwave Stomp',
        input: ['down', 'down', 'kick'],
        damage: 30,
        startup: 20,
        active: 5,
        recovery: 30,
        description: 'Ground-shaking stomp that hits entire screen'
      },
      {
        name: 'Overheat Mode',
        input: ['down', 'down-forward', 'forward', 'down', 'down-forward', 'forward', 'punch'],
        damage: 0,
        startup: 25,
        active: 180,
        recovery: 10,
        description: 'Temporary mode increasing power and speed'
      }
    ],
    animations: {
      idle: { frames: [0, 1, 2, 3], frameRate: 6, loop: true },
      walk: { frames: [4, 5, 6, 7], frameRate: 8, loop: true },
      jump: { frames: [8, 9, 10], frameRate: 10 },
      attack_light: { frames: [11, 12, 13], frameRate: 12 },
      attack_medium: { frames: [14, 15, 16, 17], frameRate: 10 },
      attack_heavy: { frames: [18, 19, 20, 21, 22], frameRate: 8 },
      block: { frames: [23, 24], frameRate: 6, loop: true },
      hit: { frames: [25, 26], frameRate: 10 },
      victory: { frames: [27, 28, 29, 30], frameRate: 6, loop: true },
      defeat: { frames: [31, 32, 33], frameRate: 5 }
    }
  }
};

// Helper function to get character by ID with fallback
export const getCharacterById = (id: string): Character | null => {
  return characterData[id] || null;
};

// Helper function to get all character IDs
export const getAllCharacterIds = (): string[] => {
  return Object.keys(characterData).filter(id => id !== 'fasa'); // Exclude alias
};

