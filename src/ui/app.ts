import { createDnaBundle, generateTraitsFromSeed } from '../core/dna';
import { createNewCreature, applyOfflineDecay, performCareAction } from '../core/creature';
import {
  evolutionPathFromForm,
  getEvolutionStageForLevel,
  isMajorEvolutionLevel,
  selectEvolutionForm,
} from '../core/evolution';
import { pickReactionParticle } from '../core/personality';
import type { CareAction, CreatureState, EvolutionRecord, ScreenId, UserProfile } from '../core/types';
import { getCandidateForms, getFormById, getHatchlingFormId } from '../data/forms';
import { generateSpeech } from '../data/speech-banks';
import { drawCreaturePixel, type AnimState } from '../render/creature';
import { createHabitatState, drawHabitat, updateHabitat } from '../render/habitat';
import { ParticleSystem } from '../render/particles';
import { creatureDrawScale, resizeStageCanvas, STAGE_LOGICAL_H, STAGE_LOGICAL_W } from '../render/stage';
import {
  createEvolutionCinematic,
  drawEvolutionOverlay,
  drawLevelUpBurst,
  getEvolutionMorphAlpha,
  startEvolution,
  updateEvolution,
} from '../render/effects';
import { pipCompanion } from '../pip/pip';
import { getSupabase, isSupabaseConfigured, resetSupabaseClient } from '../sync/supabase-client';
import {
  appendEvolution,
  clearLocalSession,
  createLocalGuestId,
  createProfileAndCreature,
  fetchCreature,
  fetchEvolutions,
  fetchProfile,
  loadLocalSave,
  logCare,
  saveCreature,
} from '../sync/offline-sync';
import { RARITY_COLORS, RARITY_LABELS } from '../data/archetypes';
import { getArchetypeMeta } from '../core/dna';
import { getMoodLabel } from '../core/personality';
import { getXpProgress } from '../core/creature';
import { getCareButtonClass, getMoodClass, renderNeedBar } from './needs-ui';
import { mountStageHud, unmountStageHud, updateStageHud } from './stage-hud';
import { getHabitatBgm } from '../audio/bgm';
import { mountAudioControls, setAudioControlsVisible } from './audio-controls';

export class VinculoApp {
  screen: ScreenId = 'splash';
  profile: UserProfile | null = null;
  creature: CreatureState | null = null;
  evolutions: EvolutionRecord[] = [];
  speech = '';
  speechTick = 0;
  anim: AnimState = 'idle';
  animTime = 0;
  hatchHappyTimer = 0;
  levelUpFrame = 0;
  hatchTime = 0;
  hatchComplete = false;
  pendingName = '';
  authMode: 'login' | 'register' = 'login';
  authEmail = '';
  authPassword = '';
  authUsername = '';
  authError = '';
  toast = '';
  toastTimer = 0;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private habitat = createHabitatState();
  private particles = new ParticleSystem();
  private evolutionCine = createEvolutionCinematic();
  private lastTime = 0;
  private isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  async init(): Promise<void> {
    mountAudioControls();
    this.renderShell();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    pipCompanion.init({
      getCreature: () => this.creature,
      onFeed: () => this.doCare('feed'),
      onPlay: () => this.doCare('play'),
    });

    await this.checkSession();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    setInterval(() => this.tickNeeds(), 30000);
  }

  private async checkSession(): Promise<void> {
    const sb = getSupabase();
    if (sb) {
      const { data } = await sb.auth.getSession();
      if (data.session?.user) {
        await this.onAuthenticated(data.session.user.id, data.session.user.email ?? '');
        return;
      }
    }
    const local = loadLocalSave();
    if (local) {
      this.profile = local.profile;
      this.creature = applyOfflineDecay(local.creature);
      this.evolutions = local.evolutions;
      this.screen = 'home';
      this.refreshSpeech();
      return;
    }
    setTimeout(() => {
      this.screen = 'auth';
      this.renderShell();
    }, 1500);
  }

  private async onAuthenticated(userId: string, email: string): Promise<void> {
    this.profile = (await fetchProfile(userId)) ?? {
      id: userId,
      username: email.split('@')[0],
      displayName: email.split('@')[0],
      createdAt: Date.now(),
    };
    const creature = await fetchCreature(userId);
    if (creature) {
      this.creature = applyOfflineDecay(creature);
      this.evolutions = await fetchEvolutions(creature.id);
      this.screen = 'home';
    } else {
      this.screen = 'hatch';
      this.hatchTime = 0;
      this.hatchComplete = false;
    }
    this.renderShell();
  }

  private renderShell(): void {
    const app = document.getElementById('app');
    if (!app) return;

    if (this.screen === 'home' || this.screen === 'hatch') {
      const isTouchLayout = this.isTouch;
      app.innerHTML = `
        <div class="game-layout ${isTouchLayout ? 'touch' : ''}">
          ${isTouchLayout && this.screen === 'home' ? this.renderHomeHUD() : ''}
          <div class="pet-stage">
            <canvas id="game-canvas"></canvas>
          </div>
          <div class="ui-overlay">
            ${this.screen === 'home' ? this.renderHomeUI(isTouchLayout) : this.renderHatchUI()}
          </div>
        </div>`;
      this.canvas = app.querySelector('#game-canvas');
      this.ctx = this.canvas?.getContext('2d') ?? null;
      if (this.ctx) this.ctx.imageSmoothingEnabled = false;
      const stage = app.querySelector('.pet-stage');
      if (stage instanceof HTMLElement) mountStageHud(stage);
      this.bindHomeEvents();
      this.resizeCanvas();
      this.syncBgm();
      return;
    }

    unmountStageHud();
    app.innerHTML = `<div class="screen screen-${this.screen}">${this.renderScreenContent()}</div>`;
    this.bindScreenEvents();
    this.syncBgm();
  }

  private syncBgm(): void {
    const onHome = this.screen === 'home';
    getHabitatBgm().setHabitatActive(onHome);
    setAudioControlsVisible(onHome);
  }

  private renderScreenContent(): string {
    switch (this.screen) {
      case 'splash':
        return `
          <div class="splash-inner">
            <h1 class="title-shimmer">VÍNCULO VIVO</h1>
            <p class="subtitle">Soulbound Companion</p>
            <div class="splash-egg"></div>
            <p class="loading">Despertando vínculos...</p>
          </div>`;
      case 'auth':
        return this.renderAuthUI();
      case 'profile':
        return this.renderProfileUI();
      default:
        return '';
    }
  }

  private renderAuthUI(): string {
    return `
      <div class="auth-card">
        <h1>VÍNCULO VIVO</h1>
        <p class="badge-soulbound">◆ SOULBOUND — 1 criatura por conta</p>
        ${!isSupabaseConfigured ? '<p class="hint">Modo local (configure Supabase no .env)</p>' : ''}
        <div class="auth-tabs">
          <button data-auth-tab="login" class="${this.authMode === 'login' ? 'active' : ''}">Entrar</button>
          <button data-auth-tab="register" class="${this.authMode === 'register' ? 'active' : ''}">Registrar</button>
        </div>
        ${this.authMode === 'register' ? '<input id="auth-username" placeholder="Nome de usuário" value="' + this.authUsername + '" />' : ''}
        <input id="auth-email" type="email" placeholder="Email" value="${this.authEmail}" />
        <input id="auth-password" type="password" placeholder="Senha" value="${this.authPassword}" />
        ${this.authError ? `<p class="error">${this.authError}</p>` : ''}
        <button id="auth-submit" class="btn-primary">${this.authMode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        <button id="auth-guest" class="btn-secondary">Jogar como convidado (local)</button>
      </div>`;
  }

  private renderHatchUI(): string {
    return `
      <div class="hatch-ui ${this.hatchComplete ? 'hidden' : ''}">
        <h2>O ovo pulsa...</h2>
        ${!this.hatchComplete ? `
          <input id="creature-name" placeholder="Nome da criatura" maxlength="20" value="${this.pendingName}" />
          <button id="btn-hatch" class="btn-primary">Chocar ovo</button>
        ` : ''}
      </div>
      <div class="hatch-reveal ${this.hatchComplete ? '' : 'hidden'}">
        <button id="btn-enter-home" class="btn-primary">Entrar no habitat</button>
      </div>`;
  }

  private renderHomeHUD(): string {
    if (!this.creature) return '';
    const xp = getXpProgress(this.creature);
    return `
      <header class="hud-top hud-top-compact">
        <div class="level-bar">Nv.${this.creature.level} <div class="bar"><div style="width:${xp.pct}%"></div></div></div>
        <div class="mood ${getMoodClass(this.creature.mood)}">${getMoodLabel(this.creature.mood)}</div>
      </header>`;
  }

  private renderHomeUI(compactHud = false): string {
    if (!this.creature) return '';
    const xp = getXpProgress(this.creature);
    const traits = generateTraitsFromSeed(this.creature.dnaSeed);
    const needs = this.creature.needs;
    const moodCls = getMoodClass(this.creature.mood);
    return `
      ${compactHud ? '' : `
      <header class="hud-top">
        <div class="creature-name">${this.creature.name} <span class="soulbound-tag">SOULBOUND</span></div>
        <div class="level-bar">Nv.${this.creature.level} <div class="bar"><div style="width:${xp.pct}%"></div></div></div>
        <div class="mood ${moodCls}">${getMoodLabel(this.creature.mood)}</div>
      </header>`}
      <div class="speech-bubble">${this.speech}</div>
      <div class="needs-panel">
        ${renderNeedBar('Fome', needs.hunger, 'hunger')}
        ${renderNeedBar('Energia', needs.energy, 'energy')}
        ${renderNeedBar('Higiene', needs.hygiene, 'hygiene')}
        ${renderNeedBar('Felicidade', needs.happiness, 'happy')}
      </div>
      <div class="care-actions">
        <button data-care="feed"${getCareButtonClass('feed', needs)}>🍖 Comer</button>
        <button data-care="play"${getCareButtonClass('play', needs)}>🎾 Brincar</button>
        <button data-care="clean"${getCareButtonClass('clean', needs)}>✨ Limpar</button>
        <button data-care="rest"${getCareButtonClass('rest', needs)}>💤 Descansar</button>
        <button data-care="train"${getCareButtonClass('train', needs)}>⚔ Treinar</button>
      </div>
      <div class="hud-bottom">
        <button id="btn-pip">ABRIR PiP</button>
        <button id="btn-profile">Perfil</button>
        <span class="streak">🔥 ${this.creature.dailyStreak}d</span>
        <span class="rarity" style="color:${RARITY_COLORS[traits.rarity]}">${RARITY_LABELS[traits.rarity]}</span>
      </div>
      ${this.toast ? `<div class="toast">${this.toast}</div>` : ''}`;
  }

  private renderProfileUI(): string {
    if (!this.creature || !this.profile) return '';
    const traits = generateTraitsFromSeed(this.creature.dnaSeed);
    const meta = getArchetypeMeta(traits.archetype);
    const form = getFormById(this.creature.formId);
    return `
      <div class="profile-card">
        <button id="btn-back" class="btn-secondary">← Voltar</button>
        <h2>Creature Card</h2>
        <div class="card-frame">
          <p><strong>${this.creature.name}</strong></p>
          <p>Arquétipo: ${meta.name} (${meta.element})</p>
          <p>Forma: ${form?.label ?? this.creature.formId}</p>
          <p>Caminho: ${this.creature.evolutionPath}</p>
          <p>Raridade: <span style="color:${RARITY_COLORS[traits.rarity]}">${RARITY_LABELS[traits.rarity]}</span></p>
          <p>Nível: ${this.creature.level}</p>
          <p class="dna-hash">DNA: ${this.creature.dnaHash.slice(0, 16)}…</p>
        </div>
        <h3>Evoluções</h3>
        <ul class="evo-list">${this.evolutions.map((e) => `<li>Nv.${e.level} — ${e.formId}</li>`).join('') || '<li>Nenhuma ainda</li>'}</ul>
        <p class="account-line">Conta: ${this.profile.displayName}</p>
        <button id="btn-export" class="btn-primary">Exportar JSON</button>
        <button id="btn-logout" class="btn-logout">Sair da conta</button>
      </div>`;
  }

  private bindScreenEvents(): void {
    document.querySelectorAll('[data-auth-tab]').forEach((el) => {
      el.addEventListener('click', () => {
        this.authMode = (el as HTMLElement).dataset.authTab as 'login' | 'register';
        this.renderShell();
      });
    });
    document.getElementById('auth-submit')?.addEventListener('click', () => void this.handleAuth());
    document.getElementById('auth-guest')?.addEventListener('click', () => void this.handleGuest());
    document.getElementById('btn-back')?.addEventListener('click', () => {
      this.screen = 'home';
      this.renderShell();
    });
    document.getElementById('btn-export')?.addEventListener('click', () => this.exportCard());
    document.getElementById('btn-logout')?.addEventListener('click', () => void this.handleLogout());
  }

  private bindHomeEvents(): void {
    document.getElementById('btn-hatch')?.addEventListener('click', () => void this.hatchEgg());
    document.getElementById('btn-enter-home')?.addEventListener('click', () => {
      getHabitatBgm().unlock();
      this.screen = 'home';
      this.renderShell();
    });
    document.getElementById('btn-pip')?.addEventListener('click', () => {
      pipCompanion.toggle();
      pipCompanion.updateButtonLabel();
    });
    document.getElementById('btn-profile')?.addEventListener('click', () => {
      this.screen = 'profile';
      this.renderShell();
    });
    document.querySelectorAll('[data-care]').forEach((el) => {
      el.addEventListener('click', () => {
        this.doCare((el as HTMLElement).dataset.care as CareAction);
      });
    });
  }

  private async handleAuth(): Promise<void> {
    this.authEmail = (document.getElementById('auth-email') as HTMLInputElement)?.value ?? '';
    this.authPassword = (document.getElementById('auth-password') as HTMLInputElement)?.value ?? '';
    this.authUsername = (document.getElementById('auth-username') as HTMLInputElement)?.value ?? this.authEmail.split('@')[0];
    this.authError = '';

    const sb = getSupabase();
    if (!sb) {
      await this.handleGuest();
      return;
    }

    if (this.authMode === 'register') {
      const { data, error } = await sb.auth.signUp({
        email: this.authEmail,
        password: this.authPassword,
        options: { data: { username: this.authUsername } },
      });
      if (error) {
        this.authError = error.message;
        this.renderShell();
        return;
      }
      if (data.user) await this.onAuthenticated(data.user.id, this.authEmail);
    } else {
      const { data, error } = await sb.auth.signInWithPassword({
        email: this.authEmail,
        password: this.authPassword,
      });
      if (error) {
        this.authError = error.message;
        this.renderShell();
        return;
      }
      if (data.user) await this.onAuthenticated(data.user.id, this.authEmail);
    }
  }

  private async handleGuest(): Promise<void> {
    const guestId = createLocalGuestId();
    this.profile = {
      id: guestId,
      username: 'convidado',
      displayName: 'Convidado',
      createdAt: Date.now(),
    };
    const existing = loadLocalSave();
    if (existing?.creature) {
      this.creature = applyOfflineDecay(existing.creature);
      this.evolutions = existing.evolutions;
      this.screen = 'home';
    } else {
      this.screen = 'hatch';
    }
    this.renderShell();
  }

  private async handleLogout(): Promise<void> {
    pipCompanion.closeAll();
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    resetSupabaseClient();
    clearLocalSession(true);
    this.profile = null;
    this.creature = null;
    this.evolutions = [];
    this.authError = '';
    this.authEmail = '';
    this.authPassword = '';
    this.screen = 'auth';
    this.renderShell();
  }

  private async hatchEgg(): Promise<void> {
    const nameInput = document.getElementById('creature-name') as HTMLInputElement;
    const name = (nameInput?.value || 'Espírito').trim().slice(0, 20);
    if (!this.profile) return;

    const createdAt = Date.now();
    const { dnaSeed, dnaHash, traits } = await createDnaBundle(this.profile.id, createdAt);
    let creature = createNewCreature(this.profile.id, name, dnaSeed, dnaHash, traits.archetype);
    creature = { ...creature, formId: getHatchlingFormId(traits.archetype), evolutionStage: 1 };

    this.creature = creature;
    this.hatchComplete = true;
    this.hatchTime = 0;
    this.hatchHappyTimer = 2;
    this.anim = 'happy';

    await createProfileAndCreature(this.profile.id, '', this.profile.username, creature);
    this.showToast(`Bem-vindo, ${name}!`);
    this.renderShell();
  }

  private async doCare(action: CareAction): Promise<void> {
    if (!this.creature || this.evolutionCine.active) return;
    getHabitatBgm().unlock();
    const result = performCareAction(this.creature, action);
    if (result.blocked) {
      this.showToast(result.blocked);
      return;
    }

    this.creature = result.creature;
    this.anim = action === 'feed' ? 'eat' : action === 'play' ? 'play' : action === 'rest' ? 'sleep' : 'idle';

    const traits = generateTraitsFromSeed(this.creature.dnaSeed);
    const particle = pickReactionParticle(this.creature.mood, traits.personality);
    if (this.canvas) {
      this.particles.emit(STAGE_LOGICAL_W / 2, STAGE_LOGICAL_H * 0.62, traits.palette.glow, particle);
    }

    if (result.leveledUp) {
      this.levelUpFrame = 1;
      await this.handleLevelUp();
    }

    await saveCreature(this.creature);
    await logCare(this.creature.id, action, result.creature.needs);
    this.refreshSpeech();
    pipCompanion.update();
    this.renderShell();
  }

  private async handleLevelUp(): Promise<void> {
    if (!this.creature) return;
    if (!isMajorEvolutionLevel(this.creature.level)) return;

    const traits = generateTraitsFromSeed(this.creature.dnaSeed);
    const candidates = getCandidateForms(traits.archetype, this.creature.level);
    const form = selectEvolutionForm(candidates, this.creature.careVector, this.creature.dnaSeed);
    const path = evolutionPathFromForm(form.id);
    const prevForm = getFormById(this.creature.formId);
    if (!prevForm) return;

    return new Promise((resolve) => {
      this.anim = 'evolve';
      startEvolution(this.evolutionCine, prevForm, form, async () => {
        if (!this.creature) return resolve();
        this.creature = {
          ...this.creature,
          formId: form.id,
          evolutionPath: path,
          evolutionStage: getEvolutionStageForLevel(this.creature.level),
        };
        const record: EvolutionRecord = {
          level: this.creature.level,
          formId: form.id,
          careSnapshot: { ...this.creature.careVector },
          unlockedAt: Date.now(),
        };
        this.evolutions.push(record);
        await saveCreature(this.creature);
        await appendEvolution(this.creature.id, record);
        this.showToast(`Evoluiu para ${form.label}!`);
        resolve();
      });
    });
  }

  private tickNeeds(): void {
    if (!this.creature || this.screen !== 'home') return;
    this.creature = applyOfflineDecay(this.creature);
    void saveCreature(this.creature);
    pipCompanion.update();
    this.refreshSpeech();
    const hud = document.querySelector('.needs-panel');
    if (hud) this.renderShell();
  }

  private refreshSpeech(): void {
    if (!this.creature) return;
    this.speechTick++;
    const traits = generateTraitsFromSeed(this.creature.dnaSeed);
    this.speech = generateSpeech(
      this.creature.name,
      this.creature.mood,
      traits.archetype,
      this.creature.dnaSeed,
      this.speechTick,
      this.creature.needs,
    );
  }

  private showToast(msg: string): void {
    this.toast = msg;
    this.toastTimer = 180;
  }

  private exportCard(): void {
    if (!this.creature) return;
    const data = JSON.stringify({ creature: this.creature, evolutions: this.evolutions }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.creature.name}-card.json`;
    a.click();
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    resizeStageCanvas(this.canvas);
  }

  private loop(now: number): void {
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (this.canvas && this.ctx && this.creature && (this.screen === 'home' || this.screen === 'hatch')) {
      this.draw(dt);
    }

    if (this.toastTimer > 0) {
      this.toastTimer--;
      if (this.toastTimer === 0) this.toast = '';
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  private draw(dt: number): void {
    if (!this.ctx || !this.canvas || !this.creature) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const traits = generateTraitsFromSeed(this.creature.dnaSeed);
    const form = getFormById(this.creature.formId);
    if (!form) return;

    this.animTime += dt;
    if (this.screen === 'hatch') this.hatchTime += dt;
    if (this.hatchHappyTimer > 0) {
      this.hatchHappyTimer -= dt;
      if (this.hatchHappyTimer <= 0) this.anim = 'idle';
    }

    if (this.creature.mood === 'sleeping' && this.anim !== 'evolve' && this.anim !== 'happy') {
      this.anim = 'sleep';
    } else if (this.anim === 'sleep' && this.creature.mood !== 'sleeping') {
      this.anim = 'idle';
    }

    updateHabitat(this.habitat, dt);
    drawHabitat(ctx, w, h, traits.archetype, this.habitat);
    updateStageHud(this.creature.name, this.habitat, performance.now());

    updateEvolution(this.evolutionCine, dt);
    this.particles.update(dt);
    this.particles.draw(ctx);

    const scale = creatureDrawScale();
    const petX = w / 2;
    const petY = h * 0.62;
    const drawOpts = {
      traits,
      dnaSeed: this.creature.dnaSeed,
      anim: (this.screen === 'hatch' && !this.hatchComplete ? 'idle' : this.anim) as AnimState,
      animTime: this.screen === 'hatch' ? this.hatchTime : this.animTime,
      mood: this.creature.mood,
      moodGlow: this.creature.mood === 'excited' ? 0.3 : 0,
      happiness: this.creature.needs.happiness,
    };

    if (this.evolutionCine.active && this.evolutionCine.fromForm && this.evolutionCine.toForm) {
      const [oldA, newA] = getEvolutionMorphAlpha(this.evolutionCine);
      if (oldA > 0) {
        ctx.save();
        ctx.globalAlpha = oldA;
        drawCreaturePixel(ctx, petX, petY, scale, {
          ...drawOpts,
          form: this.evolutionCine.fromForm,
          chassisId: this.evolutionCine.fromForm.chassisId,
        });
        ctx.restore();
      }
      if (newA > 0) {
        ctx.save();
        ctx.globalAlpha = newA;
        drawCreaturePixel(ctx, petX, petY, scale, {
          ...drawOpts,
          form: this.evolutionCine.toForm,
          chassisId: this.evolutionCine.toForm.chassisId,
        });
        ctx.restore();
      }
    } else {
      drawCreaturePixel(ctx, petX, petY, scale, { ...drawOpts, form });
    }

    if (this.levelUpFrame > 0) {
      drawLevelUpBurst(ctx, w / 2, h * 0.4, this.levelUpFrame);
      this.levelUpFrame++;
      if (this.levelUpFrame > 25) this.levelUpFrame = 0;
    }

    drawEvolutionOverlay(ctx, w, h, this.evolutionCine, traits.palette.glow);
  }
}

export const app = new VinculoApp();
