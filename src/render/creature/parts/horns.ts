import type { DnaTraits } from '../../../core/types';
import { shade } from '../draw-utils';

export function drawHorns(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  scale: number,
  variant: number,
): void {
  if (variant <= 0) return;
  ctx.fillStyle = shade(pal.accent, -10);
  const h = 7 * scale;
  if (variant % 2 === 0) {
    ctx.beginPath();
    ctx.moveTo(-9, -14);
    ctx.lineTo(-11, -14 - h);
    ctx.lineTo(-7, -14 - h * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, -14);
    ctx.lineTo(11, -14 - h);
    ctx.lineTo(7, -14 - h * 0.7);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-12, -12);
    ctx.quadraticCurveTo(-14, -12 - h, -10, -14 - h);
    ctx.lineTo(-8, -12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -12);
    ctx.quadraticCurveTo(14, -12 - h, 10, -14 - h);
    ctx.lineTo(8, -12);
    ctx.fill();
  }
}
