import { loadGuilds } from "@/components/Guilds";
import TavernFeed from "./TavernFeed";

export const metadata = { title: "Taverna" };
export const dynamic = "force-dynamic";

export default async function TavernaPage() {
  const guilds = await loadGuilds();
  return (
    <div>
      <h1>Taverna</h1>
      <p className="on-dark mb-4">
        Toda morte da turma vira assunto no balcão: o Rashid espalha o boato, o Henricus confere quem já é cliente de carteirinha e a galera comenta. Sabe a
        história de verdade? Clique em &quot;🤫 contar pro Rashid&quot;.
      </p>
      <TavernFeed guilds={guilds} />
    </div>
  );
}
