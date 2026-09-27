import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

// Visita diária da Vercel (vercel.json, crons): uma consulta leve mantém o Supabase grátis ativo (ele pausa após 7 dias sem uso).
export async function GET() {
  if (!hasSupabaseEnv()) return Response.json({ ok: false, reason: "sem banco" });
  const supabase = await createClient();
  const { data, error } = await supabase.from("tracked_guilds").select("name");
  return Response.json({ ok: !error, guilds: data?.length ?? 0, at: new Date().toISOString() }, { status: error ? 500 : 200 });
}
