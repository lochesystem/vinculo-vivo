import { describe, it, expect } from 'vitest';
import { ALL_BIOMES, BIOME_PALETTES, applyDayPhase, dayLightness, getBiomePalette } from '../src/data/biome-palettes';
import { drawPixelHabitat } from '../src/render/pixel-habitat';
import { ARCHETYPES } from '../src/data/archetypes';

function mockCtx(): CanvasRenderingContext2D {
  return {
    save: () => {},
    restore: () => {},
    fillRect: () => {},
    imageSmoothingEnabled: true,
    fillStyle: '',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('biome palettes', () => {
  it('has palette for every archetype biome', () => {
    for (const arch of ARCHETYPES) {
      expect(BIOME_PALETTES[arch.biome]).toBeDefined();
    }
  });

  it('ALL_BIOMES matches 10 biomes', () => {
    expect(ALL_BIOMES.length).toBe(10);
  });

  it('dayLightness peaks during day window', () => {
    expect(dayLightness(0.45)).toBe(1);
    expect(dayLightness(0.9)).toBeLessThan(0.5);
  });

  it('applyDayPhase darkens at night', () => {
    const day = getBiomePalette('forest');
    const night = applyDayPhase(day, 0.95);
    expect(night.sky).not.toBe(day.sky);
  });
});

describe('drawPixelHabitat', () => {
  it('renders without error at stage size', () => {
    const ctx = mockCtx();
    expect(() => {
      drawPixelHabitat(ctx, 360, 270, 'forest', 0.45, 303, 1);
    }).not.toThrow();
  });

  for (const biome of ALL_BIOMES) {
    it(`draws ${biome} biome`, () => {
      const ctx = mockCtx();
      expect(() => {
        drawPixelHabitat(ctx, 360, 270, biome, 0.45, 42, 0);
      }).not.toThrow();
    });
  }
});
