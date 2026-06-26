import { describe, it, expect } from 'vitest';
import { mulberry32, fnv1a, pickWeighted } from '../src/core/rng';

describe('mulberry32', () => {
  it('same seed produces same sequence', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('different seeds produce different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it('values are in [0, 1)', () => {
    const rng = mulberry32(999);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('fnv1a', () => {
  it('is deterministic', () => {
    expect(fnv1a('test-user:123:salt')).toBe(fnv1a('test-user:123:salt'));
  });

  it('differs for different inputs', () => {
    expect(fnv1a('a')).not.toBe(fnv1a('b'));
  });
});

describe('pickWeighted', () => {
  it('respects weights over many samples', () => {
    const rng = mulberry32(42);
    const counts: Record<'a' | 'b' | 'c', number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 1000; i++) {
      const pick = pickWeighted(rng, ['a', 'b', 'c'] as const, [90, 9, 1]);
      counts[pick]++;
    }
    expect(counts.a).toBeGreaterThan(counts.b);
    expect(counts.b).toBeGreaterThan(counts.c);
  });
});
