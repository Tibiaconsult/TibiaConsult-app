-- 020: a Taverna fica só com as mortes, comentadas pelos NPCs (boato do Rashid, Henricus) e pelas pessoas.
-- Causos saem: ninguém posta mais (a tabela fica, sem uso). O mural passa a trazer quantas vezes o char morreu em 30 dias.

revoke insert on table public.posts from authenticated;

drop function if exists public.death_wall(integer, text);
create or replace function public.death_wall(p_limit integer default 100, p_guild text default null)
returns table (name text, world text, vocation text, died_at timestamptz, level integer, reason text, by_player boolean, guild text, month_deaths bigint)
language sql stable security definer set search_path = public as $$
  select d.name, s.world, s.vocation, d.died_at, d.level, d.reason, d.by_player, t.guild,
         (select count(*) from public.char_deaths x where x.name = d.name and x.died_at > now() - interval '30 days') as month_deaths
  from public.char_deaths d
  join public.tracked_names() t on t.lname = lower(d.name)
  left join lateral (select world, vocation from public.char_snapshots x where x.name = d.name order by snap_date desc limit 1) s on true
  where p_guild is null or t.guild = p_guild
  order by d.died_at desc
  limit least(greatest(p_limit, 1), 500)
$$;
grant execute on function public.death_wall(integer, text) to anon, authenticated;

-- perfil: 🤡 contado nas mortes (não mais nos causos) e mortes em 30 dias
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
           coalesce((select created_at from acc), (select added_at from gm)) as joined_at
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
    'posts', 0,
    'clowns', (select count(*) from public.reactions r where r.target_type = 'death' and r.emoji = 'palhaco' and split_part(r.target_key, '|', 1) = lower(p_name)),
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
