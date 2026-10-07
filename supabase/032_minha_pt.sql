-- 032: Minha PT. Cada conta guarda, de forma privada, os chars da sua PT (até 10) e vê evolução de XP, tempo online e mortes.
-- Os chars da lista entram na coleta (snapshot diário, mortes a cada 10 min e online a cada 5 min) mesmo fora das guildas acompanhadas.

create table if not exists public.party_watch (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  world text,
  added_at timestamptz not null default now(),
  primary key (user_id, name)
);
create index if not exists party_watch_lname on public.party_watch (lower(name));
alter table public.party_watch enable row level security;
create policy "pt: dono lê" on public.party_watch for select using (user_id = (select auth.uid()));
revoke all on table public.party_watch from anon, authenticated;
grant select on table public.party_watch to authenticated;

-- adiciona pelo nome: confere no tibia.com (nome certo e mundo) e já busca os dados
create or replace function public.add_party_char(p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare j jsonb; c jsonb; nm text;
begin
  if auth.uid() is null then raise exception 'entre para montar a sua PT'; end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 2 and 30 then raise exception 'nome inválido'; end if;
  if (select count(*) from public.party_watch where user_id = auth.uid()) >= 10 then raise exception 'a PT tem no máximo 10 chars'; end if;
  j := public.tc_get_json('https://api.tibiadata.com/v4/character/' || replace(btrim(p_name), ' ', '%20'));
  c := j -> 'character' -> 'character';
  if c is null or coalesce(c ->> 'name', '') = '' then raise exception 'char não encontrado no tibia.com'; end if;
  nm := c ->> 'name';
  insert into public.party_watch (user_id, name, world) values (auth.uid(), nm, c ->> 'world')
  on conflict (user_id, name) do update set world = excluded.world;
  perform public.refresh_char(nm);
  return nm;
end $$;
revoke all on function public.add_party_char(text) from public, anon;
grant execute on function public.add_party_char(text) to authenticated;

-- tudo da PT de quem está logado, num json só
create or replace function public.my_party(p_days integer default 30) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x ->> 'name'), '[]'::jsonb) from (
    select jsonb_build_object(
      'name', w.name,
      'world', coalesce(s.world, w.world),
      'vocation', s.vocation,
      'level', s.level,
      'guild', (select g.guild from public.guild_members g where lower(g.name) = lower(w.name) limit 1),
      'snaps', (select coalesce(jsonb_agg(jsonb_build_object('d', x.snap_date, 'l', x.level, 'e', x.experience) order by x.snap_date), '[]')
                from public.char_snapshots x where lower(x.name) = lower(w.name) and x.snap_date >= public.tibia_day() - least(greatest(p_days, 7), 90)),
      'online', (select coalesce(jsonb_agg(jsonb_build_object('d', o.day, 'm', o.minutes) order by o.day), '[]')
                 from public.char_online o where lower(o.name) = lower(w.name) and o.day >= public.tibia_day() - least(greatest(p_days, 7), 90)),
      'last_seen', (select max(o.last_seen) from public.char_online o where lower(o.name) = lower(w.name)),
      'deaths', (select coalesce(jsonb_agg(jsonb_build_object('t', d.died_at, 'l', d.level, 'r', d.reason, 'p', d.by_player) order by d.died_at desc), '[]')
                 from (select * from public.char_deaths d where lower(d.name) = lower(w.name) order by died_at desc limit 15) d)
    ) as x
    from public.party_watch w
    left join lateral (select world, vocation, level from public.char_snapshots z where lower(z.name) = lower(w.name) order by snap_date desc limit 1) s on true
    where w.user_id = auth.uid()
  ) t
$$;
revoke all on function public.my_party(integer) from public, anon;
grant execute on function public.my_party(integer) to authenticated;

-- coleta passa a incluir os chars das PTs
create or replace function public.refresh_char(p_name text)
returns text language plpgsql security definer set search_path to 'public', 'extensions' as $function$
declare j jsonb; c jsonb; d jsonb; lvl integer; nm text;
begin
  if not exists (select 1 from public.chars where lower(name) = lower(p_name))
     and not exists (select 1 from public.guild_members where lower(name) = lower(p_name))
     and not exists (select 1 from public.party_watch where lower(name) = lower(p_name)) then
    return 'char não acompanhado';
  end if;
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
end $function$;

create or replace function public.refresh_deaths_batch(p_n integer default 25)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare nm text; n integer := 0;
begin
  perform public.tc_queue();
  for nm in
    select t.name from (select name from public.guild_members union select name from public.chars union select name from public.party_watch) t
    left join public.char_checks k on lower(k.name) = lower(t.name)
    where not exists (select 1 from public.tracking_optout o where lower(o.name) = lower(t.name))
    order by k.checked_at nulls first
    limit p_n
  loop
    perform public.refresh_char(nm);
    n := n + 1;
  end loop;
  return n;
end $function$;
