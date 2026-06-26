import type { CareAction, CareVector, CreatureState, Needs } from './types';
import { clamp, todayKey } from './rng';
import {
  defaultCareVector,
  defaultNeeds,
  MVP_MAX_LEVEL,
  OFFLINE_DECAY_CAP_MS,
  xpForLevel,
  type ArchetypeId,
} from './types';
import { generateTraitsFromSeed } from './dna';
import { getInitialFormId } from '../data/forms';
import { computeMood } from './personality';

const DECAY_PER_MIN = {
  hunger: 0.35,
  energy: 0.28,
  hygiene: 0.18,
  happiness: 0.22,
};

const CARE_DELTAS: Record<
  CareAction,
  { needs: Partial<Needs>; care: Partial<CareVector>; xp: number }
> = {
  feed: { needs: { hunger: 25, happiness: 5 }, care: { nourishment: 2, affection: 0.5 }, xp: 8 },
  play: { needs: { happiness: 20, energy: -12, hunger: -5 }, care: { playBias: 2, affection: 1.5 }, xp: 12 },
  clean: { needs: { hygiene: 30, happiness: 8 }, care: { discipline: 0.5 }, xp: 6 },
  rest: { needs: { energy: 35, hunger: -8 }, care: { restBias: 2 }, xp: 5 },
  train: { needs: { energy: -18, happiness: -3 }, care: { discipline: 2.5 }, xp: 15 },
};

export function createNewCreature(
  ownerId: string,
  name: string,
  dnaSeed: number,
  dnaHash: string,
  archetype: ArchetypeId,
): CreatureState {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    ownerId,
    name,
    dnaSeed,
    dnaHash,
    level: 1,
    xp: 0,
    evolutionStage: 0,
    evolutionPath: 'balanced',
    formId: getInitialFormId(archetype),
    careVector: defaultCareVector(),
    needs: defaultNeeds(),
    mood: 'content',
    lastTickAt: now,
    createdAt: now,
    dailyStreak: 1,
    lastCareDate: todayKey(),
  };
}

export function applyOfflineDecay(creature: CreatureState, now = Date.now()): CreatureState {
  const elapsed = Math.min(now - creature.lastTickAt, OFFLINE_DECAY_CAP_MS);
  if (elapsed <= 0) return creature;

  const minutes = elapsed / 60000;
  const needs = { ...creature.needs };
  needs.hunger = clamp(needs.hunger - DECAY_PER_MIN.hunger * minutes, 0, 100);
  needs.energy = clamp(needs.energy - DECAY_PER_MIN.energy * minutes, 0, 100);
  needs.hygiene = clamp(needs.hygiene - DECAY_PER_MIN.hygiene * minutes, 0, 100);
  needs.happiness = clamp(needs.happiness - DECAY_PER_MIN.happiness * minutes, 0, 100);

  const traits = generateTraitsFromSeed(creature.dnaSeed);
  const mood = computeMood(needs, creature.mood, traits.personality);

  return { ...creature, needs, mood, lastTickAt: now };
}

export interface CareResult {
  creature: CreatureState;
  leveledUp: boolean;
  blocked?: string;
}

export function performCareAction(creature: CreatureState, action: CareAction): CareResult {
  const traits = generateTraitsFromSeed(creature.dnaSeed);
  const cfg = CARE_DELTAS[action];
  const needs = { ...creature.needs };

  if (action === 'play' && traits.personality.shy > 0.65 && needs.happiness < 30) {
    return { creature, leveledUp: false, blocked: `${creature.name} está tímido demais para brincar agora.` };
  }
  if (action === 'feed' && traits.personality.stubborn > 0.7 && needs.hunger > 40) {
    return { creature, leveledUp: false, blocked: `${creature.name} está teimoso e recusa comer.` };
  }
  if (action === 'train' && needs.energy < 25) {
    return { creature, leveledUp: false, blocked: 'Energia insuficiente para treinar.' };
  }
  if (action === 'rest' && creature.mood !== 'sleeping' && needs.energy > 70) {
    return { creature, leveledUp: false, blocked: `${creature.name} não está cansado.` };
  }

  for (const [k, v] of Object.entries(cfg.needs)) {
    const key = k as keyof Needs;
    needs[key] = clamp(needs[key] + (v ?? 0), 0, 100);
  }

  const careVector = { ...creature.careVector };
  for (const [k, v] of Object.entries(cfg.care)) {
    const key = k as keyof CareVector;
    careVector[key] = (careVector[key] ?? 0) + (v ?? 0);
  }

  let xp = creature.xp + cfg.xp;
  let level = creature.level;
  let leveledUp = false;

  while (level < MVP_MAX_LEVEL && xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    leveledUp = true;
  }

  const today = todayKey();
  let dailyStreak = creature.dailyStreak;
  if (creature.lastCareDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    dailyStreak =
      creature.lastCareDate === yesterday.toISOString().slice(0, 10) ? dailyStreak + 1 : 1;
  }

  if (dailyStreak >= 3) xp += 2;

  const mood = computeMood(
    needs,
    action === 'rest' ? 'sleeping' : creature.mood,
    traits.personality,
  );

  return {
    creature: {
      ...creature,
      needs,
      careVector,
      xp,
      level,
      mood,
      dailyStreak,
      lastCareDate: today,
      lastTickAt: Date.now(),
    },
    leveledUp,
  };
}

export function getXpProgress(creature: CreatureState): { current: number; max: number; pct: number } {
  const max = xpForLevel(creature.level);
  return {
    current: creature.xp,
    max,
    pct: creature.level >= MVP_MAX_LEVEL ? 100 : (creature.xp / max) * 100,
  };
}
