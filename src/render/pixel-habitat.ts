import { mulberry32, clamp } from '../core/rng';
import { applyDayPhase, dayLightness, getBiomePalette, type BiomePalette } from '../data/biome-palettes';

const BLOCK = 2;
const CLOUD_CELL = 4;

interface Cloud {
  layer: 0 | 1 | 2;
  baseX: number;
  baseY: number;
  template: number;
  speed: number;
  phase: number;
  wisp: boolean;
}

/** Block cell coords [col, row] — drawn at CLOUD_CELL px per cell */
const CLOUD_TEMPLATES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  // megaCumulus (~128px wide)
  [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3], [19, 3], [20, 3], [21, 3], [22, 3], [23, 3], [24, 3], [25, 3], [26, 3], [27, 3], [28, 3], [29, 3], [30, 3], [31, 3],
   [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2], [18, 2], [19, 2], [20, 2], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [26, 2], [27, 2], [28, 2], [29, 2],
   [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1], [19, 1], [20, 1], [21, 1], [22, 1], [23, 1], [24, 1], [25, 1],
   [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0]],
  // stormStack (~96px tall tower)
  [[4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0],
   [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1],
   [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2],
   [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3],
   [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4],
   [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5]],
  // anvilSpread (~120px wide wing)
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2], [18, 2], [19, 2], [20, 2], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [26, 2], [27, 2], [28, 2], [29, 2],
   [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1], [19, 1], [20, 1], [21, 1], [22, 1], [23, 1], [24, 1], [25, 1],
   [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0]],
  // wisp A (distant small)
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
   [1, 0], [2, 0], [3, 0], [4, 0]],
  // wisp B
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
   [2, 1], [3, 1], [4, 1]],
];

const LAYER_SPEED = [2, 4, 7] as const;
const LAYER_ALPHA = [0.28, 0.38, 0.5] as const;
const LAYER_FACTOR = [0.5, 0.85, 1.2] as const;

export function hillY(
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

/** Pet foot Y — follows near-hill terrain with visible 8–16px variation */
export function sampleGroundY(x: number, w: number, h: number, seed: number): number {
  const col = clamp(Math.floor(x / BLOCK), 0, Math.ceil(w / BLOCK) - 1);
  const cols = Math.ceil(w / BLOCK);
  const nearY = hillY(col, cols, h, 2, seed + 41);
  const groundLine = h * 0.72;
  const basePetY = h * 0.62;
  const terrainOffset = (nearY - groundLine + BLOCK * 4) * 0.38;
  return basePetY + clamp(terrainOffset, -16, 16);
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

  for (let i = 0; i < 3; i++) {
    const layer = (i % 3) as 0 | 1 | 2;
    clouds.push({
      layer,
      baseX: rng() * w * 0.8,
      baseY: 6 + layer * 14 + Math.floor(rng() * (h * 0.1)),
      template: i % 3,
      speed: LAYER_SPEED[layer] * (0.85 + rng() * 0.2),
      phase: rng() * Math.PI * 2,
      wisp: false,
    });
  }

  for (let i = 0; i < 2; i++) {
    clouds.push({
      layer: 0,
      baseX: rng() * w,
      baseY: 18 + Math.floor(rng() * (h * 0.08)),
      template: 3 + (i % 2),
      speed: LAYER_SPEED[0] * 0.7,
      phase: rng() * Math.PI * 2,
      wisp: true,
    });
  }

  return clouds;
}

function drawCloudHero(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  templateIdx: number,
  wisp: boolean,
): void {
  const cells = CLOUD_TEMPLATES[templateIdx % CLOUD_TEMPLATES.length];
  const minRow = Math.min(...cells.map((c) => c[1]));
  const topCols = new Set(cells.filter((c) => c[1] === minRow).map((c) => c[0]));
  const cell = wisp ? CLOUD_CELL * 0.5 : CLOUD_CELL;

  ctx.fillStyle = '#90A4AE';
  for (const [col, row] of cells) {
    ctx.fillRect(
      Math.floor(originX + col * cell + 3),
      Math.floor(originY + row * cell + 3),
      Math.ceil(cell),
      Math.ceil(cell),
    );
  }

  for (const [col, row] of cells) {
    ctx.fillStyle = topCols.has(col) && row === minRow ? '#E8EAF6' : '#FFFFFF';
    ctx.fillRect(
      Math.floor(originX + col * cell),
      Math.floor(originY + row * cell),
      Math.ceil(cell),
      Math.ceil(cell),
    );
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

  const margin = 180;
  ctx.save();

  for (const cloud of clouds) {
    const layerAlpha = (cloud.wisp ? LAYER_ALPHA[0] * 0.55 : LAYER_ALPHA[cloud.layer]) * clamp(light, 0.2, 1);
    ctx.globalAlpha = layerAlpha;
    const xBase =
      ((cloud.baseX + time * cloud.speed * LAYER_FACTOR[cloud.layer]) % (w + margin)) - margin;
    const yBase = cloud.baseY + Math.sin(time * 0.35 + cloud.phase) * 4;
    drawCloudHero(ctx, Math.floor(xBase), Math.floor(yBase), cloud.template, cloud.wisp);
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
