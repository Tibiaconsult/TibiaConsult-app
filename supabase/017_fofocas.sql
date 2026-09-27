-- 017: "Fofoca pro Rashid". Quem tem char liberado conta um detalhe de uma morte que está no mural e o Rashid publica
-- como fofoca, sem dizer quem contou. Para evitar ataque gratuito, a fofoca só pode ser sobre uma morte real do mural
-- (char acompanhado). Filtro de palavras, limite por hora, uma fofoca por conta em cada morte e 3 denúncias escondem.
-- O público não vê o autor; o admin vê pelo /admin (admin_gossips).

create table if not exists public.gossips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  death_key text not null check (char_length(death_key) <= 120),
  about text not null default '',
  body text not null check (char_length(body) between 5 and 280),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, death_key)
);
create index if not exists gossips_death on public.gossips (death_key);
create index if not exists gossips_recent on public.gossips (created_at desc) where not hidden;
alter table public.gossips enable row level security;

drop policy if exists "fofocas: todos leem" on public.gossips;
create policy "fofocas: todos leem" on public.gossips for select using (not hidden or user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "fofocas: conta conta" on public.gossips;
create policy "fofocas: conta conta" on public.gossips for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "fofocas: autor ou admin apaga" on public.gossips;
create policy "fofocas: autor ou admin apaga" on public.gossips for delete to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "fofocas: admin modera" on public.gossips;
create policy "fofocas: admin modera" on public.gossips for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- o autor (user_id) não é legível pela API: só as colunas públicas
revoke all on table public.gossips from anon, authenticated;
grant select (id, death_key, about, body, hidden, created_at) on table public.gossips to anon, authenticated;
grant insert (death_key, body) on table public.gossips to authenticated;
grant delete, update (hidden) on table public.gossips to authenticated;

create or replace function public.gossips_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare nm text; n integer;
begin
  if not exists (select 1 from public.chars where user_id = auth.uid() and public_profile) then
    raise exception 'libere seu char na comunidade para contar fofoca';
  end if;
  select d.name into nm
  from public.char_deaths d
  join public.tracked_names() t on t.lname = lower(d.name)
  where lower(d.name) = split_part(new.death_key, '|', 1)
    and floor(extract(epoch from d.died_at))::bigint::text = split_part(new.death_key, '|', 2);
  if nm is null then raise exception 'essa morte não está no mural'; end if;
  select count(*) into n from public.gossips where user_id = auth.uid() and created_at > now() - interval '1 hour';
  if n >= 3 then raise exception 'o Rashid só aguenta 3 fofocas por hora: volta daqui a pouco'; end if;
  if exists (select 1 from public.gossips where user_id = auth.uid() and death_key = new.death_key) then
    raise exception 'você já contou uma fofoca dessa morte';
  end if;
  new.user_id := auth.uid();
  new.about := nm;
  new.hidden := false;
  new.created_at := now();
  new.body := public.tc_clean_text(btrim(new.body));
  return new;
end $$;
revoke all on function public.gossips_before_insert() from public, anon, authenticated;
drop trigger if exists gossips_before_insert on public.gossips;
create trigger gossips_before_insert before insert on public.gossips for each row execute function public.gossips_before_insert();

-- reações e denúncias também valem para fofocas
alter table public.reactions drop constraint if exists reactions_target_type_check;
alter table public.reactions add constraint reactions_target_type_check check (target_type in ('post', 'death', 'comment', 'gossip'));
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check check (target_type in ('post', 'comment', 'gossip'));

create or replace function public.reports_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  select count(*) into n from public.reports where target_type = new.target_type and target_id = new.target_id;
  if n >= 3 then
    if new.target_type = 'post' then update public.posts set hidden = true where id = new.target_id;
    elsif new.target_type = 'gossip' then update public.gossips set hidden = true where id = new.target_id;
    else update public.comments set hidden = true where id = new.target_id; end if;
  end if;
  return new;
end $$;
revoke all on function public.reports_after_insert() from public, anon, authenticated;

-- Para o /admin: autor de cada fofoca (chars da conta), só para administrador
create or replace function public.admin_gossips() returns table (id uuid, author text)
language sql stable security definer set search_path = public as $$
  select g.id, coalesce((select string_agg(c.name, ', ' order by c.name) from public.chars c where c.user_id = g.user_id), 'conta sem char')
  from public.gossips g
  where public.is_admin()
$$;
revoke all on function public.admin_gossips() from public, anon;
grant execute on function public.admin_gossips() to authenticated;
