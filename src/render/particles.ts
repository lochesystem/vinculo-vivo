import { lerp } from '../core/rng';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'heart' | 'spark' | 'smoke' | 'star' | 'pixel';
}

export class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, color: string, kind: Particle['kind'], count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 0.5 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (kind === 'heart' ? 1.5 : 0),
        life: 1,
        maxLife: 0.6 + Math.random() * 0.8,
        size: kind === 'star' ? 3 : 2 + Math.random() * 2,
        color,
        kind,
      });
    }
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt / p.maxLife;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      if (p.kind === 'smoke') p.vy -= 0.02 * dt * 60;
      if (p.kind === 'spark') p.vy += 0.05 * dt * 60;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      const alpha = lerp(0, 1, p.life);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.kind === 'heart') {
        this.drawHeart(ctx, p.x, p.y, p.size);
      } else if (p.kind === 'star') {
        this.drawStar(ctx, p.x, p.y, p.size);
      } else {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size));
      }
    }
    ctx.restore();
  }

  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
    ctx.fillRect(x - s, y, s, s);
    ctx.fillRect(x, y - s, s, s);
    ctx.fillRect(x + s, y, s, s);
    ctx.fillRect(x, y + s, s * 2, s);
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
    ctx.fillRect(x - s, y, s * 2, s);
    ctx.fillRect(x, y - s, s, s * 2);
  }
}
