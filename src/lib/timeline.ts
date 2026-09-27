// Linha do tempo da comunidade: causos da Taverna + mortes do mural (com boato e fofocas), numa ordem só.
// A mesma função alimenta o feed da Taverna e o banner do Rashid, então os dois mostram sempre a mesma coisa no topo.
// Uma fofoca nova "sobe" a morte para o topo, como um tópico respondido.

import type { PostKind } from "@/lib/social";
import { deathKey } from "@/lib/social";
import { Gossip, ReactionMap, hasDb, loadCommentCounts, loadGossips, loadReactions } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

export interface Post {
  id: string;
  user_id: string;
  char_name: string;
  char_vocation: string | null;
  char_level: number | null;
  char_world: string | null;
  kind: PostKind;
  hunt: string | null;
  body: string;
  hidden: boolean;
  created_at: string;
}

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

export type TimelineItem = { type: "post"; at: string; id: string; post: Post } | { type: "death"; at: string; id: string; death: Death; gossips: Gossip[] };

/** "mortes" = só mortes do mural; um tipo de causo = só causos daquele tipo; null = tudo. */
export type TimelineFilter = "mortes" | PostKind | null;

const POST_COLS = "id, user_id, char_name, char_vocation, char_level, char_world, kind, hunt, body, hidden, created_at";

export async function fetchTimeline(filter: TimelineFilter = null, size = 60): Promise<TimelineItem[]> {
  if (!hasDb()) return [];
  const sb = createClient();
  const wantPosts = filter !== "mortes";
  const wantDeaths = filter === null || filter === "mortes";
  let postQ = sb.from("posts").select(POST_COLS).order("created_at", { ascending: false }).limit(50);
  if (filter && filter !== "mortes") postQ = postQ.eq("kind", filter);
  const [postsRes, deathsRes] = await Promise.all([
    wantPosts ? postQ : Promise.resolve({ data: [] }),
    wantDeaths ? sb.rpc("death_wall", { p_limit: 100 }) : Promise.resolve({ data: [] }),
  ]);
  const posts = (postsRes.data ?? []) as Post[];
  const deaths = (deathsRes.data ?? []) as Death[];
  const gossips = await loadGossips(deaths.map((d) => deathKey(d.name, d.died_at)));

  const items: TimelineItem[] = [
    ...posts.map((p) => ({ type: "post" as const, at: p.created_at, id: p.id, post: p })),
    ...deaths.map((d) => {
      const key = deathKey(d.name, d.died_at);
      const gs = gossips[key] ?? [];
      const at = [d.died_at, ...gs.map((g) => g.created_at)].sort().at(-1)!;
      return { type: "death" as const, at: new Date(at).toISOString(), id: key, death: d, gossips: gs };
    }),
  ];
  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, size);
}

/** Reações (causos, mortes e fofocas) e número de comentários dos itens visíveis. As chaves não se repetem entre os tipos. */
export async function fetchExtras(items: TimelineItem[], userId: string | null): Promise<{ reactions: ReactionMap; comments: Record<string, number> }> {
  const postIds = items.filter((i) => i.type === "post").map((i) => i.id);
  const deathKeys = items.filter((i) => i.type === "death").map((i) => i.id);
  const gossipIds = items.flatMap((i) => (i.type === "death" ? i.gossips.map((g) => g.id) : []));
  const [rp, rd, rg, cp, cd] = await Promise.all([
    loadReactions("post", postIds, userId),
    loadReactions("death", deathKeys, userId),
    loadReactions("gossip", gossipIds, userId),
    loadCommentCounts("post", postIds),
    loadCommentCounts("death", deathKeys),
  ]);
  return {
    reactions: { counts: { ...rp.counts, ...rd.counts, ...rg.counts }, mine: { ...rp.mine, ...rd.mine, ...rg.mine } },
    comments: { ...cp, ...cd },
  };
}

// ---------------------------------------------------------------- sincronia entre as partes da página

const EVENT = "tc-social";

/** Avise que algo mudou (causo, fofoca, comentário): Taverna, mural e banner recarregam na hora. */
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
