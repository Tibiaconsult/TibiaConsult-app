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

function int(form: FormData, key: string, fallback: number): number {
  const n = Number(form.get(key));
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

export async function addChar(form: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/meus-chars");

  const name = text(form, "name");
  if (!name) return;

  await supabase.from("chars").insert({
    user_id: user.id,
    name,
    vocation: text(form, "vocation") ?? "sorcerer",
    level: int(form, "level", 8),
    magic_level: int(form, "magic_level", 0),
    world: text(form, "world"),
    wand: text(form, "wand"),
    notes: text(form, "notes"),
  });
  revalidatePath("/meus-chars");
}

export async function deleteChar(form: FormData) {
  const id = text(form, "id");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("chars").delete().eq("id", id);
  revalidatePath("/meus-chars");
}
