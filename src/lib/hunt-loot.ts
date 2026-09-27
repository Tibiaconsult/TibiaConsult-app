// Drops valiosos de uma hunt: junta o loot das creatures da área (TibiaWiki), pondera pelo peso de cada uma no lure e pela chance
// de drop, e ordena pelo quanto cada item rende em média. Também separa os raros caros, que pagam a hunt quando caem.

import { CREATURES } from "@/data/creatures";
import type { Hunt } from "@/data/hunts";
import { HUNT_SPAWNS } from "@/data/hunt-spawns";
import { ITEM_VALUES } from "@/data/item-values";

// chance estimada quando a wiki não tem estatística: só a raridade
const RARITY_CHANCE: Record<string, number> = { always: 100, common: 25, uncommon: 5, "semi-rare": 1.5, rare: 0.5, "very rare": 0.1 };
const COINS = new Set(["Gold Coin", "Platinum Coin", "Crystal Coin"]);

export interface HuntDrop {
  item: string;
  /** valor de uma unidade (o maior entre a venda para NPC e a referência da wiki) */
  value: number;
  /** chance por kill da creature que mais dropa, em % */
  chance: number;
  /** creatures que dropam */
  from: string[];
  /** gp médio por kill do lure */
  perKill: number;
}

const avg = (amount: string | null) => {
  const n = (amount ?? "1").match(/\d+/g)?.map(Number) ?? [1];
  return n.length > 1 ? (n[0] + n[1]) / 2 : n[0];
};

export interface HuntDropsData {
  top: HuntDrop[];
  rare: HuntDrop[];
  goldPerKill: number;
}

export function huntDrops(h: Hunt): HuntDropsData {
  // peso de cada creature no lure: a quantidade no respawn, quando existe; senão o peso da ficha
  const spawn = HUNT_SPAWNS[h.id]?.counts;
  // creature da ficha sem spawn no arquivo (aparece por mecânica, como as Apparitions, ou faltou no Canary): entra com a
  // menor quantidade do respawn, para o loot dela não sumir da conta
  const minSpawn = spawn ? Math.min(...Object.values(spawn)) : 1;
  const weight = (c: Hunt["creatures"][number]) => (spawn ? (spawn[c.name] ?? minSpawn) : (c.weight ?? 1));
  const totalW = h.creatures.reduce((a, c) => a + weight(c), 0) || 1;
  const acc = new Map<string, HuntDrop>();
  let gold = 0;
  for (const c of h.creatures) {
    const cr = CREATURES[c.name];
    if (!cr) continue;
    const share = weight(c) / totalW;
    for (const l of cr.loot) {
      const value = Math.max(...(ITEM_VALUES[l.name] ?? [0, 0]));
      const chance = l.chance ?? RARITY_CHANCE[l.rarity ?? ""] ?? 0;
      if (!value || !chance) continue;
      const ev = (chance / 100) * avg(l.amount) * value * share;
      if (COINS.has(l.name)) {
        gold += ev;
        continue;
      }
      const d = acc.get(l.name) ?? { item: l.name, value, chance: 0, from: [], perKill: 0 };
      d.perKill += ev;
      d.chance = Math.max(d.chance, chance);
      if (!d.from.includes(c.name)) d.from.push(c.name);
      acc.set(l.name, d);
    }
  }
  const all = [...acc.values()];
  const top = [...all].sort((a, b) => b.perKill - a.perKill).slice(0, 8);
  const inTop = new Set(top.map((d) => d.item));
  const rare = all
    .filter((d) => d.value >= 20000 && d.chance < 2 && !inTop.has(d.item))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return { top, rare, goldPerKill: gold };
}
