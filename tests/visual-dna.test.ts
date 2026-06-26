import { describe, it, expect } from 'vitest';
import { generateTraitsFromSeed } from '../src/core/dna';
import { generateVisualDnaFromSeed, resolveChassisId } from '../src/core/visual-dna';
import { HATCH_CHASSIS_IDS, ALL_FACE_IDS, chassisFromFormId } from '../src/data/chassis';
import { FORM_REGISTRY } from '../src/data/forms';

describe('CreatureVisualDna determinism', () => {
  it('same seed produces same visual DNA', () => {
    const traits = generateTraitsFromSeed(4242);
    const a = generateVisualDnaFromSeed(4242, traits);
    const b = generateVisualDnaFromSeed(4242, traits);
    expect(a).toEqual(b);
  });

  it('hatch chassis is one of HATCH_CHASSIS_IDS', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const traits = generateTraitsFromSeed(seed);
      const v = generateVisualDnaFromSeed(seed, traits);
      expect(HATCH_CHASSIS_IDS).toContain(v.chassisId);
      expect(ALL_FACE_IDS).toContain(v.faceId);
      expect(v.variant).toBeGreaterThanOrEqual(0);
      expect(v.variant).toBeLessThanOrEqual(3);
    }
  });

  it('different seeds often produce different chassis', () => {
    const ids = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) =>
        generateVisualDnaFromSeed(s, generateTraitsFromSeed(s)).chassisId,
      ),
    );
    expect(ids.size).toBeGreaterThan(3);
  });
});

describe('chassisFromFormId', () => {
  it('hatchling returns null (uses DNA chassis)', () => {
    expect(chassisFromFormId('ember_hatchling')).toBeNull();
  });

  it('evolution forms map to distinct chassis', () => {
    expect(chassisFromFormId('emb_guardian_5')).toBe('quadruped_low');
    expect(chassisFromFormId('emb_feral_5')).toBe('long_snout');
    expect(chassisFromFormId('emb_apex_20')).toBe('apex_hybrid');
  });

  it('every form with chassisId matches chassisFromFormId', () => {
    for (const form of FORM_REGISTRY) {
      expect(form.chassisId).toBe(chassisFromFormId(form.id));
    }
  });
});

describe('resolveChassisId', () => {
  it('uses DNA chassis for hatchling', () => {
    const traits = generateTraitsFromSeed(99);
    const visual = generateVisualDnaFromSeed(99, traits);
    expect(resolveChassisId('tide_hatchling', visual)).toBe(visual.chassisId);
  });

  it('uses form chassis when evolved', () => {
    const traits = generateTraitsFromSeed(99);
    const visual = generateVisualDnaFromSeed(99, traits);
    expect(resolveChassisId('tid_mystic_10', visual)).toBe('star_spirit');
  });
});
