import type { CareVector } from './types';
import type { FormPreset } from '../data/forms';
import { mulberry32 } from './rng';

function normalizeCareVector(cv: CareVector): CareVector {
  const total =
    cv.affection +
    cv.discipline +
    cv.playBias +
    cv.restBias +
    cv.nourishment +
    Math.max(0, cv.neglect) +
    1;
  return {
    affection: cv.affection / total,
    discipline: cv.discipline / total,
    playBias: cv.playBias / total,
    restBias: cv.restBias / total,
    nourishment: cv.nourishment / total,
    neglect: cv.neglect / total,
  };
}

function dotAffinity(form: FormPreset, cv: CareVector): number {
  const n = normalizeCareVector(cv);
  let score = 0;
  const aff = form.affinity;
  if (aff.affection) score += n.affection * aff.affection;
  if (aff.discipline) score += n.discipline * aff.discipline;
  if (aff.playBias) score += n.playBias * aff.playBias;
  if (aff.restBias) score += n.restBias * aff.restBias;
  if (aff.nourishment) score += n.nourishment * aff.nourishment;
  if (aff.neglect) score += n.neglect * aff.neglect;
  return score;
}

export function selectEvolutionForm(
  candidates: FormPreset[],
  careVector: CareVector,
  dnaSeed: number,
): FormPreset {
  if (candidates.length === 0) throw new Error('No evolution candidates');
  if (candidates.length === 1) return candidates[0];

  const scored = candidates.map((f) => ({ form: f, score: dotAffinity(f, careVector) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0].score;
  const tied = scored.filter((s) => Math.abs(s.score - top) < 0.001).map((s) => s.form);
  const rng = mulberry32(dnaSeed + careVector.affection * 1000 + careVector.discipline * 777);
  return tied[Math.floor(rng() * tied.length)];
}

export function evolutionPathFromForm(formId: string): string {
  if (formId.includes('guardian')) return 'guardian';
  if (formId.includes('feral')) return 'feral';
  if (formId.includes('mystic')) return 'mystic';
  if (formId.includes('asc')) return 'ascendant';
  if (formId.includes('apex')) return 'apex';
  return 'balanced';
}

export function isMajorEvolutionLevel(level: number): boolean {
  return [5, 10, 20, 30, 40, 50, 60, 70, 80].includes(level);
}

export function isMinorEvolutionLevel(level: number): boolean {
  return level % 3 === 0 && !isMajorEvolutionLevel(level);
}

export function getEvolutionStageForLevel(level: number): number {
  if (level < 5) return 0;
  if (level < 10) return 1;
  if (level < 20) return 2;
  if (level < 30) return 3;
  if (level < 40) return 4;
  if (level < 50) return 5;
  if (level < 60) return 6;
  if (level < 70) return 7;
  if (level < 80) return 8;
  return 9;
}
