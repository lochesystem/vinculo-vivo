import { generateTraitsFromSeed } from '../core/dna';
import type { ArchetypeId } from '../core/types';
import { ARCHETYPES } from '../data/archetypes';
import { ALL_BIOMES } from '../data/biome-palettes';
import { getFormById } from '../data/forms';
import { drawCreaturePixel } from '../render/creature';
import { generateVisualDnaFromSeed } from '../render/creature/composer';
import { drawPixelHabitat } from '../render/pixel-habitat';
import { creatureDrawScale, STAGE_LOGICAL_H, STAGE_LOGICAL_W } from '../render/stage';
import { mountDebugShell } from './debug-shared';

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

function archetypeForBiome(biome: string): (typeof ARCHETYPES)[number] {
  return ARCHETYPES.find((a) => a.biome === biome) ?? ARCHETYPES[0];
}

function drawStagePreview(
  ctx: CanvasRenderingContext2D,
  biome: string,
  dayPhase: number,
): void {
  const w = STAGE_LOGICAL_W;
  const h = STAGE_LOGICAL_H;
  const seed = BIOME_SEEDS[biome] ?? 101;
  const arch = archetypeForBiome(biome);

  ctx.imageSmoothingEnabled = false;
  drawPixelHabitat(ctx, w, h, biome, dayPhase, seed, dayPhase * 100);

  const baseTraits = generateTraitsFromSeed(seed);
  const traits = { ...baseTraits, archetype: arch.id as ArchetypeId };
  const visual = generateVisualDnaFromSeed(seed, traits);
  const form = getFormById(`${arch.id}_hatchling`);
  if (!form) return;

  const scale = creatureDrawScale();
  drawCreaturePixel(ctx, w / 2, h * 0.62, scale, {
    traits,
    form,
    dnaSeed: seed,
    visualDna: visual,
    anim: 'idle',
    animTime: seed * 0.001,
    mood: 'content',
  });
}

function addSection(grid: HTMLElement, title: string): void {
  const section = document.createElement('div');
  section.className = 'debug-section';
  section.textContent = title;
  grid.appendChild(section);
}

function addBiomeCell(grid: HTMLElement, biome: string, phaseLabel: string, dayPhase: number): void {
  const arch = archetypeForBiome(biome);
  const cell = document.createElement('div');
  cell.className = 'debug-cell habitat';
  const canvas = document.createElement('canvas');
  canvas.width = STAGE_LOGICAL_W;
  canvas.height = STAGE_LOGICAL_H;
  const ctx = canvas.getContext('2d');
  if (ctx) drawStagePreview(ctx, biome, dayPhase);

  const label = document.createElement('label');
  label.textContent = `${biome}\n${arch.name} · ${phaseLabel}\n360×270`;
  cell.appendChild(canvas);
  cell.appendChild(label);
  grid.appendChild(cell);
}

export function mountHabitatDebugPage(): void {
  const grid = mountDebugShell(
    'Background Debug — Pixel Habitats',
    '10 biomas soulbound · pet hatchling em cima · dia e noite',
    'habitat',
  );

  addSection(grid, '— Dia —');
  for (const biome of ALL_BIOMES) {
    addBiomeCell(grid, biome, 'dia', 0.45);
  }

  addSection(grid, '— Noite —');
  for (const biome of ALL_BIOMES) {
    addBiomeCell(grid, biome, 'noite', 0.92);
  }
}
