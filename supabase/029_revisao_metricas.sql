-- 029: correções da revisão de métricas.
-- level_feed: devolve só os marcos de 50 em 50 (o que a Taverna mostra). Antes cortava em 300 level ups comuns e os marcos
--   mais antigos sumiam do feed quando a guilda subia muito.
-- admin_metrics: "level ups" passa a contar só chars das guildas/liberados (igual às mortes) e "voltaram na semana" conta
--   quem apareceu nesta semana e também em outro dia, mesmo que antes da semana.

create or replace function public.level_feed(p_days integer default 7, p_guild text default null)
returns table (name text, level integer, from_level integer, milestone integer, at timestamptz, guild text, vocation text, world text, month_deaths bigint)
language sql stable security definer set search_path = public as $$
  select l.name, l.level, l.from_level, l.milestone, l.at, t.guild, s.vocation, s.world,
         (select count(*) from public.char_deaths x where lower(x.name) = l.lname and x.died_at > now() - interval '30 days')
  from public.level_ups l
  join public.tracked_names() t on t.lname = l.lname
  left join lateral (select vocation, world from public.char_snapshots x where lower(x.name) = l.lname order by snap_date desc limit 1) s on true
  where l.at > now() - make_interval(days => least(greatest(p_days, 1), 60))
    and (p_guild is null or t.guild = p_guild)
    and l.milestone is not null
  order by l.at desc
  limit 300
$$;
grant execute on function public.level_feed(integer, text) to anon, authenticated;

create or replace function public.admin_metrics(p_days integer default 14) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d0 date := (now() at time zone 'America/Sao_Paulo')::date - (least(greatest(p_days, 1), 90) - 1);
        brt text := 'America/Sao_Paulo'; out jsonb;
begin
  if not public.is_admin() then raise exception 'só administradores'; end if;
  select jsonb_build_object(
    'days', (select jsonb_agg(jsonb_build_object(
        'day', g.day,
        'visitors', (select count(distinct visitor) from public.site_visits v where v.day = g.day),
        'views', (select coalesce(sum(hits), 0) from public.site_visits v where v.day = g.day),
        'logged', (select count(distinct visitor) from public.site_visits v where v.day = g.day and v.logged),
        'signups', (select count(*) from auth.users u where (u.created_at at time zone brt)::date = g.day),
        'comments', (select count(*) from public.comments c where (c.created_at at time zone brt)::date = g.day),
        'gossips', (select count(*) from public.gossips x where (x.created_at at time zone brt)::date = g.day),
        'reactions', (select count(*) from public.reactions r where (r.created_at at time zone brt)::date = g.day),
        'deaths', (select count(*) from public.char_deaths d join public.tracked_names() t on t.lname = lower(d.name)
                   where (d.died_at at time zone brt)::date = g.day),
        'levels', (select count(*) from public.level_ups l join public.tracked_names() t on t.lname = l.lname
                   where (l.at at time zone brt)::date = g.day)
      ) order by g.day desc)
      from generate_series(d0, (now() at time zone brt)::date, interval '1 day') as gs(t), lateral (select gs.t::date as day) g),
    'totals', jsonb_build_object(
      'users', (select count(*) from auth.users),
      'active7', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
      'chars', (select count(*) from public.chars),
      'released', (select count(*) from public.chars where public_profile),
      'push_users', (select count(distinct user_id) from public.push_subscriptions),
      'visitors7', (select count(distinct visitor) from public.site_visits where day > (now() at time zone brt)::date - 7),
      'visitors30', (select count(distinct visitor) from public.site_visits where day > (now() at time zone brt)::date - 30),
      -- voltaram: vistos nos últimos 7 dias e também em outro dia (nesta semana ou antes)
      'returning7', (select count(*) from (select visitor from public.site_visits
                                           where visitor in (select visitor from public.site_visits where day > (now() at time zone brt)::date - 7)
                                           group by visitor having count(distinct day) > 1) r),
      'tracked', (select count(*) from public.tracked_names())),
    'pages', (select coalesce(jsonb_agg(p order by p.views desc), '[]') from (
        select path, sum(hits) as views, count(distinct visitor) as visitors
        from public.site_visits where day > (now() at time zone brt)::date - 7
        group by path order by 2 desc limit 15) p)
  ) into out;
  return out;
end $$;
revoke all on function public.admin_metrics(integer) from public, anon;
grant execute on function public.admin_metrics(integer) to authenticated;
