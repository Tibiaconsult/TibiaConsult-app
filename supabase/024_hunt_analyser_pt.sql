-- 024: Hunt Analyser da guild e Procura-se PT.
-- Hunt Analyser: cada um cola o "Copy to Clipboard" do Hunt Analyser do cliente; o site guarda xp/h e lucro/h por hunt,
--   char, vocação e level. O ranking de hunts sai com dados reais da turma. Só chars liberados na comunidade (o nome aparece).
-- Procura-se PT: anúncio curto (hunt, horário, observação) que some sozinho; mostra quem está online agora nas guildas.

-- 1. sessões de hunt -------------------------------------------------------------------------------------------------
create table if not exists public.hunt_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  char_id uuid not null references public.chars (id) on delete cascade,
  char_name text not null,
  vocation text,
  level integer not null check (level between 1 and 3000),
  hunt_id text not null check (char_length(hunt_id) <= 60),
  minutes integer not null check (minutes between 5 and 1440),
  xp bigint not null check (xp >= 0),
  raw_xp bigint check (raw_xp >= 0),
  loot bigint not null default 0,
  supplies bigint not null default 0,
  balance bigint not null default 0,
  xp_h bigint generated always as (xp * 60 / minutes) stored,
  profit_h bigint generated always as (balance * 60 / minutes) stored,
  kills jsonb,
  created_at timestamptz not null default now()
);
create index if not exists hunt_sessions_hunt on public.hunt_sessions (hunt_id, created_at desc);
alter table public.hunt_sessions enable row level security;
drop policy if exists "sessões: todos leem" on public.hunt_sessions;
create policy "sessões: todos leem" on public.hunt_sessions for select using (true);
drop policy if exists "sessões: dono apaga" on public.hunt_sessions;
create policy "sessões: dono apaga" on public.hunt_sessions for delete using ((select auth.uid()) = user_id);
revoke all on table public.hunt_sessions from anon, authenticated;
-- user_id fica escondido; o resto é público (ranking)
grant select (id, char_name, vocation, level, hunt_id, minutes, xp, raw_xp, loot, supplies, balance, xp_h, profit_h, kills, created_at)
  on table public.hunt_sessions to anon, authenticated;
grant delete on table public.hunt_sessions to authenticated;

create or replace function public.add_hunt_session(p_char uuid, p_hunt text, p_level integer, p_minutes integer, p_xp bigint, p_raw_xp bigint,
  p_loot bigint, p_supplies bigint, p_balance bigint, p_kills jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare ch record; sid uuid;
begin
  select id, name, vocation, public_profile into ch from public.chars where id = p_char and user_id = auth.uid();
  if ch is null then raise exception 'char não encontrado'; end if;
  if not ch.public_profile then raise exception 'libere o char na comunidade para publicar sessões'; end if;
  if (select count(*) from public.hunt_sessions where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'muitas sessões seguidas: tente de novo daqui a pouco';
  end if;
  if p_xp::numeric * 60 / greatest(p_minutes, 1) > 200000000 then raise exception 'xp/h fora da realidade: confira o texto colado'; end if;
  insert into public.hunt_sessions (user_id, char_id, char_name, vocation, level, hunt_id, minutes, xp, raw_xp, loot, supplies, balance, kills)
  values (auth.uid(), ch.id, ch.name, ch.vocation, p_level, p_hunt, p_minutes, p_xp, p_raw_xp, p_loot, p_supplies, p_balance,
          case when jsonb_typeof(p_kills) = 'object' then p_kills else null end)
  returning id into sid;
  return sid;
end $$;
revoke all on function public.add_hunt_session(uuid, text, integer, integer, bigint, bigint, bigint, bigint, bigint, jsonb) from public, anon;
grant execute on function public.add_hunt_session(uuid, text, integer, integer, bigint, bigint, bigint, bigint, bigint, jsonb) to authenticated;

-- 2. procura-se PT ----------------------------------------------------------------------------------------------------
create table if not exists public.lfg_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  char_id uuid not null references public.chars (id) on delete cascade,
  char_name text not null,
  vocation text,
  level integer,
  hunt text not null check (char_length(hunt) between 2 and 80),
  note text check (char_length(note) <= 200),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists lfg_posts_expires on public.lfg_posts (expires_at);
alter table public.lfg_posts enable row level security;
drop policy if exists "pt: todos leem os ativos" on public.lfg_posts;
create policy "pt: todos leem os ativos" on public.lfg_posts for select using (expires_at > now());
drop policy if exists "pt: dono apaga" on public.lfg_posts;
create policy "pt: dono apaga" on public.lfg_posts for delete using ((select auth.uid()) = user_id);
revoke all on table public.lfg_posts from anon, authenticated;
grant select (id, char_name, vocation, level, hunt, note, starts_at, expires_at, created_at) on table public.lfg_posts to anon, authenticated;
grant delete on table public.lfg_posts to authenticated;

create or replace function public.add_lfg(p_char uuid, p_hunt text, p_note text, p_starts timestamptz) returns uuid
language plpgsql security definer set search_path = public as $$
declare ch record; pid uuid; st timestamptz := greatest(coalesce(p_starts, now()), now());
begin
  select c.id, c.name, c.vocation, c.level, c.public_profile into ch from public.chars c where c.id = p_char and c.user_id = auth.uid();
  if ch is null then raise exception 'char não encontrado'; end if;
  if not ch.public_profile then raise exception 'libere o char na comunidade para anunciar'; end if;
  if st > now() + interval '2 days' then raise exception 'horário muito longe: anuncie mais perto do dia'; end if;
  -- um anúncio ativo por char
  delete from public.lfg_posts where char_id = ch.id;
  insert into public.lfg_posts (user_id, char_id, char_name, vocation, level, hunt, note, starts_at, expires_at)
  values (auth.uid(), ch.id, ch.name, ch.vocation,
          coalesce((select s.level from public.char_snapshots s where lower(s.name) = lower(ch.name) order by snap_date desc limit 1), ch.level),
          public.tc_clean_text(btrim(p_hunt)), public.tc_clean_text(nullif(btrim(coalesce(p_note, '')), '')), st, st + interval '3 hours')
  returning id into pid;
  return pid;
end $$;
revoke all on function public.add_lfg(uuid, text, text, timestamptz) from public, anon;
grant execute on function public.add_lfg(uuid, text, text, timestamptz) to authenticated;

-- quem está online agora (visto nos últimos 7 minutos pela coleta de 5 em 5), das guildas e dos chars liberados
create or replace function public.online_now() returns table (name text, level integer, vocation text, guild text)
language sql stable security definer set search_path = public as $$
  select o.name, s.level, s.vocation, t.guild
  from (select distinct on (lower(name)) name, last_seen from public.char_online where day >= public.tibia_day() - 1 order by lower(name), last_seen desc) o
  join public.tracked_names() t on t.lname = lower(o.name)
  left join lateral (select level, vocation from public.char_snapshots x where lower(x.name) = lower(o.name) order by snap_date desc limit 1) s on true
  where o.last_seen > now() - interval '7 minutes'
  order by s.level desc nulls last
$$;
grant execute on function public.online_now() to anon, authenticated;

-- limpeza: anúncios vencidos há mais de 1 dia
select cron.unschedule(jobid) from cron.job where jobname = 'tc-lfg-clean';
select cron.schedule('tc-lfg-clean', '35 4 * * *', $$delete from public.lfg_posts where expires_at < now() - interval '1 day'$$);
