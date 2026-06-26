import type { FormPreset } from '../data/forms';

export interface EvolutionCinematic {
  active: boolean;
  phase: number;
  timer: number;
  fromForm: FormPreset | null;
  toForm: FormPreset | null;
  onComplete?: () => void;
}

export function createEvolutionCinematic(): EvolutionCinematic {
  return { active: false, phase: 0, timer: 0, fromForm: null, toForm: null };
}

export function startEvolution(
  cine: EvolutionCinematic,
  fromForm: FormPreset,
  toForm: FormPreset,
  onComplete: () => void,
): void {
  cine.active = true;
  cine.phase = 0;
  cine.timer = 0;
  cine.fromForm = fromForm;
  cine.toForm = toForm;
  cine.onComplete = onComplete;
}

export function updateEvolution(cine: EvolutionCinematic, dt: number): void {
  if (!cine.active) return;
  cine.timer += dt;
  if (cine.phase === 0 && cine.timer > 0.8) {
    cine.phase = 1;
    cine.timer = 0;
  } else if (cine.phase === 1 && cine.timer > 1.5) {
    cine.phase = 2;
    cine.timer = 0;
  } else if (cine.phase === 2 && cine.timer > 1.5) {
    cine.active = false;
    cine.fromForm = null;
    cine.toForm = null;
    cine.onComplete?.();
    cine.onComplete = undefined;
  }
}

/** Returns [oldAlpha, newAlpha] for silhouette crossfade during phase 1 */
export function getEvolutionMorphAlpha(cine: EvolutionCinematic): [number, number] {
  if (!cine.active || cine.phase !== 1) return [1, 0];
  const t = Math.min(1, cine.timer / 1.5);
  return [1 - t, t];
}

export function drawEvolutionOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cine: EvolutionCinematic,
  glowColor: string,
): void {
  if (!cine.active) return;

  ctx.save();
  if (cine.phase === 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, cine.timer / 0.8) * 0.7})`;
    ctx.fillRect(0, 0, w, h);
    drawDnaHelix(ctx, w / 2, h / 2, cine.timer * 4, glowColor);
  } else if (cine.phase === 1) {
    const flash = Math.sin(cine.timer * 6) * 0.15 + 0.25;
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0, 0, w, h);
    drawDnaHelix(ctx, w / 2, h / 2, cine.timer * 8, glowColor);
  } else {
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = Math.max(0, 1 - cine.timer / 1.5) * 0.6;
    ctx.fillRect(0, 0, w, h);
    ctx.font = '16px Silkscreen, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 1;
    ctx.fillText('EVOLUÇÃO!', w / 2, h / 2);
  }
  ctx.restore();
}

function drawDnaHelix(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = cy - 60 + i * 6;
    const x1 = cx + Math.sin(t + i * 0.5) * 20;
    const x2 = cx + Math.sin(t + i * 0.5 + Math.PI) * 20;
    ctx.fillStyle = color;
    ctx.fillRect(x1, y, 4, 4);
    ctx.fillRect(x2, y, 4, 4);
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }
}

export function drawLevelUpBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number): void {
  const r = 10 + frame * 3;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - frame / 20);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.restore();
}
