import { generateTraitsFromSeed } from '../core/dna';
import { getFormById } from '../data/forms';
import { HATCH_CHASSIS_IDS } from '../data/chassis';
import { drawCreaturePixel } from '../render/creature';
import { composeCreatureSprite, generateVisualDnaFromSeed } from '../render/creature/composer';
import { creatureDrawScale } from '../render/stage';
import { mountDebugShell } from './debug-shared';

const SEEDS = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1111, 2222, 3333, 4444, 5555, 6666, 7777];

export function mountSpriteDebugPage(): void {
  const grid = mountDebugShell(
    'Sprite Debug — Tamagotchi Chassis',
    'Silhueta sólida conectada · max 1 feature extra · borda única',
    'sprites',
  );
  grid.classList.add('sprites');

  for (const seed of SEEDS) {
    const traits = generateTraitsFromSeed(seed);
    const visual = generateVisualDnaFromSeed(seed, traits);
    const form = getFormById(`${traits.archetype}_hatchling`);
    if (!form) continue;

    const composed = composeCreatureSprite({
      traits,
      dnaSeed: seed,
      formId: form.id,
      silhouette: form.silhouette,
      anim: 'idle',
      animTime: seed * 0.001,
      mood: 'content',
      visualDna: visual,
    });

    const cell = document.createElement('div');
    cell.className = `debug-cell${composed.connected ? '' : ' warn'}`;
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(0, 0, 96, 96);
      drawCreaturePixel(ctx, 48, 52, creatureDrawScale() * 0.85, {
        traits,
        form,
        dnaSeed: seed,
        visualDna: visual,
        anim: 'idle',
        animTime: seed * 0.001,
        mood: 'content',
      });
    }
    const label = document.createElement('label');
    const feat = visual.features.length ? visual.features.join('+') : '—';
    const conn = composed.connected ? 'ok' : 'DESCONECTADO';
    label.textContent = `#${seed}\n${visual.chassisId}\n${visual.faceId}\n+${feat} · ${conn}`;
    cell.appendChild(canvas);
    cell.appendChild(label);
    grid.appendChild(cell);
  }

  const row = document.createElement('div');
  row.className = 'debug-cell';
  row.style.gridColumn = '1 / -1';
  row.innerHTML = `<label>Hatch chassis: ${HATCH_CHASSIS_IDS.join(', ')}</label>`;
  grid.appendChild(row);
}
