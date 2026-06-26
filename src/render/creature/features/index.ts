import type { ChassisId, FeatureSlot } from '../../../data/chassis';
import { CHASSIS_BUILTIN_FEATURES } from '../../../data/chassis';
import type { PixelGrid } from '../pixel-grid';

export { CHASSIS_BUILTIN_FEATURES };

export function filterFeaturesForChassis(chassisId: ChassisId, features: FeatureSlot[]): FeatureSlot[] {
  const builtin = new Set(CHASSIS_BUILTIN_FEATURES[chassisId] ?? []);
  const filtered = features.filter((f) => !builtin.has(f));
  return filtered.slice(0, 1);
}

function bridgeRect(grid: PixelGrid, x: number, y: number, w: number, h: number): void {
  grid.fillRect(x, y, w, h, 1);
}

export function applyFeatures(grid: PixelGrid, chassisId: ChassisId, features: FeatureSlot[]): void {
  for (const f of features) {
    const attach = grid.bodyAttachPoint(24, 22);
    switch (f) {
      case 'ears': {
        const top = grid.bodyAttachPoint(24, 12);
        bridgeRect(grid, top.x - 10, top.y - 2, 5, 10);
        bridgeRect(grid, top.x + 5, top.y - 2, 5, 10);
        bridgeRect(grid, top.x - 6, top.y + 6, 12, 3);
        break;
      }
      case 'crown': {
        const top = grid.bodyAttachPoint(24, 8);
        bridgeRect(grid, top.x - 6, top.y - 6, 4, 8);
        bridgeRect(grid, top.x + 2, top.y - 8, 4, 10);
        bridgeRect(grid, top.x + 6, top.y - 6, 4, 8);
        bridgeRect(grid, top.x - 8, top.y + 2, 16, 2);
        break;
      }
      case 'tail': {
        bridgeRect(grid, attach.x - 12, attach.y, 6, 4);
        bridgeRect(grid, attach.x - 14, attach.y + 2, 4, 6);
        break;
      }
      case 'wings': {
        bridgeRect(grid, attach.x - 14, attach.y - 4, 8, 6);
        bridgeRect(grid, attach.x + 6, attach.y - 4, 8, 6);
        bridgeRect(grid, attach.x - 10, attach.y - 1, 4, 3);
        bridgeRect(grid, attach.x + 6, attach.y - 1, 4, 3);
        break;
      }
      case 'horn': {
        const top = grid.bodyAttachPoint(24, 10);
        bridgeRect(grid, top.x - 1, top.y - 8, 3, 10);
        break;
      }
      case 'cape': {
        bridgeRect(grid, attach.x - 10, attach.y + 2, 20, 12);
        bridgeRect(grid, attach.x - 12, attach.y + 4, 4, 8);
        bridgeRect(grid, attach.x + 8, attach.y + 4, 4, 8);
        break;
      }
      case 'tuft': {
        const top = grid.bodyAttachPoint(24, 10);
        bridgeRect(grid, top.x - 2, top.y - 5, 5, 7);
        break;
      }
      default:
        break;
    }
    void chassisId;
  }
}
