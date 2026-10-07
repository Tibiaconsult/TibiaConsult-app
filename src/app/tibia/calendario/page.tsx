import Link from "next/link";
import Box from "@/components/Box";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { SS_NOTE, TibiaEvent, day, eventInfo, fmtDay, withAnnounced } from "@/lib/tibiaEvents";

export const metadata = { title: "Calendário de eventos do Tibia" };
export const dynamic = "force-dynamic";

const WEEK = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Mês pedido (?mes=2026-10) ou o atual, no horário de Brasília; até 12 meses para a frente e para trás. */
function monthOf(mes: string | undefined) {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const cur = today.slice(0, 7);
  const ok = mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? mes : cur;
  const [y, m] = ok.split("-").map(Number);
  const shift = (k: number) => {
    const t = new Date(y, m - 1 + k, 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
  };
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  // grade de segunda a domingo
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const cells: string[] = [];
  for (const d = new Date(gridStart); d <= last || cells.length % 7; d.setDate(d.getDate() + 1)) cells.push(iso(d));
  const label = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase());
  return { key: ok, today, prev: shift(-1), next: shift(1), first: iso(first), last: iso(last), cells, label, month: m };
}

type News = { id: number; date: string; title: string; type: string };

async function load(from: string, to: string, today: string) {
  if (!hasSupabaseEnv()) return { month: [] as TibiaEvent[], soon: [] as TibiaEvent[], news: [] as News[] };
  const supabase = await createClient();
  const [a, b, c] = await Promise.all([
    supabase.from("tibia_events").select("id, name, start_date, end_date, tentative").lte("start_date", to).gte("end_date", from).order("start_date"),
    supabase.from("tibia_events").select("id, name, start_date, end_date, tentative").gte("end_date", today).order("start_date").limit(14),
    supabase.from("tibia_news").select("id, date, title, type").neq("type", "ticker").order("date", { ascending: false }).limit(5),
  ]);
  return { month: withAnnounced((a.data ?? []) as TibiaEvent[], from, to), soon: withAnnounced((b.data ?? []) as TibiaEvent[], today), news: (c.data ?? []) as News[] };
}

export default async function CalendarioPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams;
  const mo = monthOf(mes);
  const { month, soon, news } = await load(mo.cells[0], mo.cells[mo.cells.length - 1], mo.today);
  const now = soon.filter((e) => e.start_date <= mo.today && !e.tentative);
  const next = soon.filter((e) => e.start_date > mo.today).slice(0, 8);
  const daysTo = (d: string) => Math.round((day(d).getTime() - day(mo.today).getTime()) / 86400000);

  return (
    <div>
      <h1>Calendário do Tibia</h1>
      <p className="on-dark mb-4">
        Eventos oficiais do Tibia: XP e skill em dobro, respawn rápido, eventos de temporada e mudanças de mundo. Atualiza sozinho todo dia com a TibiaWiki.
      </p>

      <div className="grid gap-3 md:grid-cols-2 mb-3 items-start">
        <Box title="🟢 Acontecendo agora">
          {now.length === 0 ? (
            <p className="text-[12px]">Nenhum evento no momento. Aproveita pra caçar em paz.</p>
          ) : (
            <ul className="space-y-1 text-[12px]">
              {now.map((e) => {
                const i = eventInfo(e.name);
                return (
                  <li key={e.id}>
                    {i.emoji} <b>{i.pt}</b> <span className="muted">até {fmtDay(e.end_date)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Box>
        <Box title="⏳ Próximos eventos">
          <ul className="space-y-1 text-[12px]">
            {next.map((e) => {
              const i = eventInfo(e.name);
              const n = daysTo(e.start_date);
              return (
                <li key={e.id}>
                  {i.emoji} <b>{i.pt}</b>{" "}
                  <span className="muted">
                    {fmtDay(e.start_date)} a {fmtDay(e.end_date)} · {n === 1 ? "amanhã" : `em ${n} dias`}
                  </span>
                  {e.tentative && <span className="tag tag-physical ml-1">previsão</span>}
                </li>
              );
            })}
          </ul>
        </Box>
      </div>

      <section className="tc-panel">
        <div className="tc-title flex items-center justify-between">
          <Link href={`/tibia/calendario?mes=${mo.prev}`} className="text-[13px] !text-inherit no-underline">
            ◀
          </Link>
          <span>{mo.label}</span>
          <Link href={`/tibia/calendario?mes=${mo.next}`} className="text-[13px] !text-inherit no-underline">
            ▶
          </Link>
        </div>
        <div className="tc-box !p-1 sm:!p-2">
          <div className="grid grid-cols-7 gap-[2px] text-[10px] sm:text-[11px]">
            {WEEK.map((w) => (
              <div key={w} className="text-center font-bold py-1 bg-[#5a3a1e] text-[#f3e3c3] rounded-sm">
                {w}
              </div>
            ))}
            {mo.cells.map((c) => {
              const inMonth = Number(c.slice(5, 7)) === mo.month;
              const evs = month.filter((e) => e.start_date <= c && e.end_date >= c);
              const isToday = c === mo.today;
              return (
                <div
                  key={c}
                  className="min-h-[64px] sm:min-h-[92px] rounded-sm p-[2px] sm:p-1"
                  style={{
                    background: isToday ? "#fff1c4" : inMonth ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.06)",
                    outline: isToday ? "2px solid #c98a1a" : "1px solid rgba(185,138,90,.4)",
                    opacity: inMonth ? 1 : 0.55,
                  }}
                >
                  <div className="font-bold text-[11px] text-[#3a1a00]">{Number(c.slice(8, 10))}</div>
                  <div className="space-y-[2px]">
                    {evs.map((e) => {
                      const i = eventInfo(e.name);
                      const starts = e.start_date === c;
                      return (
                        <div
                          key={e.id}
                          title={`${e.name} · ${fmtDay(e.start_date)} a ${fmtDay(e.end_date)}${e.tentative ? " (previsão)" : ""}`}
                          className="truncate rounded-sm px-1 leading-[15px] text-white"
                          style={{ background: i.color, opacity: e.tentative ? 0.7 : 1, border: e.tentative ? "1px dashed #fff" : undefined }}
                        >
                          {i.emoji}
                          <span className="hidden sm:inline"> {starts || c.endsWith("-01") || c === mo.cells[0] ? i.pt : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px]">
            {[...new Map(month.map((e) => [e.name, e])).values()].map((e) => {
              const i = eventInfo(e.name);
              return (
                <span key={e.name} className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: i.color }} /> {i.emoji} {i.pt}
                  <span className="muted">({e.name})</span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <Box title="📰 Últimas do tibia.com">
          <ul className="text-[12px] space-y-0.5">
            {news.map((n) => (
              <li key={n.id}>
                <span className="muted">{fmtDay(n.date)}</span> · <Link href={`/tibia/noticias#n${n.id}`}>{n.title}</Link>
              </li>
            ))}
          </ul>
          <p className="text-[11px] mt-1">
            <Link href="/tibia/noticias">Todas as notícias</Link>
          </p>
        </Box>
      )}

      <ul className="on-dark muted text-[11px] list-disc pl-5 space-y-0.5">
        <li>{SS_NOTE}</li>
        <li>
          &quot;Previsão&quot;: XP em dobro e respawn rápido costumam seguir um ciclo, mas a data só é certa quando a CipSoft anuncia. Veja as{" "}
          <Link href="/tibia/noticias">notícias do Tibia</Link>.
        </li>
        <li>Datas pela TibiaWiki (tibia.fandom.com), atualizadas todo dia. Tibia é marca da CipSoft GmbH.</li>
      </ul>
    </div>
  );
}
