import { describe, it, expect } from 'vitest';
import { generateTraitsFromSeed, computeDnaSeed, computeDnaHash } from '../src/core/dna';

describe('DNA generation', () => {
  it('generateTraitsFromSeed is deterministic', () => {
    const t1 = generateTraitsFromSeed(123456789);
    const t2 = generateTraitsFromSeed(123456789);
    expect(t1).toEqual(t2);
  });

  it('different seeds produce different traits', () => {
    const t1 = generateTraitsFromSeed(111);
    const t2 = generateTraitsFromSeed(222);
    expect(t1.archetype !== t2.archetype || t1.bodyShape !== t2.bodyShape || t1.rarity !== t2.rarity).toBe(true);
  });

  it('includes all required trait fields', () => {
    const t = generateTraitsFromSeed(55555);
    expect(t.archetype).toBeTruthy();
    expect(t.bodyShape).toBeTruthy();
    expect(t.palette.primary).toMatch(/^hsl\(/);
    expect(t.parts).toBeDefined();
    expect(t.personality.curious).toBeGreaterThanOrEqual(0);
    expect(t.baseStats.vitality).toBeGreaterThan(0);
  });

  it('computeDnaSeed is deterministic', async () => {
    const s1 = await computeDnaSeed('user-1', 1000);
    const s2 = await computeDnaSeed('user-1', 1000);
    expect(s1).toBe(s2);
  });

  it('computeDnaHash is deterministic', async () => {
    const h1 = await computeDnaHash('user-1', 1000, 42);
    const h2 = await computeDnaHash('user-1', 1000, 42);
    expect(h1).toBe(h2);
    expect(h1.length).toBe(64);
  });
});
