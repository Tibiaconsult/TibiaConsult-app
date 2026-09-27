import Link from "next/link";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

// Guildas acompanhadas (tabela tracked_guilds, 016): abas de filtro e etiqueta com o nome da guilda.

export async function loadGuilds(): Promise<string[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("tracked_guilds").select("name").order("name");
  return (data ?? []).map((g) => g.name as string);
}

/** Valida o parâmetro ?g= contra as guildas acompanhadas. */
export const pickGuild = (guilds: string[], g: string | undefined) => (g && guilds.includes(g) ? g : null);

export function GuildTabs({ guilds, current, href }: { guilds: string[]; current: string | null; href: (g: string | null) => string }) {
  if (!guilds.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {[null, ...guilds].map((g) => (
        <Link key={g ?? "todos"} href={href(g)} className={`tc-btn !py-0.5 !px-3 ${g === current ? "" : "opacity-60"}`}>
          {g ? `🛡️ ${g}` : "Todos"}
        </Link>
      ))}
    </div>
  );
}

export { GuildTag } from "./GuildTag";
