-- 021: level up na Taverna, notificações (sino e push no celular) e métricas do site no /admin.
--
-- Level up: todo snapshot novo (guildas a cada 3 h, chars na rotação de 10 min) compara com o maior level já visto do char.
--   Passou do maior level: vira um level up. Perder level na morte e recuperar não conta de novo.
--   Só os marcos de 50 em 50 (50, 100, 150...) aparecem na Taverna e viram aviso.
-- Notificações: comentário na morte ou no level do seu char, fofoca nova, morte e level up do seu char.
--   O sino do site lê a tabela; o push vai por /api/push, chamado pelo pg_cron a cada minuto só quando há algo a enviar.
--   As chaves (senha do /api/push e as chaves VAPID) ficam em private.settings, inseridas fora deste arquivo.
-- Métricas: visitas por dia (visitante anônimo, sem IP), contas, comentários, fofocas, reações, mortes e level ups.

-- 1. level up ---------------------------------------------------------------------------------------------------------
create table if not exists public.char_peaks (
  lname text primary key,
  level integer not null,
  updated_at timestamptz not null default now()
);
alter table public.char_peaks enable row level security;
insert into public.char_peaks (lname, level)
select lower(name), max(level) from public.char_snapshots where level is not null group by 1
on conflict do nothing;

create table if not exists public.level_ups (
  lname text not null,
  name text not null,
  level integer not null,
  from_level integer not null,
  milestone integer,
  at timestamptz not null default now(),
  primary key (lname, level)
);
create index if not exists level_ups_at on public.level_ups (at desc);
alter table public.level_ups enable row level security;

-- marco cruzado entre dois levels: 50, 100, 150, 200...
create or replace function public.level_milestone(a integer, b integer) returns integer
language sql immutable set search_path = public as $$
  select case when b / 50 > a / 50 then (b / 50) * 50 end
$$;

create or replace function public.snap_level_up() returns trigger
language plpgsql security definer set search_path = public as $$
declare pk integer;
begin
  if new.level is null then return null; end if;
  select level into pk from public.char_peaks where lname = lower(new.name);
  if pk is null then
    insert into public.char_peaks (lname, level) values (lower(new.name), new.level) on conflict do nothing;
    return null;
  end if;
  if new.level <= pk then return null; end if;
  update public.char_peaks set level = new.level, updated_at = now() where lname = lower(new.name);
  insert into public.level_ups (lname, name, level, from_level, milestone)
  values (lower(new.name), new.name, new.level, pk, public.level_milestone(pk, new.level))
  on conflict do nothing;
  return null;
end $$;
drop trigger if exists snap_level_up on public.char_snapshots;
create trigger snap_level_up after insert or update of level on public.char_snapshots
for each row execute function public.snap_level_up();

-- level ups dos chars acompanhados (guildas e chars liberados), do mais recente para o mais antigo
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
  order by l.at desc
  limit 300
$$;
grant execute on function public.level_feed(integer, text) to anon, authenticated;

-- comentários e reações também no level up (chave: "nome|lvl500")
alter table public.comments drop constraint if exists comments_target_type_check;
alter table public.comments add constraint comments_target_type_check check (target_type in ('post', 'death', 'level'));
alter table public.reactions drop constraint if exists reactions_target_type_check;
alter table public.reactions add constraint reactions_target_type_check check (target_type in ('post', 'death', 'comment', 'gossip', 'level'));

-- 2. notificações -----------------------------------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  url text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  pushed_at timestamptz
);
create index if not exists notifications_user on public.notifications (user_id, created_at desc);
create index if not exists notifications_pending on public.notifications (created_at) where pushed_at is null;
alter table public.notifications enable row level security;
drop policy if exists "notificações: dono lê" on public.notifications;
create policy "notificações: dono lê" on public.notifications for select using (user_id = (select auth.uid()));
drop policy if exists "notificações: dono marca lida" on public.notifications;
create policy "notificações: dono marca lida" on public.notifications for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "notificações: dono apaga" on public.notifications;
create policy "notificações: dono apaga" on public.notifications for delete using (user_id = (select auth.uid()));
revoke all on table public.notifications from anon, authenticated;
grant select, delete on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

-- nome do char como aparece no jogo, a partir do nome em minúsculas
create or replace function public.tc_char_name(p_lname text) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select name from public.guild_members where lower(name) = p_lname limit 1),
                  (select name from public.chars where lower(name) = p_lname limit 1),
                  (select name from public.char_snapshots where lower(name) = p_lname order by snap_date desc limit 1),
                  initcap(p_lname))
$$;

-- avisa as contas donas do char (menos quem causou o aviso); devolve quem foi avisado
create or replace function public.tc_notify_owners(p_lname text, p_except uuid, p_kind text, p_title text, p_body text, p_url text)
returns uuid[] language plpgsql security definer set search_path = public as $$
declare ids uuid[];
begin
  select coalesce(array_agg(distinct user_id), '{}') into ids
  from public.chars where lower(name) = p_lname and user_id is distinct from p_except;
  insert into public.notifications (user_id, kind, title, body, url)
  select u, p_kind, p_title, left(p_body, 200), p_url from unnest(ids) u;
  return ids;
end $$;
revoke all on function public.tc_notify_owners(text, uuid, text, text, text, text), public.tc_char_name(text) from public, anon, authenticated;

create or replace function public.comments_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare ln text := split_part(new.target_key, '|', 1); nm text; what text; owners uuid[]; url text;
begin
  if new.target_type not in ('death', 'level') then return null; end if;
  nm := public.tc_char_name(ln);
  what := case when new.target_type = 'death' then 'na morte de ' || nm
               else 'no level ' || substr(split_part(new.target_key, '|', 2), 4) || ' de ' || nm end;
  url := '/comunidade/taverna#' || new.target_key;
  owners := public.tc_notify_owners(ln, new.user_id, 'comment', '💬 ' || new.char_name || ' comentou ' || what, new.body, url);
  -- quem já comentou ali também fica sabendo da resposta
  insert into public.notifications (user_id, kind, title, body, url)
  select distinct c.user_id, 'reply', '💬 ' || new.char_name || ' também comentou ' || what, left(new.body, 200), url
  from public.comments c
  where c.target_type = new.target_type and c.target_key = new.target_key and c.id <> new.id
    and c.user_id <> new.user_id and not (c.user_id = any (owners));
  return null;
end $$;
drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments for each row execute function public.comments_notify();

create or replace function public.gossips_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.tc_notify_owners(lower(new.about), new.user_id, 'gossip', '🤫 Tem fofoca nova sobre a morte de ' || new.about,
    'Alguém contou pro Rashid. Ele não diz quem foi, mas conta tudo o resto.', '/comunidade/taverna#' || new.death_key);
  return null;
end $$;
drop trigger if exists gossips_notify on public.gossips;
create trigger gossips_notify after insert on public.gossips for each row execute function public.gossips_notify();

-- morte do seu char (só as recentes: a primeira leitura de um char novo não vira enxurrada de avisos)
create or replace function public.deaths_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.died_at < now() - interval '1 day' then return null; end if;
  perform public.tc_notify_owners(lower(new.name), null, 'death', '⚰️ ' || new.name || ' morreu no level ' || coalesce(new.level::text, '?'),
    coalesce(new.reason, '') || ' O Rashid já está espalhando na Taverna.',
    '/comunidade/taverna#' || lower(new.name) || '|' || floor(extract(epoch from new.died_at))::bigint);
  return null;
end $$;
drop trigger if exists deaths_notify on public.char_deaths;
create trigger deaths_notify after insert on public.char_deaths for each row execute function public.deaths_notify();

create or replace function public.levels_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.milestone is null then return null; end if;
  perform public.tc_notify_owners(new.lname, null, 'level', '🎉 ' || new.name || ' chegou no level ' || new.milestone || '!',
    'O Rashid ergueu a caneca na Taverna. O Henricus já reajustou o preço da bless.',
    '/comunidade/taverna#' || new.lname || '|lvl' || new.level);
  return null;
end $$;
drop trigger if exists levels_notify on public.level_ups;
create trigger levels_notify after insert on public.level_ups for each row execute function public.levels_notify();

-- 3. push no celular --------------------------------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.settings (key text primary key, value text not null);
-- senha que o pg_cron manda para /api/push (as chaves VAPID são inseridas à parte, fora do repositório)
insert into private.settings (key, value)
values ('push_key', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
on conflict do nothing;

create table if not exists public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
revoke all on table public.push_subscriptions from anon, authenticated;

create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'entre para receber notificações'; end if;
  if p_endpoint !~ '^https://' then raise exception 'endereço inválido'; end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth) values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now();
  -- no máximo 10 aparelhos por conta
  delete from public.push_subscriptions where user_id = auth.uid() and endpoint not in (
    select endpoint from public.push_subscriptions where user_id = auth.uid() order by created_at desc limit 10);
end $$;
create or replace function public.push_unsubscribe(p_endpoint text) returns void
language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
$$;
revoke all on function public.push_subscribe(text, text, text), public.push_unsubscribe(text) from public, anon;
grant execute on function public.push_subscribe(text, text, text), public.push_unsubscribe(text) to authenticated;

-- /api/push pega o que falta enviar (com a senha) e avisa os aparelhos que não existem mais
create or replace function public.push_take(p_key text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  if p_key is null or p_key is distinct from (select value from private.settings where key = 'push_key') then
    raise exception 'não autorizado';
  end if;
  with pend as (
    update public.notifications set pushed_at = now() where pushed_at is null returning id, user_id, title, body, url, created_at
  )
  select coalesce(jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
                                               'title', p.title, 'body', p.body, 'url', p.url, 'tag', p.id)), '[]')
  into out
  from pend p join public.push_subscriptions s on s.user_id = p.user_id
  where p.created_at > now() - interval '2 hours';
  return jsonb_build_object(
    'public', (select value from private.settings where key = 'vapid_public'),
    'private', (select value from private.settings where key = 'vapid_private'),
    'subject', 'https://tibia-consult-app.vercel.app',
    'items', out);
end $$;
create or replace function public.push_gone(p_key text, p_endpoints text[]) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_key is null or p_key is distinct from (select value from private.settings where key = 'push_key') then
    raise exception 'não autorizado';
  end if;
  delete from public.push_subscriptions where endpoint = any (p_endpoints);
end $$;
revoke all on function public.push_take(text), public.push_gone(text, text[]) from public;
grant execute on function public.push_take(text), public.push_gone(text, text[]) to anon, authenticated;

-- a cada minuto: só chama o site quando há aviso novo para alguém com o push ligado
create or replace function public.push_kick() returns integer
language plpgsql security definer set search_path = public, extensions as $$
declare r extensions.http_response;
begin
  update public.notifications n set pushed_at = now()
  where n.pushed_at is null and not exists (select 1 from public.push_subscriptions s where s.user_id = n.user_id);
  if not exists (select 1 from public.notifications where pushed_at is null) then return 0; end if;
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS', '25000');
  select * into r from extensions.http((
    'GET', 'https://tibia-consult-app.vercel.app/api/push',
    array[extensions.http_header('x-push-key', (select value from private.settings where key = 'push_key'))], null, null
  )::extensions.http_request);
  return r.status;
exception when others then
  return -1;
end $$;
revoke all on function public.push_kick() from public, anon, authenticated;

-- 4. visitas ----------------------------------------------------------------------------------------------------------
create table if not exists public.site_visits (
  day date not null,
  visitor uuid not null,
  path text not null,
  hits integer not null default 1,
  logged boolean not null default false,
  primary key (day, visitor, path)
);
create index if not exists site_visits_day on public.site_visits (day);
alter table public.site_visits enable row level security;
revoke all on table public.site_visits from anon, authenticated;

create or replace function public.track_visit(p_visitor uuid, p_path text) returns void
language sql security definer set search_path = public as $$
  insert into public.site_visits (day, visitor, path, logged)
  values ((now() at time zone 'America/Sao_Paulo')::date, p_visitor, left(split_part(coalesce(p_path, '/'), '?', 1), 100), auth.uid() is not null)
  on conflict (day, visitor, path) do update set hits = least(public.site_visits.hits + 1, 10000), logged = public.site_visits.logged or excluded.logged;
$$;
grant execute on function public.track_visit(uuid, text) to anon, authenticated;

-- 5. métricas do /admin -----------------------------------------------------------------------------------------------
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
        'levels', (select count(*) from public.level_ups l where (l.at at time zone brt)::date = g.day)
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
      'returning7', (select count(*) from (select visitor from public.site_visits where day > (now() at time zone brt)::date - 7
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

-- 6. agendamentos: push a cada minuto; limpeza diária de avisos e visitas antigas
select cron.unschedule(jobid) from cron.job where jobname in ('tc-push', 'tc-cleanup');
select cron.schedule('tc-push', '* * * * *', 'select public.push_kick()');
select cron.schedule('tc-cleanup', '5 4 * * *',
  $$delete from public.notifications where created_at < now() - interval '60 days';
    delete from public.site_visits where day < current_date - 180;
    delete from public.level_ups where at < now() - interval '400 days'$$);
