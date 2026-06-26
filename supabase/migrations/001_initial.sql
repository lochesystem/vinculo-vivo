-- Vínculo Vivo — initial schema

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.creatures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique not null references public.profiles(id) on delete cascade,
  dna_hash text not null,
  dna_seed bigint not null,
  name text not null,
  level int not null default 1 check (level >= 1 and level <= 80),
  xp int not null default 0,
  evolution_stage int not null default 0,
  evolution_path text not null default 'balanced',
  form_id text not null,
  care_vector jsonb not null default '{}',
  needs jsonb not null default '{"hunger":80,"energy":85,"hygiene":90,"happiness":75}',
  mood text not null default 'content',
  last_tick_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  daily_streak int not null default 1,
  last_care_date date not null default current_date
);

create table if not exists public.care_log (
  id uuid primary key default gen_random_uuid(),
  creature_id uuid not null references public.creatures(id) on delete cascade,
  action text not null,
  delta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.evolution_history (
  id uuid primary key default gen_random_uuid(),
  creature_id uuid not null references public.creatures(id) on delete cascade,
  level int not null,
  form_id text not null,
  care_snapshot jsonb not null default '{}',
  unlocked_at timestamptz not null default now(),
  unique (creature_id, level)
);

create index if not exists idx_creatures_owner on public.creatures(owner_id);
create index if not exists idx_care_log_creature on public.care_log(creature_id);
create index if not exists idx_evolution_creature on public.evolution_history(creature_id);

alter table public.profiles enable row level security;
alter table public.creatures enable row level security;
alter table public.care_log enable row level security;
alter table public.evolution_history enable row level security;

create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles public read safe" on public.profiles
  for select using (true);

create policy "creatures read own" on public.creatures
  for select using (auth.uid() = owner_id);

create policy "creatures insert own" on public.creatures
  for insert with check (auth.uid() = owner_id);

create policy "creatures update own" on public.creatures
  for update using (auth.uid() = owner_id);

create policy "creatures public read safe" on public.creatures
  for select using (true);

create policy "care_log own creature" on public.care_log
  for all using (
    exists (
      select 1 from public.creatures c
      where c.id = care_log.creature_id and c.owner_id = auth.uid()
    )
  );

create policy "evolution own creature" on public.evolution_history
  for all using (
    exists (
      select 1 from public.creatures c
      where c.id = evolution_history.creature_id and c.owner_id = auth.uid()
    )
  );

create policy "evolution public read" on public.evolution_history
  for select using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
