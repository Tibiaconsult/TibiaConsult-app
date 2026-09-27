-- 014: tempo online dos chars cadastrados e o quadro "Funcionário do Mês".
-- Mesmo método do GuildStats (que não tem API pública): a cada 5 minutos o banco lê a lista de quem está online
-- em cada mundo com char cadastrado (TibiaData, /v4/world) e soma 5 minutos para quem aparece nela.
-- Precisão: cerca de 5 minutos por sessão. Só chars verificados com a opção pública aparecem no quadro e no perfil.

create table if not exists public.char_online (
  name text not null,
  day date not null,
  minutes integer not null default 0,
  last_seen timestamptz,
  primary key (name, day)
);
create index if not exists char_online_day on public.char_online (day);
alter table public.char_online enable row level security;
-- sem políticas: ninguém lê direto pela API; a leitura pública passa pelas funções abaixo (só chars públicos)

create or replace function public.track_online() returns void
language plpgsql security definer set search_path = public as $$
declare w text; j jsonb;
begin
  for w in select distinct world from public.chars where world is not null loop
    j := public.tc_get_json('https://api.tibiadata.com/v4/world/' || replace(w, ' ', '%20'));
    continue when j is null or jsonb_typeof(j -> 'world' -> 'online_players') <> 'array';
    insert into public.char_online as o (name, day, minutes, last_seen)
    select p ->> 'name', public.tibia_day(), 5, now()
    from jsonb_array_elements(j -> 'world' -> 'online_players') p
    where lower(p ->> 'name') in (select lower(name) from public.chars where world = w)
    on conflict (name, day) do update set minutes = o.minutes + 5, last_seen = now()
      where o.last_seen is null or o.last_seen < now() - interval '4 minutes'; -- rodou duas vezes seguidas: não conta em dobro
  end loop;
  delete from public.char_online where day < public.tibia_day() - 400;
end $$;
revoke execute on function public.track_online() from public, anon, authenticated;

-- a cada 5 minutos
select cron.unschedule(jobid) from cron.job where jobname = 'tc-online';
select cron.schedule('tc-online', '*/5 * * * *', 'select public.track_online()');

-- Quadro do mês: minutos online de cada char público no mês de p_month (qualquer dia do mês; padrão: o mês atual)
create or replace function public.online_ranking(p_month date default null)
returns table (name text, world text, vocation text, level integer, minutes bigint, days bigint)
language sql stable security definer set search_path = public as $$
  with m as (select date_trunc('month', coalesce(p_month, public.tibia_day()))::date as ini)
  select o.name, coalesce(s.world, ch.world), coalesce(s.vocation, ch.vocation), coalesce(s.level, ch.level), sum(o.minutes) as minutes, count(*) as days
  from public.char_online o
  cross join m
  left join lateral (select world, vocation, level from public.char_snapshots x where lower(x.name) = lower(o.name) order by snap_date desc limit 1) s on true
  left join lateral (select world, vocation, level from public.chars x where lower(x.name) = lower(o.name) limit 1) ch on true
  where o.day >= m.ini and o.day < (m.ini + interval '1 month')::date
    and exists (select 1 from public.chars c where lower(c.name) = lower(o.name) and c.public_profile and c.verified)
  group by 1, 2, 3, 4
  order by minutes desc
  limit 100
$$;
grant execute on function public.online_ranking(date) to anon, authenticated;

-- Perfil público: acrescenta o tempo online (30 dias, mês atual, desde quando conta) e quantas vezes foi funcionário do mês
create or replace function public.char_profile(p_name text) returns jsonb
language sql stable security definer set search_path = public as $$
  with c as (
    select id, name, vocation, level, world, verified_at from public.chars
    where lower(name) = lower(p_name) and public_profile and verified limit 1
  )
  select case when not exists (select 1 from c) then null else jsonb_build_object(
    'name', (select name from c),
    'vocation', (select vocation from c),
    'level', (select level from c),
    'world', (select world from c),
    'verified_at', (select verified_at from c),
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
                 where o.day < date_trunc('month', public.tibia_day())::date
                   and exists (select 1 from public.chars x where lower(x.name) = lower(o.name) and x.public_profile and x.verified)
                 group by 1, 2
               ) t order by t.mes, t.total desc
             ) w where w.name = lower(p_name))
  ) end
$$;
grant execute on function public.char_profile(text) to anon, authenticated;
