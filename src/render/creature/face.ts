import type { DnaTraits } from '../../core/types';
import type { AnimState } from './types';
import { shade } from './draw-utils';

export function drawFace(
  ctx: CanvasRenderingContext2D,
  traits: DnaTraits,
  anim: AnimState,
  blink: boolean,
  happiness = 50,
): void {
  const pal = traits.palette;
  const eyeStyle = traits.parts.eyes % 6;
  const eyeY = -8;
  const eyeSpacing = eyeStyle < 3 ? 7 : 8;

  if (anim === 'sleep' || blink) {
    ctx.strokeStyle = shade(pal.eye, -30);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 3, eyeY);
    ctx.quadraticCurveTo(-eyeSpacing, eyeY + 2, -eyeSpacing + 3, eyeY);
    ctx.moveTo(eyeSpacing - 3, eyeY);
    ctx.quadraticCurveTo(eyeSpacing, eyeY + 2, eyeSpacing + 3, eyeY);
    ctx.stroke();
  } else {
    drawEye(ctx, -eyeSpacing, eyeY, eyeStyle, pal.eye, pal.primary);
    drawEye(ctx, eyeSpacing, eyeY, eyeStyle, pal.eye, pal.primary);
  }

  if (happiness > 70 && anim !== 'sleep') {
    ctx.fillStyle = 'rgba(255,120,160,0.35)';
    ctx.beginPath();
    ctx.ellipse(-10, 0, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(10, 0, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMouth(ctx, anim, pal);
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  style: number,
  eyeColor: string,
  rim: string,
): void {
  const w = style % 3 === 0 ? 5 : style % 3 === 1 ? 4 : 6;
  const h = style % 3 === 1 ? 3 : 5;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.ellipse(x + (style > 3 ? 0.5 : 0), y + 0.5, w * 0.28, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x - 1, y - 1, 1.2, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (style > 4) {
    ctx.strokeStyle = shade(rim, -25);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

function drawMouth(ctx: CanvasRenderingContext2D, anim: AnimState, pal: DnaTraits['palette']): void {
  ctx.strokeStyle = shade(pal.secondary, -25);
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();

  if (anim === 'happy' || anim === 'play') {
    ctx.moveTo(-5, 4);
    ctx.quadraticCurveTo(0, 9, 5, 4);
    ctx.stroke();
  } else if (anim === 'eat') {
    ctx.arc(0, 5, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (anim === 'hurt' || anim === 'sleep') {
    ctx.moveTo(-3, 5);
    ctx.lineTo(3, 5);
    ctx.stroke();
  } else {
    ctx.moveTo(-3, 5);
    ctx.quadraticCurveTo(0, 6, 3, 5);
    ctx.stroke();
  }
}
