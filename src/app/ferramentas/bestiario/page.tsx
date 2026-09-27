import Box from "@/components/Box";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import BestiaryTracker from "./BestiaryTracker";

export const metadata = { title: "Bestiary Tracker" };
export const dynamic = "force-dynamic";

export default async function BestiarioPage() {
  let chars: { id: string; name: string }[] = [];
  let logged = false;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
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
        Marque as creatures que o char já completou. Com conta, o progresso fica salvo por char e só você vê. Sem conta, fica guardado neste
        navegador.
      </p>
      <Box title="Bestiary">
        <BestiaryTracker chars={chars} logged={logged} />
      </Box>
      <p className="on-dark muted text-[11px]">
        Lista de creatures, dificuldade, classe, raridade, kills e charm points: TibiaWiki (Bestiary/Difficulties e página de cada creature),
        consulta em 26/09/2026.
      </p>
    </div>
  );
}
