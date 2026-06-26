import type { ArchetypeId, Mood, Needs } from '../core/types';
import { mulberry32 } from '../core/rng';
import { getMoodLabel } from '../core/personality';
import { NEED_LOW_THRESHOLD } from '../core/types';

const REASONS: Record<Mood, string[]> = {
  happy: ['você cuidou bem de mim', 'o habitat está lindo hoje', 'sinto energia vital pulsar'],
  content: ['estou confortável aqui', 'nosso vínculo cresce a cada dia', 'tudo parece equilibrado'],
  hungry: ['minha barriga ronca', 'preciso de sustento', 'o cheiro de comida me distrai'],
  lonely: ['sinto sua falta', 'quero atenção', 'o silêncio pesa'],
  sick: ['não me sinto bem', 'preciso de higiene', 'minha energia vital oscila'],
  sleeping: ['sonho com evoluções', 'descanso para crescer', 'shhh...'],
  excited: ['quero brincar!', 'sinto evolução próxima!', 'vamos explorar!'],
  sad: ['fiquei sozinho demais', 'meu humor caiu', 'preciso de carinho'],
};

const LOW_HYGIENE_HINTS = ['preciso de um banho', 'me sinto sujo', 'a higiene está caindo'];

const ARCHETYPE_PHRASES: Record<ArchetypeId, string[]> = {
  ember: ['Brasa viva!', 'Calor ancestral.', 'Chamas dançam em mim.'],
  tide: ['Marés me chamam.', 'Fluxo eterno.', 'Ondas sussurram.'],
  moss: ['Raízes profundas.', 'Vida brota.', 'Musgo antigo.'],
  void: ['Sombras veladas.', 'Eco do vazio.', 'Silêncio profundo.'],
  spark: ['Centelha iminente!', 'Trovão distante.', 'Energia crua!'],
  gale: ['Ventos guiam.', 'Céu aberto.', 'Correntes livres.'],
  stone: ['Rocha firme.', 'Montanha inabalável.', 'Terra antiga.'],
  lumen: ['Luz cristalina.', 'Brilho interior.', 'Prisma vivo.'],
  frost: ['Gelo sereno.', 'Cristais formam.', 'Frio puro.'],
  bloom: ['Pétalas despertam.', 'Flor eterna.', 'Vida floresce.'],
};

const TEMPLATES = [
  '{name} sente {emotion} porque {reason}.',
  '{phrase} — {name} está {emotion}.',
  '...{name} murmura: "{reason}"',
  '{name} ({archetype}): {phrase}',
];

function pickLowNeedSpeech(name: string, needs: Needs, rng: () => number): string | null {
  if (needs.hunger < NEED_LOW_THRESHOLD) {
    const reasons = REASONS.hungry;
    const reason = reasons[Math.floor(rng() * reasons.length)];
    return `${name} está com fome — ${reason}.`;
  }
  if (needs.hygiene < NEED_LOW_THRESHOLD) {
    const hint = LOW_HYGIENE_HINTS[Math.floor(rng() * LOW_HYGIENE_HINTS.length)];
    return `${name} precisa de higiene — ${hint}.`;
  }
  return null;
}

export function generateSpeech(
  name: string,
  mood: Mood,
  archetype: ArchetypeId,
  dnaSeed: number,
  tick: number,
  needs?: Needs,
): string {
  const rng = mulberry32(dnaSeed + tick);

  if (needs) {
    const urgent = pickLowNeedSpeech(name, needs, rng);
    if (urgent) return urgent;
  }

  const template = TEMPLATES[Math.floor(rng() * TEMPLATES.length)];
  const reasons = REASONS[mood];
  const phrases = ARCHETYPE_PHRASES[archetype];
  return template
    .replace('{name}', name)
    .replace('{emotion}', getMoodLabel(mood).toLowerCase())
    .replace('{reason}', reasons[Math.floor(rng() * reasons.length)])
    .replace('{phrase}', phrases[Math.floor(rng() * phrases.length)])
    .replace('{archetype}', archetype);
}

export const SPEECH_BANK_SIZE =
  Object.values(REASONS).flat().length + Object.values(ARCHETYPE_PHRASES).flat().length;
