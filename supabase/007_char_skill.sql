-- 007: skill principal e ataque da arma, usados no simulador de knight e paladin.
alter table public.chars
  add column if not exists skill integer not null default 0 check (skill between 0 and 300),
  add column if not exists weapon_attack integer not null default 0 check (weapon_attack between 0 and 300);
