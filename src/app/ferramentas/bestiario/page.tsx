import Box from "@/components/Box";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { ALL_CREATURES } from "@/lib/creatures";
import BestiaryTracker from "./BestiaryTracker";

export const metadata = { title: "Bestiary Tracker" };
export const dynamic = "force-dynamic";

export default async function BestiarioPage() {
  let chars: { id: string; name: string }[] = [];
  let logged = false;
  let boosted: string | null = null;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data: b } = await supabase.from("boosted_log").select("creature").order("day", { ascending: false }).limit(1).maybeSingle();
    boosted = (b?.creature as string | undefined) ?? null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      logged = true;
      const { data } = await supabase.from("chars").select("id, name").order("created_at", { ascending: true });
      chars = data ?? [];
    }
  }
  return (
    <div>
      <h1>Bestiary Tracker</h1>
      <p className="on-dark mb-4">
        Sem o limite do tracker do jogo: marque as creatures completas e fixe 📌 quantas quiser para acompanhar. Ordene pelo que rende mais charm point
        por kill e, quando uma creature acompanhada for o boosted do dia, o site avisa no celular. Com conta, fica salvo por char; sem conta, neste
        navegador.
      </p>
      <Box title="Bestiary">
        <BestiaryTracker chars={chars} logged={logged} sheets={ALL_CREATURES.map((c) => c.name)} boosted={boosted} />
      </Box>
      <p className="on-dark muted text-[11px]">
        Lista de creatures, dificuldade, classe, raridade, kills e charm points: TibiaWiki (Bestiary/Difficulties e página de cada creature),
        consulta em 26/09/2026.
      </p>
    </div>
  );
}
