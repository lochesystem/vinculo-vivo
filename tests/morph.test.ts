import { describe, it, expect } from 'vitest';
import { FORM_REGISTRY, getCandidateForms } from '../src/data/forms';
import { morphFromFormId } from '../src/data/morphs';
import { selectEvolutionForm } from '../src/core/evolution';
import type { CareVector } from '../src/core/types';

describe('morphId determinism', () => {
  it('every form has a morphId matching morphFromFormId', () => {
    for (const form of FORM_REGISTRY) {
      expect(form.morphId).toBe(morphFromFormId(form.id));
    }
  });

  it('guardian path at level 5 maps to quadruped_pup', () => {
    const cv: CareVector = {
      affection: 2,
      discipline: 20,
      playBias: 1,
      restBias: 1,
      nourishment: 5,
      neglect: 0,
    };
    const form = selectEvolutionForm(getCandidateForms('ember', 5), cv, 42);
    expect(form.morphId).toBe('quadruped_pup');
  });

  it('feral path at level 5 maps to canine_feral', () => {
    const cv: CareVector = {
      affection: 10,
      discipline: 1,
      playBias: 20,
      restBias: 1,
      nourishment: 2,
      neglect: 0,
    };
    const form = selectEvolutionForm(getCandidateForms('tide', 5), cv, 42);
    expect(form.morphId).toBe('canine_feral');
  });

  it('same seed + care vector yields same morph at level 10', () => {
    const cv: CareVector = {
      affection: 5,
      discipline: 5,
      playBias: 5,
      restBias: 5,
      nourishment: 5,
      neglect: 0,
    };
    const candidates = getCandidateForms('moss', 10);
    const f1 = selectEvolutionForm(candidates, cv, 12345);
    const f2 = selectEvolutionForm(candidates, cv, 12345);
    expect(f1.morphId).toBe(f2.morphId);
  });

  it('apex level 20 maps to apex_hybrid', () => {
    const cv: CareVector = {
      affection: 5,
      discipline: 5,
      playBias: 5,
      restBias: 5,
      nourishment: 5,
      neglect: 0,
    };
    const form = selectEvolutionForm(getCandidateForms('void', 20), cv, 777);
    expect(form.morphId).toBe('apex_hybrid');
  });
});
