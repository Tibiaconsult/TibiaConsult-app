"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@/components/Box";
import { CommentThread, PostingAs, ReactionBar, ReportButton, friendlyError, useMe, usePostingChar } from "@/components/Social";
import { POST_KINDS, PostKind, kindOf, timeAgo } from "@/lib/social";
import { ReactionMap, hasDb, loadCommentCounts, loadReactions, removeRow } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  user_id: string;
  char_name: string;
  char_vocation: string | null;
  char_level: number | null;
  char_world: string | null;
  kind: PostKind;
  hunt: string | null;
  body: string;
  hidden: boolean;
  created_at: string;
}

const EMPTY: ReactionMap = { counts: {}, mine: {} };

/** Últimos 50 causos (do tipo escolhido) com reações e número de comentários. */
async function fetchFeed(filter: PostKind | null, userId: string | null) {
  let posts: Post[] = [];
  if (hasDb()) {
    let q = createClient()
      .from("posts")
      .select("id, user_id, char_name, char_vocation, char_level, char_world, kind, hunt, body, hidden, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (filter) q = q.eq("kind", filter);
    posts = ((await q).data ?? []) as Post[];
  }
  const keys = posts.map((p) => p.id);
  const [reactions, comments] = await Promise.all([loadReactions("post", keys, userId), loadCommentCounts("post", keys)]);
  return { posts, reactions, comments };
}

export default function TavernFeed() {
  const me = useMe();
  const [charId, setCharId] = usePostingChar(me);
  const [filter, setFilter] = useState<PostKind | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [reactions, setReactions] = useState<ReactionMap>(EMPTY);
  const [comments, setComments] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!me.loaded && hasDb()) return;
    let alive = true;
    fetchFeed(filter, me.userId).then((f) => {
      if (!alive) return;
      setPosts(f.posts);
      setReactions(f.reactions);
      setComments(f.comments);
    });
    return () => {
      alive = false;
    };
  }, [filter, me.loaded, me.userId]);

  return (
    <>
      <Composer me={me} charId={charId} setCharId={setCharId} onPosted={(p) => setPosts((l) => [p, ...(l ?? [])])} />
      <div className="flex flex-wrap gap-1 mb-3">
        <button type="button" className={`tc-btn !py-0.5 !px-3 ${filter ? "opacity-60" : ""}`} onClick={() => setFilter(null)}>
          Todos
        </button>
        {POST_KINDS.map((k) => (
          <button key={k.id} type="button" className={`tc-btn !py-0.5 !px-3 ${filter === k.id ? "" : "opacity-60"}`} onClick={() => setFilter(k.id)}>
            {k.emoji} {k.label}
          </button>
        ))}
      </div>
      <Box title={filter ? `${kindOf(filter).emoji} ${kindOf(filter).label}` : "🍺 Últimos causos"}>
        {posts === null ? (
          <p className="muted">Abrindo a taverna...</p>
        ) : posts.length === 0 ? (
          <p className="text-[13px]">Nenhum causo ainda. A primeira rodada é sua: conta aí o que aconteceu na última hunt.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => {
              const k = kindOf(p.kind);
              return (
                <li key={p.id} className="border border-[#b98a5a] rounded p-3 bg-white/40">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12px]">
                    <span className="text-[18px]">{k.emoji}</span>
                    <Link href={`/char/${encodeURIComponent(p.char_name)}`} className="font-bold text-[14px]">
                      {p.char_name}
                    </Link>
                    <span className="muted">
                      {p.char_level ? `level ${p.char_level}` : ""}
                      {p.char_vocation ? ` · ${p.char_vocation}` : ""}
                      {p.char_world ? ` · ${p.char_world}` : ""}
                    </span>
                    <span className="tag tag-physical">{k.label}</span>
                    {p.hunt && <span className="tag tag-earth">📍 {p.hunt}</span>}
                    {p.hidden && <span className="tag tag-death">oculto: em análise</span>}
                    <span className="muted ml-auto text-[11px]">{timeAgo(p.created_at)}</span>
                  </div>
                  <p className="text-[13px] my-2 whitespace-pre-wrap break-words">{p.body}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <ReactionBar type="post" targetKey={p.id} map={reactions} me={me} />
                    <span className="ml-auto flex gap-2">
                      {me.userId === p.user_id || me.isAdmin ? (
                        <button
                          type="button"
                          className="text-[11px] underline opacity-70"
                          onClick={async () => {
                            if (!confirm("Apagar este causo?")) return;
                            if (!(await removeRow("posts", p.id))) setPosts((l) => (l ?? []).filter((x) => x.id !== p.id));
                          }}
                        >
                          apagar
                        </button>
                      ) : (
                        <ReportButton type="post" id={p.id} me={me} />
                      )}
                    </span>
                  </div>
                  <div className="mt-2">
                    <CommentThread type="post" targetKey={p.id} count={comments[p.id] ?? 0} me={me} charId={charId} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Box>
      <p className="on-dark muted text-[11px]">
        Regras da casa: zoeira sim, ofensa não. Três denúncias escondem o causo até a moderação olhar. Veja os <Link href="/termos#comunidade">termos</Link>.
      </p>
    </>
  );
}

function Composer({
  me,
  charId,
  setCharId,
  onPosted,
}: {
  me: ReturnType<typeof useMe>;
  charId: string | null;
  setCharId: (id: string) => void;
  onPosted: (p: Post) => void;
}) {
  const [kind, setKind] = useState<PostKind>("morte");
  const [hunt, setHunt] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!charId) return;
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient()
      .from("posts")
      .insert({ char_id: charId, kind, hunt: hunt.trim() || null, body: body.trim() })
      .select("id, user_id, char_name, char_vocation, char_level, char_world, kind, hunt, body, hidden, created_at")
      .single();
    setBusy(false);
    if (error) return setMsg({ ok: false, text: friendlyError(error.message) });
    onPosted(data as Post);
    setBody("");
    setHunt("");
    setMsg({ ok: true, text: "Causo na mesa! 🍺" });
  }

  return (
    <Box title="✍️ Contar um causo">
      <PostingAs me={me} charId={charId} setCharId={setCharId} />
      {charId && (
        <form onSubmit={submit} className="space-y-2 mt-2">
          <div className="flex flex-wrap gap-1">
            {POST_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                title={k.hint}
                onClick={() => setKind(k.id)}
                className="text-[12px] rounded px-2 py-0.5 border border-[#b98a5a]"
                style={{ background: kind === k.id ? "#f3d9a8" : "rgba(255,255,255,.45)", fontWeight: kind === k.id ? "bold" : "normal" }}
              >
                {k.emoji} {k.label}
              </button>
            ))}
          </div>
          <p className="muted text-[11px]">{kindOf(kind).hint}</p>
          <input
            value={hunt}
            maxLength={80}
            onChange={(e) => setHunt(e.target.value)}
            placeholder="Onde? (opcional: hunt, quest, boss)"
            className="w-full text-[12px]"
          />
          <textarea
            value={body}
            maxLength={500}
            rows={3}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Conta aí... (até 500 caracteres)"
            className="w-full text-[13px]"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="tc-btn" disabled={busy || body.trim().length < 3}>
              {busy ? "Enviando..." : "Publicar"}
            </button>
            <span className="muted text-[11px]">{body.length}/500</span>
            {msg && <span className={`text-[12px] ${msg.ok ? "good" : "bad"}`}>{msg.text}</span>}
          </div>
        </form>
      )}
    </Box>
  );
}
