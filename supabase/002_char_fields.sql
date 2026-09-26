-- Campos estruturados do char: set por slot com tier, imbuements, wheel, gemas e hunts.
alter table public.chars
  add column if not exists wand_tier integer not null default 0 check (wand_tier between 0 and 10),
  add column if not exists helmet text, add column if not exists helmet_tier integer not null default 0,
  add column if not exists armor text, add column if not exists armor_tier integer not null default 0,
  add column if not exists legs text, add column if not exists legs_tier integer not null default 0,
  add column if not exists boots text, add column if not exists boots_tier integer not null default 0,
  add column if not exists spellbook text,
  add column if not exists ring text,
  add column if not exists amulet text,
  add column if not exists imbuements text,
  add column if not exists wheel_code text,
  add column if not exists wheel_summary text,
  add column if not exists gems text,
  add column if not exists hunts text;
