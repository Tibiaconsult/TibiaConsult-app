"use client";

// Feed da Taverna: causos dos jogadores e mortes do mural (com boato do Rashid e fofocas) numa linha do tempo só.
// É a mesma linha do tempo do banner do Rashid; recarrega sozinha e quando alguém posta.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Box from "@/components/Box";
import DeathCard from "@/components/DeathCard";
import HenricusBoard from "@/components/HenricusBoard";
import { CommentThread, PostingAs, ReactionBar, ReportButton, friendlyError, useMe, usePostingChar } from "@/components/Social";
import { POST_KINDS, PostKind, kindOf, timeAgo } from "@/lib/social";
import { ReactionMap, removeRow } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";
import { Post, TimelineFilter, TimelineItem, fetchExtras, fetchTimeline, notifySocial, onSocialChange } from "@/lib/timeline";

const EMPTY: ReactionMap = { counts: {}, mine: {} };

const FILTERS: { id: TimelineFilter; label: string }[] = [
  { id: null, label: "Tudo" },
  { id: "mortes", label: "💀 Mortes do mural" },
  ...POST_KINDS.map((k) => ({ id: k.id as TimelineFilter, label: `${k.emoji} ${k.label}` })),
];

export default function TavernFeed() {
  const me = useMe();
  const [charId, setCharId] = usePostingChar(me);
  const [filter, setFilter] = useState<TimelineFilter>(null);
  const [items, setItems] = useState<TimelineItem[] | null>(null);
  const [reactions, setReactions] = useState<ReactionMap>(EMPTY);
  const [comments, setComments] = useState<Record<string, number>>({});

  const load = useCallback(
    (alive: () => boolean = () => true) =>
      fetchTimeline(filter).then(async (list) => {
        const x = await fetchExtras(list, me.userId);
        if (!alive()) return;
        setItems(list);
        setReactions(x.reactions);
        setComments(x.comments);
      }),
    [filter, me.userId],
  );

  useEffect(() => {
    if (!me.loaded) return;
    let alive = true;
    load(() => alive);
    const off = onSocialChange(() => load(() => alive));
    return () => {
      alive = false;
      off();
    };
  }, [load, me.loaded]);

  const title = filter === null ? "🍺 Na mesa da Taverna" : (FILTERS.find((f) => f.id === filter)?.label ?? "");

  return (
    <>
      <Composer me={me} charId={charId} setCharId={setCharId} onPosted={() => notifySocial()} />
      <HenricusBoard />
      <div className="flex flex-wrap gap-1 mb-3">
        {FILTERS.map((f) => (
          <button key={f.id ?? "tudo"} type="button" className={`tc-btn !py-0.5 !px-3 ${filter === f.id ? "" : "opacity-60"}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <Box title={title}>
        {items === null ? (
          <p className="muted">Abrindo a taverna...</p>
        ) : items.length === 0 ? (
          <p className="text-[13px]">Nada por aqui ainda. A primeira rodada é sua: conta aí o que aconteceu na última hunt.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) =>
              it.type === "death" ? (
                <li key={it.id}>
                  <DeathCard
                    d={it.death}
                    gossips={it.gossips}
                    me={me}
                    charId={charId}
                    reactions={reactions}
                    comments={comments[it.id] ?? 0}
                    onGossip={() => notifySocial()}
                  />
                </li>
              ) : (
                <li key={it.id}>
                  <PostCard p={it.post} me={me} charId={charId} reactions={reactions} comments={comments[it.id] ?? 0} onRemoved={() => notifySocial()} />
                </li>
              ),
            )}
          </ul>
        )}
      </Box>
      <p className="on-dark muted text-[11px]">
        As mortes vêm do mural (membros das guildas e chars liberados) com o boato do Rashid. Zoeira sim, ofensa não: três denúncias escondem o conteúdo até a
        moderação olhar. Veja os <Link href="/termos#comunidade">termos</Link>.
      </p>
    </>
  );
}

function PostCard({
  p,
  me,
  charId,
  reactions,
  comments,
  onRemoved,
}: {
  p: Post;
  me: ReturnType<typeof useMe>;
  charId: string | null;
  reactions: ReactionMap;
  comments: number;
  onRemoved: () => void;
}) {
  const k = kindOf(p.kind);
  return (
    <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
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
                if (!(await removeRow("posts", p.id))) onRemoved();
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
        <CommentThread type="post" targetKey={p.id} count={comments} me={me} charId={charId} />
      </div>
    </div>
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
