import Box from "@/components/Box";

// Métricas do site (admin_metrics, 021): visitas por dia, contas, engajamento na Taverna e páginas mais vistas.

export interface MetricsData {
  days: {
    day: string;
    visitors: number;
    views: number;
    logged: number;
    signups: number;
    comments: number;
    gossips: number;
    reactions: number;
    deaths: number;
    levels: number;
  }[];
  totals: {
    users: number;
    active7: number;
    chars: number;
    released: number;
    push_users: number;
    visitors7: number;
    visitors30: number;
    returning7: number;
    tracked: number;
  };
  pages: { path: string; views: number; visitors: number }[];
}

const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const path = (p: string) => {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
};
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

export default function Metrics({ m }: { m: MetricsData | null }) {
  if (!m) return null;
  const t = m.totals;
  const days = [...m.days].reverse();
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const sum = (k: keyof MetricsData["days"][number]) => m.days.reduce((s, d) => s + Number(d[k]), 0);

  return (
    <Box title="📈 Métricas (14 dias)">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        {[
          ["Visitantes em 7 dias", t.visitors7, `${t.visitors30} em 30 dias`],
          ["Voltaram na semana", t.returning7, `${pct(t.returning7, t.visitors7)} dos visitantes`],
          ["Contas", t.users, `${t.active7} entraram em 7 dias`],
          ["Chars liberados", t.released, `${t.chars} cadastrados · ${t.tracked} acompanhados`],
          ["Push ligado", t.push_users, `${pct(t.push_users, t.users)} das contas`],
          ["Comentários", sum("comments"), "em 14 dias"],
          ["Fofocas / reações", `${sum("gossips")} / ${sum("reactions")}`, "em 14 dias"],
          ["Mortes / level ups", `${sum("deaths")} / ${sum("levels")}`, "da turma em 14 dias"],
        ].map(([l, v, s]) => (
          <div key={String(l)} className="border border-[#b98a5a] rounded p-2 bg-white/40">
            <div className="muted text-[11px]">{l}</div>
            <div className="font-bold text-[20px] text-[#3a1a00]">{v}</div>
            <div className="muted text-[10px]">{s}</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="muted text-[11px] mb-1">Visitantes por dia (a parte escura entrou logada)</div>
        <div className="flex items-end gap-1 h-[110px] border-b border-[#b98a5a]">
          {days.map((d) => (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end h-full"
              title={`${dm(d.day)}: ${d.visitors} visitantes, ${d.views} páginas`}
            >
              <span className="text-[9px] text-[#3a1a00]">{d.visitors || ""}</span>
              <div className="w-full rounded-t flex flex-col justify-end" style={{ height: `${(d.visitors / max) * 90}%`, background: "#d9a85a" }}>
                <div className="w-full rounded-t" style={{ height: `${d.visitors ? (d.logged / d.visitors) * 100 : 0}%`, background: "#7a4a1a" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {days.map((d) => (
            <div key={d.day} className="flex-1 text-center text-[9px] muted">
              {dm(d.day)}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_260px] mt-3">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left">
                {["Dia", "Visit.", "Págs.", "Logados", "Contas", "Coment.", "Fofocas", "Reações", "Mortes", "Levels"].map((h) => (
                  <th key={h} className="pr-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.days.map((d) => (
                <tr key={d.day} className="border-t border-[#b98a5a]/40">
                  <td className="pr-2">{dm(d.day)}</td>
                  {[d.visitors, d.views, d.logged, d.signups, d.comments, d.gossips, d.reactions, d.deaths, d.levels].map((v, i) => (
                    <td key={i} className="pr-2">
                      {v || <span className="muted">·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="muted text-[11px] mb-1">Páginas mais vistas (7 dias)</div>
          {m.pages.length === 0 ? (
            <p className="muted text-[11px]">Sem visitas registradas ainda.</p>
          ) : (
            <ol className="text-[11px] space-y-0.5">
              {m.pages.map((p) => (
                <li key={p.path} className="flex gap-2">
                  <span className="truncate flex-1" title={path(p.path)}>
                    {path(p.path)}
                  </span>
                  <b>{p.views}</b>
                  <span className="muted">({p.visitors})</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <p className="muted text-[10px] mt-2">
        Visitante = navegador (um código aleatório guardado no aparelho, sem IP e sem cookie de terceiros). Dias no horário de Brasília.
      </p>
    </Box>
  );
}
