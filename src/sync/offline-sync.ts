import type { CareVector, CreatureState, EvolutionRecord, Needs, UserProfile } from '../core/types';
import { defaultCareVector, defaultNeeds } from '../core/types';
import type { DbCreature, DbEvolutionRecord, DbProfile } from './supabase-client';
import { getSupabase, isSupabaseConfigured } from './supabase-client';

const LOCAL_KEY = 'vinculo_vivo_local';
const LOCAL_PROFILE_KEY = 'vinculo_vivo_profile';
const LOCAL_EVOLUTION_KEY = 'vinculo_vivo_evolutions';

export interface LocalSave {
  profile: UserProfile;
  creature: CreatureState;
  evolutions: EvolutionRecord[];
}

function creatureToDb(c: CreatureState): Partial<DbCreature> {
  return {
    id: c.id,
    owner_id: c.ownerId,
    dna_hash: c.dnaHash,
    dna_seed: c.dnaSeed,
    name: c.name,
    level: c.level,
    xp: c.xp,
    evolution_stage: c.evolutionStage,
    evolution_path: c.evolutionPath,
    form_id: c.formId,
    care_vector: c.careVector as unknown as Record<string, number>,
    needs: c.needs as unknown as Record<string, number>,
    mood: c.mood,
    last_tick_at: new Date(c.lastTickAt).toISOString(),
    created_at: new Date(c.createdAt).toISOString(),
    daily_streak: c.dailyStreak,
    last_care_date: c.lastCareDate,
  };
}

function creatureFromDb(row: DbCreature): CreatureState {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    dnaSeed: row.dna_seed,
    dnaHash: row.dna_hash,
    level: row.level,
    xp: row.xp,
    evolutionStage: row.evolution_stage,
    evolutionPath: row.evolution_path,
    formId: row.form_id,
    careVector: { ...defaultCareVector(), ...(row.care_vector as unknown as CareVector) },
    needs: { ...defaultNeeds(), ...(row.needs as unknown as Needs) },
    mood: row.mood as CreatureState['mood'],
    lastTickAt: new Date(row.last_tick_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
    dailyStreak: row.daily_streak ?? 1,
    lastCareDate: row.last_care_date ?? new Date().toISOString().slice(0, 10),
  };
}

function profileFromDb(row: DbProfile): UserProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function loadLocalSave(): LocalSave | null {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalSave;
  } catch {
    return null;
  }
}

export function saveLocal(save: LocalSave): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(save));
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(save.profile));
  localStorage.setItem(LOCAL_EVOLUTION_KEY, JSON.stringify(save.evolutions));
}

export async function fetchCreature(ownerId: string): Promise<CreatureState | null> {
  const sb = getSupabase();
  if (!sb) {
    const local = loadLocalSave();
    return local?.creature.ownerId === ownerId ? local.creature : null;
  }
  const { data, error } = await sb.from('creatures').select('*').eq('owner_id', ownerId).maybeSingle();
  if (error || !data) return null;
  return creatureFromDb(data as DbCreature);
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const sb = getSupabase();
  if (!sb) {
    const local = loadLocalSave();
    return local?.profile.id === userId ? local.profile : null;
  }
  const { data } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (!data) return null;
  return profileFromDb(data as DbProfile);
}

export async function saveCreature(creature: CreatureState): Promise<void> {
  const sb = getSupabase();
  const local = loadLocalSave();
  if (local) {
    local.creature = creature;
    saveLocal(local);
  }
  if (!sb) return;
  await sb.from('creatures').upsert(creatureToDb(creature));
}

export async function createProfileAndCreature(
  userId: string,
  _email: string,
  username: string,
  creature: CreatureState,
): Promise<UserProfile> {
  const profile: UserProfile = {
    id: userId,
    username,
    displayName: username,
    createdAt: Date.now(),
  };

  const sb = getSupabase();
  if (!sb) {
    saveLocal({ profile, creature, evolutions: [] });
    return profile;
  }

  await sb.from('profiles').upsert({
    id: userId,
    username,
    display_name: username,
    created_at: new Date().toISOString(),
  });

  await sb.from('creatures').insert(creatureToDb(creature));
  return profile;
}

export async function fetchEvolutions(creatureId: string): Promise<EvolutionRecord[]> {
  const sb = getSupabase();
  if (!sb) {
    const local = loadLocalSave();
    return local?.evolutions ?? [];
  }
  const { data } = await sb
    .from('evolution_history')
    .select('*')
    .eq('creature_id', creatureId)
    .order('level');
  if (!data) return [];
  return (data as DbEvolutionRecord[]).map((r) => ({
    level: r.level,
    formId: r.form_id,
    careSnapshot: r.care_snapshot as unknown as CareVector,
    unlockedAt: new Date(r.unlocked_at).getTime(),
  }));
}

export async function appendEvolution(creatureId: string, record: EvolutionRecord): Promise<void> {
  const local = loadLocalSave();
  if (local) {
    local.evolutions.push(record);
    saveLocal(local);
  }
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('evolution_history').insert({
    creature_id: creatureId,
    level: record.level,
    form_id: record.formId,
    care_snapshot: record.careSnapshot,
    unlocked_at: new Date(record.unlockedAt).toISOString(),
  });
}

export async function logCare(creatureId: string, action: string, delta: Partial<Needs>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('care_log').insert({
    creature_id: creatureId,
    action,
    delta,
    created_at: new Date().toISOString(),
  });
}

export function createLocalGuestId(): string {
  let id = localStorage.getItem('vinculo_vivo_guest_id');
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem('vinculo_vivo_guest_id', id);
  }
  return id;
}

/** Limpa save local e sessão em cache (não remove conta Supabase). */
export function clearLocalSession(clearGuestId = false): void {
  localStorage.removeItem(LOCAL_KEY);
  localStorage.removeItem(LOCAL_PROFILE_KEY);
  localStorage.removeItem(LOCAL_EVOLUTION_KEY);
  if (clearGuestId) localStorage.removeItem('vinculo_vivo_guest_id');
}

export { isSupabaseConfigured };
