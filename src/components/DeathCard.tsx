"use client";

// Cartão de uma morte do mural: dados, boato do Rashid, fofocas, reações, "contar pro Rashid" e comentários.
// O mesmo cartão aparece no mural e no feed da Taverna, com as mesmas reações e comentários.

import Link from "next/link";
import { RashidRumor, RashidSays, TellRashid } from "@/components/Gossip";
import { CommentThread, ReactionBar, type Me } from "@/components/Social";
import { bozoJoke } from "@/lib/bozo";
import { henricusLine } from "@/lib/henricus";
import { yasirLine } from "@/lib/yasir";
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
      {(d.month_deaths ?? 0) >= 2 && <HenricusSays name={d.name} deaths={d.month_deaths!} />}
      <YasirSays d={d} />
      <BozoSays d={d} />
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

/** O Henricus, que vende bless em Thais, comenta quem já é cliente de carteirinha (2+ mortes em 30 dias). */
function HenricusSays({ name, deaths }: { name: string; deaths: number }) {
  const l = henricusLine(name, deaths);
  return (
    <div className="w-full pt-1 flex items-start gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/henricus.webp" alt="Henricus" width={44} height={44} className="shrink-0" style={{ imageRendering: "pixelated" }} />
      <div className="relative flex-1 rounded-lg px-2 py-1.5 text-[12px] leading-snug" style={{ background: "#efe4ff", color: "#2a1640" }}>
        <span
          aria-hidden
          className="absolute -left-1.5 top-3 w-0 h-0"
          style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #efe4ff" }}
        />
        ⛪ {l.text}
        <div className="mt-0.5 text-[10px] opacity-70">
          — Henricus, vendedor de bless em Thais · {l.badge} · {deaths} mortes em 30 dias
        </div>
      </div>
    </div>
  );
}

/** Bozo, o bobo da corte de Thais: uma piada em toda morte (de monstro, de vocação ou dele mesmo). */
function BozoSays({ d }: { d: Death }) {
  const joke = bozoJoke(d);
  return (
    <div className="w-full pt-1 flex items-start gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bozo.webp" alt="Bozo" width={44} height={44} className="shrink-0" style={{ imageRendering: "pixelated" }} />
      <div className="relative flex-1 rounded-lg px-2 py-1.5 text-[12px] leading-snug" style={{ background: "#e3f4df", color: "#1d3a14" }}>
        <span
          aria-hidden
          className="absolute -left-1.5 top-3 w-0 h-0"
          style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #e3f4df" }}
        />
        🃏 {joke}
        <div className="mt-0.5 text-[10px] opacity-70">— Bozo, bobo da corte de Thais</div>
      </div>
    </div>
  );
}

/** Yasir, o mercador oriental: aparece de vez em quando, fala na língua dele e o Rashid traduz. */
function YasirSays({ d }: { d: Death }) {
  const l = yasirLine(d);
  if (!l) return null;
  return (
    <div className="w-full pt-1 flex items-start gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/yasir.webp" alt="Yasir" width={44} height={44} className="shrink-0" style={{ imageRendering: "pixelated" }} />
      <div className="relative flex-1 rounded-lg px-2 py-1.5 text-[12px] leading-snug" style={{ background: "#ffe9cc", color: "#4a2600" }}>
        <span
          aria-hidden
          className="absolute -left-1.5 top-3 w-0 h-0"
          style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #ffe9cc" }}
        />
        🐪 <b>{l.yasir}</b> <span className="italic">(Rashid traduz: “{l.pt}”)</span>
        <div className="mt-0.5 text-[10px] opacity-70">— Yasir, mercador oriental, de passagem pelo porto</div>
      </div>
    </div>
  );
}
