import { describe, it, expect } from 'vitest';
import { defaultNeeds } from '../src/core/types';
import { generateSpeech } from '../src/data/speech-banks';
import {
  clampNeedValue,
  getCareButtonClass,
  getMoodClass,
  getNeedLowClass,
  renderNeedBar,
} from '../src/ui/needs-ui';

describe('needs-ui', () => {
  it('clampNeedValue rounds and clamps', () => {
    expect(clampNeedValue(72.4)).toBe(72);
    expect(clampNeedValue(undefined)).toBe(0);
    expect(clampNeedValue(150)).toBe(100);
    expect(clampNeedValue(-5)).toBe(0);
  });

  it('renderNeedBar includes percent width', () => {
    const html = renderNeedBar('Fome', 72, 'hunger');
    expect(html).toContain('Fome 72%');
    expect(html).toContain('width:72%');
    expect(html).toContain('bar hunger');
  });

  it('adds low-hunger class below threshold', () => {
    expect(getNeedLowClass('hunger', 29)).toBe(' low-hunger');
    expect(renderNeedBar('Fome', 20, 'hunger')).toContain('low-hunger');
    expect(getNeedLowClass('hunger', 30)).toBe('');
  });

  it('adds low-hygiene class below threshold', () => {
    expect(getNeedLowClass('hygiene', 15)).toBe(' low-hygiene');
    expect(getNeedLowClass('energy', 10)).toBe('');
  });

  it('suggests feed when hunger critical', () => {
    const needs = { ...defaultNeeds(), hunger: 20 };
    expect(getCareButtonClass('feed', needs)).toBe(' suggested');
    expect(getCareButtonClass('clean', needs)).toBe('');
  });

  it('suggests clean when hygiene critical', () => {
    const needs = { ...defaultNeeds(), hygiene: 18 };
    expect(getCareButtonClass('clean', needs)).toBe(' suggested');
    expect(getCareButtonClass('feed', needs)).toBe('');
  });

  it('mood class for hungry and sick', () => {
    expect(getMoodClass('hungry')).toBe('hungry');
    expect(getMoodClass('sick')).toBe('sick');
    expect(getMoodClass('happy')).toBe('');
  });
});

describe('generateSpeech with needs', () => {
  it('prioritizes hunger message when hunger is low', () => {
    const needs = { ...defaultNeeds(), hunger: 15, happiness: 90 };
    const line = generateSpeech('Test', 'happy', 'moss', 42, 1, needs);
    expect(line.toLowerCase()).toContain('fome');
  });

  it('prioritizes hygiene message when hygiene is low and hunger ok', () => {
    const needs = { ...defaultNeeds(), hunger: 80, hygiene: 15 };
    const line = generateSpeech('Test', 'happy', 'moss', 42, 2, needs);
    expect(line.toLowerCase()).toContain('higiene');
  });
});
