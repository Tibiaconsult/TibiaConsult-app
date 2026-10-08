// Charms por creature de uma hunt: qual charm major de dano e qual minor colocar em cada creature, e em quem completar o bestiário primeiro.
// Regras (TibiaWiki: Major Charms, Minor Charms e Winter Update 2024):
// - cada creature leva 1 charm major e 1 minor ao mesmo tempo, e cada charm vai em uma creature só;
// - major exige o bestiário completo da creature; minor exige o estágio 2;
// - charm elemental (Zap, Enflame, Freeze, Poison, Curse, Divine Wrath, Wound): 5% da vida máxima da creature, limitado a 2x o level do char,
//   e a resistência da creature ao elemento conta;
// - Overflux (2,5% da mana máxima) e Overpower (5% da vida máxima do char): limitados a 8% da vida da creature; entram como físico.
// Peso de cada creature = fração dos kills no lure x vida dela (a parte do dano que você gasta nela).
// Fração dos kills: respawn do mapa (hunt-spawns) ou, sem ele, a proporção de kills das estatísticas de loot da TibiaWiki.

import { BESTIARY, CHARMS, CHARMS_VERY_RARE, KILLS, KILLS_VERY_RARE } from "@/data/bestiary";
import { CREATURE_DAMAGE } from "@/data/creature-damage";
import { CREATURES } from "@/data/creatures";
import { HUNT_SPAWNS } from "@/data/hunt-spawns";
import type { Hunt } from "@/data/hunts";
import type { Element } from "@/data/spells";
import { CHARM_OF } from "@/lib/huntprep";
import type { SetVoc } from "@/lib/huntset";

/** Hunts com o quadro de charms por creature (piloto; vai crescendo hunt a hunt). */
export const CHARM_HUNTS = new Set(["norcferatu"]);

const ELEMENTS: Element[] = ["physical", "fire", "energy", "ice", "earth", "death", "holy"];

/** Vida e mana por level, aproximadas, sem bônus de equipamento. */
const PER_LEVEL: Record<SetVoc, { hp: number; mana: number }> = {
  knight: { hp: 15, mana: 5 },
  paladin: { hp: 10, mana: 15 },
  monk: { hp: 10, mana: 10 },
  sorcerer: { hp: 5, mana: 30 },
  druid: { hp: 5, mana: 30 },
};

/** Minors na ordem de valor para a vocação (o leech só vale com item ou imbuement de leech). */
const MINOR_ORDER: Record<SetVoc, string[]> = {
  sorcerer: ["Void's Call", "Vampiric Embrace"],
  druid: ["Void's Call", "Vampiric Embrace"],
  knight: ["Vampiric Embrace", "Void's Call"],
  paladin: ["Vampiric Embrace", "Void's Call"],
  monk: ["Vampiric Embrace", "Void's Call"],
};

export interface CharmOption {
  charm: string;
  el: Element | null;
  /** dano por ativação, já com a resistência */
  dmg: number;
  /** o limite de 2x o level (ou de 8% da vida) cortou o dano */
  capped: boolean;
}

export interface CreatureCharm {
  name: string;
  hp: number;
  /** fração dos kills no lure (0 a 1) */
  share: number;
  /** parte do dano do lure gasto nesta creature (0 a 1): define a prioridade */
  weight: number;
  major: CharmOption;
  /** outra opção de major: a melhor nela quando já foi para outra creature (taken = onde ficou), ou a segunda melhor */
  alt: (CharmOption & { takenBy: string | null }) | null;
  minor: string | null;
  minorWhy: string;
  /** maior golpe conhecido (TibiaWiki) */
  maxHit: number | null;
  bestiary: { kills: number; stage2: number; points: number } | null;
}

export interface CharmPlanResult {
  rows: CreatureCharm[];
  /** de onde veio a fração dos kills */
  shareSource: "spawn" | "loot" | "ficha";
  /** creature para Dodge/Parry, se estiver apanhando */
  defense: { name: string; maxHit: number; attack: string } | null;
  /** creatures sem dano listado na TibiaWiki */
  noDamage: string[];
}

function options(c: Hunt["creatures"][number], voc: SetVoc, level: number): CharmOption[] {
  const out: CharmOption[] = ELEMENTS.map((el) => {
    const raw = 0.05 * c.hp;
    const cap = 2 * level;
    const taken = c.taken[el] ?? 100;
    return { charm: CHARM_OF[el], el, dmg: Math.round(Math.min(raw, cap) * (taken / 100)), capped: raw > cap };
  }).filter((o) => o.dmg > 0);
  const per = PER_LEVEL[voc];
  const phys = (c.taken.physical ?? 100) / 100;
  const limit = 0.08 * c.hp;
  const flux = 0.025 * per.mana * level;
  const power = 0.05 * per.hp * level;
  if (voc === "sorcerer" || voc === "druid")
    out.push({ charm: "Overflux", el: null, dmg: Math.round(Math.min(flux, limit) * phys), capped: flux > limit });
  if (voc === "knight") out.push({ charm: "Overpower", el: null, dmg: Math.round(Math.min(power, limit) * phys), capped: power > limit });
  return out.sort((a, b) => b.dmg - a.dmg);
}

function bestiaryOf(name: string) {
  const r = BESTIARY.find((b) => b[0] === name);
  if (!r) return null;
  const k = r[3] ? KILLS_VERY_RARE : KILLS[r[1]];
  return { kills: k[2], stage2: k[1], points: r[3] ? CHARMS_VERY_RARE[r[1]] : CHARMS[r[1]] };
}

/**
 * Monta o plano de charms da hunt para a vocação e o level.
 * owned: charms que o jogador já tem (nome); sem a lista, considera todos.
 */
export function charmsByCreature(h: Hunt, voc: SetVoc, level: number, owned?: Set<string>): CharmPlanResult {
  const spawn = HUNT_SPAWNS[h.id]?.counts;
  const lootKills = h.creatures.map((c) => CREATURES[c.name]?.kills ?? 0);
  const shareSource: CharmPlanResult["shareSource"] = spawn ? "spawn" : lootKills.every((k) => k > 0) ? "loot" : "ficha";
  const raw = h.creatures.map((c, i) => (shareSource === "spawn" ? (spawn?.[c.name] ?? 0) : shareSource === "loot" ? lootKills[i] : (c.weight ?? 1)));
  const totShare = raw.reduce((a, b) => a + b, 0) || 1;
  const share = raw.map((v) => v / totShare);
  const totW = h.creatures.reduce((a, c, i) => a + share[i] * c.hp, 0) || 1;

  const opts = h.creatures.map((c) => options(c, voc, level).filter((o) => !owned || owned.has(o.charm)));
  const weight = h.creatures.map((c, i) => (share[i] * c.hp) / totW);

  // cada charm em uma creature só: busca a combinação que soma mais dano extra (peso x dano por ativação / vida)
  const n = h.creatures.length;
  const gain = (i: number, o: CharmOption) => (weight[i] * o.dmg) / h.creatures[i].hp;
  let best: (CharmOption | null)[] = Array(n).fill(null);
  let bestScore = -1;
  const pick: (CharmOption | null)[] = Array(n).fill(null);
  const used = new Set<string>();
  const order = [...h.creatures.keys()].sort((a, b) => weight[b] - weight[a]);
  const walk = (k: number, score: number) => {
    if (k === n) {
      if (score > bestScore) {
        bestScore = score;
        best = [...pick];
      }
      return;
    }
    const i = order[k];
    for (const o of opts[i].slice(0, 6)) {
      if (used.has(o.charm)) continue;
      used.add(o.charm);
      pick[i] = o;
      walk(k + 1, score + gain(i, o));
      used.delete(o.charm);
    }
    pick[i] = null;
    walk(k + 1, score);
  };
  walk(0, 0);

  // minors: leech nas duas que mais pesam; Bless na que bate mais forte; depois Numb, Cleanse e Adrenaline Burst
  const hit = h.creatures.map((c) => {
    const d = CREATURE_DAMAGE[c.name];
    if (!d) return null;
    const all = [...(d.melee ? [{ name: "golpe corpo a corpo", max: d.melee }] : []), ...d.attacks];
    return all.reduce((a, b) => (b.max > a.max ? b : a), { name: "", max: 0 });
  });
  const minors = new Map<number, [string, string]>();
  const leech = MINOR_ORDER[voc];
  order.slice(0, 2).forEach((i, k) => {
    const why = leech[k] === "Void's Call" ? "mais mana leech onde você passa mais tempo (precisa de item ou imbuement de mana leech)" : "mais life leech onde você passa mais tempo (precisa de item ou imbuement de life leech)";
    minors.set(i, [leech[k], why]);
  });
  const byHit = [...h.creatures.keys()].filter((i) => !minors.has(i) && hit[i]).sort((a, b) => (hit[b]?.max ?? 0) - (hit[a]?.max ?? 0));
  if (byHit[0] !== undefined) minors.set(byHit[0], ["Bless", "perde menos XP se morrer para ela: é a que bate mais forte entre as que sobram"]);
  const rest: [string, string][] = [
    ["Numb", "paralisa a creature depois de ela atacar: segura quem cola em você"],
    ["Cleanse", "tira um status negativo (veneno, fogo, paralyze) quando ela acerta"],
    ["Adrenaline Burst", "corre mais depois de apanhar: ajuda a sair de trap"],
  ];
  for (const i of order) if (!minors.has(i) && rest.length) minors.set(i, rest.shift()!);

  const altOf = (i: number, major: CharmOption) => {
    const top = opts[i][0];
    if (top && top.charm !== major.charm && top.dmg > major.dmg) {
      const j = best.findIndex((o) => o?.charm === top.charm);
      return { ...top, takenBy: j >= 0 ? h.creatures[j].name : null };
    }
    const o = opts[i].find((x) => x.charm !== major.charm);
    return o ? { ...o, takenBy: null } : null;
  };
  const rows: CreatureCharm[] = h.creatures.map((c, i) => {
    const major = best[i] ?? opts[i][0] ?? { charm: "-", el: null, dmg: 0, capped: false };
    return {
      name: c.name,
      hp: c.hp,
      share: share[i],
      weight: weight[i],
      major,
      alt: altOf(i, major),
      minor: minors.get(i)?.[0] ?? null,
      minorWhy: minors.get(i)?.[1] ?? "",
      maxHit: hit[i]?.max ?? null,
      bestiary: bestiaryOf(c.name),
    };
  });
  rows.sort((a, b) => b.weight - a.weight);

  const hitters = h.creatures
    .map((c, i) => ({ name: c.name, maxHit: hit[i]?.max ?? 0, attack: hit[i]?.name ?? "", score: (hit[i]?.max ?? 0) * share[i] }))
    .filter((x) => x.maxHit > 0)
    .sort((a, b) => b.score - a.score);
  return {
    rows,
    shareSource,
    defense: hitters[0] ? { name: hitters[0].name, maxHit: hitters[0].maxHit, attack: hitters[0].attack } : null,
    noDamage: h.creatures.filter((c) => !CREATURE_DAMAGE[c.name]).map((c) => c.name),
  };
}
