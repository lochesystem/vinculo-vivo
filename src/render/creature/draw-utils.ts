import type { DnaTraits } from '../../core/types';

export function shade(hslStr: string, dl: number): string {
  const m = hslStr.match(/([\d.]+)/g);
  if (!m) return hslStr;
  const h = parseFloat(m[0]);
  const s = parseFloat(m[1]);
  const l = Math.max(0, Math.min(100, parseFloat(m[2]) + dl));
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function bodyGradient(
  ctx: CanvasRenderingContext2D,
  pal: DnaTraits['palette'],
  cx: number,
  cy: number,
  r: number,
): CanvasGradient {
  const g = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r);
  g.addColorStop(0, shade(pal.primary, 18));
  g.addColorStop(0.55, pal.primary);
  g.addColorStop(1, shade(pal.primary, -22));
  return g;
}

export function glowGradient(
  ctx: CanvasRenderingContext2D,
  color: string,
  cx: number,
  cy: number,
  r: number,
): CanvasGradient {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  return g;
}

export function drawSoftEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
