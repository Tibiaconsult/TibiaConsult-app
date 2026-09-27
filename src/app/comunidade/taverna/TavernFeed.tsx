"use client";

// Feed da Taverna: as mortes do mural comentadas pelos NPCs (boato do Rashid, Henricus para os clientes de carteirinha,
// fofocas contadas pro Rashid) e pelas pessoas. É a mesma linha do tempo do banner do Rashid; recarrega sozinha.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Box from "@/components/Box";
import DeathCard from "@/components/DeathCard";
import HenricusBoard from "@/components/HenricusBoard";
import { ReleaseChar, useMe, usePostingChar } from "@/components/Social";
import { ReactionMap } from "@/lib/social-client";
import { TimelineItem, fetchExtras, fetchTimeline, notifySocial, onSocialChange } from "@/lib/timeline";

const EMPTY: ReactionMap = { counts: {}, mine: {} };

export default function TavernFeed({ guilds }: { guilds: string[] }) {
  const me = useMe();
  const [charId] = usePostingChar(me);
  const [guild, setGuild] = useState<string | null>(null);
  const [items, setItems] = useState<TimelineItem[] | null>(null);
  const [reactions, setReactions] = useState<ReactionMap>(EMPTY);
  const [comments, setComments] = useState<Record<string, number>>({});

  const load = useCallback(
    (alive: () => boolean = () => true) =>
      fetchTimeline(guild).then(async (list) => {
        const x = await fetchExtras(list, me.userId);
        if (!alive()) return;
        setItems(list);
        setReactions(x.reactions);
        setComments(x.comments);
      }),
    [guild, me.userId],
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

  return (
    <>
      {me.loaded && !charId && (
        <Box title="💬 Quer comentar?">
          <ReleaseChar me={me} />
        </Box>
      )}
      {guilds.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {[null, ...guilds].map((g) => (
            <button key={g ?? "todas"} type="button" className={`tc-btn !py-0.5 !px-3 ${guild === g ? "" : "opacity-60"}`} onClick={() => setGuild(g)}>
              {g ? `🛡️ ${g}` : "Todas as mortes"}
            </button>
          ))}
        </div>
      )}
      <Box title="🍺 Na mesa da Taverna">
        {items === null ? (
          <p className="muted">Abrindo a taverna...</p>
        ) : items.length === 0 ? (
          <p className="text-[13px]">Ninguém morreu ainda. Os NPCs estão entediados.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
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
            ))}
          </ul>
        )}
      </Box>
      <HenricusBoard />
      <p className="on-dark muted text-[11px]">
        As mortes vêm do mural (membros das guildas e chars liberados). Os comentários dos NPCs são zoeira, boato não confirmado. Zoeira sim, ofensa não: três
        denúncias escondem o conteúdo até a moderação olhar. Veja os <Link href="/termos#comunidade">termos</Link>.
      </p>
    </>
  );
}
