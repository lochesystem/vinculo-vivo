import { getHabitatBgm } from '../audio/bgm';

let rootEl: HTMLElement | null = null;
let muteBtn: HTMLButtonElement | null = null;
let volumeInput: HTMLInputElement | null = null;

function syncControlsUi(): void {
  if (!muteBtn || !volumeInput) return;
  const bgm = getHabitatBgm();
  const muted = bgm.isMuted();
  muteBtn.textContent = muted ? '🔇' : '🔊';
  muteBtn.setAttribute('aria-label', muted ? 'Ativar som' : 'Silenciar');
  volumeInput.value = String(Math.round(bgm.getVolume() * 100));
  volumeInput.disabled = muted;
}

export function mountAudioControls(): void {
  if (rootEl) return;

  rootEl = document.createElement('div');
  rootEl.className = 'audio-controls hidden';
  rootEl.innerHTML = `
    <button type="button" id="btn-bgm-mute" aria-label="Som">🔊</button>
    <input type="range" id="bgm-volume" min="0" max="100" value="45" aria-label="Volume" />`;

  document.body.appendChild(rootEl);
  muteBtn = rootEl.querySelector('#btn-bgm-mute');
  volumeInput = rootEl.querySelector('#bgm-volume');

  rootEl.addEventListener('pointerdown', () => {
    getHabitatBgm().unlock();
  }, { once: true });

  muteBtn?.addEventListener('click', () => {
    const bgm = getHabitatBgm();
    bgm.unlock();
    bgm.toggleMuted();
    syncControlsUi();
  });

  volumeInput?.addEventListener('input', () => {
    const vol = Number(volumeInput?.value ?? 45) / 100;
    getHabitatBgm().setVolume(vol);
    syncControlsUi();
  });

  syncControlsUi();
}

export function setAudioControlsVisible(visible: boolean): void {
  if (!rootEl) return;
  rootEl.classList.toggle('hidden', !visible);
}

export function refreshAudioControls(): void {
  syncControlsUi();
}
