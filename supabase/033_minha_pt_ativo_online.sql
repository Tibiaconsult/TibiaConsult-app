-- 033: Minha PT sem apagar linha: tirar da PT desativa (active = false) e adicionar de novo reativa.
-- Tempo online dos chars de PT fora das guildas acompanhadas e dos cadastrados: job próprio a cada 5 min (track_online_party).
alter table public.party_watch add column if not exists active boolean not null default true;

create or replace function public.set_party_char(p_name text, p_active boolean) returns void
language sql security definer set search_path = public as $$
  update public.party_watch set active = p_active where user_id = auth.uid() and lower(name) = lower(p_name)
$$;
revoke all on function public.set_party_char(text, boolean) from public, anon;
grant execute on function public.set_party_char(text, boolean) to authenticated;

-- add_party_char: conta só os ativos no limite de 10 e reativa quem volta (mesmo corpo da 032 com "active")
-- my_party: só os ativos (where w.user_id = auth.uid() and w.active)
-- (corpos completos aplicados no banco em 07/10/2026; ver a 032 para a estrutura)

create or replace function public.track_online_party() returns void
language plpgsql security definer set search_path = public as $$
declare w text; j jsonb;
begin
  for w in select distinct p.world from public.party_watch p
           where p.active and p.world is not null
             and not exists (select 1 from public.guild_members g where lower(g.name) = lower(p.name))
             and not exists (select 1 from public.chars c where lower(c.name) = lower(p.name)) loop
    j := public.tc_get_json('https://api.tibiadata.com/v4/world/' || replace(w, ' ', '%20'));
    continue when j is null or jsonb_typeof(j -> 'world' -> 'online_players') <> 'array';
    insert into public.char_online as o (name, day, minutes, last_seen)
    select x ->> 'name', public.tibia_day(), 5, now()
    from jsonb_array_elements(j -> 'world' -> 'online_players') x
    where lower(x ->> 'name') in (
      select lower(p.name) from public.party_watch p
      where p.active and p.world = w
        and not exists (select 1 from public.guild_members g where lower(g.name) = lower(p.name))
        and not exists (select 1 from public.chars c where lower(c.name) = lower(p.name)))
    on conflict (name, day) do update set minutes = o.minutes + 5, last_seen = now()
      where o.last_seen is null or o.last_seen < now() - interval '4 minutes';
  end loop;
end $$;
revoke all on function public.track_online_party() from public, anon, authenticated;
select cron.schedule('tc-online-party', '*/5 * * * *', 'select public.track_online_party()');
