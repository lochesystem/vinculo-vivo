import type { CreatureState } from '../core/types';
import { generateTraitsFromSeed } from '../core/dna';
import { getFormById } from '../data/forms';
import { drawCreaturePixel, type AnimState } from '../render/creature-sprite';
import { getMoodLabel } from '../core/personality';
import { getXpProgress } from '../core/creature';

type PipCallbacks = {
  onFeed: () => void;
  onPlay: () => void;
  getCreature: () => CreatureState | null;
};

export class PiPCompanion {
  private pipWindow: Window | null = null;
  private popupWindow: Window | null = null;
  private popupPoll: ReturnType<typeof setInterval> | null = null;
  private widget: HTMLElement | null = null;
  private widgetVisible = false;
  private animFrame = 0;
  private rafId = 0;
  private callbacks: PipCallbacks | null = null;

  private readonly POPUP_NAME = 'vinculo-vivo-pip';
  private readonly POPUP_FEATURES =
    'width=320,height=380,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';

  init(callbacks: PipCallbacks): void {
    this.callbacks = callbacks;
    this.createWidget();
    this.updateButtonLabel();
  }

  isNativeSupported(): boolean {
    return !!(window.documentPictureInPicture && documentPictureInPicture.requestWindow);
  }

  isActive(): boolean {
    return this.isPipOpen() || this.isPopupOpen() || this.widgetVisible;
  }

  private isPipOpen(): boolean {
    return !!(this.pipWindow && !this.pipWindow.closed);
  }

  private isPopupOpen(): boolean {
    return !!(this.popupWindow && !this.popupWindow.closed);
  }

  toggle(): void {
    if (this.isActive()) {
      this.closeAll();
      return;
    }
    if (this.isNativeSupported()) this.openNative();
    else this.openPopup();
  }

  closeAll(): void {
    if (this.pipWindow && !this.pipWindow.closed) this.pipWindow.close();
    this.pipWindow = null;
    if (this.popupWindow && !this.popupWindow.closed) this.popupWindow.close();
    this.popupWindow = null;
    this.stopPopupPoll();
    if (this.widget) {
      this.widgetVisible = false;
      this.widget.classList.add('hidden');
    }
    cancelAnimationFrame(this.rafId);
  }

  updateButtonLabel(): void {
    const btn = document.getElementById('btn-pip');
    if (!btn) return;
    if (this.isNativeSupported()) {
      btn.textContent = 'ABRIR PiP';
      btn.title = 'Janela flutuante (Chrome/Edge)';
    } else {
      btn.textContent = 'JANELA FLUTUANTE';
      btn.title = 'Popup flutuante';
    }
  }

  update(): void {
    const creature = this.callbacks?.getCreature();
    if (!creature) return;

    const docs = this.getDocs();
    const xp = getXpProgress(creature);
    const mood = getMoodLabel(creature.mood);

    for (const doc of docs) {
      const hunger = doc.getElementById('pip-hunger');
      const happy = doc.getElementById('pip-happy');
      const moodEl = doc.getElementById('pip-mood');
      const lvl = doc.getElementById('pip-level');
      const name = doc.getElementById('pip-name');
      if (hunger) hunger.style.width = `${creature.needs.hunger}%`;
      if (happy) happy.style.width = `${creature.needs.happiness}%`;
      if (moodEl) moodEl.textContent = mood;
      if (lvl) lvl.textContent = `Nv.${creature.level} (${Math.floor(xp.pct)}%)`;
      if (name) name.textContent = creature.name;
    }
    this.drawCreatureCanvases(creature);
  }

  private getDocs(): Document[] {
    const docs: Document[] = [document];
    if (this.pipWindow && !this.pipWindow.closed) docs.push(this.pipWindow.document);
    if (this.popupWindow && !this.popupWindow.closed) docs.push(this.popupWindow.document);
    return docs;
  }

  private buildHTML(): string {
    return `
      <div class="pip-root">
        <div class="pip-title pip-drag-handle">Vínculo Vivo</div>
        <div id="pip-name" class="pip-name">—</div>
        <canvas id="pip-canvas" width="280" height="140"></canvas>
        <div class="pip-stat"><span>Fome</span><div class="pip-bar"><div id="pip-hunger" class="pip-fill hunger"></div></div></div>
        <div class="pip-stat"><span>Felicidade</span><div class="pip-bar"><div id="pip-happy" class="pip-fill happy"></div></div></div>
        <div id="pip-mood" class="pip-mood">—</div>
        <div id="pip-level" class="pip-level">—</div>
        <div class="pip-actions">
          <button id="pip-feed">Comer</button>
          <button id="pip-play">Brincar</button>
        </div>
      </div>`;
  }

  private getCSS(): string {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0d0a1a; color: #e8e0ff; font-family: Silkscreen, monospace; font-size: 11px; }
      .pip-root { padding: 8px; }
      .pip-title { font-size: 10px; color: #a78bfa; margin-bottom: 6px; cursor: move; }
      .pip-name { font-size: 12px; color: #ffd700; margin-bottom: 4px; text-align: center; }
      #pip-canvas { display: block; margin: 0 auto 8px; image-rendering: pixelated; background: #151028; border: 2px solid #4c1d95; }
      .pip-stat { display: flex; align-items: center; gap: 6px; margin: 4px 0; font-size: 9px; }
      .pip-bar { flex: 1; height: 8px; background: #1a1030; border: 1px solid #4c1d95; }
      .pip-fill { height: 100%; transition: width 0.3s; }
      .pip-fill.hunger { background: #f97316; }
      .pip-fill.happy { background: #ec4899; }
      .pip-mood, .pip-level { text-align: center; margin: 4px 0; color: #c4b5fd; font-size: 9px; }
      .pip-actions { display: flex; gap: 6px; margin-top: 8px; }
      .pip-actions button { flex: 1; padding: 6px; background: #4c1d95; border: 2px solid #a78bfa; color: #fff; cursor: pointer; font-family: inherit; font-size: 9px; }
      .pip-actions button:hover { background: #6d28d9; }
    `;
  }

  private attachToDoc(doc: Document): void {
    doc.body.innerHTML = this.buildHTML();
    const style = doc.createElement('style');
    style.textContent = this.getCSS();
    doc.head.appendChild(style);
    doc.getElementById('pip-feed')?.addEventListener('click', () => this.callbacks?.onFeed());
    doc.getElementById('pip-play')?.addEventListener('click', () => this.callbacks?.onPlay());
    this.update();
    this.startAnimLoop();
  }

  private openNative(): void {
    documentPictureInPicture
      .requestWindow({ width: 320, height: 380 })
      .then((win) => {
        this.pipWindow = win;
        this.attachToDoc(win.document);
        win.addEventListener('pagehide', () => {
          this.pipWindow = null;
          cancelAnimationFrame(this.rafId);
        });
      })
      .catch(() => this.openPopup());
  }

  private openPopup(): void {
    const win = window.open('about:blank', this.POPUP_NAME, this.POPUP_FEATURES);
    if (!win) {
      this.showWidget();
      return;
    }
    this.popupWindow = win;
    this.attachToDoc(win.document);
    try {
      win.document.title = 'Vínculo Vivo — Companion';
    } catch {
      /* noop */
    }
    this.startPopupPoll();
  }

  private startPopupPoll(): void {
    this.stopPopupPoll();
    this.popupPoll = setInterval(() => {
      if (!this.popupWindow || this.popupWindow.closed) {
        this.popupWindow = null;
        this.stopPopupPoll();
        cancelAnimationFrame(this.rafId);
      }
    }, 500);
  }

  private stopPopupPoll(): void {
    if (this.popupPoll) clearInterval(this.popupPoll);
    this.popupPoll = null;
  }

  private createWidget(): void {
    if (document.getElementById('vv-pip-widget')) return;
    const w = document.createElement('div');
    w.id = 'vv-pip-widget';
    w.className = 'vv-pip-widget hidden';
    document.body.appendChild(w);
    this.widget = w;

    let dragging = false;
    let ox = 0;
    let oy = 0;
    w.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).classList.contains('pip-drag-handle')) {
        dragging = true;
        ox = e.clientX - w.offsetLeft;
        oy = e.clientY - w.offsetTop;
      }
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      w.style.left = `${e.clientX - ox}px`;
      w.style.top = `${e.clientY - oy}px`;
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
    });
  }

  private showWidget(): void {
    if (!this.widget) return;
    this.widgetVisible = true;
    this.widget.classList.remove('hidden');
    this.widget.innerHTML = this.buildHTML() + '<button id="pip-close" style="position:absolute;top:4px;right:4px;background:#333;border:none;color:#fff;cursor:pointer">×</button>';
    const style = document.createElement('style');
    style.textContent = this.getCSS();
    this.widget.prepend(style);
    this.widget.querySelector('#pip-feed')?.addEventListener('click', () => this.callbacks?.onFeed());
    this.widget.querySelector('#pip-play')?.addEventListener('click', () => this.callbacks?.onPlay());
    this.widget.querySelector('#pip-close')?.addEventListener('click', () => this.closeAll());
    this.update();
    this.startAnimLoop();
  }

  private startAnimLoop(): void {
    const loop = () => {
      this.animFrame++;
      const creature = this.callbacks?.getCreature();
      if (creature) this.drawCreatureCanvases(creature);
      this.rafId = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(loop);
  }

  private drawCreatureCanvases(creature: CreatureState): void {
    const traits = generateTraitsFromSeed(creature.dnaSeed);
    const form = getFormById(creature.formId);
    if (!form) return;
    const anim: AnimState = creature.mood === 'sleeping' ? 'sleep' : 'idle';

    for (const doc of this.getDocs()) {
      const canvas = doc.getElementById('pip-canvas') as HTMLCanvasElement | null;
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#151028';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCreaturePixel(ctx, canvas.width / 2, canvas.height / 2 + 10, 2.5, {
        traits,
        form,
        anim,
        frame: this.animFrame,
      });
    }
  }
}

export const pipCompanion = new PiPCompanion();
