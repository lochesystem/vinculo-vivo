import { describe, it, expect } from 'vitest';
import { selectEvolutionForm, evolutionPathFromForm } from '../src/core/evolution';
import { getCandidateForms } from '../src/data/forms';
import type { CareVector } from '../src/core/types';

describe('Evolution branching', () => {
  const highDiscipline: CareVector = {
    affection: 2,
    discipline: 20,
    playBias: 1,
    restBias: 1,
    nourishment: 5,
    neglect: 0,
  };

  const highPlay: CareVector = {
    affection: 10,
    discipline: 1,
    playBias: 20,
    restBias: 1,
    nourishment: 2,
    neglect: 0,
  };

  it('selects guardian form with high discipline at level 5', () => {
    const candidates = getCandidateForms('ember', 5);
    expect(candidates.length).toBeGreaterThan(1);
    const form = selectEvolutionForm(candidates, highDiscipline, 12345);
    expect(form.id).toContain('guardian');
    expect(evolutionPathFromForm(form.id)).toBe('guardian');
  });

  it('selects feral form with high play bias', () => {
    const candidates = getCandidateForms('ember', 5);
    const form = selectEvolutionForm(candidates, highPlay, 12345);
    expect(form.id).toContain('feral');
  });

  it('same inputs produce same form (deterministic tie-break)', () => {
    const candidates = getCandidateForms('tide', 10);
    const cv: CareVector = { affection: 5, discipline: 5, playBias: 5, restBias: 5, nourishment: 5, neglect: 0 };
    const f1 = selectEvolutionForm(candidates, cv, 999);
    const f2 = selectEvolutionForm(candidates, cv, 999);
    expect(f1.id).toBe(f2.id);
  });
});
