"use client";

// "O Rashid tá sabendo...": as últimas fofocas, com link para a morte no mural.

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@/components/Box";
import { RashidSays } from "@/components/Gossip";
import { Gossip, recentGossips } from "@/lib/social-client";

export default function GossipBoard() {
  const [list, setList] = useState<Gossip[] | null>(null);
  useEffect(() => {
    recentGossips(5).then(setList);
  }, []);
  if (list === null) return null;
  return (
    <Box title="🗣️ O Rashid tá sabendo...">
      {list.length === 0 ? (
        <p className="text-[12px]">
          Nenhuma fofoca ainda. Viu uma morte patética no <Link href="/comunidade/mural">Caixão e Vela Preta</Link>? Clique em &quot;🤫 contar pro Rashid&quot;
          e ele espalha, sem dizer quem contou.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((g) => (
            <div key={g.id}>
              <RashidSays g={g} compact />
              <Link href={`/comunidade/mural#${encodeURIComponent(g.death_key)}`} className="text-[11px] ml-10">
                ver a morte no mural →
              </Link>
            </div>
          ))}
          <p className="muted text-[11px]">Sabe de alguma? No mural, clique em &quot;🤫 contar pro Rashid&quot; na morte.</p>
        </div>
      )}
    </Box>
  );
}
