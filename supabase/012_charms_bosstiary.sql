-- 012: plano de charms e kills do Bosstiary salvos por char, e ajustes do Security Advisor de 27/09/2026.
-- Privacidade igual ao bestiário (005): só o dono do char lê, grava e apaga.

-- 1. plano de charms: um por char (nível atual e desejado de cada charm, char promovido)
create table if not exists public.charm_plans (
  char_id uuid primary key references public.chars(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plan jsonb not null default '{}'::jsonb,
  promoted boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint charm_plans_plan_len check (char_length(plan::text) <= 5000)
);
create index if not exists charm_plans_user on public.charm_plans(user_id);
alter table public.charm_plans enable row level security;

drop policy if exists "charms: dono le" on public.charm_plans;
create policy "charms: dono le" on public.charm_plans for select using (auth.uid() = user_id);
drop policy if exists "charms: dono cria" on public.charm_plans;
create policy "charms: dono cria" on public.charm_plans for insert with check (
  auth.uid() = user_id and exists (select 1 from public.chars c where c.id = char_id and c.user_id = auth.uid())
);
drop policy if exists "charms: dono altera" on public.charm_plans;
create policy "charms: dono altera" on public.charm_plans for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists (select 1 from public.chars c where c.id = char_id and c.user_id = auth.uid())
);
drop policy if exists "charms: dono apaga" on public.charm_plans;
create policy "charms: dono apaga" on public.charm_plans for delete using (auth.uid() = user_id);
grant select, insert, update, delete on table public.charm_plans to authenticated;

-- 2. kills do Bosstiary: uma linha por boss com kills num char
create table if not exists public.boss_kills (
  char_id uuid not null references public.chars(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  boss text not null,
  kills integer not null,
  updated_at timestamptz not null default now(),
  primary key (char_id, boss),
  constraint boss_kills_boss_len check (char_length(boss) between 1 and 80),
  constraint boss_kills_range check (kills between 1 and 100000)
);
create index if not exists boss_kills_user on public.boss_kills(user_id);
alter table public.boss_kills enable row level security;

drop policy if exists "bosses: dono le" on public.boss_kills;
create policy "bosses: dono le" on public.boss_kills for select using (auth.uid() = user_id);
drop policy if exists "bosses: dono cria" on public.boss_kills;
create policy "bosses: dono cria" on public.boss_kills for insert with check (
  auth.uid() = user_id and exists (select 1 from public.chars c where c.id = char_id and c.user_id = auth.uid())
);
drop policy if exists "bosses: dono altera" on public.boss_kills;
create policy "bosses: dono altera" on public.boss_kills for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists (select 1 from public.chars c where c.id = char_id and c.user_id = auth.uid())
);
drop policy if exists "bosses: dono apaga" on public.boss_kills;
create policy "bosses: dono apaga" on public.boss_kills for delete using (auth.uid() = user_id);
grant select, insert, update, delete on table public.boss_kills to authenticated;

-- 3. Security Advisor: refresh_char só é chamada pela coleta agendada (refresh_all); ninguém pela API
revoke execute on function public.refresh_char(text) from public, anon, authenticated;
-- is_admin continua liberada para anon: as políticas de leitura de feedback e chars a chamam, e sem o grant
-- um visitante levaria erro de permissão. Para quem não está logado ela sempre responde falso.
-- death_wall e xp_ranking continuam abertas de propósito: alimentam o mural e o ranking públicos.
