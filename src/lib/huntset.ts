// Set sugerido por vocação para uma hunt, calculado a partir dos dados do site:
// - elemento de ataque: média da sensibilidade dos bichos (peso de cada bicho no lure);
// - proteção: elementos citados nos ataques dos bichos (texto da ficha, vindo da TibiaWiki);
// - itens: equipamento de level 250+ da vocação (lista do TibiaPal, atributos da TibiaWiki).
// É uma sugestão automática, não um set testado.

import type { Element } from "@/data/spells";
import type { Hunt } from "@/data/hunts";
import { EquipRow, VOC_EQUIPMENT } from "@/data/voc-equipment";

export type SetVoc = "sorcerer" | "druid" | "knight" | "paladin" | "monk";

const PT: Record<string, Element> = { físico: "physical", fogo: "fire", gelo: "ice", terra: "earth", energia: "energy", death: "death", holy: "holy" };
export const EL_PT: Record<Element, string> = { physical: "físico", fire: "fogo", ice: "gelo", earth: "terra", energy: "energia", death: "death", holy: "holy" };

const INCOMING: [Element, RegExp][] = [
  ["physical", /melee|físic|physical|explosion|bolt|spear|stone|pedra|blast|scratch|claw|knife|arrow|bomb/gi],
  ["fire", /fogo|fire|burn|flame|hell/gi],
  ["energy", /energia|energy|thunder|electr/gi],
  ["earth", /terra|earth|poison|veneno|envenom/gi],
  ["ice", /gelo|ice|frost/gi],
  ["death", /death|morte|smoke/gi],
  ["holy", /holy/gi],
];

/** Peso de cada elemento no dano que os bichos causam, pelo texto dos ataques. */
export function incomingProfile(h: Hunt): Record<Element, number> {
  const p = { physical: 0, fire: 0, ice: 0, earth: 0, energy: 0, death: 0, holy: 0 } as Record<Element, number>;
  for (const c of h.creatures) {
    const w = c.weight ?? 1;
    for (const [el, re] of INCOMING) p[el] += (c.attacks.match(re)?.length ?? 0) * w;
  }
  return p;
}

const OFFENSE: Record<SetVoc, Element[]> = {
  sorcerer: ["fire", "energy", "death"],
  druid: ["ice", "earth"],
  paladin: ["holy", "physical"],
  knight: ["fire", "energy", "ice", "earth", "death"],
  monk: ["fire", "energy", "ice", "earth", "death", "physical"],
};

/** Média ponderada da sensibilidade dos bichos a cada elemento que a vocação usa. */
export function offenseRanking(h: Hunt, voc: SetVoc): { el: Element; pct: number }[] {
  const tot = h.creatures.reduce((a, c) => a + (c.weight ?? 1), 0) || 1;
  return OFFENSE[voc]
    .map((el) => ({ el, pct: h.creatures.reduce((a, c) => a + (c.taken[el] ?? 100) * (c.weight ?? 1), 0) / tot }))
    .sort((a, b) => b.pct - a.pct);
}

function resists(r: EquipRow): Partial<Record<Element, number>> {
  const out: Partial<Record<Element, number>> = {};
  for (const m of r.resist.matchAll(/([a-zà-ú]+)\s*([+-]\d+)%/gi)) {
    const el = PT[m[1].toLowerCase()];
    if (el) out[el] = (out[el] ?? 0) + Number(m[2]);
  }
  return out;
}

function weaponElement(r: EquipRow): Element | null {
  const m = r.stats.match(/\+\s*([a-zà-ú]+)\s+\d+/i);
  return m ? (PT[m[1].toLowerCase()] ?? null) : null;
}

function protScore(r: EquipRow, prof: Record<Element, number>): number {
  const res = resists(r);
  return (Object.keys(res) as Element[]).reduce((a, el) => a + (res[el] ?? 0) * (prof[el] ?? 0), 0);
}

/** Para magos: magic level e ML do elemento de ataque da hunt pesam na escolha. */
function mageScore(r: EquipRow, best: Element | undefined): number {
  const ml = r.sk?.["magic level"] ?? 0;
  const el = best ? (r.sk?.[`${best} magic level`] ?? 0) : 0;
  return ml * 3 + el * 5;
}

const SLOTS: Record<SetVoc, string[]> = {
  sorcerer: ["Arma", "Spellbook", "Elmo", "Armadura", "Pernas", "Botas", "Anel", "Amuleto"],
  druid: ["Arma", "Spellbook", "Elmo", "Armadura", "Pernas", "Botas", "Anel", "Amuleto"],
  knight: ["Arma", "Escudo", "Elmo", "Armadura", "Pernas", "Botas", "Anel", "Amuleto"],
  paladin: ["Arma", "Aljava", "Elmo", "Armadura", "Pernas", "Botas", "Anel", "Amuleto"],
  monk: ["Arma", "Elmo", "Armadura", "Pernas", "Botas", "Anel", "Amuleto"],
};

export interface SetPick {
  slot: string;
  item: EquipRow | null;
  why: string;
}

export function suggestSet(h: Hunt, voc: SetVoc, maxLevel: number): { picks: SetPick[]; offense: { el: Element; pct: number }[]; incoming: [Element, number][] } {
  const prof = incomingProfile(h);
  const incomingTot = Object.values(prof).reduce((a, b) => a + b, 0) || 1;
  const incoming = (Object.entries(prof) as [Element, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const offense = offenseRanking(h, voc);
  const pool = (VOC_EQUIPMENT[voc] ?? []).filter((r) => r.level <= maxLevel);
  const best = offense[0]?.el;

  const picks: SetPick[] = SLOTS[voc].map((slot) => {
    const items = pool.filter((r) => r.slot === slot);
    if (!items.length) return { slot, item: null, why: "sem item de level 250+ na lista para este slot" };
    if (slot === "Arma" && (voc === "knight" || voc === "monk")) {
      const ofEl = items.filter((r) => weaponElement(r) === best);
      const cand = (ofEl.length ? ofEl : items).sort((a, b) => b.level - a.level || protScore(b, prof) - protScore(a, prof))[0];
      const el = weaponElement(cand);
      const pct = offense.find((o) => o.el === el)?.pct;
      return { slot, item: cand, why: el ? `ataque de ${EL_PT[el]}${pct ? `: os bichos tomam ${Math.round(pct)}% em média` : ""}` : "maior level disponível" };
    }
    const mage = voc === "sorcerer" || voc === "druid";
    const score = (r: EquipRow) => protScore(r, prof) + (mage ? mageScore(r, best) * 10 : 0);
    const cand =
      slot === "Arma"
        ? items.sort((a, b) => (mage ? mageScore(b, best) - mageScore(a, best) : 0) || b.level - a.level || protScore(b, prof) - protScore(a, prof))[0]
        : items.sort((a, b) => score(b) - score(a) || b.level - a.level)[0];
    const res = resists(cand);
    const useful = (Object.keys(res) as Element[]).filter((el) => (prof[el] ?? 0) / incomingTot >= 0.1 && (res[el] ?? 0) > 0);
    return {
      slot,
      item: cand,
      why: slot === "Arma" ? (mage && best && (cand.sk?.[`${best} magic level`] ?? 0) > 0 ? `${EL_PT[best]} ML +${cand.sk[`${best} magic level`]}, ML +${cand.sk["magic level"] ?? 0}` : "maior level disponível até o level escolhido") : useful.length ? `protege de ${useful.map((el) => `${EL_PT[el]} +${res[el]}%`).join(", ")}` : "melhor opção disponível no level",
    };
  });
  return { picks, offense, incoming };
}
