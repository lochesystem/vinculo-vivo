export const ARCHETYPES = [
  { id: 'ember', name: 'Brasa', hue: 15, biome: 'volcano', element: 'fire' },
  { id: 'tide', name: 'Maré', hue: 200, biome: 'ocean', element: 'water' },
  { id: 'moss', name: 'Musgo', hue: 120, biome: 'forest', element: 'nature' },
  { id: 'void', name: 'Vazio', hue: 270, biome: 'void', element: 'shadow' },
  { id: 'spark', name: 'Centelha', hue: 50, biome: 'storm', element: 'lightning' },
  { id: 'gale', name: 'Vento', hue: 185, biome: 'sky', element: 'wind' },
  { id: 'stone', name: 'Rocha', hue: 35, biome: 'canyon', element: 'earth' },
  { id: 'lumen', name: 'Lumen', hue: 280, biome: 'crystal', element: 'light' },
  { id: 'frost', name: 'Gelo', hue: 210, biome: 'tundra', element: 'ice' },
  { id: 'bloom', name: 'Flor', hue: 320, biome: 'garden', element: 'life' },
] as const;

export const BODY_SHAPES = ['round', 'slim', 'bulky', 'winged', 'quadruped', 'serpent'] as const;

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'mythic'] as const;
export const RARITY_WEIGHTS = [50, 28, 14, 6, 2];

export const RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  mythic: 'Mítico',
};

export const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#34d399',
  rare: '#60a5fa',
  epic: '#c084fc',
  mythic: '#fbbf24',
};
