import { getArchetypeMeta } from '../core/dna';
import type { ArchetypeId } from '../core/types';
import { DAY_CYCLE_MS } from '../core/types';
import { drawPixelHabitat } from './pixel-habitat';

export interface HabitatState {
  time: number;
  dayPhase: number;
}

export function createHabitatState(): HabitatState {
  return { time: 0, dayPhase: 0.45 };
}

export function updateHabitat(state: HabitatState, dt: number): void {
  state.time += dt;
  state.dayPhase = ((state.time * 1000) % DAY_CYCLE_MS) / DAY_CYCLE_MS;
}

const BIOME_SEEDS: Record<string, number> = {
  forest: 101,
  garden: 202,
  ocean: 303,
  volcano: 404,
  void: 505,
  storm: 606,
  sky: 707,
  canyon: 808,
  crystal: 909,
  tundra: 1010,
};

export function drawHabitat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  archetype: ArchetypeId,
  state: HabitatState,
): void {
  const meta = getArchetypeMeta(archetype);
  const seed = BIOME_SEEDS[meta.biome] ?? 101;
  drawPixelHabitat(ctx, w, h, meta.biome, state.dayPhase, seed, state.time);
}

export { drawPixelHabitat } from './pixel-habitat';
