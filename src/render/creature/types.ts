import type { DnaTraits, Mood } from '../../core/types';
import type { CreatureVisualDna } from '../../core/types';
import type { FormPreset } from '../../data/forms';
import type { ChassisId } from '../../data/chassis';

export type AnimState = 'idle' | 'eat' | 'play' | 'sleep' | 'evolve' | 'happy' | 'hurt';

export interface DrawCreatureOptions {
  traits: DnaTraits;
  form: FormPreset;
  dnaSeed: number;
  visualDna?: CreatureVisualDna;
  chassisId?: ChassisId | null;
  anim: AnimState;
  animTime: number;
  mood: Mood;
  moodGlow?: number;
  happiness?: number;
}

export interface BodyProportions {
  headSize: number;
  limbLength: number;
  bodyWidth: number;
  postureLean: number;
}
