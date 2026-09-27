import Link from "next/link";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import DeathList, { Death } from "./DeathList";
import { GuildTabs, loadGuilds, pickGuild } from "@/components/Guilds";

export const metadata = { title: "Caixão e Vela Preta" };
export const dynamic = "force-dynamic";

export default async function MuralPage({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  const { g } = await searchParams;
  const guilds = await loadGuilds();
  const guild = pickGuild(guilds, g);
  let deaths: Death[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("death_wall", { p_limit: 200, p_guild: guild });
    deaths = (data ?? []) as Death[];
  }
  return (
    <div>
      <h1>Caixão e Vela Preta</h1>
      <p className="on-dark mb-4">
        O mural das mortes da nossa turma: deixe seu F, ria (com respeito) e comente. Aparecem todos os membros das guildas acompanhadas e os chars liberados na
        comunidade. As mortes vêm do tibia.com, que mostra as dos últimos 30 dias; daqui para a frente o mural guarda todas.
      </p>
      <GuildTabs guilds={guilds} current={guild} href={(x) => (x ? `/comunidade/mural?g=${encodeURIComponent(x)}` : "/comunidade/mural")} />
      <section className="tc-panel">
        <div className="tc-title">🕯️ Descansem em paz 🕯️</div>
        <div className="tc-box" style={{ background: "#1b1410", color: "#e8dcc8" }}>
          {deaths.length === 0 ? (
            <p className="text-[13px]">
              Nenhuma vela acesa por enquanto. Quer entrar no mural? Cadastre seu char em <Link href="/meus-chars">Meus chars</Link> e libere na comunidade (um
              clique, no quadro Comunidade do char).
            </p>
          ) : (
            <DeathList deaths={deaths} />
          )}
        </div>
      </section>
      <p className="on-dark muted text-[11px]">
        Dados do tibia.com pela API pública do TibiaData: cada char é consultado a cada 3 horas, mais ou menos. Horários de Brasília.
      </p>
    </div>
  );
}
