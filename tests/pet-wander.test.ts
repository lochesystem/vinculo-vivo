import { describe, it, expect } from 'vitest';
import {
  createPetWander,
  recallPet,
  updatePetWander,
  wanderBounds,
} from '../src/core/pet-wander';

describe('pet-wander', () => {
  it('recallPet centers on stage', () => {
    const state = createPetWander(10, 50, 42);
    recallPet(state, 360, 270);
    expect(state.x).toBe(180);
    expect(state.y).toBe(270 * 0.62);
    expect(state.targetX).toBe(180);
    expect(state.facingLeft).toBe(false);
  });

  it('wanderBounds respects margins', () => {
    expect(wanderBounds(360)).toEqual({ minX: 48, maxX: 312 });
  });

  it('does not move when canWander is false', () => {
    const state = createPetWander(180, 167, 99);
    state.pauseSec = 0;
    state.targetX = 300;
    const x0 = state.x;
    updatePetWander(state, 0.5, 360, 270, false);
    expect(state.x).toBe(x0);
  });

  it('moves toward target when wandering', () => {
    const state = createPetWander(100, 167, 777);
    state.pauseSec = 0;
    state.targetX = 260;
    updatePetWander(state, 1, 360, 270, true);
    expect(state.x).toBeGreaterThan(100);
    expect(state.facingLeft).toBe(false);
  });
});
