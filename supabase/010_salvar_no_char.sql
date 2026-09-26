-- Set e combo salvos no char (a roda já tem wheel_code). Só o dono edita, pelas regras de linha (RLS) que já existem.
alter table public.chars
  add column if not exists set_code text check (set_code is null or length(set_code) <= 6000),
  add column if not exists combo_code text check (combo_code is null or length(combo_code) <= 2000);

-- wheel_code já pode ser editado (008); limita o tamanho também
do $$ begin
  alter table public.chars add constraint chars_wheel_code_len check (wheel_code is null or length(wheel_code) <= 500);
exception when duplicate_object then null; end $$;

grant update (set_code, combo_code) on table public.chars to authenticated;
