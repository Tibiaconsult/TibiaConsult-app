-- 013: rede social com humor (decisões do Yuri, 27/09/2026):
-- Causos da Taverna, perfil público com conquistas, mural de mortes comentável.
-- Postar e comentar exige char verificado (código no comentário do tibia.com). Reagir e denunciar: qualquer conta logada.
-- Moderação: publica na hora; com 3 denúncias o conteúdo some até o admin revisar. Limite por hora e filtro de palavras.

-- 1. Verificação do char de volta (fechada em 011). A verificação agora atualiza o char por dentro,
-- porque refresh_char não é mais chamável pela API (012).
grant execute on function public.start_verify(uuid) to authenticated;

create or replace function public.check_verify(p_char uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare ch record; j jsonb; c jsonb;
begin
  select * into ch from public.chars where id = p_char and user_id = auth.uid();
  if ch is null then return 'char não encontrado'; end if;
  if ch.verify_code is null then return 'gere o código primeiro'; end if;
  j := public.tc_get_json('https://api.tibiadata.com/v4/character/' || replace(ch.name, ' ', '%20'));
  c := j -> 'character' -> 'character';
  if c is null or coalesce(c ->> 'name', '') = '' then return 'char não encontrado no tibia.com'; end if;
  if position(ch.verify_code in coalesce(c ->> 'comment', '')) = 0 then
    return 'código não encontrado no comentário do char (o tibia.com pode levar alguns minutos para atualizar)';
  end if;
  -- quem provou por último fica com o char
  update public.chars set verified = false, public_profile = false where lower(name) = lower(c ->> 'name') and id <> ch.id;
  update public.chars set verified = true, verified_at = now(), name = c ->> 'name', world = coalesce(c ->> 'world', world) where id = ch.id;
  update public.chars set verified = true where id = ch.id; -- o trigger zera ao trocar maiúsculas; garante o valor final
  perform public.refresh_char(c ->> 'name'); -- snapshot e mortes na hora, para o char já aparecer
  return 'ok';
end $$;
revoke all on function public.check_verify(uuid) from public, anon;
grant execute on function public.check_verify(uuid) to authenticated;

-- 2. Filtro de palavras: "mask" troca por asteriscos, "block" recusa o texto. O admin edita a lista pelo SQL Editor.
create table if not exists public.blocked_words (
  word text primary key,
  action text not null check (action in ('mask', 'block'))
);
alter table public.blocked_words enable row level security;
insert into public.blocked_words (word, action) values
  ('porra', 'mask'), ('caralho', 'mask'), ('merda', 'mask'), ('puta', 'mask'), ('foda', 'mask'), ('fdp', 'mask'),
  ('pqp', 'mask'), ('vsf', 'mask'), ('tnc', 'mask'), ('arrombado', 'mask'), ('buceta', 'mask'), ('cacete', 'mask'),
  ('viado', 'block'), ('traveco', 'block'), ('retardado', 'block'), ('mongoloide', 'block'), ('crioulo', 'block')
on conflict (word) do nothing;

create or replace function public.tc_clean_text(p text) returns text
language plpgsql stable security definer set search_path = public as $$
declare w record; out text := p;
begin
  for w in select word, action from public.blocked_words loop
    if out ~* ('\m' || w.word || '\M') then
      if w.action = 'block' then raise exception 'texto com linguagem ofensiva: reescreva sem ofender ninguém'; end if;
      out := regexp_replace(out, '\m' || w.word || '\M', left(w.word, 1) || repeat('*', char_length(w.word) - 1), 'gi');
    end if;
  end loop;
  return out;
end $$;
revoke all on function public.tc_clean_text(text) from public, anon, authenticated;

-- 3. Causos da Taverna
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  char_id uuid not null references public.chars(id) on delete cascade,
  char_name text not null default '',
  char_vocation text,
  char_level integer,
  char_world text,
  kind text not null check (kind in ('morte', 'loot', 'perrengue', 'vacilo', 'conquista', 'outro')),
  hunt text check (hunt is null or char_length(hunt) <= 80),
  body text not null check (char_length(body) between 3 and 500),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists posts_recent on public.posts (created_at desc) where not hidden;
create index if not exists posts_char on public.posts (char_id);

-- 4. Comentários: em causos (target_type 'post', target_key = id) e em mortes do mural ('death', 'nome|epoch')
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  char_id uuid not null references public.chars(id) on delete cascade,
  char_name text not null default '',
  target_type text not null check (target_type in ('post', 'death')),
  target_key text not null check (char_length(target_key) <= 120),
  body text not null check (char_length(body) between 1 and 300),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_target on public.comments (target_type, target_key, created_at);

-- Autor preenchido pelo banco a partir do char (verificado e do próprio usuário), texto limpo e limite por hora.
create or replace function public.social_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare ch record; n integer;
begin
  select name, vocation, level, world, verified into ch from public.chars where id = new.char_id and user_id = auth.uid();
  if ch is null then raise exception 'char não encontrado'; end if;
  if not ch.verified then raise exception 'verifique o char em Meus chars para postar'; end if;
  new.user_id := auth.uid();
  new.hidden := false;
  new.created_at := now();
  new.char_name := ch.name;
  new.body := public.tc_clean_text(btrim(new.body));
  if tg_table_name = 'posts' then
    new.char_vocation := ch.vocation; new.char_level := ch.level; new.char_world := ch.world;
    if new.hunt is not null then new.hunt := public.tc_clean_text(btrim(new.hunt)); end if;
    select count(*) into n from public.posts where user_id = auth.uid() and created_at > now() - interval '1 hour';
    if n >= 5 then raise exception 'calma, taverneiro: no máximo 5 causos por hora'; end if;
  else
    select count(*) into n from public.comments where user_id = auth.uid() and created_at > now() - interval '1 hour';
    if n >= 30 then raise exception 'muitos comentários seguidos: tente de novo daqui a pouco'; end if;
  end if;
  return new;
end $$;
revoke all on function public.social_before_insert() from public, anon, authenticated;
drop trigger if exists posts_before_insert on public.posts;
create trigger posts_before_insert before insert on public.posts for each row execute function public.social_before_insert();
drop trigger if exists comments_before_insert on public.comments;
create trigger comments_before_insert before insert on public.comments for each row execute function public.social_before_insert();

alter table public.posts enable row level security;
alter table public.comments enable row level security;
drop policy if exists "posts: todos leem" on public.posts;
create policy "posts: todos leem" on public.posts for select using (not hidden or user_id = auth.uid() or public.is_admin());
drop policy if exists "posts: autor posta" on public.posts;
create policy "posts: autor posta" on public.posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "posts: autor ou admin apaga" on public.posts;
create policy "posts: autor ou admin apaga" on public.posts for delete to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "posts: admin modera" on public.posts;
create policy "posts: admin modera" on public.posts for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "comentarios: todos leem" on public.comments;
create policy "comentarios: todos leem" on public.comments for select using (not hidden or user_id = auth.uid() or public.is_admin());
drop policy if exists "comentarios: autor comenta" on public.comments;
create policy "comentarios: autor comenta" on public.comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "comentarios: autor ou admin apaga" on public.comments;
create policy "comentarios: autor ou admin apaga" on public.comments for delete to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "comentarios: admin modera" on public.comments;
create policy "comentarios: admin modera" on public.comments for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on table public.posts, public.comments to anon, authenticated;
grant insert (char_id, kind, hunt, body) on table public.posts to authenticated;
grant insert (char_id, target_type, target_key, body) on table public.comments to authenticated;
grant delete, update (hidden) on table public.posts, public.comments to authenticated;

-- 5. Reações de humor (uma de cada tipo por conta em cada alvo): F, kkk, loot, palhaço
create table if not exists public.reactions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'death', 'comment')),
  target_key text not null check (char_length(target_key) <= 120),
  emoji text not null check (emoji in ('f', 'kkk', 'loot', 'palhaco')),
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_key, emoji)
);
create index if not exists reactions_target on public.reactions (target_type, target_key);
alter table public.reactions enable row level security;
drop policy if exists "reacoes: todos leem" on public.reactions;
create policy "reacoes: todos leem" on public.reactions for select using (true);
drop policy if exists "reacoes: conta reage" on public.reactions;
create policy "reacoes: conta reage" on public.reactions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "reacoes: conta desfaz" on public.reactions;
create policy "reacoes: conta desfaz" on public.reactions for delete to authenticated using (user_id = auth.uid());
grant select on table public.reactions to anon, authenticated;
grant insert (target_type, target_key, emoji), delete on table public.reactions to authenticated;

-- 6. Denúncias: uma por conta em cada conteúdo; com 3, o conteúdo some até o admin revisar
create table if not exists public.reports (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text check (reason is null or char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);
alter table public.reports enable row level security;
drop policy if exists "denuncias: conta denuncia" on public.reports;
create policy "denuncias: conta denuncia" on public.reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "denuncias: admin le" on public.reports;
create policy "denuncias: admin le" on public.reports for select to authenticated using (public.is_admin() or user_id = auth.uid());
drop policy if exists "denuncias: admin apaga" on public.reports;
create policy "denuncias: admin apaga" on public.reports for delete to authenticated using (public.is_admin());
grant select, delete on table public.reports to authenticated;
grant insert (target_type, target_id, reason) on table public.reports to authenticated;

create or replace function public.reports_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  select count(*) into n from public.reports where target_type = new.target_type and target_id = new.target_id;
  if n >= 3 then
    if new.target_type = 'post' then update public.posts set hidden = true where id = new.target_id;
    else update public.comments set hidden = true where id = new.target_id; end if;
  end if;
  return new;
end $$;
revoke all on function public.reports_after_insert() from public, anon, authenticated;
drop trigger if exists reports_after_insert on public.reports;
create trigger reports_after_insert after insert on public.reports for each row execute function public.reports_after_insert();

-- 7. Perfil público: só chars verificados com a opção pública ligada. Devolve o que a página e as conquistas precisam.
create or replace function public.char_profile(p_name text) returns jsonb
language sql stable security definer set search_path = public as $$
  with c as (
    select id, name, vocation, level, world, verified_at from public.chars
    where lower(name) = lower(p_name) and public_profile and verified limit 1
  )
  select case when not exists (select 1 from c) then null else jsonb_build_object(
    'name', (select name from c),
    'vocation', (select vocation from c),
    'level', (select level from c),
    'world', (select world from c),
    'verified_at', (select verified_at from c),
    'deaths', coalesce((select jsonb_agg(jsonb_build_object('died_at', d.died_at, 'level', d.level, 'reason', d.reason, 'by_player', d.by_player) order by d.died_at desc)
                        from public.char_deaths d where lower(d.name) = lower(p_name)), '[]'::jsonb),
    'snapshots', coalesce((select jsonb_agg(jsonb_build_object('date', s.snap_date, 'level', s.level, 'experience', s.experience) order by s.snap_date)
                           from public.char_snapshots s where lower(s.name) = lower(p_name) and s.snap_date > public.tibia_day() - 60), '[]'::jsonb),
    'posts', (select count(*) from public.posts p where p.char_id = (select id from c) and not p.hidden),
    'clowns', (select count(*) from public.reactions r join public.posts p on r.target_type = 'post' and r.target_key = p.id::text
               where p.char_id = (select id from c) and r.emoji = 'palhaco'),
    'fs', (select count(*) from public.reactions r where r.target_type = 'death' and r.emoji = 'f' and split_part(r.target_key, '|', 1) = lower(p_name))
  ) end
$$;
grant execute on function public.char_profile(text) to anon, authenticated;
