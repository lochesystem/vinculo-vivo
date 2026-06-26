import { describe, it, expect } from 'vitest';
import { computeCreatureMotion } from '../src/render/creature/animation';
import type { PersonalityTraits } from '../src/core/types';

const neutralPersonality: PersonalityTraits = {
  curious: 0.5,
  shy: 0.5,
  stubborn: 0.5,
  affectionate: 0.5,
  aggressive: 0.5,
  lazy: 0.5,
};

describe('time-based animation', () => {
  it('sleep state has minimal bounce', () => {
    const m0 = computeCreatureMotion(0, 'sleep', 'sleeping', neutralPersonality, 100, 1, 1, true);
    const m1 = computeCreatureMotion(0.5, 'sleep', 'sleeping', neutralPersonality, 100, 1, 1, true);
    expect(Math.abs(m0.bounceY)).toBeLessThan(3);
    expect(Math.abs(m1.bounceY)).toBeLessThan(3);
    expect(m0.flap).toBe(0);
    expect(m0.wag).toBe(0);
  });

  it('idle breathing is smooth and bounded', () => {
    const samples = [0, 0.25, 0.5, 0.75, 1.0].map((t) =>
      computeCreatureMotion(t, 'idle', 'content', neutralPersonality, 500, 1, 1, true).bounceY,
    );
    for (const y of samples) {
      expect(Math.abs(y)).toBeLessThan(5);
    }
  });

  it('happy produces occasional hop', () => {
    const peak = computeCreatureMotion(0.55, 'happy', 'happy', neutralPersonality, 200, 1, 1, true).bounceY;
    expect(peak).toBeLessThan(-2);
  });
});
