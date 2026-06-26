import {
  formatGameClock,
  getCountdownText,
  getPeriodIcon,
  getPeriodLabel,
  getSkyPeriod,
  type SkyPeriod,
} from '../core/day-cycle';
import type { HabitatState } from '../render/habitat';

let hudEl: HTMLElement | null = null;
let nameEl: HTMLElement | null = null;
let clockEl: HTMLElement | null = null;
let iconEl: HTMLElement | null = null;
let periodEl: HTMLElement | null = null;
let countdownEl: HTMLElement | null = null;
let lastTextUpdate = 0;
let lastPeriod: SkyPeriod | null = null;

export function mountStageHud(container: HTMLElement): void {
  unmountStageHud();
  hudEl = document.createElement('div');
  hudEl.className = 'stage-hud';
  hudEl.setAttribute('aria-live', 'polite');
  hudEl.innerHTML = `
    <div class="stage-hud-row">
      <span class="stage-hud-name"></span>
      <span class="stage-hud-clock">00:00</span>
    </div>
    <div class="stage-hud-row stage-hud-cycle">
      <span class="stage-hud-icon">☀</span>
      <span class="stage-hud-period">Dia</span>
      <span class="stage-hud-countdown">· noite em 0:00</span>
    </div>`;
  container.appendChild(hudEl);
  nameEl = hudEl.querySelector('.stage-hud-name');
  clockEl = hudEl.querySelector('.stage-hud-clock');
  iconEl = hudEl.querySelector('.stage-hud-icon');
  periodEl = hudEl.querySelector('.stage-hud-period');
  countdownEl = hudEl.querySelector('.stage-hud-countdown');
  lastTextUpdate = 0;
  lastPeriod = null;
}

export function unmountStageHud(): void {
  hudEl?.remove();
  hudEl = null;
  nameEl = null;
  clockEl = null;
  iconEl = null;
  periodEl = null;
  countdownEl = null;
  lastPeriod = null;
}

export function updateStageHud(creatureName: string, habitat: HabitatState, nowMs: number): void {
  if (!hudEl || !nameEl || !clockEl || !iconEl || !periodEl || !countdownEl) return;

  const period = getSkyPeriod(habitat.dayPhase);

  if (period !== lastPeriod) {
    hudEl.className = `stage-hud ${period}`;
    iconEl.textContent = getPeriodIcon(period);
    lastPeriod = period;
  }

  nameEl.textContent = creatureName;

  if (nowMs - lastTextUpdate >= 1000) {
    lastTextUpdate = nowMs;
    clockEl.textContent = formatGameClock(habitat.dayPhase);
    periodEl.textContent = getPeriodLabel(period);
    countdownEl.textContent = `· ${getCountdownText(habitat.dayPhase)}`;
  }
}
