import Link from "next/link";
import Box from "@/components/Box";
import { GuildTabs, GuildTag, loadGuilds, pickGuild } from "@/components/Guilds";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const metadata = { title: "Ranking de XP" };
export const dynamic = "force-dynamic";

const PERIODS = [
  { id: "dia", label: "Diário", days: 1 },
  { id: "semana", label: "Semanal", days: 7 },
  { id: "mes", label: "Mensal", days: 30 },
  { id: "ano", label: "Anual", days: 365 },
];

interface Row {
  name: string;
  world: string | null;
  vocation: string | null;
  level: number;
  gained: number;
  since: string;
  exact: boolean;
  guild: string | null;
}

const fmt = (v: number) => Number(v).toLocaleString("pt-BR");
const MEDAL = ["🥇", "🥈", "🥉"];

const url = (p: string, g: string | null) => `/comunidade/ranking?p=${p}${g ? `&g=${encodeURIComponent(g)}` : ""}`;

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ p?: string; g?: string }> }) {
  const { p, g } = await searchParams;
  const period = PERIODS.find((x) => x.id === p) ?? PERIODS[0];
  const guilds = await loadGuilds();
  const guild = pickGuild(guilds, g);
  let rows: Row[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("xp_ranking", { p_days: period.days, p_guild: guild });
    rows = (data ?? []) as Row[];
  }

  return (
    <div>
      <h1>Ranking de XP</h1>
      <p className="on-dark mb-4">
        Quanto cada char da turma ganhou de experiência: todos os membros das guildas acompanhadas e os chars liberados na comunidade.
      </p>
      <Box title={`Ranking ${period.label.toLowerCase()}`}>
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIODS.map((x) => (
            <Link key={x.id} href={url(x.id, guild)} className={`tc-btn ${x.id === period.id ? "" : "opacity-60"}`}>
              {x.label}
            </Link>
          ))}
        </div>
        <GuildTabs guilds={guilds} current={guild} href={(x) => url(period.id, x)} />
        {rows.length === 0 ? (
          <p className="text-[13px]">
            Ninguém no ranking ainda. Cadastre seu char em <Link href="/meus-chars">Meus chars</Link> e libere na comunidade.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Char</th>
                  <th>Vocação</th>
                  <th>Mundo</th>
                  <th>Level</th>
                  <th>XP ganha</th>
                  <th>Desde</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.name}>
                    <td className="font-bold">{MEDAL[i] ?? i + 1}</td>
                    <td>
                      <Link href={`/char/${encodeURIComponent(r.name)}`} className="font-bold">
                        {r.name}
                      </Link>{" "}
                      <GuildTag guild={r.guild} />
                    </td>
                    <td>{r.vocation ?? "-"}</td>
                    <td>{r.world ?? "-"}</td>
                    <td>{r.level}</td>
                    <td className={r.gained > 0 ? "good font-bold" : r.gained < 0 ? "bad" : ""}>
                      {fmt(r.gained)}
                      {!r.exact && <span className="muted text-[10px]"> (estimada)</span>}
                    </td>
                    <td className="text-[11px]">{new Date(r.since + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ul className="list-disc pl-5 text-[11px] muted mt-3 space-y-0.5">
          <li>O dia vira no server save: 5h em Brasília (6h quando a Europa sai do horário de verão). A coleta roda todo dia às 6h30.</li>
          <li>XP exata vem do highscore do tibia.com (1000 primeiros do mundo). Fora dele, a XP é estimada pelo level e aparece marcada.</li>
          <li>O histórico começou em 26/09/2026 (guildas em 27/09/2026): enquanto não houver o período inteiro, a coluna Desde mostra a data de início.</li>
          <li>Morte faz a XP cair: o valor pode ficar negativo.</li>
        </ul>
      </Box>
    </div>
  );
}
