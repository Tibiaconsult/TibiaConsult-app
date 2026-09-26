// Hunts para o level do char: as de recomendação solo do TibiaPal que ele já alcança (as mais altas primeiro) e a próxima a liberar.

import { HUNTS, type Hunt } from "@/data/hunts";
import { HUNT_RECS, type RecVoc } from "@/data/hunt-recs";

export function huntsFor(voc: string, level: number, max = 4): { ok: { h: Hunt; min: number }[]; next: { h: Hunt; min: number } | null } {
  const v = voc as RecVoc;
  const withRec = HUNTS.map((h) => ({ h, min: HUNT_RECS[h.id]?.solo[v] })).filter((x): x is { h: Hunt; min: number } => typeof x.min === "number");
  const ok = withRec.filter((x) => x.min <= level).sort((a, b) => b.min - a.min);
  const next = withRec.filter((x) => x.min > level).sort((a, b) => a.min - b.min)[0] ?? null;
  return { ok: ok.slice(0, max), next };
}
