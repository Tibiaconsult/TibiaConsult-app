import { notFound } from "next/navigation";
import Box from "@/components/Box";
import { requireAdmin } from "@/lib/admin";
import { moderate, setFeedbackStatus, setOptout } from "./actions";
import Metrics, { MetricsData } from "./Metrics";

export const metadata = { title: "Painel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = { bug: "Bug", inconsistencia: "Dado errado", hunt: "Hunt", funcionalidade: "Funcionalidade", outro: "Outro" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  // Para quem não é administrador, esta página simplesmente não existe.
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { status } = await searchParams;
  const filter = status && ["novo", "lido", "feito", "descartado"].includes(status) ? status : null;

  let q = ctx.supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter) q = q.eq("status", filter);
  const { data: items } = await q;
  const { data: all } = await ctx.supabase.from("feedback").select("status");
  const { data: chars } = await ctx.supabase
    .from("chars")
    .select("id, name, vocation, level, world, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Moderação: tudo que tem denúncia ou está oculto
  const { data: reports } = await ctx.supabase.from("reports").select("target_type, target_id, reason").limit(500);
  const reported = { post: new Set<string>(), comment: new Set<string>(), gossip: new Set<string>() };
  for (const r of reports ?? []) reported[r.target_type as "post" | "comment" | "gossip"]?.add(r.target_id);
  const none = "00000000-0000-0000-0000-000000000000";
  const [{ data: modPosts }, { data: modComments }, { data: modGossips }, { data: gossipAuthors }] = await Promise.all([
    ctx.supabase
      .from("posts")
      .select("id, char_name, body, hidden, created_at")
      .or(`hidden.eq.true,id.in.(${[...reported.post, "00000000-0000-0000-0000-000000000000"].join(",")})`)
      .order("created_at", { ascending: false }),
    ctx.supabase
      .from("comments")
      .select("id, char_name, body, hidden, created_at, target_type, target_key")
      .or(`hidden.eq.true,id.in.(${[...reported.comment, none].join(",")})`)
      .order("created_at", { ascending: false }),
    ctx.supabase
      .from("gossips")
      .select("id, about, body, hidden, created_at")
      .or(`hidden.eq.true,id.in.(${[...reported.gossip, none].join(",")})`)
      .order("created_at", { ascending: false }),
    ctx.supabase.rpc("admin_gossips"),
  ]);
  const authorOf = new Map(((gossipAuthors ?? []) as { id: string; author: string }[]).map((a) => [a.id, a.author]));
  const queue = [
    ...(modPosts ?? []).map((x) => ({ ...x, type: "post" as const })),
    ...(modComments ?? []).map((x) => ({ ...x, type: "comment" as const })),
    ...(modGossips ?? []).map((x) => ({
      ...x,
      char_name: `Fofoca sobre ${x.about} (contada por ${authorOf.get(x.id) ?? "?"})`,
      type: "gossip" as const,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const reasons = (type: string, id: string) => (reports ?? []).filter((r) => r.target_type === type && r.target_id === id);

  const { data: metrics } = await ctx.supabase.rpc("admin_metrics", { p_days: 14 });

  const { data: optouts } = await ctx.supabase.from("tracking_optout").select("name, created_at").order("created_at", { ascending: false });

  const count = (s: string) => (all ?? []).filter((f) => f.status === s).length;
  const users = new Set((chars ?? []).map((c) => c.user_id)).size;

  return (
    <div>
      <h1>Painel do administrador</h1>
      <Box title="Resumo">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Sugestões novas", count("novo")],
            ["Lidas", count("lido")],
            ["Feitas", count("feito")],
            ["Chars cadastrados", chars?.length ?? 0],
          ].map(([l, v]) => (
            <div key={String(l)} className="border border-[#b98a5a] rounded p-3 bg-white/40">
              <div className="muted text-[11px]">{l}</div>
              <div className="font-bold text-[20px] text-[#3a1a00]">{v}</div>
            </div>
          ))}
        </div>
        <p className="muted text-[11px] mt-2">
          Contas com char cadastrado: {users}. Esta página não aparece no menu e responde &quot;não encontrada&quot; para qualquer outra conta.
        </p>
      </Box>

      <Metrics m={(metrics as MetricsData | null) ?? null} />

      <Box title={`Moderação da comunidade (${queue.length})`}>
        {queue.length === 0 ? (
          <p className="muted">Nenhuma denúncia nem conteúdo oculto. Taverna em paz.</p>
        ) : (
          <div className="space-y-3">
            {queue.map((q) => {
              const rs = reasons(q.type, q.id);
              return (
                <div key={q.type + q.id} className="border border-[#b98a5a] rounded p-3 bg-white/40">
                  <div className="flex flex-wrap gap-2 items-center text-[11px]">
                    <span className="tag tag-physical">{q.type === "post" ? "Causo" : q.type === "gossip" ? "Fofoca" : "Comentário"}</span>
                    {q.hidden && <span className="tag tag-death">oculto</span>}
                    <b>{q.char_name}</b>
                    <span className="muted">{new Date(q.created_at).toLocaleString("pt-BR")}</span>
                    <span className="bad">
                      {rs.length} denúncia{rs.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[13px]">{q.body}</p>
                  {rs.some((r) => r.reason) && (
                    <ul className="text-[11px] muted list-disc pl-5">
                      {rs
                        .filter((r) => r.reason)
                        .map((r, i) => (
                          <li key={i}>{r.reason}</li>
                        ))}
                    </ul>
                  )}
                  <div className="flex gap-2 mt-2">
                    {(["show", "delete"] as const).map((op) => (
                      <form key={op} action={moderate}>
                        <input type="hidden" name="type" value={q.type} />
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="op" value={op} />
                        <button className={`tc-btn ${op === "delete" ? "tc-btn-danger" : ""}`}>{op === "show" ? "Liberar" : "Apagar"}</button>
                      </form>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Box>

      <Box title="Tirar char das páginas públicas">
        <p className="text-[12px] mb-2">
          Membro de guilda (ou qualquer char) que pediu para não aparecer: sai do mural, ranking, Funcionário do Mês e perfil público. Use o nome exato do
          tibia.com.
        </p>
        <form action={setOptout} className="flex flex-wrap gap-2 items-end">
          <input type="hidden" name="op" value="add" />
          <input name="name" required maxLength={40} placeholder="Nome do char" className="min-w-[220px]" />
          <button className="tc-btn tc-btn-danger">Tirar das páginas</button>
        </form>
        {(optouts ?? []).length > 0 && (
          <ul className="mt-3 space-y-1 text-[12px]">
            {(optouts ?? []).map((o) => (
              <li key={o.name} className="flex items-center gap-2">
                <b>{o.name}</b> <span className="muted">desde {new Date(o.created_at).toLocaleDateString("pt-BR")}</span>
                <form action={setOptout}>
                  <input type="hidden" name="op" value="remove" />
                  <input type="hidden" name="name" value={o.name} />
                  <button className="text-[11px] underline">devolver</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Box>

      <Box title="Sugestões e bugs">
        <div className="flex flex-wrap gap-2 mb-3">
          {["", "novo", "lido", "feito", "descartado"].map((s) => (
            <a key={s || "todos"} href={s ? `/admin?status=${s}` : "/admin"} className={`tc-btn ${filter === (s || null) ? "" : "opacity-60"}`}>
              {s || "todos"}
            </a>
          ))}
        </div>
        <div className="space-y-3">
          {(items ?? []).map((f) => (
            <div key={f.id} className="border border-[#b98a5a] rounded p-3 bg-white/40">
              <div className="flex flex-wrap gap-2 items-center text-[11px]">
                <span className="tag tag-fire">{KIND_LABEL[f.kind] ?? f.kind}</span>
                <span className="font-bold">{new Date(f.created_at).toLocaleString("pt-BR")}</span>
                <span>{f.email ?? "anônimo"}</span>
                <span className="muted">página {f.page}</span>
                <span className="muted">status: {f.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-line">{f.message}</p>
              {f.extra && <pre className="text-[11px] mt-1 whitespace-pre-wrap">{JSON.stringify(f.extra, null, 1)}</pre>}
              <form action={setFeedbackStatus} className="flex flex-wrap gap-2 items-end mt-2">
                <input type="hidden" name="id" value={f.id} />
                <select name="status" defaultValue={f.status}>
                  <option value="novo">novo</option>
                  <option value="lido">lido</option>
                  <option value="feito">feito</option>
                  <option value="descartado">descartado</option>
                </select>
                <input name="admin_note" defaultValue={f.admin_note ?? ""} placeholder="nota interna" className="flex-1 min-w-[200px]" />
                <button className="tc-btn">salvar</button>
              </form>
            </div>
          ))}
          {(items ?? []).length === 0 && <p className="muted">Nada por aqui.</p>}
        </div>
      </Box>

      <Box title="Chars cadastrados (últimos 200)">
        <table>
          <thead>
            <tr>
              <th>Char</th>
              <th>Vocação</th>
              <th>Level</th>
              <th>Mundo</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {(chars ?? []).map((c) => (
              <tr key={c.id}>
                <td className="font-bold">{c.name}</td>
                <td>{c.vocation}</td>
                <td>{c.level}</td>
                <td>{c.world ?? "-"}</td>
                <td>{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </div>
  );
}
