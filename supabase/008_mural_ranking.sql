-- 008: "Caixão e Vela Preta" (mural de mortes) e ranking de XP dos chars cadastrados.
-- Dados: API pública do TibiaData (api.tibiadata.com), que lê o tibia.com.
--   /v4/character/{nome}: level, mundo, vocação e mortes recentes.
--   /v4/highscores/{mundo}/experience/all/{página}: experiência exata dos 1000 primeiros do mundo.
-- Fora do top 1000, a experiência é estimada pelo level (fórmula oficial da TibiaWiki).
-- Privacidade: só aparece no mural e no ranking o char verificado (código no comentário do tibia.com) e com public_profile = true.

create extension if not exists http with schema extensions;
create extension if not exists pg_cron;

alter table public.chars add column if not exists public_profile boolean not null default false;

create table if not exists public.char_snapshots (
  name text not null,
  snap_date date not null,
  world text,
  vocation text,
  level integer not null,
  experience bigint not null,
  exp_exact boolean not null default false,
  taken_at timestamptz not null default now(),
  primary key (name, snap_date)
);

create table if not exists public.char_deaths (
  name text not null,
  died_at timestamptz not null,
  level integer,
  reason text,
  killers jsonb,
  by_player boolean not null default false,
  primary key (name, died_at)
);

alter table public.char_snapshots enable row level security;
alter table public.char_deaths enable row level security;
-- Sem policy de leitura direta: o site lê só pelas funções abaixo, que filtram public_profile.

create or replace function public.tibia_day() returns date
language sql stable as $$ select ((now() at time zone 'Europe/Berlin') - interval '10 hours')::date $$;

create or replace function public.exp_for_level(l integer) returns bigint
language sql immutable as $$ select round((50.0 / 3) * (l::numeric ^ 3 - 6 * l::numeric ^ 2 + 17 * l - 12))::bigint $$;

create or replace function public.tc_get_json(url text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r extensions.http_response;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS', '15000');
  select * into r from extensions.http_get(url);
  if r.status <> 200 then return null; end if;
  return r.content::jsonb;
exception when others then
  return null;
end $$;
revoke all on function public.tc_get_json(text) from public, anon, authenticated;

-- Atualiza um char: snapshot do dia (se não houver valor exato) e mortes novas.
create or replace function public.refresh_char(p_name text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare j jsonb; c jsonb; d jsonb; lvl integer; nm text;
begin
  if not exists (select 1 from public.chars where lower(name) = lower(p_name)) then return 'char não cadastrado'; end if;
  -- no máximo uma consulta a cada 10 minutos por char
  if exists (select 1 from public.char_snapshots where lower(name) = lower(p_name) and taken_at > now() - interval '10 minutes') then
    return 'atualizado há pouco';
  end if;
  j := public.tc_get_json('https://api.tibiadata.com/v4/character/' || replace(p_name, ' ', '%20'));
  c := j -> 'character' -> 'character';
  if c is null or coalesce(c ->> 'name', '') = '' then return 'não encontrado no tibia.com'; end if;
  nm := c ->> 'name';
  lvl := (c ->> 'level')::int;
  insert into public.char_snapshots (name, snap_date, world, vocation, level, experience, exp_exact, taken_at)
  values (nm, public.tibia_day(), c ->> 'world', c ->> 'vocation', lvl, public.exp_for_level(lvl), false, now())
  on conflict (name, snap_date) do update set
    world = excluded.world, vocation = excluded.vocation, taken_at = now(),
    level = excluded.level,
    experience = case when char_snapshots.exp_exact and char_snapshots.level = excluded.level then char_snapshots.experience else excluded.experience end,
    exp_exact = char_snapshots.exp_exact and char_snapshots.level = excluded.level;
  for d in select * from jsonb_array_elements(coalesce(j -> 'character' -> 'deaths', '[]'::jsonb)) loop
    insert into public.char_deaths (name, died_at, level, reason, killers, by_player)
    values (nm, (d ->> 'time')::timestamptz, (d ->> 'level')::int, d ->> 'reason', d -> 'killers',
            exists (select 1 from jsonb_array_elements(coalesce(d -> 'killers', '[]'::jsonb)) k where (k ->> 'player')::boolean))
    on conflict do nothing;
  end loop;
  return 'ok';
end $$;
revoke all on function public.refresh_char(text) from public, anon;
grant execute on function public.refresh_char(text) to authenticated;

-- Experiência exata pelo highscore do mundo (até 1000 primeiros), só para nomes cadastrados.
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
      if exists (select 1 from public.chars where lower(name) = lower(e ->> 'name')) then
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

create or replace function public.refresh_all(p_highscores boolean default true) returns void
language plpgsql security definer set search_path = public as $$
declare w text; n text;
begin
  for n in select distinct name from public.chars loop
    perform public.refresh_char(n);
  end loop;
  if p_highscores then
    for w in select distinct world from public.char_snapshots where snap_date = public.tibia_day() and world is not null loop
      perform public.refresh_highscores(w);
    end loop;
  end if;
end $$;
revoke all on function public.refresh_all(boolean) from public, anon, authenticated;

-- Verificação de dono: o site gera um código, o dono cola no comentário do char no tibia.com e o banco confere pela API.
alter table public.chars
  add column if not exists verified boolean not null default false,
  add column if not exists verify_code text,
  add column if not exists verified_at timestamptz;

-- A conta não pode marcar "verified" por conta própria: insert e update só nas colunas editáveis.
revoke insert, update on table public.chars from authenticated;
grant insert (user_id, name, vocation, level, magic_level, world, skill, weapon_attack, public_profile) on table public.chars to authenticated;
grant update (name, vocation, level, magic_level, world, wand, wand_tier, helmet, helmet_tier, armor, armor_tier, legs, legs_tier,
  boots, boots_tier, spellbook, ring, amulet, imbuements, wheel_code, wheel_summary, gems, hunts, notes, skill, weapon_attack,
  public_profile, updated_at) on table public.chars to authenticated;

-- Trocou o nome do char: perde a verificação.
create or replace function public.chars_reset_verify() returns trigger
language plpgsql as $$
begin
  if lower(new.name) <> lower(old.name) then
    new.verified := false; new.verify_code := null; new.verified_at := null;
  end if;
  return new;
end $$;
drop trigger if exists chars_reset_verify on public.chars;
create trigger chars_reset_verify before update on public.chars for each row execute function public.chars_reset_verify();

create or replace function public.start_verify(p_char uuid) returns text
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not exists (select 1 from public.chars where id = p_char and user_id = auth.uid()) then raise exception 'char não encontrado'; end if;
  code := 'TC-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  update public.chars set verify_code = code where id = p_char;
  return code;
end $$;
revoke all on function public.start_verify(uuid) from public, anon;
grant execute on function public.start_verify(uuid) to authenticated;

create or replace function public.check_verify(p_char uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare ch record; j jsonb; c jsonb;
begin
  select * into ch from public.chars where id = p_char and user_id = auth.uid();
  if ch is null then return 'char não encontrado'; end if;
  if ch.verify_code is null then return 'gere o código primeiro'; end if;
  j := public.tc_get_json('https://api.tibiadata.com/v4/character/' || replace(ch.name, ' ', '%20'));
  c := j -> 'character' -> 'character';
  if c is null or coalesce(c ->> 'name', '') = '' then return 'char não encontrado no tibia.com'; end if;
  if position(ch.verify_code in coalesce(c ->> 'comment', '')) = 0 then
    return 'código não encontrado no comentário do char (o tibia.com pode levar alguns minutos para atualizar)';
  end if;
  -- quem provou por último fica com o char
  update public.chars set verified = false, public_profile = false where lower(name) = lower(c ->> 'name') and id <> ch.id;
  update public.chars set verified = true, verified_at = now(), name = c ->> 'name', world = coalesce(c ->> 'world', world) where id = ch.id;
  update public.chars set verified = true where id = ch.id; -- o trigger zera ao trocar maiúsculas; garante o valor final
  return 'ok';
end $$;
revoke all on function public.check_verify(uuid) from public, anon;
grant execute on function public.check_verify(uuid) to authenticated;

-- Mural "Caixão e Vela Preta": mortes dos chars públicos.
create or replace function public.death_wall(p_limit integer default 100)
returns table (name text, world text, vocation text, died_at timestamptz, level integer, reason text, by_player boolean)
language sql stable security definer set search_path = public as $$
  select d.name, s.world, s.vocation, d.died_at, d.level, d.reason, d.by_player
  from public.char_deaths d
  left join lateral (select world, vocation from public.char_snapshots x where x.name = d.name order by snap_date desc limit 1) s on true
  where exists (select 1 from public.chars c where lower(c.name) = lower(d.name) and c.public_profile and c.verified)
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
    where exists (select 1 from public.chars c where lower(c.name) = lower(s.name) and c.public_profile and c.verified)
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

-- Roda todo dia depois do server save (10h em Berlim = 08h UTC no verão e 09h UTC no inverno) e a cada 3 horas para as mortes.
select cron.unschedule(jobid) from cron.job where jobname in ('tc-refresh-daily', 'tc-refresh-3h');
select cron.schedule('tc-refresh-daily', '30 9 * * *', $$select public.refresh_all()$$);
select cron.schedule('tc-refresh-3h', '15 */3 * * *', $$select public.refresh_all(false)$$);
