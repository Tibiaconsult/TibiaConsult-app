"use client";

// Peças da rede social usadas na Taverna, no mural e no perfil: reações, comentários, denúncia e escolha do char que posta.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActive } from "@/lib/active";
import { REACTIONS, ReactionId, timeAgo } from "@/lib/social";
import { Comment, ReactionMap, TargetType, addComment, hasDb, loadComments, removeRow, report, setReaction } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

export interface Me {
  userId: string | null;
  /** chars verificados da conta: só eles postam e comentam */
  chars: { id: string; name: string }[];
  isAdmin: boolean;
  loaded: boolean;
}

const NOBODY: Me = { userId: null, chars: [], isAdmin: false, loaded: false };

/** Conta logada e seus chars verificados. */
export function useMe(): Me {
  const [me, setMe] = useState<Me>(NOBODY);
  useEffect(() => {
    if (!hasDb()) return;
    const sb = createClient();
    (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return setMe({ ...NOBODY, loaded: true });
      const [{ data: chars }, { data: admin }] = await Promise.all([
        sb.from("chars").select("id, name").eq("user_id", user.id).eq("verified", true).order("name"),
        sb.rpc("is_admin"),
      ]);
      setMe({ userId: user.id, chars: (chars ?? []) as Me["chars"], isAdmin: admin === true, loaded: true });
    })();
  }, []);
  return me;
}

/** Char com que a pessoa posta: o ativo da barra do topo, se for verificado; senão o primeiro verificado. */
export function usePostingChar(me: Me): [string | null, (id: string) => void] {
  const { char } = useActive();
  const [picked, setPicked] = useState<string | null>(null);
  const valid = (id: string | null | undefined) => (id && me.chars.some((c) => c.id === id) ? id : null);
  return [valid(picked) ?? valid(char?.id) ?? me.chars[0]?.id ?? null, setPicked];
}

/** Aviso para quem ainda não pode postar, ou seletor do char quando há mais de um verificado. */
export function PostingAs({ me, charId, setCharId, dark }: { me: Me; charId: string | null; setCharId: (id: string) => void; dark?: boolean }) {
  if (!me.loaded) return null;
  const link = dark ? { color: "#f3d27a" } : undefined;
  if (!me.userId)
    return (
      <p className="text-[12px]">
        <Link href="/entrar" style={link}>
          Entre
        </Link>{" "}
        e verifique seu char para postar, comentar e reagir.
      </p>
    );
  if (!me.chars.length)
    return (
      <p className="text-[12px]">
        Para postar e comentar, verifique um char em{" "}
        <Link href="/meus-chars" style={link}>
          Meus chars
        </Link>{" "}
        (leva 1 minuto: um código no comentário do char no tibia.com). Reagir você já pode.
      </p>
    );
  if (me.chars.length === 1) return <span className="text-[11px] opacity-80">postando como {me.chars[0].name}</span>;
  return (
    <label className="text-[11px]">
      postando como{" "}
      <select value={charId ?? ""} onChange={(e) => setCharId(e.target.value)} className="text-[12px]">
        {me.chars.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

const pill = (on: boolean, dark?: boolean): React.CSSProperties => ({
  border: `1px solid ${dark ? "#5a4632" : "#b98a5a"}`,
  background: on ? (dark ? "#5a3a1a" : "#f3d9a8") : dark ? "#1b1410" : "rgba(255,255,255,.45)",
  color: "inherit",
  borderRadius: 999,
  padding: "1px 8px",
  fontSize: 12,
  cursor: "pointer",
});

/** Botões de reação com contagem. Atualiza na hora e desfaz se o banco recusar. */
export function ReactionBar({
  type,
  targetKey,
  map,
  me,
  only,
  dark,
}: {
  type: TargetType;
  targetKey: string;
  map: ReactionMap;
  me: Me;
  only?: ReactionId[];
  dark?: boolean;
}) {
  const [counts, setCounts] = useState(map.counts[targetKey] ?? {});
  const [mine, setMine] = useState<ReactionId[]>(map.mine[targetKey] ?? []);
  const [msg, setMsg] = useState<string | null>(null);
  // Chegaram contagens novas do banco: recomeça delas (ajuste durante a renderização, sem efeito).
  const [seen, setSeen] = useState(map);
  if (seen !== map) {
    setSeen(map);
    setCounts(map.counts[targetKey] ?? {});
    setMine(map.mine[targetKey] ?? []);
  }

  async function toggle(id: ReactionId) {
    if (!me.userId) return setMsg("Entre para reagir.");
    const on = !mine.includes(id);
    const apply = (sign: boolean) => {
      setMine((m) => (sign ? [...m, id] : m.filter((x) => x !== id)));
      setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + (sign ? 1 : -1)) }));
    };
    apply(on);
    const err = await setReaction(type, targetKey, id, on);
    if (err) {
      apply(!on);
      setMsg("Não deu para reagir agora.");
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {REACTIONS.filter((r) => !only || only.includes(r.id)).map((r) => (
        <button key={r.id} type="button" onClick={() => toggle(r.id)} title={r.label} style={pill(mine.includes(r.id), dark)}>
          {r.emoji} {r.id === "f" ? "F" : ""} {counts[r.id] ? <b>{counts[r.id]}</b> : null}
        </button>
      ))}
      {msg && <span className="text-[11px] opacity-80">{msg}</span>}
    </span>
  );
}

/** Denunciar um causo ou comentário. Com 3 denúncias ele some até a moderação olhar. */
export function ReportButton({ type, id, me, dark }: { type: "post" | "comment"; id: string; me: Me; dark?: boolean }) {
  const [state, setState] = useState<"idle" | "ask" | "done">("idle");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  if (!me.userId) return null;
  if (state === "done") return <span className="text-[11px] opacity-80">{msg}</span>;
  if (state === "idle")
    return (
      <button type="button" className="text-[11px] underline opacity-70" style={{ color: "inherit" }} onClick={() => setState("ask")}>
        denunciar
      </button>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-[11px]">
      <input
        value={reason}
        maxLength={200}
        onChange={(e) => setReason(e.target.value)}
        placeholder="motivo (opcional)"
        className="text-[11px] !py-0"
        style={dark ? { background: "#1b1410", color: "#e8dcc8" } : undefined}
      />
      <button
        type="button"
        style={pill(false, dark)}
        onClick={async () => {
          const err = await report(type, id, reason.trim() || null);
          setMsg(err ?? "Denúncia enviada. Obrigado!");
          setState("done");
        }}
      >
        enviar
      </button>
      <button type="button" className="underline opacity-70" style={{ color: "inherit" }} onClick={() => setState("idle")}>
        cancelar
      </button>
    </span>
  );
}

/** Tradução das mensagens do banco para o jogador. */
export function friendlyError(msg: string): string {
  if (/verifique o char|linguagem ofensiva|por hora|tente de novo|não encontrado/i.test(msg)) return msg.charAt(0).toUpperCase() + msg.slice(1) + ".";
  if (/check constraint|violates/i.test(msg)) return "Texto curto ou longo demais.";
  return `Não foi possível enviar: ${msg}`;
}

/** Comentários de um causo ou de uma morte; abre sob demanda. */
export function CommentThread({
  type,
  targetKey,
  count,
  me,
  charId,
  dark,
}: {
  type: "post" | "death";
  targetKey: string;
  count: number;
  me: Me;
  charId: string | null;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const total = list ? list.length : count;

  async function openIt() {
    setOpen(!open);
    if (!list) setList(await loadComments(type, targetKey));
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!charId || !text.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await addComment(charId, type, targetKey, text.trim());
    setBusy(false);
    if (r.error) return setMsg(friendlyError(r.error));
    setList((l) => [...(l ?? []), r.comment!]);
    setText("");
  }

  const link = dark ? { color: "#f3d27a" } : undefined;
  return (
    <div className="text-[12px]">
      <button type="button" className="underline" style={{ color: "inherit" }} onClick={openIt}>
        💬 {total ? `${total} comentário${total > 1 ? "s" : ""}` : "comentar"}
      </button>
      {open && (
        <div className="mt-2 space-y-1 pl-3" style={{ borderLeft: `2px solid ${dark ? "#5a4632" : "#b98a5a"}` }}>
          {list === null && <p className="opacity-70">carregando...</p>}
          {list?.map((c) => (
            <div key={c.id}>
              <Link href={`/char/${encodeURIComponent(c.char_name)}`} style={link} className="font-bold">
                {c.char_name}
              </Link>{" "}
              <span className="whitespace-pre-wrap break-words">{c.body}</span> <span className="text-[10px] opacity-60">{timeAgo(c.created_at)}</span>{" "}
              {me.userId === c.user_id || me.isAdmin ? (
                <button
                  type="button"
                  className="text-[10px] underline opacity-60"
                  style={{ color: "inherit" }}
                  onClick={async () => {
                    if (!confirm("Apagar este comentário?")) return;
                    if (!(await removeRow("comments", c.id))) setList((l) => (l ?? []).filter((x) => x.id !== c.id));
                  }}
                >
                  apagar
                </button>
              ) : (
                <ReportButton type="comment" id={c.id} me={me} dark={dark} />
              )}
            </div>
          ))}
          {charId ? (
            <form onSubmit={send} className="flex gap-1 pt-1">
              <input
                value={text}
                maxLength={300}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 text-[12px]"
                style={dark ? { background: "#1b1410", color: "#e8dcc8", border: "1px solid #5a4632" } : undefined}
              />
              <button type="submit" className="tc-btn !py-0.5 !px-3" disabled={busy || !text.trim()}>
                {busy ? "..." : "Enviar"}
              </button>
            </form>
          ) : (
            me.loaded && (
              <p className="opacity-80">
                {me.userId ? (
                  <>
                    Para comentar,{" "}
                    <Link href="/meus-chars" style={link}>
                      verifique um char
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    <Link href="/entrar" style={link}>
                      Entre
                    </Link>{" "}
                    para comentar.
                  </>
                )}
              </p>
            )
          )}
          {msg && <p className="bad">{msg}</p>}
        </div>
      )}
    </div>
  );
}
