// Linha do tempo da Taverna: as mortes do mural, com o boato do Rashid, o Henricus e as fofocas, da mais recente para a mais antiga.
// A mesma função alimenta o feed da Taverna e o banner do Rashid, então os dois mostram sempre a mesma coisa no topo.
// Uma fofoca nova "sobe" a morte para o topo, como um tópico respondido.

import { deathKey } from "@/lib/social";
import { Gossip, ReactionMap, hasDb, loadCommentCounts, loadGossips, loadReactions } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

export interface Death {
  name: string;
  world: string | null;
  vocation: string | null;
  died_at: string;
  level: number | null;
  reason: string | null;
  by_player: boolean;
  guild?: string | null;
  /** mortes do char nos últimos 30 dias (o Henricus comenta a partir de 2) */
  month_deaths?: number;
}

export interface TimelineItem {
  at: string;
  id: string;
  death: Death;
  gossips: Gossip[];
}

/** Mortes do mural (todas ou de uma guilda) com as fofocas, na ordem da Taverna. */
export async function fetchTimeline(guild: string | null = null, size = 60): Promise<TimelineItem[]> {
  if (!hasDb()) return [];
  const { data } = await createClient().rpc("death_wall", { p_limit: 100, p_guild: guild });
  const deaths = (data ?? []) as Death[];
  const gossips = await loadGossips(deaths.map((d) => deathKey(d.name, d.died_at)));
  return deaths
    .map((d) => {
      const key = deathKey(d.name, d.died_at);
      const gs = gossips[key] ?? [];
      const at = [d.died_at, ...gs.map((g) => g.created_at)].sort().at(-1)!;
      return { at: new Date(at).toISOString(), id: key, death: d, gossips: gs };
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, size);
}

/** Reações (mortes e fofocas) e número de comentários das mortes visíveis. As chaves não se repetem entre os tipos. */
export async function fetchExtras(items: TimelineItem[], userId: string | null): Promise<{ reactions: ReactionMap; comments: Record<string, number> }> {
  const deathKeys = items.map((i) => i.id);
  const gossipIds = items.flatMap((i) => i.gossips.map((g) => g.id));
  const [rd, rg, cd] = await Promise.all([
    loadReactions("death", deathKeys, userId),
    loadReactions("gossip", gossipIds, userId),
    loadCommentCounts("death", deathKeys),
  ]);
  return { reactions: { counts: { ...rd.counts, ...rg.counts }, mine: { ...rd.mine, ...rg.mine } }, comments: cd };
}

// ---------------------------------------------------------------- sincronia entre as partes da página

const EVENT = "tc-social";

/** Avise que algo mudou (fofoca, comentário): Taverna, mural e banner recarregam na hora. */
export const notifySocial = () => window.dispatchEvent(new Event(EVENT));

/** Chama `cb` quando alguém avisar, quando a aba volta ao foco e a cada `everyMs` (padrão 90 s). */
export function onSocialChange(cb: () => void, everyMs = 90_000) {
  const vis = () => document.visibilityState === "visible" && cb();
  window.addEventListener(EVENT, cb);
  document.addEventListener("visibilitychange", vis);
  const t = setInterval(() => document.visibilityState === "visible" && cb(), everyMs);
  return () => {
    window.removeEventListener(EVENT, cb);
    document.removeEventListener("visibilitychange", vis);
    clearInterval(t);
  };
}
