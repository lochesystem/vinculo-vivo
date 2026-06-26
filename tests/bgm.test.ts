import { describe, it, expect, beforeEach } from 'vitest';
import {
  BGM_TRACK_FILES,
  DEFAULT_BGM_VOLUME,
  loadBgmPrefs,
  nextTrackIndex,
  resolveTrackUrls,
  saveBgmPrefs,
  clampVolume,
} from '../src/audio/bgm';

describe('bgm playlist utils', () => {
  it('nextTrackIndex rotates', () => {
    expect(nextTrackIndex(0, 2)).toBe(1);
    expect(nextTrackIndex(1, 2)).toBe(0);
  });

  it('resolveTrackUrls uses base path', () => {
    const urls = resolveTrackUrls('/vinculo-vivo/', BGM_TRACK_FILES);
    expect(urls[0]).toBe('/vinculo-vivo/audio/bg-1.mp3');
    expect(urls[1]).toBe('/vinculo-vivo/audio/bg-2.mp3');
  });

  it('resolveTrackUrls adds trailing slash', () => {
    expect(resolveTrackUrls('/app', ['audio/bg-1.mp3'])[0]).toBe('/app/audio/bg-1.mp3');
  });
});

describe('bgm prefs', () => {
  let storage: Storage;

  beforeEach(() => {
    const map = new Map<string, string>();
    storage = {
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => { map.set(k, v); },
      removeItem: (k) => { map.delete(k); },
      clear: () => { map.clear(); },
      key: () => null,
      length: 0,
    };
  });

  it('loadBgmPrefs defaults', () => {
    expect(loadBgmPrefs(storage)).toEqual({ volume: DEFAULT_BGM_VOLUME, muted: false });
  });

  it('save and load prefs', () => {
    saveBgmPrefs({ volume: 0.7, muted: true }, storage);
    expect(loadBgmPrefs(storage)).toEqual({ volume: 0.7, muted: true });
  });

  it('clampVolume bounds', () => {
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_BGM_VOLUME);
  });
});
