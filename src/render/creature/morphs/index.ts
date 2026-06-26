import type { DnaTraits } from '../../../core/types';
import type { FormPreset } from '../../../data/forms';
import type { CreatureMotion } from '../animation';
import type { BodyProportions } from '../types';
import { bodyGradient, drawSoftEllipse, glowGradient, shade } from '../draw-utils';

export interface MorphDrawContext {
  ctx: CanvasRenderingContext2D;
  traits: DnaTraits;
  form: FormPreset;
  props: BodyProportions;
  motion: CreatureMotion;
}

export function drawAura(ctx: CanvasRenderingContext2D, glow: string, intensity: number): void {
  ctx.save();
  ctx.globalAlpha = 0.18 * intensity;
  ctx.fillStyle = glowGradient(ctx, glow, 0, 0, 30);
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawChibiBlob({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  const r = 14 * form.bodyScale * props.bodyWidth;
  drawSoftEllipse(ctx, 0, 2, r, r * 0.92, bodyGradient(ctx, pal, 0, 2, r));
  drawSoftEllipse(ctx, 0, -10 * props.headSize, r * 0.72, r * 0.65, bodyGradient(ctx, pal, 0, -10, r * 0.7));
  ctx.fillStyle = shade(pal.primary, -15);
  ctx.beginPath();
  ctx.ellipse(0, 8, r * 0.5, r * 0.25, 0, 0, Math.PI);
  ctx.fill();
}

export function drawQuadrupedPup({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  const bw = 12 * form.bodyScale * props.bodyWidth;
  drawSoftEllipse(ctx, 0, 4, bw * 1.4, bw * 0.7, bodyGradient(ctx, pal, 0, 4, bw));
  drawSoftEllipse(ctx, -10, -6, bw * 0.55, bw * 0.5, bodyGradient(ctx, pal, -10, -6, bw * 0.5));
  const leg = 5 * props.limbLength;
  ctx.fillStyle = shade(pal.primary, -12);
  for (const x of [-10, -4, 4, 10]) {
    ctx.fillRect(x - 2, 8, 4, leg);
    ctx.beginPath();
    ctx.ellipse(x, 8 + leg, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawSerpentCoil({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  ctx.lineWidth = 10 * form.bodyScale;
  ctx.lineCap = 'round';
  ctx.strokeStyle = pal.primary;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.quadraticCurveTo(-18, -4, -6, -10);
  ctx.quadraticCurveTo(8, -14, 14, -2);
  ctx.quadraticCurveTo(16, 8, 4, 12);
  ctx.stroke();
  drawSoftEllipse(ctx, -6, -12, 8 * props.headSize, 7 * props.headSize, bodyGradient(ctx, pal, -6, -12, 8));
}

export function drawCanineFeral({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  const lean = props.postureLean * 20;
  ctx.save();
  ctx.rotate(lean);
  drawSoftEllipse(ctx, 0, 2, 14 * form.bodyScale, 10 * form.bodyScale, bodyGradient(ctx, pal, 0, 2, 14));
  drawSoftEllipse(ctx, 10, -8, 9 * props.headSize, 8 * props.headSize, bodyGradient(ctx, pal, 10, -8, 9));
  ctx.fillStyle = shade(pal.primary, -15);
  ctx.beginPath();
  ctx.moveTo(16, -12);
  ctx.lineTo(20, -6);
  ctx.lineTo(14, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -14);
  ctx.lineTo(2, -20);
  ctx.lineTo(8, -16);
  ctx.fill();
  const leg = 6 * props.limbLength;
  for (const x of [-8, -2, 4, 10]) {
    ctx.fillRect(x, 8, 3, leg);
  }
  ctx.restore();
}

export function drawHumanoidGuardian({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  drawSoftEllipse(ctx, 0, 6, 11 * form.bodyScale * props.bodyWidth, 16 * form.bodyScale, bodyGradient(ctx, pal, 0, 6, 14));
  drawSoftEllipse(ctx, 0, -12, 9 * props.headSize, 9 * props.headSize, bodyGradient(ctx, pal, 0, -12, 9));
  ctx.fillStyle = shade(pal.secondary, -5);
  ctx.fillRect(-14, -4, 5, 12 * props.limbLength);
  ctx.fillRect(9, -4, 5, 12 * props.limbLength);
  ctx.fillRect(-6, 18, 5, 8 * props.limbLength);
  ctx.fillRect(1, 18, 5, 8 * props.limbLength);
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, 0, 32, 4);
}

export function drawBeastWinged({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  drawSoftEllipse(ctx, 0, 4, 13 * form.bodyScale, 11 * form.bodyScale, bodyGradient(ctx, pal, 0, 4, 13));
  drawSoftEllipse(ctx, 0, -10, 8 * props.headSize, 8 * props.headSize, bodyGradient(ctx, pal, 0, -10, 8));
  ctx.fillStyle = shade(pal.primary, -18);
  for (const x of [-9, -3, 3, 9]) {
    ctx.fillRect(x, 10, 4, 7 * props.limbLength);
  }
}

export function drawEtherealMystic({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  ctx.globalAlpha = 0.92;
  drawSoftEllipse(ctx, 0, 0, 12 * form.bodyScale, 18 * form.bodyScale, bodyGradient(ctx, pal, 0, 0, 16));
  drawSoftEllipse(ctx, 0, -14, 7 * props.headSize, 8 * props.headSize, bodyGradient(ctx, pal, 0, -14, 8));
  ctx.strokeStyle = pal.glow;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 24, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawApexHybrid({ ctx, traits, form, props }: MorphDrawContext): void {
  const pal = traits.palette;
  drawSoftEllipse(ctx, 0, 6, 16 * form.bodyScale * props.bodyWidth, 18 * form.bodyScale, bodyGradient(ctx, pal, 0, 6, 18));
  drawSoftEllipse(ctx, 0, -14, 10 * props.headSize, 10 * props.headSize, bodyGradient(ctx, pal, 0, -14, 10));
  ctx.fillStyle = shade(pal.accent, -5);
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(-24, 8);
  ctx.lineTo(-14, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, -2);
  ctx.lineTo(24, 8);
  ctx.lineTo(14, 6);
  ctx.fill();
  for (const x of [-10, -3, 3, 10]) {
    ctx.fillRect(x, 20, 5, 9 * props.limbLength);
  }
  ctx.strokeStyle = pal.glow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, -20);
  ctx.lineTo(0, -28);
  ctx.lineTo(12, -20);
  ctx.stroke();
}

export function drawEgg(ctx: CanvasRenderingContext2D, pal: DnaTraits['palette'], animTime: number): void {
  const pulse = 1 + Math.sin(animTime * Math.PI * 1.2) * 0.04;
  drawSoftEllipse(ctx, 0, 4, 14 * pulse, 18 * pulse, bodyGradient(ctx, pal, 0, 4, 18));
  ctx.strokeStyle = pal.glow;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 0.35 + Math.sin(animTime * Math.PI * 1.5) * 0.15;
  drawSoftEllipse(ctx, 0, 4, 10, 14, glowGradient(ctx, pal.glow, 0, 4, 14));
  ctx.globalAlpha = 1;
  if (animTime > 0.5) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(0, 0);
    ctx.lineTo(6, -4);
    if (animTime > 1) {
      ctx.moveTo(-2, 2);
      ctx.lineTo(4, 8);
    }
    ctx.stroke();
  }
}
