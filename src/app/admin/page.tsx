import { notFound } from "next/navigation";
import Box from "@/components/Box";
import { requireAdmin } from "@/lib/admin";
import { setFeedbackStatus } from "./actions";

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
  const { data: chars } = await ctx.supabase.from("chars").select("id, name, vocation, level, world, user_id, created_at").order("created_at", { ascending: false }).limit(200);

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
        <p className="muted text-[11px] mt-2">Contas com char cadastrado: {users}. Esta página não aparece no menu e responde &quot;não encontrada&quot; para qualquer outra conta.</p>
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
