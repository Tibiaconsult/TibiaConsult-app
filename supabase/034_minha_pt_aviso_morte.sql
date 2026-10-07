-- 034: aviso (sino e push no celular) quando um char da Minha PT morre. Liga e desliga por char (party_watch.notify).
-- deaths_notify continua avisando o dono do char e agora também quem tem o char na PT (kind 'party_death', abre /minha-pt).
alter table public.party_watch add column if not exists notify boolean not null default true;

create or replace function public.set_party_notify(p_name text, p_notify boolean) returns void
language sql security definer set search_path = public as $$
  update public.party_watch set notify = p_notify where user_id = auth.uid() and lower(name) = lower(p_name)
$$;
revoke all on function public.set_party_notify(text, boolean) from public, anon;
grant execute on function public.set_party_notify(text, boolean) to authenticated;

create or replace function public.deaths_notify() returns trigger
language plpgsql security definer set search_path = public as $function$
declare ids uuid[];
begin
  if new.died_at < now() - interval '1 day' then return null; end if;
  ids := public.tc_notify_owners(lower(new.name), null, 'death', '⚰️ ' || new.name || ' morreu no level ' || coalesce(new.level::text, '?'),
    coalesce(new.reason, '') || ' O Rashid já está espalhando na Taverna.',
    '/comunidade/taverna#' || lower(new.name) || '|' || floor(extract(epoch from new.died_at))::bigint);
  insert into public.notifications (user_id, kind, title, body, url)
  select distinct w.user_id, 'party_death',
         '⚰️ ' || new.name || ' (da sua PT) morreu no level ' || coalesce(new.level::text, '?'),
         left(coalesce(new.reason, ''), 200), '/minha-pt'
  from public.party_watch w
  where lower(w.name) = lower(new.name) and w.active and w.notify and not (w.user_id = any(coalesce(ids, '{}')));
  return null;
end $function$;
-- my_party passa a devolver 'notify' (corpo completo aplicado no banco em 07/10/2026)
