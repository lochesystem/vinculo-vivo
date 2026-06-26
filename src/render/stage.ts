/** Logical pixel dimensions for the pet habitat canvas */
export const STAGE_LOGICAL_W = 360;
export const STAGE_LOGICAL_H = 270;

export function resizeStageCanvas(canvas: HTMLCanvasElement): void {
  const parent = canvas.parentElement;
  if (!parent) return;

  const pw = parent.clientWidth;
  const ph = parent.clientHeight;
  if (pw <= 0 || ph <= 0) return;

  const scale = Math.max(1, Math.floor(Math.min(pw / STAGE_LOGICAL_W, ph / STAGE_LOGICAL_H)));
  const cssW = STAGE_LOGICAL_W * scale;
  const cssH = STAGE_LOGICAL_H * scale;

  canvas.width = STAGE_LOGICAL_W;
  canvas.height = STAGE_LOGICAL_H;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.imageRendering = 'pixelated';
}

/** Creature draw scale derived from stage logical size */
export function creatureDrawScale(): number {
  return STAGE_LOGICAL_H / 68;
}
