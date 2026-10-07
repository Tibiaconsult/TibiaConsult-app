// Recomendação de hunt para a página pública do char: as hunts do TibiaPal que a vocação e o level já alcançam e,
// pelas mortes registradas, em quais hunts do site aparecem as creatures que mataram o char.

import { HUNTS, type Hunt } from "@/data/hunts";
import { HUNT_RECS } from "@/data/hunt-recs";
import { huntsFor } from "@/lib/hunt-level";

const VOCS = ["knight", "paladin", "sorcerer", "druid", "monk"] as const;

/** Hunts que sempre aparecem no quadro quando o level alcança, mesmo fora das mais altas (pedido da guild). */
const FEATURED = ["lost-souls", "netherworld"];

/** "Royal Paladin" → "paladin"; "None" ou desconhecida → null */
export function baseVoc(vocation: string | null): (typeof VOCS)[number] | null {
  const v = (vocation ?? "").toLowerCase();
  return VOCS.find((x) => v.includes(x)) ?? null;
}

/** "Died at Level 1095 by vexclaw and a hellflayer." → ["vexclaw", "hellflayer"] */
export function killers(reason: string | null): string[] {
  const m = (reason ?? "").match(/\bby (.+?)\.?$/i);
  if (!m) return [];
  return m[1]
    .split(/,\s*|\s+and\s+/i)
    .map((s) => s.replace(/^(an?|the)\s+/i, "").trim().toLowerCase())
    .filter(Boolean);
}

export function charHunts(vocation: string | null, level: number | null, deaths: { reason: string | null; by_player: boolean }[]) {
  const voc = baseVoc(vocation);
  const rec = voc && level ? huntsFor(voc, level, 6) : null;
  if (rec && voc && level) {
    for (const id of FEATURED) {
      const min = HUNT_RECS[id]?.solo[voc];
      const h = HUNTS.find((x) => x.id === id);
      if (h && typeof min === "number" && min <= level && !rec.ok.some((x) => x.h.id === id)) rec.ok.push({ h, min });
    }
  }
  // creature que matou → hunts em que ela aparece
  const seen = new Map<string, Hunt[]>();
  for (const d of deaths.slice(0, 10)) {
    if (d.by_player) continue;
    for (const k of killers(d.reason)) {
      if (seen.has(k)) continue;
      const hs = HUNTS.filter((h) => h.creatures.some((c) => c.name.toLowerCase() === k));
      if (hs.length) seen.set(k, hs);
    }
  }
  return { voc, rec, deathHunts: [...seen.entries()].slice(0, 4).map(([creature, hunts]) => ({ creature, hunts })) };
}
