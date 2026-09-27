-- 016: guildas acompanhadas (Rangers e Rangers Academy, Belobra), limpeza da verificação antiga e ajustes de desempenho.
-- Guildas: todos os membros entram no mural, no ranking de XP, no Funcionário do Mês e ganham perfil público,
-- mesmo sem conta no site (mesmos dados públicos do tibia.com que o GuildStats mostra).
-- Quem não quiser aparecer vai para tracking_optout (o admin inclui pelo SQL Editor) e some de tudo.

-- A. Verificação por código: não é mais usada (015)
drop function if exists public.check_verify(uuid);
drop function if exists public.start_verify(uuid);
drop trigger if exists chars_reset_verify on public.chars;
drop function if exists public.chars_reset_verify();
alter table public.chars drop column if exists verify_code, drop column if exists verified_at, drop column if exists verified;

-- B. Desempenho: uma política de leitura em chars e auth.uid()/is_admin() avaliados uma vez por consulta
drop policy if exists "chars: admin le tudo" on public.chars;
drop policy if exists "chars: dono le" on public.chars;
create policy "chars: dono ou admin le" on public.chars for select using (user_id = auth.uid() or public.is_admin());

do $$
declare p record; q text; c text; stmt text;
begin
  for p in select * from pg_policies where schemaname = 'public' loop
    q := p.qual; c := p.with_check; stmt := '';
    if q is not null and q !~ 'SELECT auth\.uid|SELECT is_admin' and q ~ 'auth\.uid\(\)|is_admin\(\)' then
      stmt := stmt || ' using (' || replace(replace(q, 'auth.uid()', '(select auth.uid())'), 'is_admin()', '(select public.is_admin())') || ')';
    end if;
    if c is not null and c !~ 'SELECT auth\.uid|SELECT is_admin' and c ~ 'auth\.uid\(\)|is_admin\(\)' then
      stmt := stmt || ' with check (' || replace(replace(c, 'auth.uid()', '(select auth.uid())'), 'is_admin()', '(select public.is_admin())') || ')';
    end if;
    if stmt <> '' then
      execute format('alter policy %I on public.%I', p.policyname, p.tablename) || stmt;
    end if;
  end loop;
end $$;

create index if not exists comments_char on public.comments (char_id);
create index if not exists comments_user on public.comments (user_id);
create index if not exists posts_user on public.posts (user_id);
create index if not exists feedback_user on public.feedback (user_id);

-- C. Guildas acompanhadas
create table if not exists public.tracked_guilds (
  name text primary key,
  world text not null,
  added_at timestamptz not null default now()
);
alter table public.tracked_guilds enable row level security;
drop policy if exists "guildas: todos leem" on public.tracked_guilds;
create policy "guildas: todos leem" on public.tracked_guilds for select using (true);
grant select on table public.tracked_guilds to anon, authenticated;
insert into public.tracked_guilds (name, world) values ('Rangers', 'Belobra'), ('Rangers Academy', 'Belobra') on conflict do nothing;

create table if not exists public.guild_members (
  name text primary key,
  guild text not null references public.tracked_guilds (name) on delete cascade,
  world text,
  rank text,
  vocation text,
  level integer,
  joined date,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guild_members_lower on public.guild_members (lower(name));
create index if not exists guild_members_guild on public.guild_members (guild);
alter table public.guild_members enable row level security;
-- sem política: leitura só pelas funções abaixo (respeitam o opt-out)

create table if not exists public.tracking_optout (name text primary key, created_at timestamptz not null default now());
alter table public.tracking_optout enable row level security;

-- última consulta de mortes de cada char (rodízio)
create table if not exists public.char_checks (name text primary key, checked_at timestamptz not null);
alter table public.char_checks enable row level security;

-- Aparece nas páginas públicas: char liberado por uma conta ou membro de guilda acompanhada, e fora do opt-out
create or replace function public.is_tracked(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.tracking_optout o where lower(o.name) = lower(p_name))
     and (exists (select 1 from public.chars c where lower(c.name) = lower(p_name) and c.public_profile)
          or exists (select 1 from public.guild_members g where lower(g.name) = lower(p_name)))
$$;
revoke all on function public.is_tracked(text) from public, anon, authenticated;

-- Conjunto de nomes acompanhados (minúsculos) com a guilda de cada um: usado nas listas públicas, calculado uma vez por consulta
create or replace function public.tracked_names() returns table (lname text, guild text)
language sql stable security definer set search_path = public as $$
  select lower(x.name), max(x.guild)
  from (select name, guild from public.guild_members union all select name, null from public.chars where public_profile) x
  where not exists (select 1 from public.tracking_optout o where lower(o.name) = lower(x.name))
  group by lower(x.name)
$$;
revoke all on function public.tracked_names() from public, anon, authenticated;

-- Lista das guildas: membros, level, vocação e cargo. Remove quem saiu e grava o snapshot do dia (level da guilda).
create or replace function public.refresh_guilds() returns integer
language plpgsql security definer set search_path = public as $$
declare g record; j jsonb; m jsonb; w text; lvl integer; n integer := 0;
begin
  for g in select * from public.tracked_guilds loop
    j := public.tc_get_json('https://api.tibiadata.com/v4/guild/' || replace(g.name, ' ', '%20'));
    continue when j is null or jsonb_typeof(j -> 'guild' -> 'members') <> 'array' or jsonb_array_length(j -> 'guild' -> 'members') = 0;
    w := coalesce(j -> 'guild' ->> 'world', g.world);
    delete from public.guild_members gm
    where gm.guild = g.name and not exists (select 1 from jsonb_array_elements(j -> 'guild' -> 'members') x where x ->> 'name' = gm.name);
    for m in select * from jsonb_array_elements(j -> 'guild' -> 'members') loop
      continue when exists (select 1 from public.tracking_optout o where lower(o.name) = lower(m ->> 'name'));
      lvl := (m ->> 'level')::int;
      insert into public.guild_members as gm (name, guild, world, rank, vocation, level, joined, updated_at)
      values (m ->> 'name', g.name, w, m ->> 'rank', m ->> 'vocation', lvl, (m ->> 'joined')::date, now())
      on conflict (name) do update set guild = excluded.guild, world = excluded.world, rank = excluded.rank, vocation = excluded.vocation,
        level = excluded.level, joined = excluded.joined, updated_at = now();
      insert into public.char_snapshots as s (name, snap_date, world, vocation, level, experience, exp_exact, taken_at)
      values (m ->> 'name', public.tibia_day(), w, m ->> 'vocation', lvl, public.exp_for_level(lvl), false, now())
      on conflict (name, snap_date) do update set
        world = excluded.world, vocation = excluded.vocation, level = excluded.level,
        experience = case when s.exp_exact and s.level = excluded.level then s.experience else excluded.experience end,
        exp_exact = s.exp_exact and s.level = excluded.level;
      n := n + 1;
    end loop;
  end loop;
  delete from public.char_snapshots where snap_date < public.tibia_day() - 400;
  return n;
end $$;
revoke all on function public.refresh_guilds() from public, anon, authenticated;

-- Atualiza um char (level e mortes pelo /v4/character). Vale para chars cadastrados e membros das guildas.
create or replace function public.refresh_char(p_name text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare j jsonb; c jsonb; d jsonb; lvl integer; nm text;
begin
  if not exists (select 1 from public.chars where lower(name) = lower(p_name))
     and not exists (select 1 from public.guild_members where lower(name) = lower(p_name)) then
    return 'char não acompanhado';
  end if;
  -- no máximo uma consulta a cada 10 minutos por char
  if exists (select 1 from public.char_checks where lower(name) = lower(p_name) and checked_at > now() - interval '10 minutes') then
    return 'atualizado há pouco';
  end if;
  insert into public.char_checks (name, checked_at) values (p_name, now()) on conflict (name) do update set checked_at = now();
  j := public.tc_get_json('https://api.tibiadata.com/v4/character/' || replace(p_name, ' ', '%20'));
  c := j -> 'character' -> 'character';
  if c is null or coalesce(c ->> 'name', '') = '' then return 'não encontrado no tibia.com'; end if;
  nm := c ->> 'name';
  lvl := (c ->> 'level')::int;
  insert into public.char_snapshots as s (name, snap_date, world, vocation, level, experience, exp_exact, taken_at)
  values (nm, public.tibia_day(), c ->> 'world', c ->> 'vocation', lvl, public.exp_for_level(lvl), false, now())
  on conflict (name, snap_date) do update set
    world = excluded.world, vocation = excluded.vocation, taken_at = now(),
    level = excluded.level,
    experience = case when s.exp_exact and s.level = excluded.level then s.experience else excluded.experience end,
    exp_exact = s.exp_exact and s.level = excluded.level;
  for d in select * from jsonb_array_elements(coalesce(j -> 'character' -> 'deaths', '[]'::jsonb)) loop
    insert into public.char_deaths (name, died_at, level, reason, killers, by_player)
    values (nm, (d ->> 'time')::timestamptz, (d ->> 'level')::int, d ->> 'reason', d -> 'killers',
            exists (select 1 from jsonb_array_elements(coalesce(d -> 'killers', '[]'::jsonb)) k where (k ->> 'player')::boolean))
    on conflict do nothing;
  end loop;
  return 'ok';
end $$;
revoke all on function public.refresh_char(text) from public, anon, authenticated;

-- Rodízio de mortes: a cada execução consulta os N chars checados há mais tempo (461 membros: cada um a cada ~3 h)
create or replace function public.refresh_deaths_batch(p_n integer default 25) returns integer
language plpgsql security definer set search_path = public as $$
declare nm text; n integer := 0;
begin
  for nm in
    select t.name from (select name from public.guild_members union select name from public.chars) t
    left join public.char_checks k on lower(k.name) = lower(t.name)
    where not exists (select 1 from public.tracking_optout o where lower(o.name) = lower(t.name))
    order by k.checked_at nulls first
    limit p_n
  loop
    perform public.refresh_char(nm);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.refresh_deaths_batch(integer) from public, anon, authenticated;

-- Experiência exata pelo highscore do mundo (até 1000 primeiros), para chars cadastrados e membros das guildas
create or replace function public.refresh_highscores(p_world text) returns integer
language plpgsql security definer set search_path = public, extensions as $$
declare j jsonb; e jsonb; pg integer; total integer := 0; pages integer := 20;
begin
  for pg in 1..20 loop
    exit when pg > pages;
    j := public.tc_get_json('https://api.tibiadata.com/v4/highscores/' || replace(p_world, ' ', '%20') || '/experience/all/' || pg);
    exit when j is null;
    pages := coalesce((j -> 'highscores' -> 'highscore_page' ->> 'total_pages')::int, pages);
    for e in select * from jsonb_array_elements(coalesce(j -> 'highscores' -> 'highscore_list', '[]'::jsonb)) loop
      if exists (select 1 from public.chars where lower(name) = lower(e ->> 'name'))
         or exists (select 1 from public.guild_members where lower(name) = lower(e ->> 'name')) then
        insert into public.char_snapshots (name, snap_date, world, vocation, level, experience, exp_exact, taken_at)
        values (e ->> 'name', public.tibia_day(), e ->> 'world', e ->> 'vocation', (e ->> 'level')::int, (e ->> 'value')::bigint, true, now())
        on conflict (name, snap_date) do update set
          world = excluded.world, vocation = excluded.vocation, level = excluded.level,
          experience = excluded.experience, exp_exact = true, taken_at = now();
        total := total + 1;
      end if;
    end loop;
  end loop;
  return total;
end $$;
revoke all on function public.refresh_highscores(text) from public, anon, authenticated;

-- Tempo online: mundos dos chars cadastrados e das guildas
create or replace function public.track_online() returns void
language plpgsql security definer set search_path = public as $$
declare w text; j jsonb;
begin
  for w in select world from public.chars where world is not null union select world from public.tracked_guilds loop
    j := public.tc_get_json('https://api.tibiadata.com/v4/world/' || replace(w, ' ', '%20'));
    continue when j is null or jsonb_typeof(j -> 'world' -> 'online_players') <> 'array';
    insert into public.char_online as o (name, day, minutes, last_seen)
    select p ->> 'name', public.tibia_day(), 5, now()
    from jsonb_array_elements(j -> 'world' -> 'online_players') p
    where lower(p ->> 'name') in (select lower(name) from public.chars where world = w union select lower(name) from public.guild_members where world = w)
    on conflict (name, day) do update set minutes = o.minutes + 5, last_seen = now()
      where o.last_seen is null or o.last_seen < now() - interval '4 minutes';
  end loop;
  delete from public.char_online where day < public.tibia_day() - 400;
end $$;
revoke all on function public.track_online() from public, anon, authenticated;

-- D. Leituras públicas com a guilda de cada char e filtro por guilda (p_guild nulo = todos)
drop function if exists public.death_wall(integer);
create or replace function public.death_wall(p_limit integer default 100, p_guild text default null)
returns table (name text, world text, vocation text, died_at timestamptz, level integer, reason text, by_player boolean, guild text)
language sql stable security definer set search_path = public as $$
  select d.name, s.world, s.vocation, d.died_at, d.level, d.reason, d.by_player, t.guild
  from public.char_deaths d
  join public.tracked_names() t on t.lname = lower(d.name)
  left join lateral (select world, vocation from public.char_snapshots x where x.name = d.name order by snap_date desc limit 1) s on true
  where p_guild is null or t.guild = p_guild
  order by d.died_at desc
  limit least(greatest(p_limit, 1), 500)
$$;
grant execute on function public.death_wall(integer, text) to anon, authenticated;

drop function if exists public.xp_ranking(integer);
create or replace function public.xp_ranking(p_days integer, p_guild text default null)
returns table (name text, world text, vocation text, level integer, gained bigint, since date, exact boolean, guild text)
language sql stable security definer set search_path = public as $$
  with pub as (
    select distinct s.name, t.guild from public.char_snapshots s
    join public.tracked_names() t on t.lname = lower(s.name)
    where p_guild is null or t.guild = p_guild
  ), cur as (
    select distinct on (s.name) s.* from public.char_snapshots s join pub using (name) order by s.name, s.snap_date desc
  ), base as (
    select distinct on (s.name) s.* from public.char_snapshots s join pub using (name)
    where s.snap_date <= public.tibia_day() - greatest(p_days, 1)
    order by s.name, s.snap_date desc
  ), first as (
    select distinct on (s.name) s.* from public.char_snapshots s join pub using (name) order by s.name, s.snap_date asc
  )
  select cur.name, cur.world, cur.vocation, cur.level,
         cur.experience - coalesce(base.experience, first.experience) as gained,
         coalesce(base.snap_date, first.snap_date) as since,
         cur.exp_exact and coalesce(base.exp_exact, first.exp_exact) as exact,
         pub.guild
  from cur join first using (name) join pub using (name) left join base using (name)
  order by gained desc, cur.level desc
$$;
grant execute on function public.xp_ranking(integer, text) to anon, authenticated;

drop function if exists public.online_ranking(date);
create or replace function public.online_ranking(p_month date default null, p_guild text default null)
returns table (name text, world text, vocation text, level integer, minutes bigint, days bigint, guild text)
language sql stable security definer set search_path = public as $$
  with m as (select date_trunc('month', coalesce(p_month, public.tibia_day()))::date as ini)
  select o.name, coalesce(s.world, ch.world), coalesce(s.vocation, ch.vocation), coalesce(s.level, ch.level),
         sum(o.minutes) as minutes, count(*) as days, t.guild
  from public.char_online o
  cross join m
  join public.tracked_names() t on t.lname = lower(o.name)
  left join lateral (select world, vocation, level from public.char_snapshots x where lower(x.name) = lower(o.name) order by snap_date desc limit 1) s on true
  left join lateral (select world, vocation, level from public.chars x where lower(x.name) = lower(o.name) limit 1) ch on true
  where o.day >= m.ini and o.day < (m.ini + interval '1 month')::date
    and (p_guild is null or t.guild = p_guild)
  group by 1, 2, 3, 4, 7
  order by minutes desc
  limit 200
$$;
grant execute on function public.online_ranking(date, text) to anon, authenticated;

-- Perfil público: char liberado por uma conta ou membro de guilda
create or replace function public.char_profile(p_name text) returns jsonb
language sql stable security definer set search_path = public as $$
  with acc as (
    select id, name, vocation, level, world, created_at from public.chars
    where lower(name) = lower(p_name) and public_profile order by created_at limit 1
  ), gm as (
    select name, guild, rank, vocation, level, world, added_at from public.guild_members where lower(name) = lower(p_name)
  ), snap as (
    select name, vocation, level, world from public.char_snapshots where lower(name) = lower(p_name) order by snap_date desc limit 1
  ), c as (
    select coalesce((select name from snap), (select name from gm), (select name from acc)) as name,
           coalesce((select vocation from snap), (select vocation from gm), (select vocation from acc)) as vocation,
           coalesce((select level from snap), (select level from gm), (select level from acc)) as level,
           coalesce((select world from snap), (select world from gm), (select world from acc)) as world,
           coalesce((select created_at from acc), (select added_at from gm)) as joined_at,
           (select id from acc) as id
  )
  select case when not public.is_tracked(p_name) then null else jsonb_build_object(
    'name', (select name from c),
    'vocation', (select vocation from c),
    'level', (select level from c),
    'world', (select world from c),
    'joined_at', (select joined_at from c),
    'guild', (select guild from gm),
    'rank', (select rank from gm),
    'registered', exists (select 1 from acc),
    'deaths', coalesce((select jsonb_agg(jsonb_build_object('died_at', d.died_at, 'level', d.level, 'reason', d.reason, 'by_player', d.by_player) order by d.died_at desc)
                        from public.char_deaths d where lower(d.name) = lower(p_name)), '[]'::jsonb),
    'snapshots', coalesce((select jsonb_agg(jsonb_build_object('date', s.snap_date, 'level', s.level, 'experience', s.experience) order by s.snap_date)
                           from public.char_snapshots s where lower(s.name) = lower(p_name) and s.snap_date > public.tibia_day() - 60), '[]'::jsonb),
    'posts', (select count(*) from public.posts p where p.char_id = (select id from c) and not p.hidden),
    'clowns', (select count(*) from public.reactions r join public.posts p on r.target_type = 'post' and r.target_key = p.id::text
               where p.char_id = (select id from c) and r.emoji = 'palhaco'),
    'fs', (select count(*) from public.reactions r where r.target_type = 'death' and r.emoji = 'f' and split_part(r.target_key, '|', 1) = lower(p_name)),
    'online30', (select coalesce(sum(minutes), 0) from public.char_online o where lower(o.name) = lower(p_name) and o.day > public.tibia_day() - 30),
    'online_month', (select coalesce(sum(minutes), 0) from public.char_online o where lower(o.name) = lower(p_name)
                     and o.day >= date_trunc('month', public.tibia_day())::date),
    'online_since', (select min(day) from public.char_online),
    'wins', (select count(*) from (
               select distinct on (t.mes) t.mes, t.name from (
                 select date_trunc('month', o.day)::date as mes, lower(o.name) as name, sum(o.minutes) as total
                 from public.char_online o
                 join public.tracked_names() tn on tn.lname = lower(o.name)
                 where o.day < date_trunc('month', public.tibia_day())::date
                 group by 1, 2
               ) t order by t.mes, t.total desc
             ) w where w.name = lower(p_name))
  ) end
$$;
grant execute on function public.char_profile(text) to anon, authenticated;

-- E. Agendamentos: lista das guildas a cada 3 h e rodízio de mortes a cada 10 min
select cron.unschedule(jobid) from cron.job where jobname in ('tc-guilds', 'tc-deaths');
select cron.schedule('tc-guilds', '40 */3 * * *', 'select public.refresh_guilds()');
select cron.schedule('tc-deaths', '*/10 * * * *', 'select public.refresh_deaths_batch(25)');

-- F. O admin gerencia o opt-out pelo /admin
drop policy if exists "optout: admin gerencia" on public.tracking_optout;
create policy "optout: admin gerencia" on public.tracking_optout for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant select, insert, delete on table public.tracking_optout to authenticated;
