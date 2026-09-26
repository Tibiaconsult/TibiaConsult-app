-- 005: Bestiary Tracker. Cada linha = uma criatura completa em um char.
-- Privacidade: só o dono do char lê, grava e apaga (item 12: ninguém vê dados de outra conta).

create table if not exists public.bestiary_progress (
  char_id uuid not null references public.chars(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  creature text not null,
  completed_at timestamptz not null default now(),
  primary key (char_id, creature)
);

create index if not exists bestiary_progress_user on public.bestiary_progress(user_id);

alter table public.bestiary_progress enable row level security;

drop policy if exists "bestiario: dono le" on public.bestiary_progress;
create policy "bestiario: dono le" on public.bestiary_progress
  for select using (auth.uid() = user_id);

drop policy if exists "bestiario: dono marca" on public.bestiary_progress;
create policy "bestiario: dono marca" on public.bestiary_progress
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.chars c where c.id = char_id and c.user_id = auth.uid())
  );

drop policy if exists "bestiario: dono desmarca" on public.bestiary_progress;
create policy "bestiario: dono desmarca" on public.bestiary_progress
  for delete using (auth.uid() = user_id);

grant select, insert, delete on table public.bestiary_progress to authenticated;
