import type { Mood, PersonalityTraits } from '../../core/types';
import { getIdleBounce, getAnimationSpeed } from '../../core/personality';
import type { AnimState } from './types';

export interface CreatureMotion {
  bounceY: number;
  squishX: number;
  squishY: number;
  sway: number;
  flap: number;
  wag: number;
  blink: boolean;
}

export function computeCreatureMotion(
  animTime: number,
  anim: AnimState,
  mood: Mood,
  personality: PersonalityTraits,
  dnaSeed: number,
  wingScale: number,
  tailScale: number,
  allowLimbs: boolean,
): CreatureMotion {
  const speed = getAnimationSpeed(personality, mood);
  const bounceMult = getIdleBounce(personality);
  const t = animTime * speed;
  const seedPhase = (dnaSeed % 1000) * 0.001;

  let bounceY = 0;
  let squishX = 1;
  let squishY = 1;
  let sway = 0;
  let flap = 0;
  let wag = 0;

  if (anim === 'sleep' || mood === 'sleeping') {
    bounceY = Math.sin(t * Math.PI * 0.5) * 1.5 * bounceMult;
    squishX = 1 + Math.sin(t * Math.PI * 0.5) * 0.02;
    squishY = 1 - Math.sin(t * Math.PI * 0.5) * 0.015;
  } else if (anim === 'happy') {
    const hop = Math.max(0, Math.sin(t * Math.PI * 0.9));
    bounceY = -hop * 8 * bounceMult;
    squishX = 1 + hop * 0.06;
    squishY = 1 - hop * 0.04;
  } else if (anim === 'play') {
    bounceY = Math.sin(t * Math.PI * 1.8) * 4 * bounceMult;
    squishX = 1 + Math.sin(t * Math.PI * 1.8) * 0.05;
    squishY = 1 - Math.sin(t * Math.PI * 1.8) * 0.03;
    sway = Math.sin(t * Math.PI * 1.2) * 0.06;
  } else if (anim === 'eat') {
    const chew = Math.sin(t * Math.PI * 3) * 0.5 + 0.5;
    squishX = 1 + chew * 0.07;
    squishY = 1 - chew * 0.05;
    bounceY = chew * 1.5;
  } else if (anim === 'evolve') {
    bounceY = Math.sin(t * Math.PI * 2) * 3;
    squishX = 1 + Math.sin(t * Math.PI * 4) * 0.08;
    squishY = 1 - Math.sin(t * Math.PI * 4) * 0.05;
  } else {
    bounceY = Math.sin(t * Math.PI * 1.1) * 2.5 * bounceMult;
    squishX = 1 + Math.sin(t * Math.PI * 1.1) * 0.035;
    squishY = 1 - Math.sin(t * Math.PI * 1.1) * 0.025;
    sway = Math.sin(t * Math.PI * 0.35 + seedPhase) * 0.03;
  }

  if (allowLimbs && anim !== 'sleep' && mood !== 'sleeping') {
    flap = Math.sin(t * Math.PI * 1.4) * 2.5 * wingScale;
    wag = Math.sin(t * Math.PI * 0.9 + seedPhase) * 3 * tailScale;
  }

  const blinkCycle = Math.sin(t * 0.3 + seedPhase * 4);
  const blink = anim !== 'sleep' && mood !== 'sleeping' && blinkCycle > 0.92;

  return { bounceY, squishX, squishY, sway, flap, wag, blink };
}
