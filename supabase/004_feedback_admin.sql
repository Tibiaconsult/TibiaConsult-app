-- Administradores, caixa de sugestões e bugs, e leitura total para o admin.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins: cada um ve a si" on public.admins;
create policy "admins: cada um ve a si" on public.admins for select using (auth.uid() = user_id);
grant select on table public.admins to authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  kind text not null check (kind in ('bug', 'inconsistencia', 'hunt', 'funcionalidade', 'outro')),
  page text,
  message text not null check (char_length(message) between 5 and 4000),
  extra jsonb,
  status text not null default 'novo' check (status in ('novo', 'lido', 'feito', 'descartado')),
  admin_note text
);
alter table public.feedback enable row level security;

drop policy if exists "feedback: qualquer um envia" on public.feedback;
create policy "feedback: qualquer um envia" on public.feedback for insert
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "feedback: autor ve o seu" on public.feedback;
create policy "feedback: autor ve o seu" on public.feedback for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "feedback: admin altera" on public.feedback;
create policy "feedback: admin altera" on public.feedback for update using (public.is_admin()) with check (public.is_admin());

grant insert on table public.feedback to anon, authenticated;
grant select, update on table public.feedback to authenticated;

-- O admin enxerga todos os chars (para o painel), sem mudar o que os outros veem.
drop policy if exists "chars: admin le tudo" on public.chars;
create policy "chars: admin le tudo" on public.chars for select using (public.is_admin());

-- Único administrador: a conta do Yuri (yuri_amon2@live.com).
insert into public.admins (user_id)
select id from auth.users where email = 'yuri_amon2@live.com'
on conflict do nothing;
