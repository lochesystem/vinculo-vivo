import { ARCHETYPES, BODY_SHAPES, RARITIES, RARITY_WEIGHTS } from '../data/archetypes';
import { APP_SALT, type ArchetypeId, type BodyShape, type DnaTraits, type ModularParts, type Palette, type PersonalityTraits, type Rarity } from './types';
import { fnv1a, hsl, mulberry32, pickOne, pickWeighted, sha256Hex } from './rng';

export async function computeDnaSeed(userId: string, createdAt: number): Promise<number> {
  const raw = `${userId}:${createdAt}:${APP_SALT}`;
  return fnv1a(raw);
}

export async function computeDnaHash(userId: string, createdAt: number, seed: number): Promise<string> {
  return sha256Hex(`${userId}:${createdAt}:${seed}:${APP_SALT}`);
}

function generatePalette(rng: () => number, archetypeHue: number): Palette {
  const hue = (archetypeHue + rng() * 40 - 20 + 360) % 360;
  const sat = 55 + rng() * 35;
  return {
    primary: hsl(hue, sat, 45 + rng() * 15),
    secondary: hsl((hue + 30) % 360, sat - 10, 55 + rng() * 10),
    accent: hsl((hue + 180) % 360, sat + 10, 60),
    eye: hsl((hue + 60) % 360, 80, 70),
    glow: hsl(hue, 90, 65),
  };
}

function generatePersonality(rng: () => number): PersonalityTraits {
  const traits: PersonalityTraits = {
    curious: rng(),
    shy: rng(),
    stubborn: rng(),
    affectionate: rng(),
    aggressive: rng(),
    lazy: rng(),
  };
  const keys = Object.keys(traits) as (keyof PersonalityTraits)[];
  const peak = pickOne(rng, keys);
  const low = pickOne(rng, keys.filter((k) => k !== peak));
  traits[peak] = 0.7 + rng() * 0.3;
  traits[low] = rng() * 0.25;
  return traits;
}

function generateStats(rng: () => number, rarity: Rarity) {
  const mult = { common: 1, uncommon: 1.05, rare: 1.12, epic: 1.2, mythic: 1.35 }[rarity];
  const base = () => Math.floor((8 + rng() * 12) * mult);
  const stats = {
    vitality: base(),
    power: base(),
    spirit: base(),
    agility: base(),
    wisdom: base(),
  };
  const keys = Object.keys(stats) as (keyof typeof stats)[];
  const peak = pickOne(rng, keys);
  const low = pickOne(rng, keys.filter((k) => k !== peak));
  stats[peak] = Math.floor(stats[peak] * 1.4);
  stats[low] = Math.floor(stats[low] * 0.65);
  return stats;
}

function generateParts(rng: () => number, bodyShape: BodyShape): ModularParts {
  const wingChance = bodyShape === 'winged' ? 0.85 : 0.25;
  return {
    horns: Math.floor(rng() * 5),
    wings: rng() < wingChance ? 1 + Math.floor(rng() * 3) : 0,
    tail: Math.floor(rng() * 4),
    eyes: Math.floor(rng() * 6),
    pattern: Math.floor(rng() * 8),
  };
}

export function generateTraitsFromSeed(seed: number): DnaTraits {
  const rng = mulberry32(seed);
  const archetype = pickOne(rng, ARCHETYPES);
  const bodyShape = pickOne(rng, BODY_SHAPES) as BodyShape;
  const rarity = pickWeighted(rng, [...RARITIES], RARITY_WEIGHTS) as Rarity;
  const palette = generatePalette(rng, archetype.hue);
  const parts = generateParts(rng, bodyShape);
  const personality = generatePersonality(rng);
  const baseStats = generateStats(rng, rarity);

  return {
    archetype: archetype.id as ArchetypeId,
    bodyShape,
    palette,
    parts,
    rarity,
    baseStats,
    personality,
  };
}

export async function createDnaBundle(userId: string, createdAt: number) {
  const dnaSeed = await computeDnaSeed(userId, createdAt);
  const dnaHash = await computeDnaHash(userId, createdAt, dnaSeed);
  const traits = generateTraitsFromSeed(dnaSeed);
  return { dnaSeed, dnaHash, traits };
}

export function getArchetypeMeta(id: ArchetypeId) {
  return ARCHETYPES.find((a) => a.id === id)!;
}
