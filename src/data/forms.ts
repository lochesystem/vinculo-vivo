import type { ArchetypeId, CareVector } from '../core/types';
import { ARCHETYPES } from './archetypes';
import type { MorphId } from './morphs';
import { morphFromFormId } from './morphs';

export interface FormPreset {
  id: string;
  label: string;
  stage: number;
  affinity: Partial<CareVector>;
  bodyScale: number;
  hornScale: number;
  wingScale: number;
  tailScale: number;
  auraIntensity: number;
  silhouette: 'egg' | 'baby' | 'teen' | 'adult' | 'apex';
  morphId: MorphId;
}

export const PATHS = ['guardian', 'feral', 'ascendant', 'mystic', 'balanced'] as const;

function archPrefix(arch: ArchetypeId): string {
  return arch.slice(0, 3);
}

function form(
  base: Omit<FormPreset, 'morphId'>,
): FormPreset {
  return { ...base, morphId: morphFromFormId(base.id) };
}

function formsForArchetype(arch: ArchetypeId): FormPreset[] {
  const p = archPrefix(arch);
  return [
    form({ id: `${arch}_egg`, label: 'Ovo', stage: 0, affinity: {}, bodyScale: 0.5, hornScale: 0, wingScale: 0, tailScale: 0, auraIntensity: 0.2, silhouette: 'egg' }),
    form({ id: `${arch}_hatchling`, label: 'Filhote', stage: 1, affinity: { affection: 1 }, bodyScale: 0.65, hornScale: 0.3, wingScale: 0.2, tailScale: 0.3, auraIntensity: 0.35, silhouette: 'baby' }),
    form({ id: `${p}_guardian_5`, label: 'Guardião I', stage: 2, affinity: { discipline: 3, nourishment: 1 }, bodyScale: 0.85, hornScale: 1.2, wingScale: 0.5, tailScale: 0.6, auraIntensity: 0.5, silhouette: 'teen' }),
    form({ id: `${p}_feral_5`, label: 'Feral I', stage: 2, affinity: { playBias: 3, affection: 1 }, bodyScale: 0.9, hornScale: 0.6, wingScale: 0.8, tailScale: 1.2, auraIntensity: 0.55, silhouette: 'teen' }),
    form({ id: `${p}_asc_5`, label: 'Ascendente I', stage: 2, affinity: { restBias: 1, discipline: 1, playBias: 1 }, bodyScale: 0.88, hornScale: 0.9, wingScale: 1, tailScale: 0.8, auraIntensity: 0.6, silhouette: 'teen' }),
    form({ id: `${p}_guardian_10`, label: 'Guardião II', stage: 3, affinity: { discipline: 5, nourishment: 2 }, bodyScale: 1.05, hornScale: 1.5, wingScale: 0.7, tailScale: 0.8, auraIntensity: 0.65, silhouette: 'adult' }),
    form({ id: `${p}_feral_10`, label: 'Feral II', stage: 3, affinity: { playBias: 5, affection: 2 }, bodyScale: 1.1, hornScale: 0.8, wingScale: 1.3, tailScale: 1.5, auraIntensity: 0.7, silhouette: 'adult' }),
    form({ id: `${p}_mystic_10`, label: 'Místico', stage: 3, affinity: { restBias: 3 }, bodyScale: 1, hornScale: 1.1, wingScale: 1.1, tailScale: 1, auraIntensity: 0.85, silhouette: 'adult' }),
    form({ id: `${p}_apex_20`, label: 'Ápice', stage: 4, affinity: { discipline: 2, playBias: 2, affection: 2 }, bodyScale: 1.25, hornScale: 1.8, wingScale: 1.5, tailScale: 1.4, auraIntensity: 1, silhouette: 'apex' }),
  ];
}

export const FORM_REGISTRY: FormPreset[] = ARCHETYPES.flatMap((a) =>
  formsForArchetype(a.id as ArchetypeId),
);

export function getFormById(formId: string): FormPreset | undefined {
  return FORM_REGISTRY.find((f) => f.id === formId);
}

export function getCandidateForms(archetype: ArchetypeId, level: number): FormPreset[] {
  const p = archPrefix(archetype);
  if (level < 5) {
    return FORM_REGISTRY.filter((f) => f.id === `${archetype}_egg` || f.id === `${archetype}_hatchling`);
  }
  if (level < 10) {
    return FORM_REGISTRY.filter((f) => f.id.startsWith(`${p}_`) && f.id.endsWith('_5'));
  }
  if (level < 20) {
    return FORM_REGISTRY.filter(
      (f) => f.id.startsWith(`${p}_`) && (f.id.endsWith('_10') || f.id.includes('mystic')),
    );
  }
  return FORM_REGISTRY.filter((f) => f.id.includes('_apex_20') && f.id.startsWith(`${p}_`));
}

export function getInitialFormId(archetype: ArchetypeId): string {
  return `${archetype}_egg`;
}

export function getHatchlingFormId(archetype: ArchetypeId): string {
  return `${archetype}_hatchling`;
}
