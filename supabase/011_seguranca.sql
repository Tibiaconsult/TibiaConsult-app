-- 011: revisão de segurança de 26/09/2026 (Security Advisor do Supabase + testes de acesso).

-- 1. search_path fixo nas funções que o Advisor apontou
alter function public.set_updated_at() set search_path = public;
alter function public.tibia_day() set search_path = public;
alter function public.exp_for_level(integer) set search_path = public;
alter function public.chars_reset_verify() set search_path = public;

-- 2. função do gatilho de RLS automático do Supabase: roda pelo event trigger, ninguém precisa chamar pela API
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 3. verificação do char por código está desligada (009): fecha a porta até religar (futuro_reconfirmar.sql volta com o grant)
revoke execute on function public.start_verify(uuid) from authenticated;
revoke execute on function public.check_verify(uuid) from authenticated;

-- 4. tamanho dos campos de texto do char (o site já corta; o banco garante contra chamada direta à API)
alter table public.chars
  add constraint chars_name_len check (char_length(name) between 2 and 30),
  add constraint chars_world_len check (world is null or char_length(world) <= 30),
  add constraint chars_notes_len check (notes is null or char_length(notes) <= 4000),
  add constraint chars_texts_len check (
    coalesce(char_length(wand), 0) <= 500 and coalesce(char_length(helmet), 0) <= 500 and coalesce(char_length(armor), 0) <= 500
    and coalesce(char_length(legs), 0) <= 500 and coalesce(char_length(boots), 0) <= 500 and coalesce(char_length(spellbook), 0) <= 500
    and coalesce(char_length(ring), 0) <= 500 and coalesce(char_length(amulet), 0) <= 500 and coalesce(char_length(imbuements), 0) <= 2000
    and coalesce(char_length(wheel_summary), 0) <= 2000 and coalesce(char_length(gems), 0) <= 2000 and coalesce(char_length(hunts), 0) <= 2000
  );
alter table public.feedback
  add constraint feedback_page_len check (page is null or char_length(page) <= 300),
  add constraint feedback_email_len check (email is null or char_length(email) <= 200),
  add constraint feedback_extra_len check (extra is null or char_length(extra::text) <= 3000);

-- 5. limite de envio de feedback (contra spam pela API): 20 por hora por conta, 60 por hora somando os anônimos
create or replace function public.feedback_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null then
    if (select count(*) from public.feedback where user_id = new.user_id and created_at > now() - interval '1 hour') >= 20 then
      raise exception 'muitos envios: tente de novo mais tarde';
    end if;
  elsif (select count(*) from public.feedback where user_id is null and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'muitos envios: tente de novo mais tarde';
  end if;
  return new;
end $$;
revoke execute on function public.feedback_rate_limit() from public, anon, authenticated;
drop trigger if exists feedback_rate_limit on public.feedback;
create trigger feedback_rate_limit before insert on public.feedback for each row execute function public.feedback_rate_limit();
