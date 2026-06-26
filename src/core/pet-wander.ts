import { mulberry32 } from './rng';

export interface PetWanderState {
  x: number;
  y: number;
  targetX: number;
  pauseSec: number;
  facingLeft: boolean;
  rngState: number;
}

const WALK_SPEED = 32;
const MARGIN_X = 48;
const Y_JITTER = 4;

export function createPetWander(x: number, y: number, dnaSeed: number): PetWanderState {
  return {
    x,
    y,
    targetX: x,
    pauseSec: 0.5,
    facingLeft: false,
    rngState: dnaSeed ^ 0x57414b,
  };
}

export function recallPet(state: PetWanderState, w: number, h: number): void {
  state.x = w / 2;
  state.y = h * 0.62;
  state.targetX = state.x;
  state.pauseSec = 1.2;
  state.facingLeft = false;
}

function pickTarget(state: PetWanderState, w: number, rng: () => number): void {
  const minX = MARGIN_X;
  const maxX = w - MARGIN_X;
  let next = minX + rng() * (maxX - minX);
  if (Math.abs(next - state.x) < 40) {
    next = state.x > w / 2 ? minX + rng() * (w * 0.35) : w * 0.65 + rng() * (maxX - w * 0.65);
  }
  state.targetX = next;
  state.facingLeft = next < state.x;
  state.pauseSec = 1 + rng() * 2;
}

export function updatePetWander(
  state: PetWanderState,
  dt: number,
  w: number,
  h: number,
  canWander: boolean,
): void {
  const baseY = h * 0.62;
  state.y = baseY + Math.sin(state.x * 0.02) * Y_JITTER;

  if (!canWander) {
    state.pauseSec = Math.max(state.pauseSec, 0.3);
    return;
  }

  if (state.pauseSec > 0) {
    state.pauseSec -= dt;
    if (state.pauseSec <= 0) {
      const rng = mulberry32(state.rngState);
      pickTarget(state, w, rng);
      state.rngState = Math.floor(rng() * 1e9);
    }
    return;
  }

  const dx = state.targetX - state.x;
  if (Math.abs(dx) < 2) {
    state.x = state.targetX;
    state.pauseSec = 0.01;
    return;
  }

  const step = Math.sign(dx) * WALK_SPEED * dt;
  if (Math.abs(step) >= Math.abs(dx)) {
    state.x = state.targetX;
    state.pauseSec = 0.01;
  } else {
    state.x += step;
  }
  state.facingLeft = dx < 0;
}

export function wanderBounds(w: number): { minX: number; maxX: number } {
  return { minX: MARGIN_X, maxX: w - MARGIN_X };
}
