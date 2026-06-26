import type { ChassisId } from '../../data/chassis';
import { chassisFromFormId } from '../../data/chassis';
import { computeCreatureMotion } from './animation';
import { blitComposedSprite, composeCreatureSprite, generateVisualDnaFromSeed } from './composer';
import type { DrawCreatureOptions } from './types';

export type { AnimState, DrawCreatureOptions } from './types';
export { generateVisualDnaFromSeed, resolveChassisId } from '../../core/visual-dna';
export { computeCreatureMotion } from './animation';

const PIXEL_SCALE = 1.15;

export function drawCreaturePixel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  opts: DrawCreatureOptions,
): void {
  const { traits, form, anim, animTime, mood } = opts;
  const dnaSeed = opts.dnaSeed ?? 0;
  const visualDna = opts.visualDna ?? generateVisualDnaFromSeed(dnaSeed, traits);

  const motion = computeCreatureMotion(
    animTime,
    anim,
    mood,
    traits.personality,
    traits.parts.pattern + traits.parts.eyes,
    form.wingScale,
    form.tailScale,
    form.silhouette !== 'egg',
  );

  const pixelScale = scale * PIXEL_SCALE;
  const chassisOverride = opts.chassisId ?? null;

  const composed = composeCreatureSprite({
    traits,
    dnaSeed,
    formId: form.id,
    silhouette: form.silhouette,
    anim,
    animTime,
    mood,
    chassisOverride,
    visualDna,
  });

  const walkBounce = opts.isWalking ? Math.sin(animTime * 14) * 1.5 : 0;

  blitComposedSprite(
    ctx,
    cx,
    cy,
    pixelScale,
    composed,
    form.bodyScale,
    motion.squishX,
    motion.squishY,
    motion.bounceY + walkBounce,
    opts.facingLeft ?? false,
  );
}

export function resolveChassisForForm(formId: string, dnaSeed: number, traits: DrawCreatureOptions['traits']): ChassisId {
  const visual = generateVisualDnaFromSeed(dnaSeed, traits);
  return chassisFromFormId(formId) ?? visual.chassisId;
}
