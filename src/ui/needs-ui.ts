import { clamp } from '../core/rng';
import type { CareAction, Mood, Needs } from '../core/types';
import {
  NEED_LOW_THRESHOLD,
  NEED_SUGGEST_HUNGER,
  NEED_SUGGEST_HYGIENE,
} from '../core/types';

export { NEED_LOW_THRESHOLD, NEED_SUGGEST_HUNGER, NEED_SUGGEST_HYGIENE };

export function clampNeedValue(val: number | undefined): number {
  return Math.round(clamp(val ?? 0, 0, 100));
}

export function getNeedLowClass(cls: string, val: number | undefined): string {
  const v = clampNeedValue(val);
  if (cls === 'hunger' && v < NEED_LOW_THRESHOLD) return ' low-hunger';
  if (cls === 'hygiene' && v < NEED_LOW_THRESHOLD) return ' low-hygiene';
  return '';
}

export function renderNeedBar(label: string, val: number | undefined, cls: string): string {
  const v = clampNeedValue(val);
  const low = getNeedLowClass(cls, v);
  return `<div class="need${low}"><span>${label} ${v}%</span><div class="bar ${cls}"><div style="width:${v}%"></div></div></div>`;
}

export function getCareButtonClass(action: CareAction, needs: Needs): string {
  if (action === 'feed' && needs.hunger < NEED_SUGGEST_HUNGER) return ' suggested';
  if (action === 'clean' && needs.hygiene < NEED_SUGGEST_HYGIENE) return ' suggested';
  return '';
}

export function getMoodClass(mood: Mood): string {
  if (mood === 'hungry') return 'hungry';
  if (mood === 'sick') return 'sick';
  return '';
}
