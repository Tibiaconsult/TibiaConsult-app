"use server";

import { createClient } from "@/lib/supabase/server";

export interface FeedbackState {
  ok: boolean;
  message: string;
}

const KINDS = new Set(["bug", "inconsistencia", "hunt", "funcionalidade", "outro"]);

export async function sendFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  // Campo escondido: robôs preenchem, pessoas não.
  if (String(form.get("website") ?? "").trim()) return { ok: true, message: "Recebido. Obrigado!" };

  const kind = String(form.get("kind") ?? "");
  const message = String(form.get("message") ?? "").trim();
  const page = String(form.get("page") ?? "").slice(0, 300);
  const email = String(form.get("email") ?? "").trim().slice(0, 200) || null;
  if (!KINDS.has(kind)) return { ok: false, message: "Escolha o tipo." };
  if (message.length < 5) return { ok: false, message: "Escreva um pouco mais (mínimo de 5 letras)." };
  if (message.length > 4000) return { ok: false, message: "Texto muito longo (máximo de 4.000 letras)." };

  const extra: Record<string, string> = {};
  for (const k of ["hunt_name", "hunt_city", "hunt_level", "hunt_creatures"]) {
    const v = String(form.get(k) ?? "").trim();
    if (v) extra[k] = v.slice(0, 500);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("feedback").insert({
    kind,
    message,
    page,
    email: user?.email ?? email,
    user_id: user?.id ?? null,
    extra: Object.keys(extra).length ? extra : null,
  });
  if (error) return { ok: false, message: "Não foi possível enviar agora. Tente de novo em instantes." };
  return { ok: true, message: "Recebido. Obrigado por ajudar a melhorar o TibiaConsult!" };
}
