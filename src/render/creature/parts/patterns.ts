import type { DnaTraits } from '../../../core/types';
import { getArchetypeMeta } from '../../../core/dna';

export function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: number,
  pal: DnaTraits['palette'],
  archetype: DnaTraits['archetype'],
): void {
  const meta = getArchetypeMeta(archetype);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = pal.accent;

  if (pattern % 8 === 0) {
    ctx.beginPath();
    ctx.arc(-4, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(4, 2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pattern % 8 === 1) {
    ctx.fillRect(-8, -2, 16, 2);
    ctx.fillRect(-1, -8, 2, 14);
  } else if (pattern % 8 === 2) {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * 5, 4 + (i % 2) * 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (meta.element === 'fire' || meta.element === 'light') {
    ctx.fillStyle = meta.element === 'fire' ? '#ffaa44' : '#ffffaa';
    ctx.beginPath();
    ctx.moveTo(-2, 8);
    ctx.lineTo(0, 14);
    ctx.lineTo(2, 8);
    ctx.fill();
  } else if (meta.element === 'water') {
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.quadraticCurveTo(-5, 10, 0, 6);
    ctx.quadraticCurveTo(5, 2, 10, 6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-7, -6, 3, 0, Math.PI * 2);
    ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
