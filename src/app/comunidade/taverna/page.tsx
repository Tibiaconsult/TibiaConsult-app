import { loadGuilds, pickGuild } from "@/components/Guilds";
import TavernFeed, { Order, View } from "./TavernFeed";

export const metadata = { title: "Taverna" };
export const dynamic = "force-dynamic";

type Search = Promise<{ ver?: string; g?: string; ordem?: string }>;

export default async function TavernaPage({ searchParams }: { searchParams: Search }) {
  const { ver, g, ordem } = await searchParams;
  const guilds = await loadGuilds();
  const view: View = ver === "mortes" || ver === "levels" ? ver : "tudo";
  const order: Order = ordem === "alta" ? "alta" : "recentes";
  return (
    <div>
      <h1>Taverna</h1>
      <p className="on-dark mb-4">
        Toda morte e todo level up da turma vira assunto no balcão: o Rashid espalha o boato, o Henricus confere quem já é cliente de carteirinha e a galera
        comenta. O Caixão e Vela Preta, o memorial das mortes, também fica aqui. Sabe a história de verdade? Clique em &quot;🤫 contar pro Rashid&quot;.
      </p>
      <TavernFeed guilds={guilds} initial={{ view, guild: pickGuild(guilds, g), order }} />
    </div>
  );
}
