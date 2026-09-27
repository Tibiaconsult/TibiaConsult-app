-- 026: Rotas dos jogadores. Quem tem char liberado desenha no mapa o caminho que faz numa hunt (pontos x, y, andar), com vocação,
-- level e uma observação; os outros jogadores veem na ficha da hunt, votam 👍 nas que ajudaram e denunciam as ruins
-- (3 denúncias escondem a rota até a moderação olhar, como na Taverna).

create table if not exists public.hunt_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  char_id uuid not null references public.chars (id) on delete cascade,
  char_name text not null,
  hunt_id text not null check (char_length(hunt_id) <= 60),
  vocation text not null check (vocation in ('knight', 'paladin', 'sorcerer', 'druid', 'monk', 'pt')),
  level integer check (level between 8 and 3000),
  note text check (char_length(note) <= 300),
  -- [[x, y, z], ...]
  points jsonb not null check (jsonb_typeof(points) = 'array' and jsonb_array_length(points) between 2 and 400),
  votes integer not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists hunt_routes_hunt on public.hunt_routes (hunt_id, votes desc) where not hidden;
alter table public.hunt_routes enable row level security;
drop policy if exists "rotas: todos leem" on public.hunt_routes;
create policy "rotas: todos leem" on public.hunt_routes for select using (not hidden or user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "rotas: dono ou admin apaga" on public.hunt_routes;
create policy "rotas: dono ou admin apaga" on public.hunt_routes for delete using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "rotas: admin libera" on public.hunt_routes;
create policy "rotas: admin libera" on public.hunt_routes for update using (public.is_admin());
revoke all on table public.hunt_routes from anon, authenticated;
grant select (id, char_name, hunt_id, vocation, level, note, points, votes, hidden, created_at) on table public.hunt_routes to anon, authenticated;
grant delete, update (hidden) on table public.hunt_routes to authenticated;

create table if not exists public.hunt_route_votes (
  route_id uuid not null references public.hunt_routes (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (route_id, user_id)
);
alter table public.hunt_route_votes enable row level security;
revoke all on table public.hunt_route_votes from anon, authenticated;

-- rotas de uma hunt, com "é minha" e "já votei" para quem está logado
create or replace function public.hunt_routes_for(p_hunt text)
returns table (id uuid, char_name text, vocation text, level integer, note text, points jsonb, votes integer, created_at timestamptz, mine boolean, voted boolean)
language sql stable security definer set search_path = public as $$
  select r.id, r.char_name, r.vocation, r.level, r.note, r.points, r.votes, r.created_at,
         r.user_id = auth.uid(),
         exists (select 1 from public.hunt_route_votes v where v.route_id = r.id and v.user_id = auth.uid())
  from public.hunt_routes r
  where r.hunt_id = p_hunt and (not r.hidden or r.user_id = auth.uid())
  order by r.votes desc, r.created_at desc
  limit 50
$$;
grant execute on function public.hunt_routes_for(text) to anon, authenticated;

-- quantas rotas cada hunt tem (para a lista de hunts e o mapa)
create or replace function public.hunt_route_counts() returns table (hunt_id text, n integer)
language sql stable security definer set search_path = public as $$
  select hunt_id, count(*)::int from public.hunt_routes where not hidden group by hunt_id
$$;
grant execute on function public.hunt_route_counts() to anon, authenticated;

create or replace function public.add_hunt_route(p_char uuid, p_hunt text, p_voc text, p_level integer, p_note text, p_points jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare ch record; rid uuid; p jsonb;
begin
  select id, name, public_profile into ch from public.chars where id = p_char and user_id = auth.uid();
  if ch is null then raise exception 'char não encontrado'; end if;
  if not ch.public_profile then raise exception 'libere o char na comunidade para publicar rotas'; end if;
  if (select count(*) from public.hunt_routes where user_id = auth.uid() and created_at > now() - interval '1 day') >= 5 then
    raise exception 'muitas rotas hoje: tente de novo amanhã';
  end if;
  if jsonb_typeof(p_points) <> 'array' or jsonb_array_length(p_points) < 2 then raise exception 'rota curta demais: marque pelo menos 2 pontos'; end if;
  if jsonb_array_length(p_points) > 400 then raise exception 'rota longa demais: no máximo 400 pontos'; end if;
  for p in select * from jsonb_array_elements(p_points) loop
    if jsonb_typeof(p) <> 'array' or jsonb_array_length(p) <> 3
       or (p->>0)::int not between 31744 and 34304 or (p->>1)::int not between 30976 and 33024 or (p->>2)::int not between 0 and 15 then
      raise exception 'ponto fora do mapa';
    end if;
  end loop;
  insert into public.hunt_routes (user_id, char_id, char_name, hunt_id, vocation, level, note, points)
  values (auth.uid(), ch.id, ch.name, p_hunt, p_voc, p_level,
          public.tc_clean_text(nullif(btrim(coalesce(p_note, '')), '')),
          (select jsonb_agg(jsonb_build_array((e->>0)::int, (e->>1)::int, (e->>2)::int)) from jsonb_array_elements(p_points) e))
  returning id into rid;
  return rid;
end $$;
revoke all on function public.add_hunt_route(uuid, text, text, integer, text, jsonb) from public, anon;
grant execute on function public.add_hunt_route(uuid, text, text, integer, text, jsonb) to authenticated;

-- 👍: liga e desliga; devolve o total novo
create or replace function public.toggle_route_vote(p_route uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if auth.uid() is null then raise exception 'entre para votar'; end if;
  if exists (select 1 from public.hunt_routes where id = p_route and user_id = auth.uid()) then raise exception 'não dá para votar na própria rota'; end if;
  if exists (select 1 from public.hunt_route_votes where route_id = p_route and user_id = auth.uid()) then
    delete from public.hunt_route_votes where route_id = p_route and user_id = auth.uid();
  else
    insert into public.hunt_route_votes (route_id) values (p_route);
  end if;
  update public.hunt_routes set votes = (select count(*) from public.hunt_route_votes where route_id = p_route) where id = p_route returning votes into n;
  return coalesce(n, 0);
end $$;
revoke all on function public.toggle_route_vote(uuid) from public, anon;
grant execute on function public.toggle_route_vote(uuid) to authenticated;

-- denúncias também valem para rotas
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check check (target_type in ('post', 'comment', 'gossip', 'route'));

create or replace function public.reports_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  select count(*) into n from public.reports where target_type = new.target_type and target_id = new.target_id;
  if n >= 3 then
    if new.target_type = 'post' then update public.posts set hidden = true where id = new.target_id;
    elsif new.target_type = 'gossip' then update public.gossips set hidden = true where id = new.target_id;
    elsif new.target_type = 'route' then update public.hunt_routes set hidden = true where id = new.target_id;
    else update public.comments set hidden = true where id = new.target_id; end if;
  end if;
  return new;
end $$;
revoke all on function public.reports_after_insert() from public, anon, authenticated;
