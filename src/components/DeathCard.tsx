"use client";

// Cartão de uma morte do mural: dados, boato do Rashid, fofocas, reações, "contar pro Rashid" e comentários.
// O mesmo cartão aparece no mural e no feed da Taverna, com as mesmas reações e comentários.

import Link from "next/link";
import { RashidRumor, RashidSays, TellRashid } from "@/components/Gossip";
import { CommentThread, ReactionBar, type Me } from "@/components/Social";
import { deathKey } from "@/lib/social";
import type { Gossip, ReactionMap } from "@/lib/social-client";
import type { Death } from "@/lib/timeline";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const GOLD = { color: "#f3d27a" };

export default function DeathCard({
  d,
  gossips,
  me,
  charId,
  reactions,
  comments,
  onGossip,
}: {
  d: Death;
  gossips: Gossip[];
  me: Me;
  charId: string | null;
  reactions: ReactionMap;
  comments: number;
  onGossip: (g: Gossip) => void;
}) {
  const key = deathKey(d.name, d.died_at);
  return (
    <div
      id={key}
      className="scroll-mt-24 border border-[#5a4632] rounded p-2 flex flex-wrap gap-x-3 gap-y-1 items-baseline"
      style={{ background: "#241a14", color: "#e8dcc8" }}
    >
      <span className="text-[16px]">⚰️</span>
      <Link href={`/char/${encodeURIComponent(d.name)}`} className="font-bold text-[14px]" style={GOLD}>
        {d.name}
      </Link>
      <span className="text-[12px]">
        level {d.level ?? "?"}
        {d.vocation ? ` · ${d.vocation}` : ""}
        {d.world ? ` · ${d.world}` : ""}
      </span>
      {d.guild && <span className="tag tag-ice whitespace-nowrap">🛡️ {d.guild}</span>}
      {d.by_player && <span className="tag tag-fire">PvP</span>}
      <span className="text-[11px] opacity-80 ml-auto">{when(d.died_at)}</span>
      <div className="w-full text-[12px] opacity-90">{d.reason}</div>
      <div className="w-full pt-1">
        <RashidRumor d={d} />
      </div>
      {gossips.map((g) => (
        <div key={g.id} className="w-full pt-1">
          <RashidSays g={g} me={me} map={reactions} />
        </div>
      ))}
      <div className="w-full flex flex-wrap items-start gap-3 pt-1">
        <ReactionBar type="death" targetKey={key} map={reactions} me={me} only={["f", "kkk", "palhaco"]} dark />
        <TellRashid deathKey={key} who={d.name} me={me} onSent={onGossip} />
        <div className="flex-1 min-w-[200px]">
          <CommentThread type="death" targetKey={key} count={comments} me={me} charId={charId} dark />
        </div>
      </div>
    </div>
  );
}
