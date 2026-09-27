import Link from "next/link";
import Box from "@/components/Box";
import { employeeCaption, fmtOnline } from "@/lib/social";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const metadata = { title: "Funcionário do Mês" };
export const dynamic = "force-dynamic";

interface Row {
  name: string;
  world: string | null;
  vocation: string | null;
  level: number | null;
  minutes: number;
  days: number;
}

/** "2026-09" do parâmetro, ou o mês atual (horário de Brasília). */
function monthOf(mes: string | undefined) {
  const cur = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7);
  const m = mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) && mes <= cur ? mes : cur;
  const [y, mm] = m.split("-").map(Number);
  const shift = (d: number) => {
    const t = new Date(Date.UTC(y, mm - 1 + d, 1));
    return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const label = (k: string) => new Date(`${k}-15T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return { m, cur, isCurrent: m === cur, prev: shift(-1), next: m < cur ? shift(1) : null, label };
}

async function load(month: string, prev: string, withPrev: boolean) {
  if (!hasSupabaseEnv()) return { rows: [] as Row[], last: null as Row | null };
  const supabase = await createClient();
  const [{ data }, lastRes] = await Promise.all([
    supabase.rpc("online_ranking", { p_month: `${month}-01` }),
    withPrev ? supabase.rpc("online_ranking", { p_month: `${prev}-01` }) : Promise.resolve({ data: null }),
  ]);
  return { rows: (data ?? []) as Row[], last: ((lastRes.data ?? []) as Row[])[0] ?? null };
}

export default async function FuncionarioPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams;
  const mo = monthOf(mes);
  const { rows, last } = await load(mo.m, mo.prev, mo.isCurrent);
  const top = rows[0];
  const max = top?.minutes || 1;

  return (
    <div>
      <h1>Funcionário do Mês</h1>
      <p className="on-dark mb-4">
        Homenagem a quem mais bateu ponto no Tibia. O tempo online é contado a cada 5 minutos pela lista de quem está online no mundo, como faz o GuildStats. Só
        entram chars liberados na comunidade.
      </p>

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <Link href={`/comunidade/funcionario-do-mes?mes=${mo.prev}`} className="tc-btn !py-0.5 !px-3">
          ← {mo.label(mo.prev)}
        </Link>
        <span className="on-dark font-bold">{mo.label(mo.m).replace(/^./, (c) => c.toUpperCase())}</span>
        {mo.next && (
          <Link href={`/comunidade/funcionario-do-mes?mes=${mo.next}`} className="tc-btn !py-0.5 !px-3">
            {mo.label(mo.next)} →
          </Link>
        )}
      </div>

      <section className="tc-panel">
        <div className="tc-title">🏅 {mo.isCurrent ? "Liderando o mês" : "Funcionário do Mês"}</div>
        <div className="tc-box">
          {top ? (
            <div className="flex flex-wrap gap-4 items-center justify-center text-center">
              <div
                className="rounded-lg p-4 min-w-[260px]"
                style={{ border: "6px double #b8860b", background: "linear-gradient(#fff6d8, #f3d9a8)", boxShadow: "0 3px 10px rgba(0,0,0,.35)" }}
              >
                <div className="text-[11px] uppercase tracking-widest text-[#8a5a2a]">Funcionário do Mês</div>
                <div className="text-[44px] leading-none my-2">🏆</div>
                <Link href={`/char/${encodeURIComponent(top.name)}`} className="font-bold text-[20px] text-[#3a1a00]">
                  {top.name}
                </Link>
                <div className="text-[12px] muted">
                  {top.vocation ?? "?"} · level {top.level ?? "?"}
                  {top.world ? ` · ${top.world}` : ""}
                </div>
                <div className="font-bold text-[22px] mt-2 text-[#1a3f8f]">{fmtOnline(top.minutes)}</div>
                <div className="text-[11px] muted">
                  online em {top.days} dia{top.days === 1 ? "" : "s"}
                </div>
                <div className="text-[12px] italic mt-2 max-w-[260px]">“{employeeCaption(top.minutes)}”</div>
              </div>
              {mo.isCurrent && last && (
                <div className="text-[12px] max-w-[220px]">
                  <div className="muted">Funcionário de {mo.label(mo.prev)}</div>
                  <Link href={`/char/${encodeURIComponent(last.name)}`} className="font-bold text-[14px]">
                    🏅 {last.name}
                  </Link>
                  <div>{fmtOnline(last.minutes)} online</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13px]">
              Ninguém bateu ponto neste mês ainda. Para concorrer, verifique seu char em <Link href="/meus-chars">Meus chars</Link> e ligue a opção de aparecer
              no mural e no ranking.
            </p>
          )}
        </div>
      </section>

      {rows.length > 0 && (
        <Box title="⏱️ Quadro de horas">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Char</th>
                <th className="text-right">Tempo online</th>
                <th className="text-right hidden sm:table-cell">Dias</th>
                <th className="text-right hidden sm:table-cell">Média/dia</th>
                <th className="w-[30%] hidden sm:table-cell"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name}>
                  <td>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                  <td>
                    <Link href={`/char/${encodeURIComponent(r.name)}`} className="font-bold">
                      {r.name}
                    </Link>
                    <div className="muted text-[11px]">
                      {r.vocation ?? "?"} · level {r.level ?? "?"}
                      {r.world ? ` · ${r.world}` : ""}
                    </div>
                  </td>
                  <td className="text-right font-bold">{fmtOnline(r.minutes)}</td>
                  <td className="text-right hidden sm:table-cell">{r.days}</td>
                  <td className="text-right hidden sm:table-cell">{fmtOnline(r.minutes / r.days)}</td>
                  <td className="hidden sm:table-cell">
                    <div className="h-2 rounded bg-[#b98a5a]/30">
                      <div className="h-2 rounded" style={{ width: `${(r.minutes / max) * 100}%`, background: "linear-gradient(90deg,#3b6fd8,#1a3f8f)" }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      <p className="on-dark muted text-[11px]">
        Contagem aproximada (margem de uns 5 minutos por sessão), feita desde 27/09/2026 com a lista de online do tibia.com pela API pública do TibiaData. O mês
        segue o dia do Tibia (virada no server save).
      </p>
    </div>
  );
}
