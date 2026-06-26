import type { ChassisId, FaceId, FeatureSlot } from '../core/types';

export type { ChassisId, FaceId, FeatureSlot };

export interface FaceAnchor {
  x: number;
  y: number;
}

export interface ChassisMeta {
  id: ChassisId;
  faceAnchor: FaceAnchor;
}

/** Hatchlings pick from these 8 via DNA */
export const HATCH_CHASSIS_IDS: readonly ChassisId[] = [
  'round_mascot',
  'pear_creature',
  'bird_beak',
  'box_robot',
  'floppy_ears',
  'crown_royal',
  'ghost_wisp',
  'insect_antenna',
];

export const ALL_FACE_IDS: readonly FaceId[] = [
  'dot_classic',
  'beady_wide',
  'sleepy_slit',
  'beak_mouth',
  'cyclops',
  'star_eyes',
  'grin_toothy',
  'tiny_o',
  'angry_brow',
  'mask_slash',
];

export const CHASSIS_META: Record<ChassisId, ChassisMeta> = {
  round_mascot: { id: 'round_mascot', faceAnchor: { x: 22, y: 18 } },
  pear_creature: { id: 'pear_creature', faceAnchor: { x: 22, y: 16 } },
  bird_beak: { id: 'bird_beak', faceAnchor: { x: 28, y: 20 } },
  box_robot: { id: 'box_robot', faceAnchor: { x: 22, y: 20 } },
  floppy_ears: { id: 'floppy_ears', faceAnchor: { x: 22, y: 18 } },
  crown_royal: { id: 'crown_royal', faceAnchor: { x: 22, y: 20 } },
  ghost_wisp: { id: 'ghost_wisp', faceAnchor: { x: 22, y: 16 } },
  insect_antenna: { id: 'insect_antenna', faceAnchor: { x: 22, y: 18 } },
  long_snout: { id: 'long_snout', faceAnchor: { x: 30, y: 20 } },
  star_spirit: { id: 'star_spirit', faceAnchor: { x: 22, y: 18 } },
  mushroom_cap: { id: 'mushroom_cap', faceAnchor: { x: 22, y: 22 } },
  ninja_mask: { id: 'ninja_mask', faceAnchor: { x: 22, y: 20 } },
  quadruped_low: { id: 'quadruped_low', faceAnchor: { x: 30, y: 18 } },
  serpent_neck: { id: 'serpent_neck', faceAnchor: { x: 34, y: 12 } },
  humanoid_tall: { id: 'humanoid_tall', faceAnchor: { x: 22, y: 10 } },
  apex_hybrid: { id: 'apex_hybrid', faceAnchor: { x: 22, y: 12 } },
};

export function chassisFromFormId(formId: string): ChassisId | null {
  if (formId.endsWith('_egg') || formId.endsWith('_hatchling')) return null;
  if (formId.includes('guardian_5')) return 'quadruped_low';
  if (formId.includes('feral_5')) return 'long_snout';
  if (formId.includes('asc_5')) return 'insect_antenna';
  if (formId.includes('guardian_10')) return 'humanoid_tall';
  if (formId.includes('feral_10')) return 'bird_beak';
  if (formId.includes('mystic_10')) return 'star_spirit';
  if (formId.includes('apex_20')) return 'apex_hybrid';
  return null;
}

export function evolutionFeaturesFromForm(formId: string): FeatureSlot[] {
  if (formId.includes('guardian_10')) return ['crown'];
  if (formId.includes('feral_10')) return ['tail'];
  if (formId.includes('mystic_10')) return ['cape'];
  if (formId.includes('apex_20')) return ['wings', 'horn'];
  if (formId.includes('asc_5')) return ['wings'];
  return [];
}

/** Features already baked into chassis art — do not stack as floating parts. */
export const CHASSIS_BUILTIN_FEATURES: Partial<Record<ChassisId, FeatureSlot[]>> = {
  floppy_ears: ['ears'],
  crown_royal: ['crown'],
  bird_beak: ['tuft'],
  insect_antenna: ['tuft', 'horn'],
  box_robot: ['horn'],
  ghost_wisp: ['tail', 'cape'],
  long_snout: ['tuft'],
  serpent_neck: ['tail'],
  mushroom_cap: ['tuft'],
  ninja_mask: ['cape'],
  apex_hybrid: ['wings', 'horn', 'crown'],
};
