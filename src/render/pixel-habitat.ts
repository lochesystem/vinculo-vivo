import { mulberry32, clamp } from '../core/rng';
import { applyDayPhase, dayLightness, getBiomePalette, type BiomePalette } from '../data/biome-palettes';

const BLOCK = 2;

interface Cloud {
  layer: 0 | 1 | 2;
  baseX: number;
  baseY: number;
  template: number;
  speed: number;
  phase: number;
}

/** Block cell coords [col, row] relative to cloud origin, 2px per cell */
const CLOUD_TEMPLATES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  // wide cumulus A (~56px)
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
   [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
   [2, 0], [3, 0], [4, 0]],
  // cumulus B (~48px)
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
   [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
   [1, 0], [2, 0], [3, 0], [4, 0]],
  // cumulus C (~40px)
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
   [1, 1], [2, 1], [3, 1],
   [2, 0], [3, 0]],
  // puffy D
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
   [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
   [2, 2], [3, 2], [4, 2]],
];

const LAYER_SPEED = [3, 6, 10] as const;
const LAYER_ALPHA = [0.35, 0.45, 0.55] as const;
const LAYER_FACTOR = [0.6, 1, 1.4] as const;

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

function buildClouds(seed: number, w: number, h: number): Cloud[] {
  const rng = mulberry32(seed ^ 0xc10d07);
  const clouds: Cloud[] = [];
  for (let i = 0; i < 5; i++) {
    const layer = (i % 3) as 0 | 1 | 2;
    clouds.push({
      layer,
      baseX: rng() * w,
      baseY: 10 + layer * 12 + Math.floor(rng() * (h * 0.14)),
      template: Math.floor(rng() * CLOUD_TEMPLATES.length),
      speed: LAYER_SPEED[layer] * (0.9 + rng() * 0.25),
      phase: rng() * Math.PI * 2,
    });
  }
  return clouds;
}

function drawCloudBlocks(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  templateIdx: number,
): void {
  const cells = CLOUD_TEMPLATES[templateIdx % CLOUD_TEMPLATES.length];
  for (const [col, row] of cells) {
    ctx.fillRect(originX + col * BLOCK, originY + row * BLOCK, BLOCK, BLOCK);
  }
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

function drawPixelSun(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dayPhase: number,
  light: number,
): void {
  if (light <= 0.25) return;

  const t = clamp((dayPhase - 0.15) / 0.65, 0, 1);
  const cx = Math.floor(w * (0.08 + t * 0.78));
  const cy = Math.floor(h * (0.1 + Math.sin(t * Math.PI) * 0.12));
  const alpha = clamp((light - 0.25) / 0.75, 0, 1) * 0.95;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFD54F';
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (dx * dx + dy * dy <= 10) {
        ctx.fillRect(cx + dx * BLOCK, cy + dy * BLOCK, BLOCK, BLOCK);
      }
    }
  }
  ctx.fillStyle = '#FFF176';
  ctx.fillRect(cx - BLOCK, cy - BLOCK, BLOCK, BLOCK);
  ctx.fillRect(cx, cy - BLOCK, BLOCK, BLOCK);
  ctx.restore();
}

function drawPixelMoon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dayPhase: number,
  light: number,
): void {
  if (light >= 0.65) return;

  let t: number;
  if (dayPhase > 0.75) {
    t = (dayPhase - 0.75) / 0.25;
  } else if (dayPhase < 0.2) {
    t = 0.5 + (dayPhase / 0.2) * 0.5;
  } else {
    t = 1 - (dayPhase - 0.2) / 0.55;
  }
  t = clamp(t, 0, 1);

  const cx = Math.floor(w * (0.82 - t * 0.55));
  const cy = Math.floor(h * (0.08 + Math.sin(t * Math.PI) * 0.1));
  const alpha = clamp((0.65 - light) / 0.65, 0, 1) * 0.9;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#CFD8DC';
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy <= 6) {
        ctx.fillRect(cx + dx * BLOCK, cy + dy * BLOCK, BLOCK, BLOCK);
      }
    }
  }
  ctx.fillStyle = '#90A4AE';
  ctx.fillRect(cx + BLOCK, cy, BLOCK, BLOCK);
  ctx.fillRect(cx, cy + BLOCK, BLOCK, BLOCK);
  ctx.restore();
}

function drawOrganicClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  clouds: Cloud[],
  time: number,
  light: number,
): void {
  if (light <= 0.2) return;

  const margin = 100;
  ctx.save();
  ctx.fillStyle = '#FFFFFF';

  for (const cloud of clouds) {
    const layerAlpha = LAYER_ALPHA[cloud.layer] * clamp(light, 0.2, 1);
    ctx.globalAlpha = layerAlpha;
    const xBase =
      ((cloud.baseX + time * cloud.speed * LAYER_FACTOR[cloud.layer]) % (w + margin)) - margin;
    const yBase = cloud.baseY + Math.sin(time * 0.4 + cloud.phase) * 3;
    drawCloudBlocks(ctx, Math.floor(xBase), Math.floor(yBase), cloud.template);
  }

  ctx.restore();
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
  const clouds = buildClouds(seed, w, h);

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

  if (light < 0.55) {
    drawPixelStars(ctx, w, h, 1 - light);
  }

  drawPixelSun(ctx, w, h, dayPhase, light);
  drawPixelMoon(ctx, w, h, dayPhase, light);
  drawOrganicClouds(ctx, w, h, clouds, time, light);

  ctx.restore();
}
