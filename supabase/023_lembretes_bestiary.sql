-- 023: facilitadores com aviso no celular.
-- Bestiary: além de "completa", a pessoa marca as creatures que está ACOMPANHANDO (o tracker do jogo aceita poucas).
--   Todo dia, depois do server save, se o boosted do dia for uma creature acompanhada (e não completa), chega aviso.
-- Lembretes: boss liberado (bosstiary), stamina verde/cheia (calculadora) e qualquer lembrete com hora marcada.
--   Um job a cada 5 minutos transforma os lembretes vencidos em avisos (sino + push, pelo 021).
-- Eventos: no dia em que começa XP em dobro ou respawn rápido, todo mundo com conta recebe o aviso.

-- 1. bestiary acompanhando -------------------------------------------------------------------------------------------
create table if not exists public.bestiary_tracking (
  char_id uuid not null references public.chars (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  creature text not null check (char_length(creature) <= 80),
  created_at timestamptz not null default now(),
  primary key (char_id, creature)
);
create index if not exists bestiary_tracking_creature on public.bestiary_tracking (lower(creature));
alter table public.bestiary_tracking enable row level security;
drop policy if exists "acompanhando: dono le" on public.bestiary_tracking;
create policy "acompanhando: dono le" on public.bestiary_tracking for select using ((select auth.uid()) = user_id);
drop policy if exists "acompanhando: dono marca" on public.bestiary_tracking;
create policy "acompanhando: dono marca" on public.bestiary_tracking for insert
  with check ((select auth.uid()) = user_id and exists (select 1 from public.chars c where c.id = char_id and c.user_id = (select auth.uid())));
drop policy if exists "acompanhando: dono desmarca" on public.bestiary_tracking;
create policy "acompanhando: dono desmarca" on public.bestiary_tracking for delete using ((select auth.uid()) = user_id);
grant select, insert, delete on table public.bestiary_tracking to authenticated;

-- 2. lembretes -------------------------------------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('boss', 'stamina', 'outro')),
  ref text check (char_length(ref) <= 80),          -- boss, char... (um lembrete ativo por kind+ref)
  title text not null check (char_length(title) between 1 and 120),
  body text check (char_length(body) <= 200),
  url text check (char_length(url) <= 200),
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists reminders_due on public.reminders (due_at) where sent_at is null;
create unique index if not exists reminders_one_active on public.reminders (user_id, kind, coalesce(ref, '')) where sent_at is null;
alter table public.reminders enable row level security;
drop policy if exists "lembretes: dono le" on public.reminders;
create policy "lembretes: dono le" on public.reminders for select using ((select auth.uid()) = user_id);
drop policy if exists "lembretes: dono apaga" on public.reminders;
create policy "lembretes: dono apaga" on public.reminders for delete using ((select auth.uid()) = user_id);
revoke all on table public.reminders from anon, authenticated;
grant select, delete on table public.reminders to authenticated;

-- cria (ou troca) o lembrete ativo daquele kind+ref; no máximo 50 ativos por conta
create or replace function public.set_reminder(p_kind text, p_ref text, p_title text, p_body text, p_url text, p_due timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  if auth.uid() is null then raise exception 'entre para criar lembretes'; end if;
  if p_due < now() - interval '1 minute' or p_due > now() + interval '30 days' then raise exception 'horário inválido'; end if;
  if p_url is not null and p_url !~ '^/' then raise exception 'link inválido'; end if;
  delete from public.reminders where user_id = auth.uid() and kind = p_kind and coalesce(ref, '') = coalesce(p_ref, '') and sent_at is null;
  if (select count(*) from public.reminders where user_id = auth.uid() and sent_at is null) >= 50 then
    raise exception 'muitos lembretes ativos: apague algum';
  end if;
  insert into public.reminders (user_id, kind, ref, title, body, url, due_at)
  values (auth.uid(), p_kind, nullif(p_ref, ''), public.tc_clean_text(p_title), public.tc_clean_text(p_body), p_url, greatest(p_due, now()))
  returning id into rid;
  return rid;
end $$;
revoke all on function public.set_reminder(text, text, text, text, text, timestamptz) from public, anon;
grant execute on function public.set_reminder(text, text, text, text, text, timestamptz) to authenticated;

-- a cada 5 minutos: lembrete vencido vira aviso (o push sai no job do 021)
create or replace function public.reminders_due() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  with due as (
    update public.reminders set sent_at = now() where sent_at is null and due_at <= now()
    returning user_id, kind, title, body, url
  )
  insert into public.notifications (user_id, kind, title, body, url)
  select user_id, 'reminder', title, body, coalesce(url, '/notificacoes') from due;
  get diagnostics n = row_count;
  delete from public.reminders where sent_at < now() - interval '7 days';
  return n;
end $$;
revoke all on function public.reminders_due() from public, anon, authenticated;

-- 3. boosted do dia e eventos -----------------------------------------------------------------------------------------
create table if not exists public.boosted_log (
  day date primary key,
  creature text,
  boss text,
  checked_at timestamptz not null default now()
);
alter table public.boosted_log enable row level security;
drop policy if exists "boosted: todos leem" on public.boosted_log;
create policy "boosted: todos leem" on public.boosted_log for select using (true);
grant select on table public.boosted_log to anon, authenticated;

-- depois do server save: guarda o boosted, avisa quem acompanha a creature e avisa o início de XP/respawn em dobro
create or replace function public.daily_alerts() returns integer
language plpgsql security definer set search_path = public as $$
declare j jsonb; cr text; bo text; d date := public.tibia_day(); n integer := 0; k integer; e record;
begin
  if exists (select 1 from public.boosted_log where day = d and creature is not null) then return 0; end if;
  j := public.tc_get_json('https://api.tibiadata.com/v4/creatures');
  cr := j -> 'creatures' -> 'boosted' ->> 'name';
  j := public.tc_get_json('https://api.tibiadata.com/v4/boostablebosses');
  bo := j -> 'boostable_bosses' -> 'boosted' ->> 'name';
  if cr is null then return 0; end if;
  insert into public.boosted_log (day, creature, boss) values (d, cr, bo)
  on conflict (day) do update set creature = excluded.creature, boss = excluded.boss, checked_at = now();

  insert into public.notifications (user_id, kind, title, body, url)
  select distinct t.user_id, 'boosted', '🐾 Boosted de hoje: ' || cr,
         'Você está acompanhando ' || cr || ' no Bestiary (' || string_agg(c.name, ', ') || '). Dia de dobrar os kills.',
         '/ferramentas/bestiario?q=' || replace(cr, ' ', '%20')
  from public.bestiary_tracking t
  join public.chars c on c.id = t.char_id
  where lower(t.creature) = lower(cr)
    and not exists (select 1 from public.bestiary_progress p where p.char_id = t.char_id and lower(p.creature) = lower(cr))
  group by t.user_id;
  get diagnostics k = row_count; n := n + k;

  for e in select name from public.tibia_events
           where start_date = d and not tentative
             and name in ('Double Experience and Skill Events', 'Rapid Respawn Events') loop
    insert into public.notifications (user_id, kind, title, body, url)
    select u.id, 'event',
           case when e.name like 'Double%' then '⭐ XP e skill em dobro começou!' else '⚡ Respawn rápido começou!' end,
           'Começou hoje com o server save. Veja quanto dura no calendário.', '/tibia/calendario'
    from auth.users u;
    get diagnostics k = row_count; n := n + k;
  end loop;
  return n;
end $$;
revoke all on function public.daily_alerts() from public, anon, authenticated;

-- 4. agendamentos
select cron.unschedule(jobid) from cron.job where jobname in ('tc-reminders', 'tc-daily-alerts');
select cron.schedule('tc-reminders', '*/5 * * * *', 'select public.reminders_due()');
-- 08:20 e 09:20 UTC (server save às 10h de Berlim, no horário de verão e no de inverno); roda uma vez por dia
select cron.schedule('tc-daily-alerts', '20 8,9 * * *', 'select public.daily_alerts()');
