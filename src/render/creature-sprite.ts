import type { DnaTraits } from '../core/types';
import type { FormPreset } from '../data/forms';
import { getArchetypeMeta } from '../core/dna';

export type AnimState = 'idle' | 'eat' | 'play' | 'sleep' | 'evolve' | 'happy' | 'hurt';

export interface DrawCreatureOptions {
  traits: DnaTraits;
  form: FormPreset;
  anim: AnimState;
  frame: number;
  moodGlow?: number;
}

function shade(hslStr: string, dl: number): string {
  const m = hslStr.match(/([\d.]+)/g);
  if (!m) return hslStr;
  const h = parseFloat(m[0]);
  const s = parseFloat(m[1]);
  const l = Math.max(0, Math.min(100, parseFloat(m[2]) + dl));
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function drawCreaturePixel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  opts: DrawCreatureOptions,
): void {
  const { traits, form, anim, frame } = opts;
  const pal = traits.palette;
  const meta = getArchetypeMeta(traits.archetype);
  const bounce =
    anim === 'sleep'
      ? 0
      : Math.sin((frame / 8) * Math.PI * 2) * 2 * (anim === 'play' ? 1.5 : 1);
  const squish = anim === 'eat' ? Math.sin((frame / 3) * Math.PI) * 0.08 : 0;

  ctx.save();
  ctx.translate(cx, cy + bounce);
  ctx.scale(scale * form.bodyScale * (1 + squish), scale * form.bodyScale * (1 - squish * 0.5));

  if (form.silhouette === 'egg') {
    drawEgg(ctx, pal.primary, pal.glow, frame);
    ctx.restore();
    return;
  }

  drawAura(ctx, pal.glow, form.auraIntensity + (opts.moodGlow ?? 0));
  drawBody(ctx, traits, form, pal);
  drawFace(ctx, traits, pal, anim, frame);
  if (traits.parts.horns > 0) drawHorns(ctx, pal, form.hornScale, traits.parts.horns);
  if (traits.parts.wings > 0) drawWings(ctx, pal, form.wingScale, frame, traits.parts.wings);
  if (traits.parts.tail > 0) drawTail(ctx, pal, form.tailScale, frame, traits.bodyShape);
  drawPattern(ctx, traits.parts.pattern, pal, meta.element);

  ctx.restore();
}

function drawEgg(ctx: CanvasRenderingContext2D, fill: string, glow: string, frame: number): void {
  const pulse = 1 + Math.sin(frame * 0.15) * 0.04;
  ctx.fillStyle = shade(fill, -15);
  ctx.beginPath();
  ctx.ellipse(0, 4, 14 * pulse, 18 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = glow;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.3 + Math.sin(frame * 0.2) * 0.2;
  ctx.beginPath();
  ctx.ellipse(0, 4, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  if (frame > 10) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(0, 0);
    ctx.lineTo(6, -4);
    if (frame > 20) {
      ctx.moveTo(-2, 2);
      ctx.lineTo(4, 8);
    }
    ctx.stroke();
  }
}

function drawAura(ctx: CanvasRenderingContext2D, glow: string, intensity: number): void {
  ctx.save();
  ctx.globalAlpha = 0.15 * intensity;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  traits: DnaTraits,
  form: FormPreset,
  pal: DnaTraits['palette'],
): void {
  ctx.fillStyle = pal.primary;
  const shape = traits.bodyShape;
  if (shape === 'round' || form.silhouette === 'baby') {
    ctx.fillRect(-12, -8, 24, 22);
    ctx.fillRect(-10, -14, 20, 8);
  } else if (shape === 'slim') {
    ctx.fillRect(-8, -10, 16, 26);
    ctx.fillRect(-6, -16, 12, 8);
  } else if (shape === 'bulky') {
    ctx.fillRect(-16, -6, 32, 24);
    ctx.fillRect(-12, -14, 24, 10);
  } else if (shape === 'winged') {
    ctx.fillRect(-10, -8, 20, 20);
    ctx.fillRect(-8, -14, 16, 8);
  } else if (shape === 'quadruped') {
    ctx.fillRect(-14, -4, 28, 14);
    ctx.fillRect(-10, -12, 18, 10);
    ctx.fillRect(-14, 8, 6, 8);
    ctx.fillRect(8, 8, 6, 8);
  } else {
    ctx.fillRect(-10, -6, 20, 28);
    ctx.fillRect(-8, -14, 14, 10);
  }
  ctx.fillStyle = shade(pal.primary, -12);
  ctx.fillRect(-8, 4, 16, 6);
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  traits: DnaTraits,
  pal: DnaTraits['palette'],
  anim: AnimState,
  frame: number,
): void {
  const eyeY = -6;
  const eyeStyle = traits.parts.eyes % 3;
  ctx.fillStyle = '#fff';
  if (eyeStyle === 0) {
    ctx.fillRect(-8, eyeY, 5, 5);
    ctx.fillRect(3, eyeY, 5, 5);
  } else if (eyeStyle === 1) {
    ctx.fillRect(-7, eyeY + 1, 4, 3);
    ctx.fillRect(4, eyeY + 1, 4, 3);
  } else {
    ctx.fillRect(-8, eyeY, 6, 6);
    ctx.fillRect(2, eyeY, 6, 6);
  }
  ctx.fillStyle = pal.eye;
  const blink = anim === 'sleep' || frame % 120 > 118;
  if (!blink) {
    ctx.fillRect(-6, eyeY + 1, 2, 2);
    ctx.fillRect(5, eyeY + 1, 2, 2);
  }
  ctx.fillStyle = shade(pal.secondary, -20);
  if (anim === 'happy' || anim === 'play') {
    ctx.fillRect(-4, 2, 8, 2);
    ctx.fillRect(-5, 3, 2, 2);
    ctx.fillRect(3, 3, 2, 2);
  } else if (anim === 'hurt') {
    ctx.fillRect(-3, 4, 6, 1);
  } else {
    ctx.fillRect(-2, 3, 4, 1);
  }
}

function drawHorns(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  scale: number,
  variant: number,
): void {
  ctx.fillStyle = shade(pal.accent, -10);
  const h = 6 * scale;
  if (variant % 2 === 0) {
    ctx.fillRect(-10, -18, 4, h);
    ctx.fillRect(6, -18, 4, h);
  } else {
    ctx.fillRect(-12, -16, 3, h);
    ctx.fillRect(-6, -20, 3, h + 2);
    ctx.fillRect(4, -20, 3, h + 2);
    ctx.fillRect(9, -16, 3, h);
  }
}

function drawWings(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  scale: number,
  frame: number,
  variant: number,
): void {
  const flap = Math.sin((frame / 6) * Math.PI * 2) * 3 * scale;
  ctx.fillStyle = shade(pal.secondary, 5);
  ctx.globalAlpha = 0.85;
  if (variant >= 2) {
    ctx.fillRect(-26, -8 + flap, 14, 10);
    ctx.fillRect(12, -8 - flap, 14, 10);
  } else {
    ctx.fillRect(-22, -4 + flap, 12, 8);
    ctx.fillRect(10, -4 - flap, 12, 8);
  }
  ctx.globalAlpha = 1;
}

function drawTail(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  scale: number,
  frame: number,
  bodyShape: string,
): void {
  const wag = Math.sin((frame / 10) * Math.PI * 2) * 4;
  ctx.fillStyle = shade(pal.primary, -8);
  if (bodyShape === 'serpent') {
    ctx.fillRect(-4 + wag, 14, 8, 16);
    ctx.fillRect(-6 + wag, 28, 6, 8);
  } else {
    ctx.fillRect(8 + wag, 8, 10 * scale, 4);
    ctx.fillRect(16 + wag, 6, 6 * scale, 4);
  }
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: number,
  pal: DnaTraits['palette'],
  element: string,
): void {
  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.6;
  if (pattern % 4 === 0) {
    ctx.fillRect(-4, -2, 3, 3);
    ctx.fillRect(2, 0, 3, 3);
  } else if (pattern % 4 === 1) {
    ctx.fillRect(-6, 0, 12, 2);
    ctx.fillRect(0, -4, 2, 12);
  } else if (element === 'fire') {
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-2, 10, 2, 4);
    ctx.fillRect(1, 12, 2, 3);
  } else {
    ctx.fillRect(-8, -10, 4, 4);
    ctx.fillRect(5, -8, 4, 4);
  }
  ctx.globalAlpha = 1;
}
