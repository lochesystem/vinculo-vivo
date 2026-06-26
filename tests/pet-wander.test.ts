import { describe, it, expect } from 'vitest';
import {
  createPetWander,
  recallPet,
  updatePetWander,
  wanderBounds,
  shouldPreservePetWander,
  minTravelDistance,
} from '../src/core/pet-wander';
import { sampleGroundY } from '../src/render/pixel-habitat';

const neutralPersonality = {
  curious: 0.5,
  affectionate: 0.5,
  aggressive: 0.3,
  shy: 0.3,
  lazy: 0.3,
  stubborn: 0.3,
};

describe('pet-wander', () => {
  it('recallPet centers on stage', () => {
    const state = createPetWander(10, 50, 42);
    recallPet(state, 360, (x) => sampleGroundY(x, 360, 270, 42));
    expect(state.x).toBe(180);
    expect(state.y).toBe(sampleGroundY(180, 360, 270, 42));
    expect(state.targetX).toBe(180);
    expect(state.facingLeft).toBe(false);
    expect(state.mode).toBe('idle');
  });

  it('shouldPreservePetWander keeps state for same dnaSeed', () => {
    const state = createPetWander(100, 160, 42);
    state.x = 200;
    expect(shouldPreservePetWander(state, 42)).toBe(true);
    expect(shouldPreservePetWander(state, 99)).toBe(false);
    expect(shouldPreservePetWander(null, 42)).toBe(false);
  });

  it('wanderBounds respects margins', () => {
    expect(wanderBounds(360)).toEqual({ minX: 48, maxX: 312 });
  });

  it('minTravelDistance is at least 100px', () => {
    expect(minTravelDistance()).toBeGreaterThanOrEqual(100);
  });

  it('does not move when canLocomote is false', () => {
    const state = createPetWander(180, 167, 99);
    state.mode = 'walk';
    state.targetX = 300;
    state.speed = 55;
    const x0 = state.x;
    updatePetWander(state, 0.5, 360, 270, false, {
      getGroundY: (x) => sampleGroundY(x, 360, 270, 99),
      personality: neutralPersonality,
      mood: 'content',
    });
    expect(state.x).toBe(x0);
  });

  it('walk mode advances x and walkPhase over time', () => {
    const state = createPetWander(100, 167, 777);
    state.mode = 'walk';
    state.targetX = 260;
    state.speed = 55;
    state.modeTimer = 0;
    const ctx = {
      getGroundY: (x: number) => sampleGroundY(x, 360, 270, 777),
      personality: neutralPersonality,
      mood: 'content' as const,
    };
    updatePetWander(state, 1, 360, 270, true, ctx);
    expect(state.x).toBeGreaterThan(100);
    expect(state.walkPhase).toBeGreaterThan(0);
    expect(state.facingLeft).toBe(false);
  });

  it('sampleGroundY varies with x across the stage', () => {
    const w = 360;
    const h = 270;
    const seed = 12345;
    const yLeft = sampleGroundY(60, w, h, seed);
    const yMid = sampleGroundY(180, w, h, seed);
    const yRight = sampleGroundY(300, w, h, seed);
    const spread = Math.max(yLeft, yMid, yRight) - Math.min(yLeft, yMid, yRight);
    expect(spread).toBeGreaterThan(0);
  });
});
