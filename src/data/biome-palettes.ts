export interface BiomePalette {
  sky: string;
  skyAlt: string;
  hillFar: string;
  hillMid: string;
  hillNear: string;
  grassHi: string;
  grassMid: string;
  grassLo: string;
  ground: string;
  /** Optional flower/accent speckles (garden) */
  accent?: string;
}

export const BIOME_PALETTES: Record<string, BiomePalette> = {
  forest: {
    sky: '#4FC3F7',
    skyAlt: '#42A5F5',
    hillFar: '#33691E',
    hillMid: '#558B2F',
    hillNear: '#689F38',
    grassHi: '#9CCC65',
    grassMid: '#7CB342',
    grassLo: '#558B2F',
    ground: '#33691E',
  },
  garden: {
    sky: '#81D4FA',
    skyAlt: '#F48FB1',
    hillFar: '#388E3C',
    hillMid: '#43A047',
    hillNear: '#66BB6A',
    grassHi: '#AED581',
    grassMid: '#8BC34A',
    grassLo: '#558B2F',
    ground: '#33691E',
    accent: '#F06292',
  },
  ocean: {
    sky: '#0288D1',
    skyAlt: '#039BE5',
    hillFar: '#00695C',
    hillMid: '#00897B',
    hillNear: '#26A69A',
    grassHi: '#4DB6AC',
    grassMid: '#26A69A',
    grassLo: '#00796B',
    ground: '#004D40',
  },
  volcano: {
    sky: '#FF8A65',
    skyAlt: '#FF7043',
    hillFar: '#4E342E',
    hillMid: '#6D4C41',
    hillNear: '#795548',
    grassHi: '#A1887F',
    grassMid: '#8D6E63',
    grassLo: '#5D4037',
    ground: '#3E2723',
  },
  void: {
    sky: '#311B92',
    skyAlt: '#4527A0',
    hillFar: '#1A1030',
    hillMid: '#4A148C',
    hillNear: '#6A1B9A',
    grassHi: '#7E57C2',
    grassMid: '#5E35B1',
    grassLo: '#4527A0',
    ground: '#1A1030',
  },
  storm: {
    sky: '#546E7A',
    skyAlt: '#78909C',
    hillFar: '#37474F',
    hillMid: '#455A64',
    hillNear: '#607D8B',
    grassHi: '#90A4AE',
    grassMid: '#78909C',
    grassLo: '#546E7A',
    ground: '#37474F',
  },
  sky: {
    sky: '#29B6F6',
    skyAlt: '#4FC3F7',
    hillFar: '#0288D1',
    hillMid: '#039BE5',
    hillNear: '#03A9F4',
    grassHi: '#81D4FA',
    grassMid: '#4FC3F7',
    grassLo: '#29B6F6',
    ground: '#0277BD',
  },
  canyon: {
    sky: '#FFB74D',
    skyAlt: '#FFA726',
    hillFar: '#6D4C41',
    hillMid: '#8D6E63',
    hillNear: '#A1887F',
    grassHi: '#D7CCC8',
    grassMid: '#BCAAA4',
    grassLo: '#8D6E63',
    ground: '#5D4037',
  },
  crystal: {
    sky: '#CE93D8',
    skyAlt: '#E1BEE7',
    hillFar: '#6A1B9A',
    hillMid: '#8E24AA',
    hillNear: '#AB47BC',
    grassHi: '#E1BEE7',
    grassMid: '#CE93D8',
    grassLo: '#9C27B0',
    ground: '#6A1B9A',
  },
  tundra: {
    sky: '#B3E5FC',
    skyAlt: '#E1F5FE',
    hillFar: '#546E7A',
    hillMid: '#78909C',
    hillNear: '#90A4AE',
    grassHi: '#ECEFF1',
    grassMid: '#CFD8DC',
    grassLo: '#90A4AE',
    ground: '#607D8B',
  },
};

export const ALL_BIOMES = Object.keys(BIOME_PALETTES);

export function getBiomePalette(biome: string): BiomePalette {
  return BIOME_PALETTES[biome] ?? BIOME_PALETTES.forest;
}

const NIGHT_SKY = '#0D1B2A';
const NIGHT_SKY_ALT = '#1B263B';

export function applyDayPhase(base: BiomePalette, dayPhase: number): BiomePalette {
  const light = dayLightness(dayPhase);
  if (light >= 0.98) return base;

  const dark = (hex: string, factor: number) => darkenHex(hex, factor);

  return {
    sky: lerpHex(NIGHT_SKY, base.sky, light),
    skyAlt: lerpHex(NIGHT_SKY_ALT, base.skyAlt, light),
    hillFar: dark(base.hillFar, 1 - light * 0.5),
    hillMid: dark(base.hillMid, 1 - light * 0.45),
    hillNear: dark(base.hillNear, 1 - light * 0.4),
    grassHi: dark(base.grassHi, 1 - light * 0.35),
    grassMid: dark(base.grassMid, 1 - light * 0.4),
    grassLo: dark(base.grassLo, 1 - light * 0.45),
    ground: dark(base.ground, 1 - light * 0.5),
    accent: base.accent,
  };
}

export function dayLightness(dayPhase: number): number {
  if (dayPhase >= 0.2 && dayPhase <= 0.75) return 1;
  if (dayPhase > 0.75) return Math.max(0, 1 - (dayPhase - 0.75) / 0.25);
  return Math.max(0, dayPhase / 0.2);
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const f = 1 - amount * 0.65;
  return toHex(r * f, g * f, b * f);
}
