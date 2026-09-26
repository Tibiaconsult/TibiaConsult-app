// Cálculo do set: soma magic level, ML elemental, proteções, leech, crit e velocidade dos itens,
// dos imbuements e dos efeitos de forja por tier. Fontes: TibiaWiki (itens, Imbuing, Onslaught,
// Ruse, Momentum, Transcendence, Amplification), lidas em 26/09/2026.

import { Item, SLOTS } from "@/data/equipment";

export type Elem = "physical" | "fire" | "energy" | "death" | "ice" | "earth" | "holy";
export const PROT_ELEMS: Elem[] = ["physical", "fire", "earth", "energy", "ice", "death", "holy"];

export interface ItemStats {
  ml: number;
  eml: Partial<Record<"fire" | "energy" | "death" | "ice" | "earth" | "holy", number>>;
  prot: Partial<Record<Elem, number>>;
  critExtra: number;
  critChance: number;
  lifeLeech: number;
  manaLeech: number;
  speed: number;
  arm: number;
  augments: string[];
}

const EMPTY = (): ItemStats => ({ ml: 0, eml: {}, prot: {}, critExtra: 0, critChance: 0, lifeLeech: 0, manaLeech: 0, speed: 0, arm: 0, augments: [] });

/** Lê os textos da tabela de equipamento e devolve números. */
export function parseItem(it: Item): ItemStats {
  const s = EMPTY();
  s.arm = it.arm ?? 0;
  const text = `${it.ml ?? ""}, ${it.extras ?? ""}`;
  // ML genérico: "+4" isolado no campo ml, ou "magic level +N"
  const mlField = (it.ml ?? "").trim();
  if (/^[+-]?\d+$/.test(mlField)) s.ml += Number(mlField);
  for (const m of text.matchAll(/(fire|energy|death|ice|earth|holy) ML \+(\d+)/gi)) {
    const k = m[1].toLowerCase() as keyof ItemStats["eml"];
    s.eml[k] = (s.eml[k] ?? 0) + Number(m[2]);
  }
  for (const m of (it.protection ?? "").matchAll(/(physical|fire|energy|death|ice|earth|holy)[^,]*?([+-]\d+)%/gi)) {
    const k = m[1].toLowerCase() as Elem;
    s.prot[k] = (s.prot[k] ?? 0) + Number(m[2]);
  }
  const all4 = (it.protection ?? "").match(/fire, earth, energy, ice \+(\d+)%/i) ?? (it.protection ?? "").match(/\+(\d+)% nos 4 elementos/i);
  if (all4) for (const k of ["fire", "earth", "energy", "ice"] as Elem[]) s.prot[k] = Number(all4[1]);
  const ce = text.match(/crit extra(?: damage)? \+(\d+)%/i);
  if (ce) s.critExtra += Number(ce[1]);
  const ll = text.match(/life leech (\d+)%/i);
  if (ll) s.lifeLeech += Number(ll[1]);
  const mlc = text.match(/mana leech (\d+)%/i);
  if (mlc) s.manaLeech += Number(mlc[1]);
  const sp = text.match(/speed \+(\d+)/i);
  if (sp) s.speed += Number(sp[1]);
  for (const m of text.matchAll(/augment[s]? ([^,]+(?:,[^,]*?(?:\+|-)\d+[^,]*)*)/gi)) s.augments.push(m[1].trim());
  return s;
}

export type SlotId = "wand" | "helmet" | "armor" | "legs" | "boots" | "spellbook" | "ring" | "amulet";

export interface ImbueChoice {
  kind: string;
  level: 0 | 1 | 2 | 3; // 0 = vazio, 1 basic, 2 intricate, 3 powerful
}

export interface SlotChoice {
  item: string | null;
  tier: number;
  imbues: ImbueChoice[];
}

export type SetChoice = Record<SlotId, SlotChoice>;

export const IMBUE_SLOTS: Record<SlotId, number> = { wand: 2, helmet: 2, armor: 2, legs: 0, boots: 1, spellbook: 1, ring: 0, amulet: 0 };

export const IMBUEMENTS: Record<string, { label: string; slots: SlotId[]; values: [number, number, number]; apply: (s: ItemStats, v: number) => void }> = {
  epiphany: { label: "Epiphany (ML)", slots: ["wand", "helmet"], values: [1, 2, 4], apply: (s, v) => (s.ml += v) },
  void: { label: "Void (mana leech %)", slots: ["wand", "helmet"], values: [3, 5, 8], apply: (s, v) => (s.manaLeech += v) },
  vampirism: { label: "Vampirism (life leech %)", slots: ["wand", "armor"], values: [5, 10, 25], apply: (s, v) => (s.lifeLeech += v) },
  dragonhide: { label: "Dragon Hide (fogo %)", slots: ["armor", "spellbook"], values: [3, 8, 15], apply: (s, v) => (s.prot.fire = (s.prot.fire ?? 0) + v) },
  snakeskin: { label: "Snake Skin (terra %)", slots: ["armor", "spellbook"], values: [3, 8, 15], apply: (s, v) => (s.prot.earth = (s.prot.earth ?? 0) + v) },
  quarascale: { label: "Quara Scale (gelo %)", slots: ["armor", "spellbook"], values: [3, 8, 15], apply: (s, v) => (s.prot.ice = (s.prot.ice ?? 0) + v) },
  cloudfabric: { label: "Cloud Fabric (energia %)", slots: ["armor", "spellbook"], values: [3, 8, 15], apply: (s, v) => (s.prot.energy = (s.prot.energy ?? 0) + v) },
  lichshroud: { label: "Lich Shroud (death %)", slots: ["armor", "spellbook"], values: [2, 5, 10], apply: (s, v) => (s.prot.death = (s.prot.death ?? 0) + v) },
  swiftness: { label: "Swiftness (velocidade)", slots: ["boots"], values: [10, 15, 30], apply: (s, v) => (s.speed += v) },
};

// Forja: chance por tier (índice = tier). Fonte: páginas de cada efeito na TibiaWiki.
export const ONSLAUGHT = [0, 0.5, 1.05, 1.7, 2.45, 3.3, 4.25, 5.3, 6.45, 7.7, 9.05];
export const RUSE = [0, 0.5, 1.03, 1.62, 2.28, 3.0, 3.78, 4.62, 5.52, 6.48, 7.51];
export const MOMENTUM = [0, 2.0, 4.05, 6.2, 8.45, 10.8, 13.25, 15.8, 18.45, 21.2, 24.05];
export const TRANSCENDENCE = [0, 0.13, 0.27, 0.44, 0.64, 0.86, 1.11, 1.38, 1.68, 2.0, 2.35];
export const AMPLIFICATION = [0, 2.5, 5.4, 9.1, 13.6, 18.9, 25.0, 31.9, 39.6, 48.1, 57.4];

export interface SetTotals extends ItemStats {
  onslaught: number;
  ruse: number;
  momentum: number;
  transcendence: number;
  amplification: number;
}

export function findItem(slot: SlotId, name: string | null): Item | undefined {
  if (!name) return undefined;
  // nome antigo, de quando as duas versões estavam juntas
  const n = name === "Sanguine Coil / Grand Sanguine Coil" ? "Sanguine Coil" : name;
  return SLOTS.find((s) => s.id === slot)?.items.find((i) => i.name === n);
}

export function emptySet(): SetChoice {
  const slot = (): SlotChoice => ({ item: null, tier: 0, imbues: [] });
  return { wand: slot(), helmet: slot(), armor: slot(), legs: slot(), boots: slot(), spellbook: slot(), ring: slot(), amulet: slot() };
}

export function computeSet(set: SetChoice): SetTotals {
  const t: SetTotals = { ...EMPTY(), onslaught: 0, ruse: 0, momentum: 0, transcendence: 0, amplification: 0 };
  for (const slot of Object.keys(set) as SlotId[]) {
    const ch = set[slot];
    const item = findItem(slot, ch.item);
    const s = item ? parseItem(item) : EMPTY();
    for (const im of ch.imbues) {
      const def = IMBUEMENTS[im.kind];
      if (def && im.level > 0 && def.slots.includes(slot)) def.apply(s, def.values[im.level - 1]);
    }
    t.ml += s.ml;
    for (const [k, v] of Object.entries(s.eml)) t.eml[k as keyof ItemStats["eml"]] = (t.eml[k as keyof ItemStats["eml"]] ?? 0) + (v ?? 0);
    for (const [k, v] of Object.entries(s.prot)) t.prot[k as Elem] = (t.prot[k as Elem] ?? 0) + (v ?? 0);
    t.critExtra += s.critExtra;
    t.critChance += s.critChance;
    t.lifeLeech += s.lifeLeech;
    t.manaLeech += s.manaLeech;
    t.speed += s.speed;
    t.arm += s.arm;
    t.augments.push(...s.augments.map((a) => `${item?.name}: ${a}`));
  }
  const amp = 1 + AMPLIFICATION[set.boots.tier] / 100;
  t.amplification = AMPLIFICATION[set.boots.tier];
  t.onslaught = ONSLAUGHT[set.wand.tier] * amp;
  t.ruse = RUSE[set.armor.tier] * amp;
  t.momentum = MOMENTUM[set.helmet.tier] * amp;
  t.transcendence = TRANSCENDENCE[set.legs.tier] * amp;
  return t;
}

/** Set recomendado para o Master Sorcerer 800+ (ponto de partida do comparador). */
export function recommendedSet(): SetChoice {
  const s = emptySet();
  s.wand = { item: "Sanguine Coil", tier: 0, imbues: [{ kind: "epiphany", level: 3 }, { kind: "void", level: 3 }] };
  s.helmet = { item: "Moonsilver Nimbus Hat", tier: 0, imbues: [{ kind: "epiphany", level: 3 }, { kind: "void", level: 3 }] };
  s.armor = { item: "Soulmantle", tier: 0, imbues: [{ kind: "vampirism", level: 3 }, { kind: "lichshroud", level: 3 }] };
  s.legs = { item: "Soulshanks", tier: 0, imbues: [] };
  s.boots = { item: "Sanguine Boots", tier: 0, imbues: [{ kind: "swiftness", level: 3 }] };
  s.spellbook = { item: "Arcanomancer Folio", tier: 0, imbues: [{ kind: "dragonhide", level: 3 }] };
  s.ring = { item: "Charged Arcanomancer Sigil", tier: 0, imbues: [] };
  s.amulet = { item: "Enchanted Flamingo Amulet of Destruction", tier: 0, imbues: [] };
  return s;
}

/** Serializa o set para URL (compartilhar e enviar ao simulador). */
export function encodeSet(set: SetChoice): string {
  const parts = (Object.keys(set) as SlotId[]).map((slot) => {
    const c = set[slot];
    const imb = c.imbues.filter((i) => i.level > 0).map((i) => `${i.kind}${i.level}`).join("+");
    return [slot, c.item ?? "", c.tier, imb].join("~");
  });
  return encodeURIComponent(parts.join("|"));
}

export function decodeSet(raw: string | null): SetChoice | null {
  if (!raw) return null;
  try {
    const set = emptySet();
    for (const part of decodeURIComponent(raw).split("|")) {
      const [slot, item, tier, imb] = part.split("~");
      if (!(slot in set)) continue;
      set[slot as SlotId] = {
        item: item || null,
        tier: Math.max(0, Math.min(10, Number(tier) || 0)),
        imbues: (imb ?? "")
          .split("+")
          .filter(Boolean)
          .map((x) => ({ kind: x.slice(0, -1), level: Math.max(0, Math.min(3, Number(x.slice(-1)))) as 0 | 1 | 2 | 3 })),
      };
    }
    return set;
  } catch {
    return null;
  }
}
