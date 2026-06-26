import {
  ALL_FACE_IDS,
  CHASSIS_BUILTIN_FEATURES,
  HATCH_CHASSIS_IDS,
  chassisFromFormId,
  type ChassisId,
  type FeatureSlot,
} from '../data/chassis';
import type { CreatureVisualDna, DnaTraits } from './types';
import { mulberry32, pickOne } from './rng';

const FEATURE_POOL: FeatureSlot[] = ['tail', 'wings', 'cape', 'tuft'];

export function generateVisualDnaFromSeed(seed: number, traits: DnaTraits): CreatureVisualDna {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const chassisId = pickOne(rng, HATCH_CHASSIS_IDS);
  const faceId = pickOne(rng, ALL_FACE_IDS);
  const variant = Math.floor(rng() * 4) as 0 | 1 | 2 | 3;

  const candidates: FeatureSlot[] = [];
  if (traits.parts.tail > 1 && rng() > 0.55) candidates.push('tail');
  if (traits.parts.wings > 1 && rng() > 0.55) candidates.push('wings');
  if (traits.rarity === 'mythic' || traits.rarity === 'epic') {
    if (rng() > 0.65) candidates.push('cape');
  }
  if (traits.bodyShape === 'bulky' && rng() > 0.6) candidates.push('tuft');

  const builtin = new Set(CHASSIS_BUILTIN_FEATURES[chassisId] ?? []);
  const features = candidates.filter((f) => !builtin.has(f)).slice(0, 1);

  if (features.length === 0 && rng() > 0.75) {
    const extra = pickOne(rng, FEATURE_POOL.filter((f) => !builtin.has(f)));
    if (extra) features.push(extra);
  }

  return { chassisId, faceId, features, variant };
}

export function resolveChassisId(
  formId: string,
  visualDna: CreatureVisualDna,
  override?: ChassisId | null,
): ChassisId {
  if (override) return override;
  const fromForm = chassisFromFormId(formId);
  if (fromForm) return fromForm;
  return visualDna.chassisId;
}
