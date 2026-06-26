export const GRID_SIZE = 48;

/** 0=empty, 1=body fill, 2=outline/detail */
export type PixelCell = 0 | 1 | 2;

export interface FlatPalette {
  fill: string;
  outline: string;
  accent: string;
}

export class PixelGrid {
  readonly cells: PixelCell[] = new Array(GRID_SIZE * GRID_SIZE).fill(0);

  clear(): void {
    this.cells.fill(0);
  }

  private idx(x: number, y: number): number {
    return y * GRID_SIZE + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  }

  get(x: number, y: number): PixelCell {
    if (!this.inBounds(x, y)) return 0;
    return this.cells[this.idx(x, y)];
  }

  set(x: number, y: number, cell: PixelCell): void {
    if (!this.inBounds(x, y)) return;
    this.cells[this.idx(x, y)] = cell;
  }

  fillRect(x: number, y: number, w: number, h: number, cell: PixelCell = 1): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.set(x + dx, y + dy, cell);
      }
    }
  }

  /** Solid silhouette: F and O both become body fill (no hollow rings). */
  drawBitmap(rows: string[], ox = 0, oy = 0): void {
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === 'F' || ch === 'O') this.set(ox + x, oy + y, 1);
      }
    }
  }

  fillEllipse(cx: number, cy: number, rx: number, ry: number, cell: PixelCell = 1): void {
    const rxe = Math.max(1, rx);
    const rye = Math.max(1, ry);
    for (let y = Math.floor(cy - rye); y <= Math.ceil(cy + rye); y++) {
      for (let x = Math.floor(cx - rxe); x <= Math.ceil(cx + rxe); x++) {
        const nx = (x - cx) / rxe;
        const ny = (y - cy) / rye;
        if (nx * nx + ny * ny <= 1.05) this.set(x, y, cell);
      }
    }
  }

  /** Merge outline into fill for one solid Tamagotchi blob. */
  solidify(): void {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] === 2) this.cells[i] = 1;
    }
  }

  /** Edge pixels become outline (optional depth after solidify pass). */
  addOuterOutline(): void {
    const snap = [...this.cells];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (snap[this.idx(x, y)] !== 1) continue;
        const touchesEmpty =
          !this.inBounds(x - 1, y) || snap[this.idx(x - 1, y)] === 0 ||
          !this.inBounds(x + 1, y) || snap[this.idx(x + 1, y)] === 0 ||
          !this.inBounds(x, y - 1) || snap[this.idx(x, y - 1)] === 0 ||
          !this.inBounds(x, y + 1) || snap[this.idx(x, y + 1)] === 0;
        if (touchesEmpty) this.cells[this.idx(x, y)] = 2;
      }
    }
    for (let i = 0; i < this.cells.length; i++) {
      if (snap[i] === 1 && this.cells[i] !== 2) this.cells[i] = 1;
    }
  }

  mirrorX(): void {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE >> 1; x++) {
        const a = this.get(x, y);
        const b = this.get(GRID_SIZE - 1 - x, y);
        this.set(x, y, b);
        this.set(GRID_SIZE - 1 - x, y, a);
      }
    }
  }

  /** True if all fill pixels form one 4-connected component. */
  isSilhouetteConnected(): boolean {
    let start = -1;
    let total = 0;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] === 1 || this.cells[i] === 2) {
        total++;
        if (start < 0) start = i;
      }
    }
    if (total === 0) return true;
    if (start < 0) return true;

    const visited = new Set<number>();
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      if (visited.has(i)) continue;
      if (this.cells[i] !== 1 && this.cells[i] !== 2) continue;
      visited.add(i);
      const x = i % GRID_SIZE;
      const y = (i / GRID_SIZE) | 0;
      if (x > 0) stack.push(i - 1);
      if (x < GRID_SIZE - 1) stack.push(i + 1);
      if (y > 0) stack.push(i - GRID_SIZE);
      if (y < GRID_SIZE - 1) stack.push(i + GRID_SIZE);
    }
    return visited.size === total;
  }

  /** Nearest body column center for attaching features. */
  bodyAttachPoint(preferX: number, preferY: number): { x: number; y: number } {
    let best = { x: preferX, y: preferY, d: Infinity };
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!this.get(x, y)) continue;
        const d = (x - preferX) ** 2 + (y - preferY) ** 2;
        if (d < best.d) best = { x, y, d };
      }
    }
    return { x: best.x, y: best.y };
  }

  blit(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    pal: FlatPalette,
  ): void {
    const px = scale;
    const half = (GRID_SIZE * px) / 2;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = this.get(x, y);
        if (!cell) continue;
        ctx.fillStyle = cell === 2 ? pal.outline : pal.fill;
        ctx.fillRect(cx - half + x * px, cy - half + y * px, px, px);
      }
    }
  }

  blitAccent(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    color: string,
    points: Array<[number, number]>,
  ): void {
    const px = scale;
    const half = (GRID_SIZE * px) / 2;
    ctx.fillStyle = color;
    for (const [x, y] of points) {
      if (!this.inBounds(x, y)) continue;
      ctx.fillRect(cx - half + x * px, cy - half + y * px, px, px);
    }
  }
}

export function flatPaletteFromTraits(primary: string, accent: string): FlatPalette {
  return {
    fill: primary,
    outline: darkenHex(primary, 0.35),
    accent,
  };
}

function darkenHex(hslOrHex: string, amount: number): string {
  const m = hslOrHex.match(/([\d.]+)/g);
  if (m && hslOrHex.startsWith('hsl')) {
    const h = parseFloat(m[0]);
    const s = parseFloat(m[1]);
    const l = Math.max(8, parseFloat(m[2]) - amount * 40);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return '#1a1a1a';
}
