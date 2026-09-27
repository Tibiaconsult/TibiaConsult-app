"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DeathCard from "@/components/DeathCard";
import { useMe, usePostingChar } from "@/components/Social";
import { deathKey } from "@/lib/social";
import { Gossip, ReactionMap, loadGossips } from "@/lib/social-client";
import { Death, fetchExtras, notifySocial, onSocialChange } from "@/lib/timeline";

export type { Death };

/** Lista do mural: cada morte com boato do Rashid, fofocas, F, risadas e comentários (os mesmos da Taverna). */
export default function DeathList({ deaths }: { deaths: Death[] }) {
  const me = useMe();
  const router = useRouter();
  const [charId] = usePostingChar(me);
  const [reactions, setReactions] = useState<ReactionMap>({ counts: {}, mine: {} });
  const [comments, setComments] = useState<Record<string, number>>({});
  const [gossips, setGossips] = useState<Record<string, Gossip[]>>({});

  const load = useCallback(() => {
    const keys = deaths.map((d) => deathKey(d.name, d.died_at));
    loadGossips(keys).then(async (g) => {
      const items = deaths.map((d) => {
        const key = deathKey(d.name, d.died_at);
        return { at: d.died_at, id: key, death: d, gossips: g[key] ?? [] };
      });
      const x = await fetchExtras(items, me.userId);
      setGossips(g);
      setReactions(x.reactions);
      setComments(x.comments);
    });
  }, [deaths, me.userId]);

  useEffect(() => {
    if (!me.loaded) return;
    load();
    // mortes novas chegam pelo servidor (coleta a cada 10 min): recarrega a página em silêncio de vez em quando
    let n = 0;
    return onSocialChange(() => {
      if (++n % 3 === 0) router.refresh();
      load();
    });
  }, [load, me.loaded, router]);

  return (
    <ul className="space-y-2">
      {deaths.map((d) => {
        const key = deathKey(d.name, d.died_at);
        return (
          <li key={key}>
            <DeathCard
              d={d}
              gossips={gossips[key] ?? []}
              me={me}
              charId={charId}
              reactions={reactions}
              comments={comments[key] ?? 0}
              onGossip={(g) => {
                setGossips((all) => ({ ...all, [key]: [...(all[key] ?? []), g] }));
                notifySocial();
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
