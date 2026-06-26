import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('your-project') && anonKey !== 'your-anon-key',
);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export type DbProfile = {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
};

export type DbCreature = {
  id: string;
  owner_id: string;
  dna_hash: string;
  dna_seed: number;
  name: string;
  level: number;
  xp: number;
  evolution_stage: number;
  evolution_path: string;
  form_id: string;
  care_vector: Record<string, number>;
  needs: Record<string, number>;
  mood: string;
  last_tick_at: string;
  created_at: string;
  daily_streak: number;
  last_care_date: string;
};

export type DbEvolutionRecord = {
  creature_id: string;
  level: number;
  form_id: string;
  care_snapshot: Record<string, number>;
  unlocked_at: string;
};
