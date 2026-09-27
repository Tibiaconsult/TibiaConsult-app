"use client";

// Fofoca pro Rashid: o balão com a fofoca na voz dele e o formulário para contar uma.

import Link from "next/link";
import { useState } from "react";
import { ReactionBar, ReportButton, friendlyError, type Me } from "@/components/Social";
import { RumorDeath, gossipLines, rashidRumor } from "@/lib/rashid";
import { timeAgo } from "@/lib/social";
import { Gossip, ReactionMap, addGossip } from "@/lib/social-client";

/** A fofoca contada pelo Rashid. */
export function RashidSays({ g, me, map, compact }: { g: Gossip; me?: Me; map?: ReactionMap; compact?: boolean }) {
  const l = gossipLines(g);
  return (
    <div className="flex items-start gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rashid.webp" alt="Rashid" width={compact ? 32 : 44} height={compact ? 32 : 44} className="shrink-0" style={{ imageRendering: "pixelated" }} />
      <div className="relative flex-1 rounded-lg px-2 py-1.5 text-[12px] leading-snug" style={{ background: "#fff8e6", color: "#3a1a00" }}>
        <span
          aria-hidden
          className="absolute -left-1.5 top-3 w-0 h-0"
          style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #fff8e6" }}
        />
        <div>
          <b>🗣️ {l.open}</b> {l.text} <i>{l.close}</i>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] opacity-75">
          <span>
            — {l.sign} · {timeAgo(g.created_at)}
          </span>
          {me && map && (
            <span className="ml-auto flex items-center gap-2">
              <ReactionBar type="gossip" targetKey={g.id} map={map} me={me} only={["kkk", "palhaco"]} />
              <ReportButton type="gossip" id={g.id} me={me} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** O boato que o Rashid inventa para toda morte do mural. */
export function RashidRumor({ d, compact }: { d: RumorDeath; compact?: boolean }) {
  const r = rashidRumor(d);
  return (
    <div className="flex items-start gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rashid.webp" alt="Rashid" width={compact ? 32 : 44} height={compact ? 32 : 44} className="shrink-0" style={{ imageRendering: "pixelated" }} />
      <div className="relative flex-1 rounded-lg px-2 py-1.5 text-[12px] leading-snug" style={{ background: "#f3e3c3", color: "#3a1a00" }}>
        <span
          aria-hidden
          className="absolute -left-1.5 top-3 w-0 h-0"
          style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #f3e3c3" }}
        />
        <div>
          🗣️ {r.text} <i>{r.close}</i>
        </div>
        {r.ps && <div className="mt-0.5 italic">P.S.: {r.ps}</div>}
        <div className="mt-0.5 text-[10px] opacity-70">— {r.sign}</div>
      </div>
    </div>
  );
}

/** Botão "Contar pro Rashid" com o formulário da fofoca de uma morte do mural. */
export function TellRashid({ deathKey, who, me, onSent }: { deathKey: string; who: string; me: Me; onSent: (g: Gossip) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const gold = { color: "#f3d27a" };

  if (!open)
    return (
      <button type="button" className="underline text-[12px]" style={{ color: "inherit" }} onClick={() => setOpen(true)}>
        🤫 contar pro Rashid
      </button>
    );

  return (
    <div className="w-full mt-1 rounded p-2 text-[12px]" style={{ background: "#1b1410", border: "1px dashed #7a5230" }}>
      {!me.userId ? (
        <p>
          <Link href="/entrar" style={gold}>
            Entre
          </Link>{" "}
          para contar fofoca pro Rashid.
        </p>
      ) : !me.chars.length ? (
        <p>
          Para fofocar, libere seu char na comunidade (um clique em{" "}
          <Link href="/comunidade/taverna" style={gold}>
            Taverna
          </Link>
          ).
        </p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMsg(null);
            const r = await addGossip(deathKey, text.trim());
            setBusy(false);
            if (r.error) return setMsg(friendlyError(r.error));
            onSent(r.gossip!);
            setText("");
            setOpen(false);
          }}
          className="space-y-1.5"
        >
          <p>
            <b style={gold}>🤫 O que você sabe dessa morte de {who}?</b> O Rashid conta pra todo mundo e <b>não diz quem contou</b>.
          </p>
          <textarea
            value={text}
            maxLength={280}
            rows={2}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex.: tava pelado no depot conferindo o market quando o rat apareceu"
            className="w-full text-[12px]"
            style={{ background: "#241a14", color: "#e8dcc8", border: "1px solid #5a4632" }}
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="tc-btn !py-0.5 !px-3" disabled={busy || text.trim().length < 5}>
              {busy ? "Sussurrando..." : "Contar pro Rashid"}
            </button>
            <button type="button" className="underline opacity-70" style={{ color: "inherit" }} onClick={() => setOpen(false)}>
              cancelar
            </button>
            <span className="opacity-60 text-[10px] ml-auto">{text.length}/280 · zoeira sim, ofensa não</span>
          </div>
          {msg && <p className="bad">{msg}</p>}
        </form>
      )}
    </div>
  );
}
