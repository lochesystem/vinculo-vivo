export const BGM_TRACK_FILES = ['audio/bg-1.mp3', 'audio/bg-2.mp3'] as const;
export const BGM_VOLUME_KEY = 'vv_bgm_volume';
export const BGM_MUTED_KEY = 'vv_bgm_muted';
export const DEFAULT_BGM_VOLUME = 0.45;

export interface BgmPrefs {
  volume: number;
  muted: boolean;
}

export function nextTrackIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

export function resolveTrackUrls(baseUrl: string, files: readonly string[] = BGM_TRACK_FILES): string[] {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return files.map((file) => `${base}${file}`);
}

export function loadBgmPrefs(storage?: Storage): BgmPrefs {
  const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return { volume: DEFAULT_BGM_VOLUME, muted: false };
  const volRaw = store.getItem(BGM_VOLUME_KEY);
  const mutedRaw = store.getItem(BGM_MUTED_KEY);
  const volume = volRaw != null ? clampVolume(Number(volRaw)) : DEFAULT_BGM_VOLUME;
  const muted = mutedRaw === 'true';
  return { volume, muted };
}

export function saveBgmPrefs(prefs: BgmPrefs, storage?: Storage): void {
  const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return;
  store.setItem(BGM_VOLUME_KEY, String(clampVolume(prefs.volume)));
  store.setItem(BGM_MUTED_KEY, String(prefs.muted));
}

export function clampVolume(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_BGM_VOLUME;
  return Math.max(0, Math.min(1, n));
}

export class HabitatBgm {
  private audio: HTMLAudioElement;
  private tracks: string[];
  private trackIndex = 0;
  private loadedUrl = '';
  private unlocked = false;
  private habitatActive = false;
  private prefs: BgmPrefs;

  constructor(baseUrl = import.meta.env.BASE_URL || '/') {
    this.tracks = resolveTrackUrls(baseUrl);
    this.prefs = loadBgmPrefs();
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.applyPrefsToAudio();
    this.audio.addEventListener('ended', () => this.onTrackEnded());
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    if (this.habitatActive && !this.prefs.muted) {
      void this.play();
    }
  }

  setHabitatActive(active: boolean): void {
    this.habitatActive = active;
    if (active) {
      if (this.unlocked && !this.prefs.muted) void this.play();
    } else {
      this.pause();
    }
  }

  play(): Promise<void> {
    if (!this.unlocked || !this.habitatActive || this.prefs.muted) {
      return Promise.resolve();
    }
    const url = this.tracks[this.trackIndex];
    if (this.loadedUrl !== url) {
      this.audio.src = url;
      this.loadedUrl = url;
    }
    this.applyPrefsToAudio();
    if (this.audio.paused) {
      return this.audio.play().catch(() => {});
    }
    return Promise.resolve();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  toggleMuted(): boolean {
    this.setMuted(!this.prefs.muted);
    return this.prefs.muted;
  }

  setMuted(muted: boolean): void {
    this.prefs.muted = muted;
    saveBgmPrefs(this.prefs);
    this.applyPrefsToAudio();
    if (muted) {
      this.pause();
    } else if (this.unlocked && this.habitatActive) {
      void this.play();
    }
  }

  setVolume(volume: number): void {
    this.prefs.volume = clampVolume(volume);
    saveBgmPrefs(this.prefs);
    this.applyPrefsToAudio();
  }

  getVolume(): number {
    return this.prefs.volume;
  }

  isMuted(): boolean {
    return this.prefs.muted;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  private onTrackEnded(): void {
    this.trackIndex = nextTrackIndex(this.trackIndex, this.tracks.length);
    this.loadedUrl = '';
    if (this.habitatActive && this.unlocked && !this.prefs.muted) {
      void this.play();
    }
  }

  private applyPrefsToAudio(): void {
    this.audio.volume = this.prefs.volume;
    this.audio.muted = this.prefs.muted;
  }
}

let habitatBgmInstance: HabitatBgm | undefined;

export function getHabitatBgm(): HabitatBgm {
  if (!habitatBgmInstance) {
    habitatBgmInstance = new HabitatBgm();
  }
  return habitatBgmInstance;
}
