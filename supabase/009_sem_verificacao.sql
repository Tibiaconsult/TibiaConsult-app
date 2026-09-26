-- 009: por enquanto, mural e ranking mostram o char só pelo nome cadastrado (decisão do Yuri, 26/09/2026).
-- A verificação por código no comentário (start_verify / check_verify) continua no banco, desligada, para voltar depois:
-- basta recriar as duas funções abaixo com "and c.public_profile and c.verified".

-- Mural "Caixão e Vela Preta": mortes dos chars públicos.
create or replace function public.death_wall(p_limit integer default 100)
returns table (name text, world text, vocation text, died_at timestamptz, level integer, reason text, by_player boolean)
language sql stable security definer set search_path = public as $$
  select d.name, s.world, s.vocation, d.died_at, d.level, d.reason, d.by_player
  from public.char_deaths d
  left join lateral (select world, vocation from public.char_snapshots x where x.name = d.name order by snap_date desc limit 1) s on true
  where exists (select 1 from public.chars c where lower(c.name) = lower(d.name) and c.public_profile)
  order by d.died_at desc
  limit least(greatest(p_limit, 1), 500)
$$;
grant execute on function public.death_wall(integer) to anon, authenticated;

-- Ranking de XP: diferença entre o snapshot mais recente e o de N dias atrás (ou o mais antigo, se o histórico for curto).
create or replace function public.xp_ranking(p_days integer)
returns table (name text, world text, vocation text, level integer, gained bigint, since date, exact boolean)
language sql stable security definer set search_path = public as $$
  with pub as (
    select distinct s.name from public.char_snapshots s
    where exists (select 1 from public.chars c where lower(c.name) = lower(s.name) and c.public_profile)
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
         cur.exp_exact and coalesce(base.exp_exact, first.exp_exact) as exact
  from cur join first using (name) left join base using (name)
  order by gained desc, cur.level desc
$$;
grant execute on function public.xp_ranking(integer) to anon, authenticated;

