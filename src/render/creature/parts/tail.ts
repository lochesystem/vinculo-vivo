import type { BodyShape } from '../../../core/types';
import type { DnaTraits } from '../../../core/types';
import { shade } from '../draw-utils';

export function drawTail(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  _scale: number,
  wag: number,
  bodyShape: BodyShape,
  variant: number,
): void {
  if (variant <= 0) return;
  ctx.fillStyle = shade(pal.primary, -10);
  ctx.strokeStyle = shade(pal.primary, -18);
  ctx.lineWidth = 1.5;

  if (bodyShape === 'serpent' || variant >= 3) {
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(6 + wag, 18, 4 + wag * 0.5, 28);
    ctx.quadraticCurveTo(2 + wag, 34, -2 + wag * 0.3, 36);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-2 + wag * 0.3, 36, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.quadraticCurveTo(14 + wag, 6, 18 + wag, 10);
    ctx.quadraticCurveTo(22 + wag * 0.5, 12, 20 + wag, 14);
    ctx.lineTo(6, 10);
    ctx.fill();
  }
}
