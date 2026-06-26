export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'mythic';

export type ArchetypeId =
  | 'ember'
  | 'tide'
  | 'moss'
  | 'void'
  | 'spark'
  | 'gale'
  | 'stone'
  | 'lumen'
  | 'frost'
  | 'bloom';

export type BodyShape = 'round' | 'slim' | 'bulky' | 'winged' | 'quadruped' | 'serpent';

export type Mood =
  | 'happy'
  | 'content'
  | 'hungry'
  | 'lonely'
  | 'sick'
  | 'sleeping'
  | 'excited'
  | 'sad';

export type CareAction = 'feed' | 'play' | 'clean' | 'rest' | 'train';

export interface PersonalityTraits {
  curious: number;
  shy: number;
  stubborn: number;
  affectionate: number;
  aggressive: number;
  lazy: number;
}

export interface BaseStats {
  vitality: number;
  power: number;
  spirit: number;
  agility: number;
  wisdom: number;
}

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  eye: string;
  glow: string;
}

export interface ModularParts {
  horns: number;
  wings: number;
  tail: number;
  eyes: number;
  pattern: number;
}

export interface DnaTraits {
  archetype: ArchetypeId;
  bodyShape: BodyShape;
  palette: Palette;
  parts: ModularParts;
  rarity: Rarity;
  baseStats: BaseStats;
  personality: PersonalityTraits;
}

export type ChassisId =
  | 'round_mascot'
  | 'pear_creature'
  | 'bird_beak'
  | 'box_robot'
  | 'floppy_ears'
  | 'crown_royal'
  | 'ghost_wisp'
  | 'insect_antenna'
  | 'long_snout'
  | 'star_spirit'
  | 'mushroom_cap'
  | 'ninja_mask'
  | 'quadruped_low'
  | 'serpent_neck'
  | 'humanoid_tall'
  | 'apex_hybrid';

export type FaceId =
  | 'dot_classic'
  | 'beady_wide'
  | 'sleepy_slit'
  | 'beak_mouth'
  | 'cyclops'
  | 'star_eyes'
  | 'grin_toothy'
  | 'tiny_o'
  | 'angry_brow'
  | 'mask_slash';

export type FeatureSlot = 'ears' | 'crown' | 'tail' | 'wings' | 'horn' | 'cape' | 'tuft';

export interface CreatureVisualDna {
  chassisId: ChassisId;
  faceId: FaceId;
  features: FeatureSlot[];
  variant: 0 | 1 | 2 | 3;
}

export interface CareVector {
  affection: number;
  discipline: number;
  playBias: number;
  restBias: number;
  nourishment: number;
  neglect: number;
}

export interface Needs {
  hunger: number;
  energy: number;
  hygiene: number;
  happiness: number;
}

export interface CreatureState {
  id: string;
  ownerId: string;
  name: string;
  dnaSeed: number;
  dnaHash: string;
  level: number;
  xp: number;
  evolutionStage: number;
  evolutionPath: string;
  formId: string;
  careVector: CareVector;
  needs: Needs;
  mood: Mood;
  lastTickAt: number;
  createdAt: number;
  dailyStreak: number;
  lastCareDate: string;
}

export interface EvolutionRecord {
  level: number;
  formId: string;
  careSnapshot: CareVector;
  unlockedAt: number;
}

export interface CareLogEntry {
  action: CareAction;
  delta: Partial<Needs>;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  createdAt: number;
}

export interface AppSession {
  userId: string;
  email: string;
  profile: UserProfile | null;
}

export type ScreenId = 'splash' | 'auth' | 'hatch' | 'home' | 'profile';

export const APP_SALT = 'vinculo-vivo-soulbound-2026';
export const MAX_LEVEL = 80;
export const MVP_MAX_LEVEL = 20;
export const OFFLINE_DECAY_CAP_MS = 8 * 60 * 60 * 1000;
export const DAY_CYCLE_MS = 30 * 60 * 1000;

export const MAJOR_EVOLUTION_LEVELS = [5, 10, 20, 30, 40, 50, 60, 70, 80];
export const SKILL_UNLOCK_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

export function xpForLevel(level: number): number {
  return Math.floor(50 + level * level * 12);
}

export function defaultNeeds(): Needs {
  return { hunger: 80, energy: 85, hygiene: 90, happiness: 75 };
}

export function defaultCareVector(): CareVector {
  return {
    affection: 0,
    discipline: 0,
    playBias: 0,
    restBias: 0,
    nourishment: 0,
    neglect: 0,
  };
}
