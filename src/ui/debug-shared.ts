export type DebugPage = 'sprites' | 'habitat';

export function mountDebugShell(title: string, hint: string, active: DebugPage): HTMLElement {
  const app = document.getElementById('app');
  if (!app) throw new Error('#app not found');

  app.innerHTML = `
    <div class="debug-sprites">
      <nav class="debug-nav">
        <a href="?debug=sprites" class="${active === 'sprites' ? 'active' : ''}">Sprites</a>
        <a href="?debug=habitat" class="${active === 'habitat' ? 'active' : ''}">Backgrounds</a>
        <a href="./">Jogo</a>
      </nav>
      <h1>${title}</h1>
      <p class="debug-hint">${hint}</p>
      <div id="debug-grid" class="debug-grid"></div>
    </div>`;

  injectDebugStyles();
  const grid = document.getElementById('debug-grid');
  if (!grid) throw new Error('#debug-grid not found');
  return grid;
}

function injectDebugStyles(): void {
  if (document.getElementById('debug-shared-style')) return;

  const style = document.createElement('style');
  style.id = 'debug-shared-style';
  style.textContent = `
    .debug-sprites { padding: 16px; background: #0d0a1a; min-height: 100%; color: #e8e0ff; font-family: Silkscreen, monospace; }
    .debug-nav { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .debug-nav a { font-size: 9px; color: #a78bfa; text-decoration: none; padding: 4px 8px; border: 1px solid #4c1d95; }
    .debug-nav a.active { color: #ffd700; border-color: #ffd700; background: #1a1030; }
    .debug-sprites h1 { font-size: 14px; color: #ffd700; margin-bottom: 8px; }
    .debug-hint { font-size: 9px; color: #888; margin-bottom: 16px; }
    .debug-section { font-size: 10px; color: #c4b5fd; margin: 16px 0 8px; grid-column: 1 / -1; }
    .debug-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; max-width: 980px; }
    .debug-grid.sprites { grid-template-columns: repeat(4, 1fr); max-width: 720px; }
    .debug-cell { background: #151028; border: 2px solid #4c1d95; padding: 8px; text-align: center; }
    .debug-cell.warn { border-color: #f87171; }
    .debug-cell canvas { display: block; margin: 0 auto 6px; image-rendering: pixelated; }
    .debug-cell.habitat canvas { width: 100%; max-width: 196px; height: auto; }
    .debug-cell label { font-size: 8px; color: #a78bfa; display: block; line-height: 1.4; white-space: pre-line; }
  `;
  document.head.appendChild(style);
}
