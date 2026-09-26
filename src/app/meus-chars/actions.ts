"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function text(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function int(form: FormData, key: string, fallback: number, min = 0, max = 10000): number {
  const n = Number(form.get(key));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/meus-chars");
  return { supabase, user };
}

export async function addChar(form: FormData) {
  const { supabase, user } = await requireUser();
  const name = text(form, "name");
  if (!name) return;

  const { data, error } = await supabase
    .from("chars")
    .insert({
      user_id: user.id,
      name,
      vocation: text(form, "vocation") ?? "sorcerer",
      level: int(form, "level", 8, 1, 5000),
      magic_level: int(form, "magic_level", 0, 0, 300),
      world: text(form, "world"),
    })
    .select("id")
    .single();
  revalidatePath("/meus-chars");
  if (error || !data?.id) redirect(`/meus-chars?erro=${encodeURIComponent(error?.message ?? "não foi possível cadastrar")}`);
  redirect(`/meus-chars/${data.id}`);
}

export async function updateChar(form: FormData) {
  const { supabase } = await requireUser();
  const id = text(form, "id");
  const name = text(form, "name");
  if (!id || !name) return;

  const { error } = await supabase
    .from("chars")
    .update({
      name,
      vocation: text(form, "vocation") ?? "sorcerer",
      level: int(form, "level", 8, 1, 5000),
      magic_level: int(form, "magic_level", 0, 0, 300),
      skill: int(form, "skill", 0, 0, 300),
      weapon_attack: int(form, "weapon_attack", 0, 0, 300),
      world: text(form, "world"),
      wand: text(form, "wand"),
      wand_tier: int(form, "wand_tier", 0, 0, 10),
      helmet: text(form, "helmet"),
      helmet_tier: int(form, "helmet_tier", 0, 0, 10),
      armor: text(form, "armor"),
      armor_tier: int(form, "armor_tier", 0, 0, 10),
      legs: text(form, "legs"),
      legs_tier: int(form, "legs_tier", 0, 0, 10),
      boots: text(form, "boots"),
      boots_tier: int(form, "boots_tier", 0, 0, 10),
      spellbook: text(form, "spellbook"),
      ring: text(form, "ring"),
      amulet: text(form, "amulet"),
      imbuements: text(form, "imbuements"),
      wheel_code: text(form, "wheel_code"),
      wheel_summary: text(form, "wheel_summary"),
      gems: text(form, "gems"),
      hunts: text(form, "hunts"),
      notes: text(form, "notes"),
    })
    .eq("id", id);
  revalidatePath("/meus-chars");
  revalidatePath(`/meus-chars/${id}`);
  if (error) redirect(`/meus-chars/${id}?erro=${encodeURIComponent(error.message)}`);
  redirect(`/meus-chars/${id}?salvo=1`);
}

export async function deleteChar(form: FormData) {
  const id = text(form, "id");
  if (!id) return;
  const { supabase } = await requireUser();
  await supabase.from("chars").delete().eq("id", id);
  revalidatePath("/meus-chars");
  redirect("/meus-chars");
}
