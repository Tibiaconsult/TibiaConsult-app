"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export async function setFeedbackStatus(form: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  const note = String(form.get("admin_note") ?? "").slice(0, 2000) || null;
  if (!id || !["novo", "lido", "feito", "descartado"].includes(status)) return;
  await ctx.supabase.from("feedback").update({ status, admin_note: note }).eq("id", id);
  revalidatePath("/admin");
}

/** Moderação da comunidade: liberar (volta a aparecer e zera as denúncias) ou apagar um causo ou comentário. */
export async function moderate(form: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const type = String(form.get("type") ?? "");
  const id = String(form.get("id") ?? "");
  const op = String(form.get("op") ?? "");
  if (!["post", "comment"].includes(type) || !id || !["show", "delete"].includes(op)) return;
  const table = type === "post" ? "posts" : "comments";
  if (op === "delete") await ctx.supabase.from(table).delete().eq("id", id);
  else await ctx.supabase.from(table).update({ hidden: false }).eq("id", id);
  await ctx.supabase.from("reports").delete().eq("target_type", type).eq("target_id", id);
  revalidatePath("/admin");
}

/** Tira (ou devolve) um char das páginas públicas: mural, ranking, Funcionário do Mês e perfil (tracking_optout, 016). */
export async function setOptout(form: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 40);
  const op = String(form.get("op") ?? "");
  if (!name) return;
  if (op === "add") await ctx.supabase.from("tracking_optout").insert({ name });
  if (op === "remove") await ctx.supabase.from("tracking_optout").delete().eq("name", name);
  revalidatePath("/admin");
}
