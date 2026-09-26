-- Esquema inicial do TibiaConsult-app. Rodar no SQL Editor do Supabase.
-- Cada usuário só enxerga e altera os próprios chars (Row Level Security).

create table if not exists public.chars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  vocation text not null default 'sorcerer' check (vocation in ('sorcerer', 'druid', 'knight', 'paladin', 'monk')),
  level integer not null default 8 check (level between 1 and 5000),
  magic_level integer not null default 0 check (magic_level between 0 and 300),
  world text,
  wand text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chars_user_id_idx on public.chars (user_id);

alter table public.chars enable row level security;

drop policy if exists "chars: dono lê" on public.chars;
create policy "chars: dono lê" on public.chars
  for select using (auth.uid() = user_id);

drop policy if exists "chars: dono insere" on public.chars;
create policy "chars: dono insere" on public.chars
  for insert with check (auth.uid() = user_id);

drop policy if exists "chars: dono altera" on public.chars;
create policy "chars: dono altera" on public.chars
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "chars: dono apaga" on public.chars;
create policy "chars: dono apaga" on public.chars
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists chars_set_updated_at on public.chars;
create trigger chars_set_updated_at before update on public.chars
  for each row execute function public.set_updated_at();
