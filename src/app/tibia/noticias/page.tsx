import Link from "next/link";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { NEWS_CATEGORY, cleanNewsHtml } from "@/lib/tibiaEvents";

export const metadata = { title: "Notícias do Tibia" };
export const dynamic = "force-dynamic";

interface News {
  id: number;
  date: string;
  title: string;
  category: string | null;
  type: string | null;
  url: string | null;
  content_html: string | null;
}

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const text = (html: string | null) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default async function NoticiasPage() {
  let list: News[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tibia_news")
      .select("id, date, title, category, type, url, content_html")
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .limit(80);
    list = (data ?? []) as News[];
  }
  const news = list.filter((n) => n.type !== "ticker");
  const ticker = list.filter((n) => n.type === "ticker").slice(0, 25);

  return (
    <div>
      <h1>Notícias do Tibia</h1>
      <p className="on-dark mb-4">
        As notícias oficiais do tibia.com, no original em inglês, atualizadas sozinhas a cada 2 horas. Os eventos anunciados entram também no{" "}
        <Link href="/tibia/calendario">calendário</Link>.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {news.length === 0 && <p className="on-dark">Buscando as notícias...</p>}
          {news.map((n, i) => {
            const c = NEWS_CATEGORY[n.category ?? ""] ?? { pt: n.category ?? "Notícia", emoji: "📰" };
            return (
              <section key={n.id} className="tc-panel">
                <div className="tc-title text-left flex flex-wrap items-baseline gap-x-2">
                  <span>
                    {c.emoji} {n.title}
                  </span>
                </div>
                <div className="tc-box">
                  <div className="flex flex-wrap gap-2 items-center text-[11px] mb-1">
                    <span className="tag tag-physical">{c.pt}</span>
                    <span className="muted">{fmt(n.date)}</span>
                    {n.url && (
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
                        abrir no tibia.com ↗
                      </a>
                    )}
                  </div>
                  {n.content_html ? (
                    <details open={i < 2} className="tc-news">
                      <summary className="cursor-pointer text-[12px] font-bold text-[#1a3f8f]">{i < 2 ? "Notícia completa" : "Ler notícia"}</summary>
                      <div className="text-[13px] leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: cleanNewsHtml(n.content_html) }} />
                    </details>
                  ) : (
                    <p className="muted text-[12px]">O texto completo chega na próxima atualização.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <aside>
          <section className="tc-panel">
            <div className="tc-title">📢 Ticker</div>
            <div className="tc-box">
              <ul className="space-y-2 text-[12px]">
                {ticker.map((n) => (
                  <li key={n.id} className="border-b border-[#b98a5a]/40 pb-1.5">
                    <div className="muted text-[10px]">
                      {fmt(n.date)} · {(NEWS_CATEGORY[n.category ?? ""] ?? { pt: "" }).pt}
                    </div>
                    {text(n.content_html) || n.title}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>
      </div>
      <p className="on-dark muted text-[11px]">Fonte: tibia.com, pela API pública do TibiaData. Tibia é marca da CipSoft GmbH.</p>
    </div>
  );
}
