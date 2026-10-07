-- 035: aviso (sino e push) quando um char da Minha PT sobe de level. Todo level novo, com liga/desliga por char (party_watch.notify_level).
-- O dono do char continua recebendo só os marcos; quem acompanha na PT recebe todos (kind 'party_level', abre /minha-pt).
alter table public.party_watch add column if not exists notify_level boolean not null default true;

create or replace function public.set_party_notify_level(p_name text, p_notify boolean) returns void
language sql security definer set search_path = public as $$
  update public.party_watch set notify_level = p_notify where user_id = auth.uid() and lower(name) = lower(p_name)
$$;
revoke all on function public.set_party_notify_level(text, boolean) from public, anon;
grant execute on function public.set_party_notify_level(text, boolean) to authenticated;

create or replace function public.levels_notify() returns trigger
language plpgsql security definer set search_path = public as $function$
declare ids uuid[] := '{}';
begin
  if new.milestone is not null then
    ids := public.tc_notify_owners(new.lname, null, 'level', '🎉 ' || new.name || ' chegou no level ' || new.milestone || '!',
      'O Rashid ergueu a caneca na Taverna. O Henricus já reajustou o preço da bless.',
      '/comunidade/taverna#' || new.lname || '|lvl' || new.level);
  end if;
  insert into public.notifications (user_id, kind, title, body, url)
  select distinct w.user_id, 'party_level',
         '⬆️ ' || new.name || ' (da sua PT) subiu para o level ' || new.level,
         case when new.level - coalesce(new.from_level, new.level - 1) > 1
              then 'Subiu ' || (new.level - new.from_level) || ' levels desde a última conferida (era ' || new.from_level || ').'
              else 'Era ' || coalesce(new.from_level::text, '?') || '.' end,
         '/minha-pt'
  from public.party_watch w
  where lower(w.name) = new.lname and w.active and w.notify_level and not (w.user_id = any(coalesce(ids, '{}')));
  return null;
end $function$;
-- my_party passa a devolver 'notify_level' (corpo completo aplicado no banco em 07/10/2026)
