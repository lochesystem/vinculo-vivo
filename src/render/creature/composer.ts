import type { ChassisId } from '../../data/chassis';
import { CHASSIS_META, evolutionFeaturesFromForm } from '../../data/chassis';
import type { CreatureVisualDna, DnaTraits } from '../../core/types';
import { generateVisualDnaFromSeed, resolveChassisId } from '../../core/visual-dna';
import { computeCreatureMotion } from './animation';
import { drawChassis, drawEggPixel } from './chassis/index';
import { drawFaceOnGrid } from './faces/index';
import { applyFeatures, filterFeaturesForChassis } from './features/index';
import { flatPaletteFromTraits, GRID_SIZE, PixelGrid } from './pixel-grid';
import type { AnimState } from './types';

export interface ComposeOptions {
  traits: DnaTraits;
  dnaSeed: number;
  formId: string;
  silhouette: 'egg' | 'baby' | 'teen' | 'adult' | 'apex';
  anim: AnimState;
  animTime: number;
  mood: import('../../core/types').Mood;
  chassisOverride?: ChassisId | null;
  visualDna?: CreatureVisualDna;
}

export interface ComposedSprite {
  grid: PixelGrid;
  accentPixels: Array<[number, number]>;
  palette: ReturnType<typeof flatPaletteFromTraits>;
  connected: boolean;
}

const gridPool = new PixelGrid();

export function composeCreatureSprite(opts: ComposeOptions): ComposedSprite {
  const visualDna = opts.visualDna ?? generateVisualDnaFromSeed(opts.dnaSeed, opts.traits);
  const grid = gridPool;
  grid.clear();

  const pal = flatPaletteFromTraits(opts.traits.palette.primary, opts.traits.palette.accent);

  if (opts.silhouette === 'egg') {
    drawEggPixel(grid);
    grid.addOuterOutline();
    return { grid, accentPixels: [], palette: pal, connected: grid.isSilhouetteConnected() };
  }

  const chassisId = resolveChassisId(opts.formId, visualDna, opts.chassisOverride);
  drawChassis(grid, chassisId);

  const evoFeatures = evolutionFeaturesFromForm(opts.formId);
  const dnaFeatures = filterFeaturesForChassis(chassisId, visualDna.features);
  const evoFiltered = filterFeaturesForChassis(chassisId, evoFeatures);
  const allFeatures = [...new Set([...dnaFeatures, ...evoFiltered])].slice(0, 2);
  applyFeatures(grid, chassisId, allFeatures);

  grid.solidify();
  grid.addOuterOutline();

  if (visualDna.variant % 2 === 1) {
    grid.mirrorX();
  }

  const anchor = CHASSIS_META[chassisId].faceAnchor;
  const ax = visualDna.variant % 2 === 1 ? GRID_SIZE - 1 - anchor.x : anchor.x;
  const motion = computeCreatureMotion(
    opts.animTime,
    opts.anim,
    opts.mood,
    opts.traits.personality,
    opts.traits.parts.pattern + opts.traits.parts.eyes,
    1,
    1,
    true,
  );
  const face = drawFaceOnGrid(grid, visualDna.faceId, ax, anchor.y, opts.anim, motion.blink);

  return {
    grid,
    accentPixels: face.accentPixels,
    palette: pal,
    connected: grid.isSilhouetteConnected(),
  };
}

export function blitComposedSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  composed: ComposedSprite,
  bodyScale = 1,
  squishX = 1,
  squishY = 1,
  bounceY = 0,
): void {
  ctx.save();
  ctx.translate(cx, cy + bounceY);
  ctx.scale(bodyScale * squishX, bodyScale * squishY);
  composed.grid.blit(ctx, 0, 0, scale, composed.palette);
  if (composed.accentPixels.length) {
    composed.grid.blitAccent(ctx, 0, 0, scale, composed.palette.accent, composed.accentPixels);
  }
  ctx.restore();
}

export { generateVisualDnaFromSeed, resolveChassisId } from '../../core/visual-dna';
