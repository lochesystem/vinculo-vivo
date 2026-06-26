import type { Mood, PersonalityTraits } from './types';
import { mulberry32 } from './rng';

export type LocomotionMode = 'idle' | 'walk' | 'trot' | 'sniff' | 'sit';

export interface PetWanderState {
  x: number;
  y: number;
  targetX: number;
  mode: LocomotionMode;
  modeTimer: number;
  walkPhase: number;
  facingLeft: boolean;
  speed: number;
  rngState: number;
  dnaSeed: number;
  footStride: number;
}

export interface LocomotionContext {
  getGroundY: (x: number) => number;
  personality: PersonalityTraits;
  mood: Mood;
}

export interface LocomotionUpdateResult {
  footStep: boolean;
}

const MARGIN_X = 48;
const MIN_TRAVEL = 100;
const WALK_SPEED = 55;
const TROT_SPEED = 85;

export function createPetWander(x: number, y: number, dnaSeed: number): PetWanderState {
  return {
    x,
    y,
    targetX: x,
    mode: 'idle',
    modeTimer: 0.3,
    walkPhase: 0,
    facingLeft: false,
    speed: 0,
    rngState: dnaSeed ^ 0x57414b,
    dnaSeed,
    footStride: 0,
  };
}

export function shouldPreservePetWander(
  existing: PetWanderState | null,
  dnaSeed: number,
): boolean {
  return existing != null && existing.dnaSeed === dnaSeed;
}

export function recallPet(
  state: PetWanderState,
  w: number,
  getGroundY: (x: number) => number,
): void {
  state.x = w / 2;
  state.y = getGroundY(w / 2);
  state.targetX = state.x;
  state.mode = 'idle';
  state.modeTimer = 1.2;
  state.walkPhase = 0;
  state.speed = 0;
  state.facingLeft = false;
  state.footStride = 0;
}

export function getWalkIntensity(mode: LocomotionMode): number {
  if (mode === 'trot') return 1.4;
  if (mode === 'walk') return 1;
  return 0;
}

export function isLocomoting(mode: LocomotionMode): boolean {
  return mode === 'walk' || mode === 'trot';
}

function pickFarTarget(
  state: PetWanderState,
  w: number,
  rng: () => number,
  preferCenter = false,
): number {
  const minX = MARGIN_X;
  const maxX = w - MARGIN_X;
  let next: number;
  if (preferCenter) {
    next = w / 2 + (rng() - 0.5) * 40;
  } else {
    next = minX + rng() * (maxX - minX);
  }
  for (let i = 0; i < 6 && Math.abs(next - state.x) < MIN_TRAVEL; i++) {
    next = minX + rng() * (maxX - minX);
  }
  return Math.max(minX, Math.min(maxX, next));
}

function beginLocomotion(
  state: PetWanderState,
  mode: 'walk' | 'trot',
  targetX: number,
): void {
  state.mode = mode;
  state.targetX = targetX;
  state.speed = mode === 'trot' ? TROT_SPEED : WALK_SPEED;
  state.facingLeft = targetX < state.x;
  state.modeTimer = 0;
}

function pickNextBehavior(state: PetWanderState, w: number, ctx: LocomotionContext): void {
  const rng = mulberry32(state.rngState);
  state.rngState = Math.floor(rng() * 1e9);

  const { personality, mood } = ctx;
  const roll = rng();

  if (personality.lazy > 0.55 && roll < 0.32) {
    state.mode = 'sit';
    state.modeTimer = 1 + rng() * (personality.lazy > 0.75 ? 1.5 : 0.8);
    state.speed = 0;
    return;
  }

  if (roll < 0.18) {
    state.mode = 'sniff';
    state.modeTimer = 0.6 + rng() * 0.6;
    state.speed = 0;
    return;
  }

  const wantTrot =
    mood === 'excited' ||
    mood === 'happy' ||
    (personality.aggressive > 0.55 && roll < 0.55);

  if (wantTrot && roll < 0.48) {
    beginLocomotion(state, 'trot', pickFarTarget(state, w, rng));
    return;
  }

  if (personality.affectionate > 0.55 && roll < 0.22) {
    beginLocomotion(state, 'walk', pickFarTarget(state, w, rng, true));
    return;
  }

  beginLocomotion(state, 'walk', pickFarTarget(state, w, rng));
}

export function updatePetWander(
  state: PetWanderState,
  dt: number,
  w: number,
  _h: number,
  canLocomote: boolean,
  ctx: LocomotionContext,
): LocomotionUpdateResult {
  let footStep = false;
  state.y = ctx.getGroundY(state.x);

  if (!canLocomote) {
    state.modeTimer = Math.max(state.modeTimer, 0.25);
    if (isLocomoting(state.mode)) {
      state.mode = 'idle';
      state.modeTimer = 0.4;
      state.speed = 0;
    }
    return { footStep };
  }

  if (state.mode === 'idle' || state.mode === 'sniff' || state.mode === 'sit') {
    state.modeTimer -= dt;
    if (state.mode === 'sniff') {
      state.y += Math.sin(state.modeTimer * 14) * 0.8;
    }
    if (state.modeTimer <= 0) {
      if (state.mode === 'idle') {
        pickNextBehavior(state, w, ctx);
      } else {
        state.mode = 'idle';
        state.modeTimer = 0.15 + mulberry32(state.rngState)() * 0.35;
      }
    }
    return { footStep };
  }

  const dx = state.targetX - state.x;
  if (Math.abs(dx) < 2) {
    state.x = state.targetX;
    state.mode = 'idle';
    state.modeTimer = 0.2 + mulberry32(state.rngState)() * 0.5;
    state.speed = 0;
    state.walkPhase = 0;
    return { footStep };
  }

  const step = Math.sign(dx) * state.speed * dt;
  const prevStride = state.footStride;
  state.walkPhase = (state.walkPhase + dt * (state.mode === 'trot' ? 3.2 : 2.2)) % 1;
  state.footStride = Math.floor(state.walkPhase * 2);
  if (state.footStride !== prevStride) footStep = true;

  if (Math.abs(step) >= Math.abs(dx)) {
    state.x = state.targetX;
    state.mode = 'idle';
    state.modeTimer = 0.2 + mulberry32(state.rngState)() * 0.45;
    state.speed = 0;
    state.walkPhase = 0;
  } else {
    state.x += step;
  }
  state.facingLeft = dx < 0;
  state.y = ctx.getGroundY(state.x);

  return { footStep };
}

export function wanderBounds(w: number): { minX: number; maxX: number } {
  return { minX: MARGIN_X, maxX: w - MARGIN_X };
}

export function minTravelDistance(): number {
  return MIN_TRAVEL;
}
