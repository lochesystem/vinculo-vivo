import type { ArchetypeId, Mood } from '../core/types';
import { mulberry32 } from '../core/rng';
import { getMoodLabel } from '../core/personality';

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

export function generateSpeech(
  name: string,
  mood: Mood,
  archetype: ArchetypeId,
  dnaSeed: number,
  tick: number,
): string {
  const rng = mulberry32(dnaSeed + tick);
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
