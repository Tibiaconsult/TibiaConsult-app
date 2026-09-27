// Acesso da rede social pelo navegador. As permissões (quem posta, o que cada um vê) são garantidas pelo banco (RLS, 013).

import { createClient } from "@/lib/supabase/client";
import type { ReactionId } from "@/lib/social";

export const hasDb = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export type TargetType = "post" | "death" | "comment" | "gossip" | "level";
export type CommentTarget = "post" | "death" | "level";

export interface ReactionMap {
  counts: Record<string, Partial<Record<ReactionId, number>>>;
  mine: Record<string, ReactionId[]>;
}

/** Reações de vários alvos de uma vez (contagem e as da própria conta). */
export async function loadReactions(type: TargetType, keys: string[], userId: string | null): Promise<ReactionMap> {
  const out: ReactionMap = { counts: {}, mine: {} };
  if (!hasDb() || !keys.length) return out;
  const { data } = await createClient().from("reactions").select("target_key, emoji, user_id").eq("target_type", type).in("target_key", keys);
  for (const r of data ?? []) {
    const k = r.target_key as string;
    const e = r.emoji as ReactionId;
    out.counts[k] = { ...out.counts[k], [e]: (out.counts[k]?.[e] ?? 0) + 1 };
    if (userId && r.user_id === userId) out.mine[k] = [...(out.mine[k] ?? []), e];
  }
  return out;
}

export async function setReaction(type: TargetType, key: string, emoji: ReactionId, on: boolean): Promise<string | null> {
  const sb = createClient();
  const { error } = on
    ? await sb.from("reactions").insert({ target_type: type, target_key: key, emoji })
    : await sb.from("reactions").delete().eq("target_type", type).eq("target_key", key).eq("emoji", emoji);
  return error?.message ?? null;
}

export interface Comment {
  id: string;
  user_id: string;
  char_name: string;
  body: string;
  created_at: string;
}

/** Quantos comentários cada alvo tem (para mostrar "3 comentários" sem carregar tudo). */
export async function loadCommentCounts(type: CommentTarget, keys: string[]): Promise<Record<string, number>> {
  if (!hasDb() || !keys.length) return {};
  const { data } = await createClient().from("comments").select("target_key").eq("target_type", type).in("target_key", keys);
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.target_key as string] = (out[r.target_key as string] ?? 0) + 1;
  return out;
}

export async function loadComments(type: CommentTarget, key: string): Promise<Comment[]> {
  const { data } = await createClient()
    .from("comments")
    .select("id, user_id, char_name, body, created_at")
    .eq("target_type", type)
    .eq("target_key", key)
    .order("created_at", { ascending: true })
    .limit(200);
  return (data ?? []) as Comment[];
}

export async function addComment(charId: string, type: CommentTarget, key: string, body: string): Promise<{ comment?: Comment; error?: string }> {
  const { data, error } = await createClient()
    .from("comments")
    .insert({ char_id: charId, target_type: type, target_key: key, body })
    .select("id, user_id, char_name, body, created_at")
    .single();
  return error ? { error: error.message } : { comment: data as Comment };
}

export async function removeRow(table: "posts" | "comments", id: string): Promise<string | null> {
  const { error } = await createClient().from(table).delete().eq("id", id);
  return error?.message ?? null;
}

export async function report(type: "post" | "comment" | "gossip", id: string, reason: string | null): Promise<string | null> {
  const { error } = await createClient().from("reports").insert({ target_type: type, target_id: id, reason });
  if (error && /duplicate|unique/i.test(error.message)) return "Você já denunciou isso. Obrigado!";
  return error?.message ?? null;
}

// ---------------------------------------------------------------- fofocas pro Rashid (017)

export interface Gossip {
  id: string;
  death_key: string;
  about: string;
  body: string;
  created_at: string;
}
const GOSSIP_COLS = "id, death_key, about, body, created_at";

/** Fofocas de várias mortes do mural de uma vez. */
export async function loadGossips(keys: string[]): Promise<Record<string, Gossip[]>> {
  if (!hasDb() || !keys.length) return {};
  const { data } = await createClient().from("gossips").select(GOSSIP_COLS).eq("hidden", false).in("death_key", keys).order("created_at");
  const out: Record<string, Gossip[]> = {};
  for (const g of (data ?? []) as Gossip[]) (out[g.death_key] ??= []).push(g);
  return out;
}

export async function addGossip(deathKey: string, body: string): Promise<{ gossip?: Gossip; error?: string }> {
  const { data, error } = await createClient().from("gossips").insert({ death_key: deathKey, body }).select(GOSSIP_COLS).single();
  return error ? { error: error.message } : { gossip: data as Gossip };
}
