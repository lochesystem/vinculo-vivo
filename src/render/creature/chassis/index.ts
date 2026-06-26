import type { ChassisId } from '../../../data/chassis';
import type { PixelGrid } from '../pixel-grid';

type DrawChassis = (grid: PixelGrid) => void;

/** One connected blob: head + neck + body overlap via ellipses/rects. */
const round_mascot: DrawChassis = (g) => {
  g.fillEllipse(24, 17, 9, 8);
  g.fillRect(17, 20, 14, 6);
  g.fillEllipse(24, 28, 10, 9);
  g.fillRect(20, 34, 4, 5);
  g.fillRect(24, 34, 4, 5);
};

const pear_creature: DrawChassis = (g) => {
  g.fillEllipse(24, 14, 11, 10);
  g.fillRect(16, 18, 16, 8);
  g.fillEllipse(24, 28, 9, 11);
  g.fillRect(21, 36, 3, 4);
  g.fillRect(26, 36, 3, 4);
};

const bird_beak: DrawChassis = (g) => {
  g.fillEllipse(20, 24, 12, 10);
  g.fillRect(26, 20, 10, 8);
  g.fillEllipse(32, 18, 7, 6);
  g.fillRect(36, 20, 6, 3);
  g.fillRect(38, 21, 4, 2);
  g.fillRect(14, 32, 3, 4);
  g.fillRect(22, 32, 3, 4);
};

const box_robot: DrawChassis = (g) => {
  g.fillRect(22, 6, 4, 8);
  g.fillRect(20, 4, 8, 2);
  g.fillRect(14, 14, 20, 22);
  g.fillRect(12, 16, 2, 18);
  g.fillRect(34, 16, 2, 18);
  g.fillRect(16, 36, 6, 8);
  g.fillRect(26, 36, 6, 8);
  g.fillRect(18, 20, 12, 8, 2);
};

const floppy_ears: DrawChassis = (g) => {
  g.fillRect(10, 12, 5, 12);
  g.fillRect(33, 12, 5, 12);
  g.fillRect(12, 22, 3, 4);
  g.fillRect(33, 22, 3, 4);
  g.fillEllipse(24, 24, 10, 9);
  g.fillRect(20, 32, 4, 5);
  g.fillRect(25, 32, 4, 5);
};

const crown_royal: DrawChassis = (g) => {
  g.fillRect(18, 6, 3, 7);
  g.fillRect(27, 6, 3, 7);
  g.fillRect(22, 4, 4, 9);
  g.fillRect(16, 10, 16, 3);
  g.fillEllipse(24, 22, 10, 9);
  g.fillRect(20, 30, 4, 6);
  g.fillRect(25, 30, 4, 6);
};

const ghost_wisp: DrawChassis = (g) => {
  g.fillEllipse(24, 18, 10, 10);
  g.fillRect(16, 22, 16, 10);
  g.fillRect(14, 30, 4, 4);
  g.fillRect(20, 32, 4, 4);
  g.fillRect(26, 32, 4, 4);
  g.fillRect(30, 30, 4, 4);
};

const insect_antenna: DrawChassis = (g) => {
  g.fillRect(16, 6, 2, 14);
  g.fillRect(30, 6, 2, 14);
  g.fillRect(14, 4, 2, 4);
  g.fillRect(32, 4, 2, 4);
  g.fillEllipse(24, 22, 8, 11);
  g.fillRect(18, 32, 3, 6);
  g.fillRect(27, 32, 3, 6);
};

const long_snout: DrawChassis = (g) => {
  g.fillEllipse(18, 22, 10, 9);
  g.fillRect(22, 18, 12, 8);
  g.fillEllipse(30, 20, 8, 7);
  g.fillRect(34, 21, 8, 4);
  g.fillRect(14, 30, 4, 6);
  g.fillRect(22, 30, 4, 6);
};

const star_spirit: DrawChassis = (g) => {
  g.fillEllipse(24, 20, 9, 9);
  g.fillRect(22, 6, 4, 14);
  g.fillRect(8, 18, 14, 4);
  g.fillRect(26, 18, 14, 4);
  g.fillRect(18, 28, 4, 8);
  g.fillRect(26, 28, 4, 8);
};

const mushroom_cap: DrawChassis = (g) => {
  g.fillEllipse(24, 14, 14, 7);
  g.fillRect(10, 14, 28, 4);
  g.fillRect(21, 18, 6, 18);
  g.fillRect(19, 34, 4, 4);
  g.fillRect(26, 34, 4, 4);
};

const ninja_mask: DrawChassis = (g) => {
  g.fillEllipse(24, 20, 10, 10);
  g.fillRect(12, 22, 24, 6, 2);
  g.fillRect(8, 24, 4, 3);
  g.fillRect(36, 24, 4, 3);
  g.fillRect(20, 30, 4, 6);
  g.fillRect(26, 30, 4, 6);
};

const quadruped_low: DrawChassis = (g) => {
  g.fillEllipse(26, 18, 11, 8);
  g.fillRect(14, 20, 22, 10);
  g.fillRect(10, 26, 5, 10);
  g.fillRect(18, 26, 5, 10);
  g.fillRect(26, 26, 5, 10);
  g.fillRect(34, 26, 5, 10);
};

const serpent_neck: DrawChassis = (g) => {
  g.fillEllipse(36, 10, 6, 6);
  g.fillRect(28, 12, 12, 4);
  g.fillRect(22, 14, 10, 4);
  g.fillRect(18, 18, 8, 4);
  g.fillEllipse(20, 26, 11, 9);
  g.fillRect(16, 32, 4, 6);
  g.fillRect(24, 32, 4, 6);
};

const humanoid_tall: DrawChassis = (g) => {
  g.fillEllipse(24, 10, 7, 7);
  g.fillRect(20, 14, 8, 4);
  g.fillRect(18, 18, 12, 16);
  g.fillRect(16, 34, 6, 12);
  g.fillRect(26, 34, 6, 12);
  g.fillRect(10, 20, 8, 12);
  g.fillRect(30, 20, 8, 12);
};

const apex_hybrid: DrawChassis = (g) => {
  g.fillRect(18, 2, 4, 10);
  g.fillRect(26, 2, 4, 10);
  g.fillRect(22, 0, 4, 12);
  g.fillEllipse(24, 14, 9, 8);
  g.fillRect(16, 18, 16, 16);
  g.fillRect(6, 20, 10, 10);
  g.fillRect(32, 20, 10, 10);
  g.fillRect(16, 34, 7, 10);
  g.fillRect(25, 34, 7, 10);
};

export const CHASSIS_DRAWERS: Record<ChassisId, DrawChassis> = {
  round_mascot,
  pear_creature,
  bird_beak,
  box_robot,
  floppy_ears,
  crown_royal,
  ghost_wisp,
  insect_antenna,
  long_snout,
  star_spirit,
  mushroom_cap,
  ninja_mask,
  quadruped_low,
  serpent_neck,
  humanoid_tall,
  apex_hybrid,
};

export function drawChassis(grid: PixelGrid, chassisId: ChassisId): void {
  CHASSIS_DRAWERS[chassisId](grid);
}

export function drawEggPixel(grid: PixelGrid): void {
  grid.fillEllipse(24, 24, 10, 13);
  grid.fillRect(18, 20, 12, 10);
}
