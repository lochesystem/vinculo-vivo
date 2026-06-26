import type { MorphId } from '../../data/morphs';
import { morphFromFormId } from '../../data/morphs';
import { computeCreatureMotion } from './animation';
import { computeBodyProportions } from './proportions';
import { drawFace } from './face';
import { drawHorns } from './parts/horns';
import { drawWings } from './parts/wings';
import { drawTail } from './parts/tail';
import { drawPattern } from './parts/patterns';
import {
  drawAura,
  drawChibiBlob,
  drawQuadrupedPup,
  drawSerpentCoil,
  drawCanineFeral,
  drawHumanoidGuardian,
  drawBeastWinged,
  drawEtherealMystic,
  drawApexHybrid,
  drawEgg,
  type MorphDrawContext,
} from './morphs/index';
import type { DrawCreatureOptions } from './types';

export type { AnimState, DrawCreatureOptions } from './types';

const MORPH_DRAWERS: Record<MorphId, (ctx: MorphDrawContext) => void> = {
  chibi_blob: drawChibiBlob,
  quadruped_pup: drawQuadrupedPup,
  serpent_coil: drawSerpentCoil,
  canine_feral: drawCanineFeral,
  humanoid_guardian: drawHumanoidGuardian,
  beast_winged: drawBeastWinged,
  ethereal_mystic: drawEtherealMystic,
  apex_hybrid: drawApexHybrid,
};

export function resolveMorphId(formId: string, explicit?: MorphId): MorphId {
  return explicit ?? morphFromFormId(formId);
}

export function drawCreaturePixel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  opts: DrawCreatureOptions,
): void {
  const { traits, form, anim, animTime, mood } = opts;
  const morphId = opts.morphId ?? morphFromFormId(form.id);
  const pal = traits.palette;
  const props = computeBodyProportions(traits);
  const allowLimbs = form.silhouette !== 'egg';
  const motion = computeCreatureMotion(
    animTime,
    anim,
    mood,
    traits.personality,
    traits.parts.pattern + traits.parts.eyes,
    form.wingScale,
    form.tailScale,
    allowLimbs,
  );

  ctx.save();
  ctx.translate(cx, cy + motion.bounceY);
  ctx.rotate(motion.sway);
  ctx.scale(scale * form.bodyScale * motion.squishX, scale * form.bodyScale * motion.squishY);

  if (form.silhouette === 'egg') {
    drawEgg(ctx, pal, animTime);
    ctx.restore();
    return;
  }

  drawAura(ctx, pal.glow, form.auraIntensity + (opts.moodGlow ?? 0));

  const mctx: MorphDrawContext = { ctx, traits, form, props, motion };
  const drawer = MORPH_DRAWERS[morphId] ?? drawChibiBlob;
  drawer(mctx);

  drawFace(ctx, traits, anim, motion.blink, opts.happiness ?? 50);
  if (traits.parts.horns > 0) drawHorns(ctx, pal, form.hornScale, traits.parts.horns);
  if (traits.parts.wings > 0) drawWings(ctx, pal, form.wingScale, motion.flap, traits.parts.wings);
  if (traits.parts.tail > 0) {
    drawTail(ctx, pal, form.tailScale, motion.wag, traits.bodyShape, traits.parts.tail);
  }
  drawPattern(ctx, traits.parts.pattern, pal, traits.archetype);

  ctx.restore();
}

export { computeCreatureMotion } from './animation';
