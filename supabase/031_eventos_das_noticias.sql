-- 031: eventos anunciados nas notícias do tibia.com entram sozinhos no calendário.
-- A TibiaWiki ("Upcoming Events") não lista tudo (ex.: Exaltation Overload). As notícias de evento dizem
-- "Between the server saves of October 02 and October 05": lemos as dos últimos 60 dias e gravamos com source = 'noticia'.
-- Mesmo critério de data da 019: o fim é o dia da server save que encerra o evento.
create or replace function public.sync_news_events() returns integer
language plpgsql security definer set search_path = public as $$
declare r record; txt text; m text[]; nm text; d1 date; d2 date; y integer; n integer := 0;
  months constant text[] := array['january','february','march','april','may','june','july','august','september','october','november','december'];
begin
  for r in select id, date, title, content_html from public.tibia_news
           where type = 'news' and date >= current_date - 60 and content_html is not null loop
    txt := regexp_replace(regexp_replace(r.content_html, '<[^>]+>', ' ', 'g'), '\s+', ' ', 'g');
    m := regexp_match(txt, 'server saves? of ([A-Za-z]+) (\d{1,2})(?:st|nd|rd|th)? and ([A-Za-z]+) (\d{1,2})', 'i');
    continue when m is null or array_position(months, lower(m[1])) is null or array_position(months, lower(m[3])) is null;
    nm := case
      when r.title ilike '%double%xp%' or r.title ilike '%double%experience%' then 'Double Experience and Skill Events'
      when r.title ilike '%rapid respawn%' then 'Rapid Respawn Events'
      else regexp_replace(r.title, '^[\s\u00a0]+|[\s\u00a0]+$', '', 'g') end;
    y := extract(year from r.date)::int;
    d1 := make_date(y, array_position(months, lower(m[1])), m[2]::int);
    if d1 < r.date - 30 then d1 := make_date(y + 1, array_position(months, lower(m[1])), m[2]::int); end if;
    d2 := make_date(extract(year from d1)::int, array_position(months, lower(m[3])), m[4]::int);
    if d2 < d1 then d2 := make_date(extract(year from d1)::int + 1, array_position(months, lower(m[3])), m[4]::int); end if;
    continue when d2 - d1 > 31;
    insert into public.tibia_events (id, name, start_date, end_date, tentative, source, updated_at)
    values (nm || '|' || d1, nm, d1, d2, false, 'noticia', now())
    on conflict (id) do update set end_date = excluded.end_date, tentative = false, updated_at = now();
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.sync_news_events() from public, anon, authenticated;

-- roda logo depois das notícias (que sincronizam a cada 2 horas, no minuto 25)
select cron.schedule('tc-news-events', '35 */2 * * *', 'select public.sync_news_events()');
select public.sync_news_events();
