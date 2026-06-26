import type { DnaTraits } from '../../core/types';
import { mulberry32 } from '../../core/rng';
import type { BodyProportions } from './types';

export function computeBodyProportions(traits: DnaTraits): BodyProportions {
  const rng = mulberry32(traits.parts.pattern * 997 + traits.parts.eyes * 131);
  const shy = traits.personality.shy;
  const aggressive = traits.personality.aggressive;

  return {
    headSize: 0.85 + rng() * 0.3,
    limbLength: 0.8 + rng() * 0.35,
    bodyWidth: traits.bodyShape === 'bulky' ? 1.15 : traits.bodyShape === 'slim' ? 0.85 : 1,
    postureLean: aggressive * 0.12 - shy * 0.1,
  };
}
