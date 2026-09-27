"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RashidSays, TellRashid } from "@/components/Gossip";
import { CommentThread, ReactionBar, useMe, usePostingChar } from "@/components/Social";
import { deathCaption, deathKey } from "@/lib/social";
import { Gossip, ReactionMap, loadCommentCounts, loadGossips, loadReactions } from "@/lib/social-client";

export interface Death {
  name: string;
  world: string | null;
  vocation: string | null;
  died_at: string;
  level: number | null;
  reason: string | null;
  by_player: boolean;
  guild?: string | null;
}

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

/** Lista do mural com legenda automática, F, risadas e comentários em cada morte. */
export default function DeathList({ deaths }: { deaths: Death[] }) {
  const me = useMe();
  const [charId] = usePostingChar(me);
  const [reactions, setReactions] = useState<ReactionMap>({ counts: {}, mine: {} });
  const [comments, setComments] = useState<Record<string, number>>({});
  const [gossips, setGossips] = useState<Record<string, Gossip[]>>({});
  const [gossipReactions, setGossipReactions] = useState<ReactionMap>({ counts: {}, mine: {} });

  useEffect(() => {
    if (!me.loaded) return;
    const keys = deaths.map((d) => deathKey(d.name, d.died_at));
    Promise.all([loadReactions("death", keys, me.userId), loadCommentCounts("death", keys), loadGossips(keys)]).then(async ([r, c, g]) => {
      setReactions(r);
      setComments(c);
      setGossips(g);
      const ids = Object.values(g).flatMap((list) => list.map((x) => x.id));
      setGossipReactions(await loadReactions("gossip", ids, me.userId));
    });
  }, [deaths, me.loaded, me.userId]);

  return (
    <ul className="space-y-2">
      {deaths.map((d) => {
        const key = deathKey(d.name, d.died_at);
        return (
          <li
            key={key}
            id={key}
            className="scroll-mt-24 border border-[#5a4632] rounded p-2 flex flex-wrap gap-x-3 gap-y-1 items-baseline"
            style={{ background: "#241a14" }}
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
            <div className="w-full text-[12px] italic" style={{ color: "#d8b98a" }}>
              “{deathCaption(d)}”
            </div>
            {(gossips[key] ?? []).map((g) => (
              <div key={g.id} className="w-full pt-1">
                <RashidSays g={g} me={me} map={gossipReactions} />
              </div>
            ))}
            <div className="w-full flex flex-wrap items-start gap-3 pt-1">
              <ReactionBar type="death" targetKey={key} map={reactions} me={me} only={["f", "kkk", "palhaco"]} dark />
              <TellRashid deathKey={key} who={d.name} me={me} onSent={(g) => setGossips((all) => ({ ...all, [key]: [...(all[key] ?? []), g] }))} />
              <div className="flex-1 min-w-[200px]">
                <CommentThread type="death" targetKey={key} count={comments[key] ?? 0} me={me} charId={charId} dark />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
