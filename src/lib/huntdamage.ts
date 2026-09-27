// Dano que a hunt causa em você, pelos dados da TibiaWiki (src/data/creature-damage.ts):
// o maior hit de cada elemento (com a creature e o ataque) e o peso de cada elemento no lure,
// somando o maior valor de cada ataque vezes o peso da creature no lure. É uma estimativa para escolher proteções.

import { CREATURE_DAMAGE, DamageElement } from "@/data/creature-damage";
import type { Hunt } from "@/data/hunts";

export const DAMAGE_LABEL: Record<DamageElement, string> = {
  physical: "Físico",
  fire: "Fogo",
  energy: "Energia",
  ice: "Gelo",
  earth: "Terra",
  death: "Death",
  holy: "Holy",
  lifedrain: "Life drain",
  manadrain: "Mana drain",
  drown: "Afogamento",
};

/** Elementos que a proteção de item e de imbuement reduz. */
export const PROTECTABLE: DamageElement[] = ["physical", "fire", "energy", "ice", "earth", "death", "holy"];

export interface IncomingRow {
  el: DamageElement;
  maxHit: number;
  creature: string;
  attack: string;
  /** peso do elemento no dano do lure, em % */
  share: number;
}

/** "Mana Drain (only against Druids)": ataque que só pega uma vocação. */
function onlyAgainst(name: string): string | null {
  const m = name.match(/only against (\w+)/i);
  return m ? m[1].toLowerCase().replace(/s$/, "") : null;
}

/** voc: sem ela, entram todos os ataques; com ela, sai o que só pega outra vocação. */
export function incomingDamage(h: Hunt, voc?: string): { rows: IncomingRow[]; covered: string[]; missing: string[] } {
  const acc = new Map<DamageElement, { maxHit: number; creature: string; attack: string; weight: number }>();
  const covered: string[] = [];
  const missing: string[] = [];
  for (const c of h.creatures) {
    const d = CREATURE_DAMAGE[c.name];
    if (!d) {
      missing.push(c.name);
      continue;
    }
    covered.push(c.name);
    const w = c.weight ?? 1;
    const hits = [...(d.melee ? [{ name: "golpe corpo a corpo", max: d.melee, element: "physical" as DamageElement }] : []), ...d.attacks];
    for (const a of hits) {
      const only = onlyAgainst(a.name);
      if (voc && only && only !== voc) continue;
      const cur = acc.get(a.element) ?? { maxHit: 0, creature: "", attack: "", weight: 0 };
      cur.weight += a.max * w;
      if (a.max > cur.maxHit) Object.assign(cur, { maxHit: a.max, creature: c.name, attack: a.name });
      acc.set(a.element, cur);
    }
  }
  const total = [...acc.values()].reduce((a, v) => a + v.weight, 0) || 1;
  const rows = [...acc.entries()]
    .map(([el, v]) => ({ el, maxHit: v.maxHit, creature: v.creature, attack: v.attack, share: (v.weight / total) * 100 }))
    .sort((a, b) => b.share - a.share);
  return { rows, covered, missing };
}
