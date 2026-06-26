import type { Mood, Needs, PersonalityTraits } from './types';

const MOOD_LABELS: Record<Mood, string> = {
  happy: 'Feliz',
  content: 'Tranquilo',
  hungry: 'Faminto',
  lonely: 'Solitário',
  sick: 'Doente',
  sleeping: 'Dormindo',
  excited: 'Animado',
  sad: 'Triste',
};

export function computeMood(needs: Needs, prev: Mood, personality: PersonalityTraits): Mood {
  if (prev === 'sleeping' && needs.energy < 90) return 'sleeping';
  if (needs.hunger < 25) return 'hungry';
  if (needs.hygiene < 20 || (needs.hunger < 40 && needs.hygiene < 35)) return 'sick';
  if (needs.happiness < 25) return personality.shy > 0.5 ? 'sad' : 'lonely';
  if (needs.happiness > 85 && needs.energy > 50) return 'excited';
  if (needs.happiness > 70) return 'happy';
  return 'content';
}

export function getMoodLabel(mood: Mood): string {
  return MOOD_LABELS[mood];
}

export function getIdleBounce(personality: PersonalityTraits): number {
  return 0.4 + (1 - personality.lazy) * 0.6 + personality.affectionate * 0.2;
}

export function getAnimationSpeed(personality: PersonalityTraits, mood: Mood): number {
  let speed = 1;
  if (personality.lazy > 0.6) speed *= 0.7;
  if (personality.aggressive > 0.6) speed *= 1.3;
  if (mood === 'excited') speed *= 1.4;
  if (mood === 'sleeping') speed *= 0.4;
  return speed;
}

export function pickReactionParticle(
  mood: Mood,
  personality: PersonalityTraits,
): 'heart' | 'spark' | 'smoke' | 'star' {
  if (mood === 'happy' || mood === 'excited') {
    return personality.affectionate > 0.5 ? 'heart' : 'star';
  }
  if (mood === 'sick' || mood === 'sad') return 'smoke';
  return 'spark';
}
