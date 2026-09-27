import Link from "next/link";
import { notFound } from "next/navigation";
import Box from "@/components/Box";
import { Profile, achievements, deathCaption, kindOf, timeAgo } from "@/lib/social";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ nome: string }> };

async function load(nome: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("char_profile", { p_name: decodeURIComponent(nome) });
  if (!data) return null;
  const p = data as Profile;
  const { data: posts } = await supabase
    .from("posts")
    .select("id, kind, hunt, body, created_at")
    .eq("char_name", p.name)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(10);
  const snaps = p.snapshots;
  const first30 = snaps.find((s) => (Date.now() - new Date(s.date).getTime()) / 86400000 <= 30);
  const gained30 = first30 ? snaps[snaps.length - 1].level - first30.level : null;
  return { p, posts: posts ?? [], gained30 };
}

export async function generateMetadata({ params }: Props) {
  const { nome } = await params;
  return { title: decodeURIComponent(nome) };
}

const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function CharProfilePage({ params }: Props) {
  const { nome } = await params;
  const r = await load(nome);
  if (!r) notFound();
  const { p, posts, gained30 } = r;
  const list = achievements(p);
  const earned = list.filter((a) => a.earned);
  return (
    <div>
      <h1>{p.name}</h1>
      <p className="on-dark mb-4">
        {p.vocation ?? "?"} · level {p.level ?? "?"}
        {p.world ? ` · ${p.world}` : ""} · ✔️ char verificado{p.verified_at ? ` desde ${date(p.verified_at)}` : ""}
      </p>

      <Box title="📋 Ficha">
        <div className="grid gap-3 sm:grid-cols-4 text-center">
          {[
            ["Level", p.level ?? "?"],
            ["Levels em 30 dias", gained30 === null ? "—" : gained30 >= 0 ? `+${gained30}` : gained30],
            ["Mortes registradas", p.deaths.length],
            ["Causos contados", p.posts],
          ].map(([l, v]) => (
            <div key={String(l)} className="border border-[#b98a5a] rounded p-3 bg-white/40">
              <div className="muted text-[11px]">{l}</div>
              <div className="font-bold text-[20px] text-[#3a1a00]">{v}</div>
            </div>
          ))}
        </div>
        <p className="muted text-[11px] mt-2">
          🪦 {p.fs} F recebidos no mural · 🤡 {p.clowns} reações de palhaço nos causos
        </p>
      </Box>

      <Box title={`🏅 Conquistas (${earned.length} de ${list.length})`}>
        <div className="grid gap-2 sm:grid-cols-2">
          {[...earned, ...list.filter((a) => !a.earned)].map((a) => (
            <div
              key={a.id}
              className="border border-[#b98a5a] rounded p-2 flex gap-2 items-start"
              style={{ background: a.earned ? "#f3d9a8" : "rgba(255,255,255,.3)", opacity: a.earned ? 1 : 0.5 }}
            >
              <span className="text-[22px]" style={{ filter: a.earned ? "none" : "grayscale(1)" }}>
                {a.emoji}
              </span>
              <div>
                <div className="font-bold text-[13px]">
                  {a.title} {!a.earned && <span className="muted text-[10px] font-normal">(bloqueada)</span>}
                </div>
                <div className="text-[11px]">{a.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Box>

      <Box title="⚰️ Últimas mortes">
        {p.deaths.length === 0 ? (
          <p className="text-[12px]">Nenhuma morte registrada. Por enquanto. 👀</p>
        ) : (
          <ul className="space-y-2">
            {p.deaths.slice(0, 10).map((d) => (
              <li key={d.died_at} className="text-[12px] border-b border-[#b98a5a]/40 pb-1">
                <b>{date(d.died_at)}</b> · level {d.level ?? "?"} {d.by_player && <span className="tag tag-fire">PvP</span>}
                <div>{d.reason}</div>
                <div className="italic muted">“{deathCaption({ name: p.name, ...d })}”</div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] mt-2">
          Deixe seu F no <Link href="/comunidade/mural">Caixão e Vela Preta</Link>.
        </p>
      </Box>

      <Box title="🍺 Causos na Taverna">
        {posts.length === 0 ? (
          <p className="text-[12px]">Ainda não contou nenhum causo.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((c) => (
              <li key={c.id} className="text-[12px] border-b border-[#b98a5a]/40 pb-1">
                {kindOf(c.kind).emoji} <b>{kindOf(c.kind).label}</b>
                {c.hunt ? ` · 📍 ${c.hunt}` : ""} <span className="muted text-[11px]">· {timeAgo(c.created_at)}</span>
                <div className="whitespace-pre-wrap break-words">{c.body}</div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] mt-2">
          Reaja e comente na <Link href="/comunidade/taverna">Taverna</Link>.
        </p>
      </Box>
    </div>
  );
}
