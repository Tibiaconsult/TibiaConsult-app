"use client";

// Marco de level na Taverna (de 50 em 50): o Rashid comemora, a galera reage e comenta.

import Link from "next/link";
import { CommentThread, ReactionBar, type Me } from "@/components/Social";
import { LevelUp, levelKey, levelLine } from "@/lib/levelup";
import { timeAgo } from "@/lib/social";
import type { ReactionMap } from "@/lib/social-client";

const GOLD = { color: "#f3d27a" };

export default function LevelCard({
  u,
  me,
  charId,
  reactions,
  comments,
}: {
  u: LevelUp;
  me: Me;
  charId: string | null;
  reactions: ReactionMap;
  comments: number;
}) {
  const key = levelKey(u.name, u.level);
  const mark = u.milestone ?? u.level;
  return (
    <div
      id={key}
      className="scroll-mt-24 border border-[#8a6a2a] rounded p-2 flex flex-wrap gap-x-3 gap-y-1 items-baseline"
      style={{ background: "linear-gradient(#3a2a10, #241a14)", color: "#e8dcc8" }}
    >
      <span className="text-[16px]">🎉</span>
      <Link href={`/char/${encodeURIComponent(u.name)}`} className="font-bold text-[14px]" style={GOLD}>
        {u.name}
      </Link>
      <span className="text-[12px]">
        chegou no <b style={GOLD}>level {mark}</b>
        {u.vocation ? ` · ${u.vocation}` : ""}
        {u.world ? ` · ${u.world}` : ""}
      </span>
      {u.guild && <span className="tag tag-ice whitespace-nowrap">🛡️ {u.guild}</span>}
      <span className="text-[11px] opacity-80 ml-auto">{timeAgo(u.at)}</span>
      <div className="w-full pt-1 flex items-start gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rashid.webp" alt="Rashid" width={44} height={44} className="shrink-0" style={{ imageRendering: "pixelated" }} />
        <div className="relative flex-1 rounded-lg px-2 py-1.5 text-[12px] leading-snug" style={{ background: "#fff3c4", color: "#3a2a00" }}>
          <span
            aria-hidden
            className="absolute -left-1.5 top-3 w-0 h-0"
            style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #fff3c4" }}
          />
          🍻 {levelLine({ ...u, level: mark })}
          <div className="mt-0.5 text-[10px] opacity-70">
            — Rashid, erguendo a caneca · subiu do {u.from_level} para o {u.level}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-wrap items-start gap-3 pt-1">
        <ReactionBar type="level" targetKey={key} map={reactions} me={me} only={["loot", "kkk", "palhaco"]} dark />
        <div className="flex-1 min-w-[200px]">
          <CommentThread type="level" targetKey={key} count={comments} me={me} charId={charId} dark />
        </div>
      </div>
    </div>
  );
}
