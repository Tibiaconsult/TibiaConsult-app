import Link from "next/link";
import { redirect } from "next/navigation";
import Box from "@/components/Box";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { PushToggle } from "@/components/Notifications";
import { AddChar, NotifyToggle, RemoveChar } from "./PartyEditor";
import XpBars from "./XpBars";
import { PartyChar, hours, shortXp, stats } from "./party";

// Minha PT: lista privada da conta com os chars que a pessoa quer acompanhar (evolução de XP, tempo online e mortes).
export const metadata = { title: "Minha PT" };
export const dynamic = "force-dynamic";

const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default async function MinhaPtPage() {
  if (!hasSupabaseEnv()) redirect("/entrar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/minha-pt");

  const { data } = await supabase.rpc("my_party", { p_days: 30 });
  const party = (data ?? []) as PartyChar[];
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const rows = party.map((c) => ({ c, s: stats(c, today) }));
  const levels = party.map((c) => c.level ?? 0).filter(Boolean);
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const shares = levels.length > 1 && lo * 3 >= hi * 2;
  const tot = rows.reduce((a, { s }) => ({ xp7: a.xp7 + s.xp7, xp30: a.xp30 + s.xp30, on7: a.on7 + s.on7 }), { xp7: 0, xp30: 0, on7: 0 });

  return (
    <div>
      <h1>Minha PT</h1>
      <p className="on-dark mb-4">
        Os chars que você acompanha: XP por dia, tempo online e mortes. A lista é só sua: ninguém mais vê quem está aqui.
      </p>

      <Box title="➕ Montar a PT">
        <AddChar />
        <div className="mt-3 border-t border-[#b98a5a]/40 pt-2">
          <p className="text-[12px] mb-1">🔔 Quando alguém da PT morrer ou subir de level, chega um aviso no sino do site e no celular (ligue abaixo neste aparelho). Dá para escolher por char, embaixo de cada um.</p>
          <PushToggle />
        </div>
        <p className="muted text-[11px] mt-2">
          Até 10 chars, de qualquer mundo. O site busca o level todo dia, as mortes a cada 10 minutos e quem está online a cada 5 minutos.
        </p>
      </Box>

      {party.length === 0 ? (
        <Box title="Sua PT">
          <p className="text-[12px]">Ninguém na PT ainda. Adicione o seu char e os dos amigos com quem você caça.</p>
        </Box>
      ) : (
        <>
          <Box title={`👥 Resumo da PT (${party.length})`}>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Char</th>
                    <th>Level</th>
                    <th>XP 7 dias</th>
                    <th>XP 30 dias</th>
                    <th>Online 7 dias</th>
                    <th>XP por hora online</th>
                    <th>Mortes 30 dias</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ c, s }) => (
                    <tr key={c.name}>
                      <td className="font-bold whitespace-nowrap">
                        <Link href={`/char/${encodeURIComponent(c.name)}`}>{c.name}</Link>
                      </td>
                      <td className="whitespace-nowrap">
                        {c.level ?? "?"}
                        {s.levels30 ? <span className="muted text-[10px]"> (+{s.levels30})</span> : null}
                      </td>
                      <td>{shortXp(s.xp7)}</td>
                      <td>{shortXp(s.xp30)}</td>
                      <td className="whitespace-nowrap">{hours(s.on7)}</td>
                      <td>{s.xpPerHour ? shortXp(s.xpPerHour) : "—"}</td>
                      <td>{s.deaths30}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td>PT</td>
                    <td />
                    <td>{shortXp(tot.xp7)}</td>
                    <td>{shortXp(tot.xp30)}</td>
                    <td className="whitespace-nowrap">{hours(tot.on7)}</td>
                    <td />
                    <td>{rows.reduce((a, { s }) => a + s.deaths30, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {levels.length > 1 && (
              <p className="text-[12px] mt-2">
                {shares ? "✅" : "⚠️"} Share de XP: o menor level ({lo}) {shares ? "está" : "não está"} dentro de 2/3 do maior ({hi}).
                {!shares && ` O menor precisa de pelo menos ${Math.ceil((hi * 2) / 3)}.`}
              </p>
            )}
            <p className="muted text-[10px] mt-1">
              XP por hora online = XP de 30 dias ÷ horas online no período (conta o tempo parado no depot também). Dados coletados pelo site a partir do tibia.com.
            </p>
          </Box>

          {rows.map(({ c, s }) => (
            <Box key={c.name} title={`${c.name} · ${c.vocation ?? "?"} · level ${c.level ?? "?"}${c.world ? ` · ${c.world}` : ""}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <XpBars days={s.days} />
                  <p className="text-[12px] mt-2">
                    Online: <b>{hours(s.on7)}</b> em 7 dias · <b>{hours(s.on30)}</b> em 30 dias
                    {c.last_seen && <span className="muted"> · visto online em {when(c.last_seen)}</span>}
                  </p>
                  {c.guild && <p className="muted text-[11px]">🛡️ {c.guild}</p>}
                </div>
                <div>
                  <b className="text-[12px]">⚰️ Mortes</b>
                  {c.deaths.length === 0 ? (
                    <p className="text-[12px]">Nenhuma morte registrada.</p>
                  ) : (
                    <ul className="text-[12px] space-y-1 mt-1">
                      {c.deaths.slice(0, 5).map((d) => (
                        <li key={d.t}>
                          <b>{when(d.t)}</b> · level {d.l ?? "?"} {d.p && <span className="tag tag-fire">PvP</span>}
                          <div className="muted">{d.r}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <p className="text-[11px] mt-2 flex flex-wrap gap-3">
                <Link href={`/char/${encodeURIComponent(c.name)}`}>página do char e hunts recomendadas</Link>
                <NotifyToggle name={c.name} kind="death" on={c.notify !== false} />
                <NotifyToggle name={c.name} kind="level" on={c.notify_level !== false} />
                <RemoveChar name={c.name} />
              </p>
            </Box>
          ))}
        </>
      )}
    </div>
  );
}
