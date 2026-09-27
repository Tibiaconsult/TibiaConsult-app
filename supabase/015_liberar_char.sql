-- 015: sem verificação por código. Para postar, comentar e aparecer no mural, ranking, perfil e Funcionário do Mês
-- basta o dono liberar o char com um clique (public_profile = true). Decisão de 27/09/2026.
-- Proteção contra se passar por outro jogador: o mesmo char só pode estar liberado em uma conta (vale quem liberou primeiro).

-- 1. Taverna e comentários: exige char liberado (não mais verificado)
create or replace function public.social_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare ch record; n integer;
begin
  select name, vocation, level, world, public_profile into ch from public.chars where id = new.char_id and user_id = auth.uid();
  if ch is null then raise exception 'char não encontrado'; end if;
  if not ch.public_profile then raise exception 'libere o char na comunidade para postar'; end if;
  new.user_id := auth.uid();
  new.hidden := false;
  new.created_at := now();
  new.char_name := ch.name;
  new.body := public.tc_clean_text(btrim(new.body));
  if tg_table_name = 'posts' then
    new.char_vocation := ch.vocation; new.char_level := ch.level; new.char_world := ch.world;
    if new.hunt is not null then new.hunt := public.tc_clean_text(btrim(new.hunt)); end if;
    select count(*) into n from public.posts where user_id = auth.uid() and created_at > now() - interval '1 hour';
    if n >= 5 then raise exception 'calma, taverneiro: no máximo 5 causos por hora'; end if;
  else
    select count(*) into n from public.comments where user_id = auth.uid() and created_at > now() - interval '1 hour';
    if n >= 30 then raise exception 'muitos comentários seguidos: tente de novo daqui a pouco'; end if;
  end if;
  return new;
end $$;
revoke all on function public.social_before_insert() from public, anon, authenticated;

-- 2. um char liberado por conta
create or replace function public.chars_one_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.public_profile and exists (
    select 1 from public.chars c where lower(c.name) = lower(new.name) and c.public_profile and c.user_id <> new.user_id and c.id <> new.id
  ) then
    raise exception 'esse char já está liberado na comunidade por outra conta. Se ele é seu, avise pelo Reportar ou sugerir';
  end if;
  return new;
end $$;
revoke all on function public.chars_one_owner() from public, anon, authenticated;
drop trigger if exists chars_one_owner on public.chars;
create trigger chars_one_owner before insert or update of public_profile, name on public.chars for each row execute function public.chars_one_owner();

-- 3. Funcionário do Mês e perfil: só char liberado
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
    and exists (select 1 from public.chars c where lower(c.name) = lower(o.name) and c.public_profile)
  group by 1, 2, 3, 4
  order by minutes desc
  limit 100
$$;
grant execute on function public.online_ranking(date) to anon, authenticated;

create or replace function public.char_profile(p_name text) returns jsonb
language sql stable security definer set search_path = public as $$
  with c as (
    select id, name, vocation, level, world, created_at from public.chars
    where lower(name) = lower(p_name) and public_profile order by created_at limit 1
  )
  select case when not exists (select 1 from c) then null else jsonb_build_object(
    'name', (select name from c),
    'vocation', (select vocation from c),
    'level', (select level from c),
    'world', (select world from c),
    'joined_at', (select created_at from c),
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
                   and exists (select 1 from public.chars x where lower(x.name) = lower(o.name) and x.public_profile)
                 group by 1, 2
               ) t order by t.mes, t.total desc
             ) w where w.name = lower(p_name))
  ) end
$$;
grant execute on function public.char_profile(text) to anon, authenticated;
