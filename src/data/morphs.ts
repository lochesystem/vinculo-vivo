export type MorphId =
  | 'chibi_blob'
  | 'quadruped_pup'
  | 'serpent_coil'
  | 'canine_feral'
  | 'humanoid_guardian'
  | 'beast_winged'
  | 'ethereal_mystic'
  | 'apex_hybrid';

export function morphFromFormId(formId: string): MorphId {
  if (formId.endsWith('_egg')) return 'chibi_blob';
  if (formId.endsWith('_hatchling')) return 'chibi_blob';
  if (formId.includes('guardian_5')) return 'quadruped_pup';
  if (formId.includes('feral_5')) return 'canine_feral';
  if (formId.includes('asc_5')) return 'beast_winged';
  if (formId.includes('mystic_10')) return 'ethereal_mystic';
  if (formId.includes('guardian_10')) return 'humanoid_guardian';
  if (formId.includes('feral_10')) return 'beast_winged';
  if (formId.includes('apex_20')) return 'apex_hybrid';
  return 'chibi_blob';
}
