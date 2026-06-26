import { mulberry32 } from '../core/rng';
import { applyDayPhase, dayLightness, getBiomePalette, type BiomePalette } from '../data/biome-palettes';

const BLOCK = 2;

function hillY(
  col: number,
  cols: number,
  h: number,
  layer: number,
  seed: number,
): number {
  const t = col / cols;
  const wave1 = Math.sin(t * Math.PI * 2 * (1.2 + layer * 0.4) + layer * 1.7) * h * 0.07;
  const wave2 = Math.sin(t * Math.PI * 2 * (2.3 + layer * 0.2) + seed * 0.01) * h * 0.03;
  const base = h * (0.38 + layer * 0.07);
  const stepped = Math.floor((wave1 + wave2) / BLOCK) * BLOCK;
  return base + stepped;
}

function pickGrassColor(pal: BiomePalette, rng: () => number, accent?: string): string {
  const r = rng();
  if (accent && r > 0.92) return accent;
  if (r > 0.55) return pal.grassHi;
  if (r > 0.25) return pal.grassMid;
  return pal.grassLo;
}

export function drawPixelHabitat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  biome: string,
  dayPhase: number,
  seed: number,
  time = 0,
): void {
  const base = getBiomePalette(biome);
  const pal = applyDayPhase(base, dayPhase);
  const light = dayLightness(dayPhase);
  const groundY = Math.floor(h * 0.72);
  const cols = Math.ceil(w / BLOCK);
  const rows = Math.ceil(h / BLOCK);
  const rng = mulberry32(seed ^ 0x5a117af);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * BLOCK;
      const py = row * BLOCK;
      if (px >= w || py >= h) continue;

      let color: string;

      if (py < h * 0.42) {
        const dither = ((col + row) & 2) === 0;
        color = dither ? pal.sky : pal.skyAlt;
      } else {
        const farY = hillY(col, cols, h, 0, seed);
        const midY = hillY(col, cols, h, 1, seed + 17);
        const nearY = hillY(col, cols, h, 2, seed + 41);

        if (py < farY) {
          const dither = (col & 1) === 0;
          color = dither ? pal.sky : pal.skyAlt;
        } else if (py < midY) {
          color = pal.hillFar;
        } else if (py < nearY) {
          color = pal.hillMid;
        } else if (py < groundY - BLOCK * 4) {
          color = pal.hillNear;
        } else if (py < groundY) {
          color = pickGrassColor(pal, rng, pal.accent);
        } else if (py < groundY + BLOCK * 2) {
          color = pickGrassColor(pal, rng, pal.accent);
        } else {
          color = pal.ground;
        }
      }

      ctx.fillStyle = color;
      ctx.fillRect(px, py, BLOCK, BLOCK);
    }
  }

  if (light > 0.45) {
    drawPixelClouds(ctx, w, h, time, light);
  }

  if (light < 0.55) {
    drawPixelStars(ctx, w, h, 1 - light);
  }

  ctx.restore();
}

function drawPixelStars(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 40; i++) {
    const x = (i * 137) % w;
    const y = (i * 89) % Math.floor(h * 0.42);
    const s = (i % 2) + 1;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function drawPixelClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  time: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(((time * 12 + i * 90) % (w + 60)) - 30);
    const y = 16 + i * 22;
    ctx.fillRect(x, y, 24, 4);
    ctx.fillRect(x + 6, y - 4, 14, 4);
    ctx.fillRect(x + 12, y + 4, 10, 3);
  }
  ctx.restore();
}
