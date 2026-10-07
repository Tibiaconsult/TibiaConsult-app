-- 030: o ranking de tempo online (Funcionário do mês) levava ~11 s e estourava o statement timeout da API (500/504 no painel).
-- Soma primeiro por char e só depois busca o último snapshot de cada um, com índice em lower(name). Agora: ~12 ms.
create index if not exists char_snapshots_lname on public.char_snapshots (lower(name), snap_date desc);

create or replace function public.online_ranking(p_month date default null, p_guild text default null)
returns table (name text, world text, vocation text, level integer, minutes bigint, days bigint, guild text)
language sql stable security definer set search_path = public as $$
  with m as (select date_trunc('month', coalesce(p_month, public.tibia_day()))::date as ini),
  agg as (
    select lower(o.name) as lname, max(o.name) as name, sum(o.minutes)::bigint as minutes, count(*)::bigint as days
    from public.char_online o, m
    where o.day >= m.ini and o.day < (m.ini + interval '1 month')::date
    group by lower(o.name)
  )
  select a.name, coalesce(s.world, ch.world), coalesce(s.vocation, ch.vocation), coalesce(s.level, ch.level), a.minutes, a.days, t.guild
  from agg a
  join public.tracked_names() t on t.lname = a.lname
  left join lateral (select x.world, x.vocation, x.level from public.char_snapshots x where lower(x.name) = a.lname order by x.snap_date desc limit 1) s on true
  left join lateral (select x.world, x.vocation, x.level from public.chars x where lower(x.name) = a.lname limit 1) ch on true
  where p_guild is null or t.guild = p_guild
  order by a.minutes desc
  limit 200
$$;
grant execute on function public.online_ranking(date, text) to anon, authenticated;
