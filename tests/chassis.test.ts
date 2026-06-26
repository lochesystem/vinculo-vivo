import { describe, it, expect } from 'vitest';
import { CHASSIS_DRAWERS } from '../src/render/creature/chassis/index';
import { HATCH_CHASSIS_IDS } from '../src/data/chassis';
import { PixelGrid, GRID_SIZE } from '../src/render/creature/pixel-grid';
import { generateTraitsFromSeed } from '../src/core/dna';
import { generateVisualDnaFromSeed } from '../src/core/visual-dna';
import { composeCreatureSprite } from '../src/render/creature/composer';
import { getFormById } from '../src/data/forms';

describe('pixel chassis silhouettes', () => {
  for (const id of Object.keys(CHASSIS_DRAWERS)) {
    it(`${id} draws one connected solid blob`, () => {
      const grid = new PixelGrid();
      CHASSIS_DRAWERS[id as keyof typeof CHASSIS_DRAWERS](grid);
      grid.solidify();
      expect(grid.isSilhouetteConnected()).toBe(true);
      let filled = 0;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (grid.get(x, y)) filled++;
        }
      }
      expect(filled).toBeGreaterThan(40);
    });
  }

  it('hatch chassis are all implemented', () => {
    for (const id of HATCH_CHASSIS_IDS) {
      expect(CHASSIS_DRAWERS[id]).toBeTypeOf('function');
    }
  });

  it('pairwise chassis differ in pixel layout', () => {
    const sig = (id: string) => {
      const g = new PixelGrid();
      CHASSIS_DRAWERS[id as keyof typeof CHASSIS_DRAWERS](g);
      return g.cells.join('');
    };
    expect(sig('round_mascot')).not.toBe(sig('box_robot'));
    expect(sig('bird_beak')).not.toBe(sig('ghost_wisp'));
    expect(sig('humanoid_tall')).not.toBe(sig('quadruped_low'));
  });
});

describe('composed hatch sprites stay connected', () => {
  for (const seed of [303, 404, 7777, 101, 505, 909]) {
    it(`seed ${seed} is one connected silhouette`, () => {
      const traits = generateTraitsFromSeed(seed);
      const visual = generateVisualDnaFromSeed(seed, traits);
      const form = getFormById(`${traits.archetype}_hatchling`)!;
      const composed = composeCreatureSprite({
        traits,
        dnaSeed: seed,
        formId: form.id,
        silhouette: form.silhouette,
        anim: 'idle',
        animTime: 0,
        mood: 'content',
        visualDna: visual,
      });
      expect(composed.connected).toBe(true);
    });
  }
});
