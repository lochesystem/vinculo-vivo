import type { FaceId } from '../../../data/chassis';
import type { AnimState } from '../types';
import type { PixelGrid } from '../pixel-grid';

export interface FaceDrawResult {
  accentPixels: Array<[number, number]>;
}

function onBody(grid: PixelGrid, x: number, y: number): boolean {
  return grid.get(x, y) !== 0;
}

function snapToBody(grid: PixelGrid, x: number, y: number): [number, number] {
  if (onBody(grid, x, y)) return [x, y];
  for (let r = 1; r <= 3; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (onBody(grid, px, py)) return [px, py];
      }
    }
  }
  return [x, y];
}

export function drawFaceOnGrid(
  grid: PixelGrid,
  faceId: FaceId,
  ax: number,
  ay: number,
  anim: AnimState,
  blink: boolean,
): FaceDrawResult {
  const accent: Array<[number, number]> = [];

  if (anim === 'sleep' || blink) {
    const [lx, ly] = snapToBody(grid, ax - 4, ay);
    const [rx, ry] = snapToBody(grid, ax + 4, ay);
    grid.set(lx, ly, 2);
    grid.set(lx + 1, ly, 2);
    grid.set(rx, ry, 2);
    grid.set(rx + 1, ry, 2);
    return { accentPixels: accent };
  }

  switch (faceId) {
    case 'dot_classic':
      accent.push(snapToBody(grid, ax - 3, ay), snapToBody(grid, ax + 3, ay));
      grid.set(...snapToBody(grid, ax - 1, ay + 4), 2);
      grid.set(...snapToBody(grid, ax, ay + 4), 2);
      grid.set(...snapToBody(grid, ax + 1, ay + 4), 2);
      break;
    case 'beady_wide':
      accent.push(snapToBody(grid, ax - 5, ay), snapToBody(grid, ax + 5, ay));
      grid.set(...snapToBody(grid, ax - 2, ay + 5), 2);
      grid.set(...snapToBody(grid, ax + 2, ay + 5), 2);
      break;
    case 'sleepy_slit':
      grid.set(...snapToBody(grid, ax - 3, ay + 1), 2);
      grid.set(...snapToBody(grid, ax + 3, ay + 1), 2);
      break;
    case 'beak_mouth':
      accent.push(snapToBody(grid, ax - 2, ay));
      grid.set(...snapToBody(grid, ax + 2, ay + 2), 2);
      grid.set(...snapToBody(grid, ax + 3, ay + 3), 2);
      break;
    case 'cyclops':
      accent.push(snapToBody(grid, ax, ay));
      grid.set(...snapToBody(grid, ax - 1, ay + 4), 2);
      grid.set(...snapToBody(grid, ax + 1, ay + 4), 2);
      break;
    case 'star_eyes':
      accent.push(
        snapToBody(grid, ax - 4, ay),
        snapToBody(grid, ax + 4, ay),
        snapToBody(grid, ax - 3, ay - 1),
        snapToBody(grid, ax + 3, ay - 1),
      );
      break;
    case 'grin_toothy':
      accent.push(snapToBody(grid, ax - 3, ay), snapToBody(grid, ax + 3, ay));
      for (let i = -3; i <= 3; i++) {
        grid.set(...snapToBody(grid, ax + i, ay + 5), 2);
      }
      break;
    case 'tiny_o':
      accent.push(snapToBody(grid, ax - 2, ay), snapToBody(grid, ax + 2, ay));
      grid.set(...snapToBody(grid, ax, ay + 4), 2);
      grid.set(...snapToBody(grid, ax + 1, ay + 4), 2);
      grid.set(...snapToBody(grid, ax, ay + 5), 2);
      grid.set(...snapToBody(grid, ax + 1, ay + 5), 2);
      break;
    case 'angry_brow':
      grid.set(...snapToBody(grid, ax - 4, ay - 1), 2);
      grid.set(...snapToBody(grid, ax + 4, ay - 1), 2);
      accent.push(snapToBody(grid, ax - 2, ay + 1), snapToBody(grid, ax + 2, ay + 1));
      break;
    case 'mask_slash':
      for (let i = -4; i <= 4; i++) grid.set(...snapToBody(grid, ax + i, ay + 1), 2);
      accent.push(snapToBody(grid, ax - 1, ay + 3), snapToBody(grid, ax + 1, ay + 3));
      break;
    default:
      accent.push(snapToBody(grid, ax - 3, ay), snapToBody(grid, ax + 3, ay));
  }

  if (anim === 'happy' || anim === 'play') {
    grid.set(...snapToBody(grid, ax - 2, ay + 5), 2);
    grid.set(...snapToBody(grid, ax + 2, ay + 5), 2);
  }

  return { accentPixels: accent };
}
