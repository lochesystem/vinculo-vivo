import type { DnaTraits } from '../../../core/types';
import { shade } from '../draw-utils';

export function drawWings(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  scale: number,
  flap: number,
  variant: number,
): void {
  if (variant <= 0) return;
  ctx.fillStyle = shade(pal.secondary, 8);
  ctx.globalAlpha = 0.88;
  const span = variant >= 2 ? 16 : 12;
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.quadraticCurveTo(-8 - span * scale, -10 + flap, -8 - span * 0.6 * scale, 2 + flap * 0.5);
  ctx.quadraticCurveTo(-12, 4, -8, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.quadraticCurveTo(8 + span * scale, -10 - flap, 8 + span * 0.6 * scale, 2 - flap * 0.5);
  ctx.quadraticCurveTo(12, 4, 8, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
