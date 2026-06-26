import { DAY_CYCLE_MS } from './types';

export type SkyPeriod = 'dawn' | 'day' | 'dusk' | 'night';

const PERIOD_LABELS: Record<SkyPeriod, string> = {
  dawn: 'Amanhecendo',
  day: 'Dia',
  dusk: 'Anoitecendo',
  night: 'Noite',
};

const PERIOD_ICONS: Record<SkyPeriod, string> = {
  dawn: '🌅',
  day: '☀',
  dusk: '🌆',
  night: '🌙',
};

const NEXT_PERIOD: Record<SkyPeriod, { phase: number; label: string }> = {
  dawn: { phase: 0.2, label: 'dia' },
  day: { phase: 0.75, label: 'noite' },
  dusk: { phase: 0.2, label: 'amanhecer' },
  night: { phase: 0.2, label: 'amanhecer' },
};

export function formatGameClock(dayPhase: number): string {
  const totalMinutes = Math.floor(((dayPhase % 1) + 1) % 1 * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getSkyPeriod(dayPhase: number): SkyPeriod {
  const p = ((dayPhase % 1) + 1) % 1;
  if (p < 0.2) return 'dawn';
  if (p < 0.75) return 'day';
  if (p < 0.85) return 'dusk';
  return 'night';
}

export function getPeriodLabel(period: SkyPeriod): string {
  return PERIOD_LABELS[period];
}

export function getPeriodIcon(period: SkyPeriod): string {
  return PERIOD_ICONS[period];
}

function phaseDelta(from: number, to: number): number {
  const f = ((from % 1) + 1) % 1;
  const t = ((to % 1) + 1) % 1;
  if (t >= f) return t - f;
  return 1 - f + t;
}

export function getMsUntilNextPeriod(dayPhase: number, cycleMs = DAY_CYCLE_MS): number {
  const period = getSkyPeriod(dayPhase);
  const next = NEXT_PERIOD[period];
  const delta = phaseDelta(dayPhase, next.phase);
  return Math.round(delta * cycleMs);
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getCountdownText(dayPhase: number, cycleMs = DAY_CYCLE_MS): string {
  const period = getSkyPeriod(dayPhase);
  const next = NEXT_PERIOD[period];
  const ms = getMsUntilNextPeriod(dayPhase, cycleMs);
  return `${next.label} em ${formatCountdown(ms)}`;
}
