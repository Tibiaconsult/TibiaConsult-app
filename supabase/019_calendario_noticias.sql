-- 019: calendário de eventos e notícias do Tibia, sincronizados sozinhos.
-- Eventos: datas fixas do ano (regras abaixo, as mesmas da TibiaWiki) + datas variáveis lidas da TibiaWiki
--   ("Upcoming Events" já calculado e as páginas /Dates), todo dia depois do server save.
-- Notícias: TibiaData (/v4/news/latest, /v4/news/newsticker e o texto completo de cada uma), a cada 2 horas.

-- 1. eventos
create table if not exists public.tibia_events (
  id text primary key,               -- nome|início
  name text not null,
  start_date date not null,
  end_date date not null,
  tentative boolean not null default false,  -- previsão ("might start"): Double XP e Rapid Respawn antes do anúncio
  source text not null default 'regra',
  updated_at timestamptz not null default now()
);
create index if not exists tibia_events_dates on public.tibia_events (start_date, end_date);
alter table public.tibia_events enable row level security;
drop policy if exists "eventos: todos leem" on public.tibia_events;
create policy "eventos: todos leem" on public.tibia_events for select using (true);
grant select on table public.tibia_events to anon, authenticated;

-- regras fixas (mês-dia de início e fim; fim no ano seguinte quando menor que o início)
create table if not exists public.tibia_event_rules (
  name text not null,
  start_md text not null,
  end_md text not null,
  primary key (name, start_md)
);
alter table public.tibia_event_rules enable row level security;
insert into public.tibia_event_rules (name, start_md, end_md) values
  ('Tibia Anniversary', '01-07', '01-10'),
  ('The First Dragon Quest', '01-14', '02-14'),
  ('Masquerade Days', '02-01', '03-01'),
  ('A Piece of Cake', '02-21', '02-26'),
  ('Double Daily Reward Month', '03-01', '04-01'),
  ('The Colours of Magic', '03-15', '03-23'),
  ('April''s Fools', '04-01', '05-01'),
  ('Chyllfroest Mini World Change', '04-01', '05-01'),
  ('Spring into Life', '04-16', '04-23'),
  ('Demon''s Lullaby', '05-07', '05-14'),
  ('Flower Month', '06-01', '07-01'),
  ('Bewitched', '06-21', '06-25'),
  ('Hot Cuisine Quest', '08-01', '08-31'),
  ('Rise of Devovorga', '09-01', '09-07'),
  ('The Colours of Magic', '09-15', '09-23'),
  ('Annual Autumn Vintage', '10-01', '10-08'),
  ('Annual Autumn Vintage', '10-17', '10-24'),
  ('Halloween', '10-31', '11-03'),
  ('The Lightbearer', '11-11', '11-15'),
  ('Christmas', '12-12', '12-31'),
  ('Winterlight Solstice', '12-22', '01-10')
on conflict do nothing;

create or replace function public.sync_events() returns integer
language plpgsql security definer set search_path = public as $$
declare y integer := extract(year from current_date)::int; yy integer; r record; j jsonb; txt text; m text[]; n integer := 0;
        d date; dur integer; page text;
begin
  -- datas fixas: ano passado, este e o próximo
  for yy in y - 1 .. y + 1 loop
    for r in select * from public.tibia_event_rules loop
      d := make_date(yy, split_part(r.start_md, '-', 1)::int, split_part(r.start_md, '-', 2)::int);
      insert into public.tibia_events (id, name, start_date, end_date, tentative, source, updated_at)
      values (r.name || '|' || d, r.name, d,
              make_date(case when r.end_md < r.start_md then yy + 1 else yy end, split_part(r.end_md, '-', 1)::int, split_part(r.end_md, '-', 2)::int),
              false, 'regra', now())
      on conflict (id) do update set end_date = excluded.end_date, updated_at = now();
      n := n + 1;
    end loop;
  end loop;

  -- datas variáveis: "Upcoming Events" da TibiaWiki, já calculado ("X will|might start in N days")
  j := public.tc_get_json('https://tibia.fandom.com/api.php?action=parse&format=json&prop=text&page=Upcoming%20Events');
  txt := regexp_replace(regexp_replace(coalesce(j -> 'parse' -> 'text' ->> '*', ''), '<[^>]+>', ' ', 'g'), '\s+', ' ', 'g');
  for m in select regexp_matches(txt, '([A-Z][A-Za-z'' ]+?) (will|might) start in (\d+) days', 'g') loop
    continue when exists (select 1 from public.tibia_event_rules where name = btrim(m[1]));
    d := current_date + m[3]::int;
    dur := case btrim(m[1])
      when 'Orcsoberfest' then 7 when 'Last Creep Standing' then 5 when 'A Pirate''s Death to Me' then 3
      when 'Grimvale Mini World Change' then 3 when 'Double Experience and Skill Events' then 3 when 'Rapid Respawn Events' then 3
      else 1 end;
    -- previsão antiga do mesmo evento some quando a data muda
    delete from public.tibia_events where name = btrim(m[1]) and source = 'wiki' and start_date >= current_date and start_date <> d;
    insert into public.tibia_events (id, name, start_date, end_date, tentative, source, updated_at)
    values (btrim(m[1]) || '|' || d, btrim(m[1]), d, d + dur, m[2] = 'might', 'wiki', now())
    on conflict (id) do update set end_date = excluded.end_date, tentative = excluded.tentative, updated_at = now();
    n := n + 1;
  end loop;

  -- datas futuras publicadas pela TibiaWiki (Pirate's Death e Last Creep Standing)
  foreach page in array array['A Pirate''s Death to Me/Dates', 'Last Creep Standing/Dates'] loop
    j := public.tc_get_json('https://tibia.fandom.com/api.php?action=parse&format=json&prop=text&page=' || replace(replace(page, ' ', '%20'), '''', '%27'));
    txt := coalesce(j -> 'parse' -> 'text' ->> '*', '');
    for m in select regexp_matches(txt, '(\d{4}-\d{2}-\d{2})', 'g') loop
      d := m[1]::date;
      continue when d < current_date - 60 or d > current_date + 400;
      dur := case when page like 'A Pirate%' then 3 else 5 end;
      insert into public.tibia_events (id, name, start_date, end_date, tentative, source, updated_at)
      values (split_part(page, '/', 1) || '|' || d, split_part(page, '/', 1), d, d + dur, false, 'wiki', now())
      on conflict (id) do update set end_date = excluded.end_date, updated_at = now();
      n := n + 1;
    end loop;
  end loop;

  delete from public.tibia_events where end_date < current_date - 400;
  return n;
end $$;
revoke all on function public.sync_events() from public, anon, authenticated;

-- 2. notícias
create table if not exists public.tibia_news (
  id integer primary key,
  date date not null,
  title text not null,
  category text,
  type text,              -- news | ticker | article
  url text,
  content_html text,
  fetched_at timestamptz not null default now()
);
create index if not exists tibia_news_date on public.tibia_news (date desc);
alter table public.tibia_news enable row level security;
drop policy if exists "noticias: todos leem" on public.tibia_news;
create policy "noticias: todos leem" on public.tibia_news for select using (true);
grant select on table public.tibia_news to anon, authenticated;

create or replace function public.sync_news() returns integer
language plpgsql security definer set search_path = public as $$
declare src text; j jsonb; it jsonb; r record; c jsonb; n integer := 0;
begin
  foreach src in array array['https://api.tibiadata.com/v4/news/latest', 'https://api.tibiadata.com/v4/news/newsticker'] loop
    j := public.tc_get_json(src);
    continue when j is null or jsonb_typeof(j -> 'news') <> 'array';
    for it in select * from jsonb_array_elements(j -> 'news') loop
      insert into public.tibia_news (id, date, title, category, type, url)
      values ((it ->> 'id')::int, (it ->> 'date')::date, btrim(it ->> 'news'), it ->> 'category', it ->> 'type', it ->> 'url')
      on conflict (id) do update set date = excluded.date, category = excluded.category, type = excluded.type, url = excluded.url,
        title = case when public.tibia_news.content_html is null then excluded.title else public.tibia_news.title end;
      n := n + 1;
    end loop;
  end loop;
  -- texto completo (e o título completo) das que ainda não têm: até 12 por rodada
  for r in select id from public.tibia_news where content_html is null order by date desc limit 12 loop
    c := public.tc_get_json('https://api.tibiadata.com/v4/news/id/' || r.id) -> 'news';
    continue when c is null;
    update public.tibia_news set content_html = c ->> 'content_html',
      title = coalesce(nullif(btrim(c ->> 'title'), ''), title), fetched_at = now()
    where id = r.id;
  end loop;
  delete from public.tibia_news where date < current_date - 400;
  return n;
end $$;
revoke all on function public.sync_news() from public, anon, authenticated;

-- 3. agendamentos: eventos todo dia depois do server save; notícias a cada 2 horas
select cron.unschedule(jobid) from cron.job where jobname in ('tc-events', 'tc-news');
select cron.schedule('tc-events', '50 9 * * *', 'select public.sync_events()');
select cron.schedule('tc-news', '25 */2 * * *', 'select public.sync_news()');
