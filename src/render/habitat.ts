import { getArchetypeMeta } from '../core/dna';
import type { ArchetypeId } from '../core/types';
import { DAY_CYCLE_MS } from '../core/types';

export interface HabitatState {
  time: number;
  dayPhase: number;
}

export function createHabitatState(): HabitatState {
  return { time: 0, dayPhase: 0 };
}

export function updateHabitat(state: HabitatState, dt: number): void {
  state.time += dt;
  state.dayPhase = ((state.time * 1000) % DAY_CYCLE_MS) / DAY_CYCLE_MS;
}

const BIOME_SKIES: Record<string, [string, string, string]> = {
  volcano: ['#1a0810', '#4a1520', '#ff6622'],
  ocean: ['#0a1428', '#1a3050', '#4488cc'],
  forest: ['#0a1810', '#1a3828', '#55aa66'],
  void: ['#080810', '#1a1030', '#6633aa'],
  storm: ['#101018', '#283048', '#aaccff'],
  sky: ['#102040', '#4080c0', '#88ccff'],
  canyon: ['#181008', '#503820', '#cc8844'],
  crystal: ['#100818', '#301848', '#cc88ff'],
  tundra: ['#101820', '#284058', '#aaccdd'],
  garden: ['#101018', '#283828', '#ff88aa'],
};

export function drawHabitat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  archetype: ArchetypeId,
  state: HabitatState,
): void {
  const meta = getArchetypeMeta(archetype);
  const sky = BIOME_SKIES[meta.biome] ?? BIOME_SKIES.forest;
  const night = state.dayPhase > 0.75 || state.dayPhase < 0.2;

  let [top, mid, bottom] = sky;
  if (night) {
    top = '#050508';
    mid = '#0a0a18';
    bottom = '#151528';
  }

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, top);
  grad.addColorStop(0.5, mid);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawStars(ctx, w, h, night ? 1 : 0.15);
  drawClouds(ctx, w, h, state.time, night ? 0.3 : 0.7);
  drawMidground(ctx, w, h, meta.biome, state);
  drawForeground(ctx, w, h, meta.biome);
  drawScanlines(ctx, w, h, 0.04);
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 80; i++) {
    const x = (i * 137) % w;
    const y = (i * 89) % Math.max(1, Math.floor(h * 0.5));
    ctx.fillRect(x, y, (i % 3) + 1, (i % 3) + 1);
  }
  ctx.restore();
}

function drawClouds(ctx: CanvasRenderingContext2D, w: number, _h: number, t: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 5; i++) {
    const x = ((t * 20 + i * 180) % (w + 100)) - 50;
    const y = 30 + i * 25;
    ctx.fillRect(x, y, 40, 8);
    ctx.fillRect(x + 10, y - 6, 24, 8);
  }
  ctx.restore();
}

function drawMidground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  biome: string,
  state: HabitatState,
): void {
  const groundY = h * 0.72;
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, groundY, w, h - groundY);

  if (biome === 'volcano') {
    ctx.fillStyle = '#331108';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, groundY);
    ctx.lineTo(w * 0.35, groundY - 80);
    ctx.lineTo(w * 0.5, groundY);
    ctx.fill();
    ctx.fillStyle = '#ff4400';
    ctx.globalAlpha = 0.5 + Math.sin(state.time * 3) * 0.2;
    ctx.fillRect(w * 0.33, groundY - 85, 12, 20);
    ctx.globalAlpha = 1;
  } else if (biome === 'ocean') {
    ctx.fillStyle = '#3388aa';
    for (let i = 0; i < w; i += 30) {
      const wave = Math.sin(state.time * 2 + i * 0.05) * 4;
      ctx.fillRect(i, groundY + 20 + wave, 20, 3);
    }
  } else if (biome === 'crystal') {
    for (let i = 0; i < 6; i++) {
      const x = w * (0.1 + i * 0.15);
      ctx.fillStyle = `hsl(${280 + i * 15}, 60%, ${40 + i * 5}%)`;
      ctx.fillRect(x, groundY - 40, 12, 40);
    }
  } else {
    for (let i = 0; i < 8; i++) {
      const x = i * (w / 8);
      ctx.fillStyle = `hsl(${120 + i * 8}, 40%, ${18 + i}%)`;
      ctx.fillRect(x, groundY - 30, 20, 30);
    }
  }
}

function drawForeground(ctx: CanvasRenderingContext2D, w: number, h: number, biome: string): void {
  const groundY = h * 0.72;
  ctx.fillStyle = biome === 'volcano' ? '#2a1810' : '#1a2818';
  ctx.fillRect(0, groundY, w, 8);
  ctx.fillStyle = '#243020';
  for (let x = 0; x < w; x += 4) {
    ctx.fillRect(x, groundY - (4 + (x % 7)), 3, 4 + (x % 7));
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  ctx.restore();
}
