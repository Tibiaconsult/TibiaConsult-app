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
