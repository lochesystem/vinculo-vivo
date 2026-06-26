import { describe, it, expect } from 'vitest';
import { DAY_CYCLE_MS } from '../src/core/types';
import {
  formatCountdown,
  formatGameClock,
  getCountdownText,
  getMsUntilNextPeriod,
  getPeriodLabel,
  getSkyPeriod,
} from '../src/core/day-cycle';

describe('day-cycle', () => {
  it('formatGameClock maps phase to 24h clock', () => {
    expect(formatGameClock(0)).toBe('00:00');
    expect(formatGameClock(0.5)).toBe('12:00');
    expect(formatGameClock(0.25)).toBe('06:00');
    expect(formatGameClock(0.75)).toBe('18:00');
  });

  it('getSkyPeriod matches light bands', () => {
    expect(getSkyPeriod(0.1)).toBe('dawn');
    expect(getSkyPeriod(0.45)).toBe('day');
    expect(getSkyPeriod(0.8)).toBe('dusk');
    expect(getSkyPeriod(0.92)).toBe('night');
  });

  it('getPeriodLabel returns Portuguese labels', () => {
    expect(getPeriodLabel('day')).toBe('Dia');
    expect(getPeriodLabel('night')).toBe('Noite');
  });

  it('getMsUntilNextPeriod from midday to dusk', () => {
    const ms = getMsUntilNextPeriod(0.5);
    expect(ms).toBe(Math.round(0.25 * DAY_CYCLE_MS));
  });

  it('formatCountdown formats mm:ss', () => {
    expect(formatCountdown(125000)).toBe('2:05');
    expect(formatCountdown(61000)).toBe('1:01');
  });

  it('getCountdownText includes next phase hint', () => {
    const text = getCountdownText(0.45);
    expect(text).toContain('noite em');
  });
});
