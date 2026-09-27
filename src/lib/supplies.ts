// Supplies sugeridos para uma hunt: potions pela vocação e level (regras da TibiaWiki, Vocation Adjustments Update 2026: Great
// Mana liberada para todas), runa de área pelo elemento que mais entra nas creatures do lure, e o dano que mais bate em você.

import type { Hunt } from "@/data/hunts";
import type { Voc } from "@/lib/active";
import { DAMAGE_LABEL, incomingDamage } from "@/lib/huntdamage";

/** Preço no NPC (TibiaWiki). */
export const SUPPLY_PRICE: Record<string, number> = {
  "Supreme Health Potion": 650,
  "Ultimate Health Potion": 379,
  "Great Health Potion": 225,
  "Ultimate Spirit Potion": 488,
  "Great Spirit Potion": 254,
  "Ultimate Mana Potion": 488,
  "Great Mana Potion": 158,
  "Strong Mana Potion": 108,
  "Avalanche Rune": 64,
  "Great Fireball Rune": 64,
  "Thunderstorm Rune": 52,
  "Stone Shower Rune": 41,
  "Sudden Death Rune": 162,
};

export interface Supply {
  item: string;
  why: string;
}

function potions(voc: Voc, level: number): Supply[] {
  const out: Supply[] = [];
  if (voc === "knight") {
    const hp = level >= 200 ? "Supreme Health Potion" : level >= 130 ? "Ultimate Health Potion" : "Great Health Potion";
    out.push({ item: hp, why: "cura principal do knight" });
    out.push({ item: level >= 80 ? "Great Mana Potion" : "Strong Mana Potion", why: "mana para as magias de área" });
  } else if (voc === "paladin" || voc === "monk") {
    out.push({ item: level >= 130 ? "Ultimate Spirit Potion" : "Great Spirit Potion", why: "cura e mana juntas" });
    out.push({ item: "Great Mana Potion", why: "quando sobra vida e falta mana" });
  } else {
    out.push({ item: level >= 130 ? "Ultimate Mana Potion" : "Great Mana Potion", why: "mana para atacar e curar (a vida vem da magia)" });
  }
  return out;
}

const AREA_RUNES: [keyof Hunt["creatures"][number]["taken"], string][] = [
  ["ice", "Avalanche Rune"],
  ["fire", "Great Fireball Rune"],
  ["energy", "Thunderstorm Rune"],
  ["earth", "Stone Shower Rune"],
];

/** Média ponderada do dano recebido pelas creatures do lure num elemento (100 = normal). */
function taken(h: Hunt, el: keyof Hunt["creatures"][number]["taken"]): number {
  const w = h.creatures.reduce((a, c) => a + (c.weight ?? 1), 0) || 1;
  return h.creatures.reduce((a, c) => a + c.taken[el] * (c.weight ?? 1), 0) / w;
}

export function suggestSupplies(h: Hunt, voc: Voc, level: number) {
  const list = potions(voc, level);
  const runes = AREA_RUNES.map(([el, item]) => ({ item, pct: Math.round(taken(h, el)) })).sort((a, b) => b.pct - a.pct);
  const best = runes[0];
  if (voc !== "knight" && best.pct >= 90) list.push({ item: best.item, why: `runa de área: as creatures recebem ${best.pct}% desse elemento` });
  const sd = Math.round(taken(h, "death"));
  if ((voc === "sorcerer" || voc === "druid" || voc === "paladin") && sd >= 110) list.push({ item: "Sudden Death Rune", why: `alvo único: ${sd}% de death` });
  const dmg = incomingDamage(h, voc).rows.slice(0, 2);
  const incoming = dmg.map((r) => ({ label: DAMAGE_LABEL[r.el], share: Math.round(r.share), maxHit: r.maxHit, creature: r.creature, attack: r.attack }));
  return { list, runes, incoming };
}
