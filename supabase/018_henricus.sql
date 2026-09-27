-- 018: "Clientes VIP do Henricus" (o Lord Inquisitor de Thais, que vende a Blessing of the Inquisition).
-- Quem mais morreu no período entre os chars acompanhados (guildas e chars liberados).

create or replace function public.bless_clients(p_days integer default 30, p_guild text default null)
returns table (name text, guild text, deaths bigint, last_died timestamptz, level integer)
language sql stable security definer set search_path = public as $$
  select d.name, t.guild, count(*) as deaths, max(d.died_at) as last_died,
         (array_agg(d.level order by d.died_at desc))[1] as level
  from public.char_deaths d
  join public.tracked_names() t on t.lname = lower(d.name)
  where d.died_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
    and (p_guild is null or t.guild = p_guild)
  group by d.name, t.guild
  having count(*) >= 2
  order by deaths desc, last_died desc
  limit 15
$$;
grant execute on function public.bless_clients(integer, text) to anon, authenticated;
