-- 022: as coletas pesadas (guildas a cada 3 h, mortes a cada 10 min, coleta diária e a de 3 h) rodavam ao mesmo tempo
-- nos minutos em que os horários coincidem (:30, :40) e gravavam os mesmos chars em ordens diferentes: deadlock, e a
-- coleta inteira era desfeita (foi o que impediu o ranking de XP de encher). Agora cada uma espera a outra terminar.

create or replace function public.tc_queue() returns void
language sql security definer set search_path = public as $$
  select pg_advisory_xact_lock(424242);
$$;
revoke all on function public.tc_queue() from public, anon, authenticated;

create or replace function public.refresh_guilds() returns integer
language plpgsql security definer set search_path = public as $$
declare g record; j jsonb; m jsonb; w text; lvl integer; n integer := 0;
begin
  perform public.tc_queue();
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

create or replace function public.refresh_deaths_batch(p_n integer default 25) returns integer
language plpgsql security definer set search_path = public as $$
declare nm text; n integer := 0;
begin
  perform public.tc_queue();
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

create or replace function public.refresh_all(p_highscores boolean default true) returns void
language plpgsql security definer set search_path = public as $$
declare w text; n text;
begin
  perform public.tc_queue();
  for n in select distinct name from public.chars loop
    perform public.refresh_char(n);
  end loop;
  if p_highscores then
    for w in select distinct world from public.char_snapshots where snap_date = public.tibia_day() and world is not null loop
      perform public.refresh_highscores(w);
    end loop;
  end if;
end $$;
