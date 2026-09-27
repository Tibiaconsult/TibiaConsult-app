"use client";

// "O Rashid tá sabendo...": fofocas contadas pelos jogadores e os boatos que o Rashid inventa das mortes mais recentes.

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@/components/Box";
import { RashidRumor, RashidSays } from "@/components/Gossip";
import type { RumorDeath } from "@/lib/rashid";
import { deathKey } from "@/lib/social";
import { Gossip, hasDb, recentGossips } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

type Item = { at: string; key: string; gossip?: Gossip; death?: RumorDeath };

export async function recentDeaths(n: number): Promise<RumorDeath[]> {
  if (!hasDb()) return [];
  const { data } = await createClient().rpc("death_wall", { p_limit: n });
  return (data ?? []) as RumorDeath[];
}

export default function GossipBoard() {
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    Promise.all([recentGossips(4), recentDeaths(4)]).then(([gs, ds]) => {
      const list: Item[] = [
        ...gs.map((g) => ({ at: g.created_at, key: g.death_key, gossip: g })),
        ...ds.map((d) => ({ at: d.died_at, key: deathKey(d.name, d.died_at), death: d })),
      ];
      setItems(list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5));
    });
  }, []);
  if (items === null) return null;
  return (
    <Box title="🗣️ O Rashid tá sabendo...">
      {items.length === 0 ? (
        <p className="text-[12px]">Nenhuma morte no mural ainda. O Rashid está entediado.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={(it.gossip?.id ?? "") + it.key}>
              {it.gossip ? <RashidSays g={it.gossip} compact /> : <RashidRumor d={it.death!} compact />}
              <Link href={`/comunidade/mural#${encodeURIComponent(it.key)}`} className="text-[11px] ml-10">
                ver a morte no mural →
              </Link>
            </div>
          ))}
          <p className="muted text-[11px]">
            Sabe a história de verdade? No mural, clique em &quot;🤫 contar pro Rashid&quot; na morte: ele espalha sem dizer quem contou.
          </p>
        </div>
      )}
    </Box>
  );
}
