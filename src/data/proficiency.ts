// Árvores de proficiência das wands (um perk por nível). Fonte: TibiaWiki, Weapon Proficiency Tables, 26/09/2026.
// A ordem importa: links compartilhados guardam o índice (0 Sanguine, 1 Moonsilver, 2 Grand Sanguine, 3 Stellar Moonsilver).
// Grand Sanguine e Stellar Moonsilver são itens diferentes das versões comuns: mesmos atributos-base, perks mais fortes.

import type { Element } from "@/data/spells";

export interface Perk {
  label: string;
  ml?: number;
  eml?: Partial<Record<Element, number>>;
  critExtra?: number;
  critChance?: number;
  elemCritExtra?: Partial<Record<Element, number>>;
  elemCritChance?: Partial<Record<Element, number>>;
  spellBase?: Record<string, number>;
  spellCritExtra?: Record<string, number>;
  spellCritChance?: Record<string, number>;
  pierce?: Partial<Record<Element, number>>;
  mlAsFlatPct?: number;
  situational?: boolean;
}

export interface WandTree {
  wand: string;
  levels: Perk[][];
}

export const PROFICIENCY: WandTree[] = [
  {
    wand: "Sanguine Coil",
    levels: [
      [{ label: "+1 Magic Level", ml: 1 }],
      [
        { label: "+10% crit extra em feitiços e runas de energia", elemCritExtra: { energy: 0.1 } },
        { label: "+10% crit extra em feitiços e runas de fogo", elemCritExtra: { fire: 0.1 } },
        { label: "+7% crit extra", critExtra: 0.07 },
      ],
      [
        { label: "+4% base no Energy Wave", spellBase: { "energy-wave": 0.04 } },
        { label: "+12,5% crit extra no Hell's Core", spellCritExtra: { "hells-core": 0.125 } },
        { label: "+3% de dano contra bosses e Sinister Embraced", situational: true },
      ],
      [
        { label: "+4% do Magic Level como dano extra nos feitiços", mlAsFlatPct: 0.04 },
        { label: "+3% base no Hell's Core", spellBase: { "hells-core": 0.03 } },
      ],
      [
        { label: "+2 Energy Magic Level", eml: { energy: 2 } },
        { label: "+2 Fire Magic Level", eml: { fire: 2 } },
      ],
      [
        { label: "+2% crit chance em feitiços e runas de energia", elemCritChance: { energy: 0.02 } },
        { label: "+2% crit chance em feitiços e runas de fogo", elemCritChance: { fire: 0.02 } },
        { label: "+10% crit extra", critExtra: 0.1 },
      ],
      [{ label: "+2% crit chance", critChance: 0.02 }],
    ],
  },
  {
    wand: "Moonsilver Channeler",
    levels: [
      [{ label: "+8% crit extra", critExtra: 0.08 }],
      [
        { label: "+3% de dano contra Humans", situational: true },
        { label: "+1 Magic Level", ml: 1 },
        { label: "+6% crit extra", critExtra: 0.06 },
      ],
      [
        { label: "+5% base no Great Fire Wave", spellBase: { "great-fire-wave": 0.05 } },
        { label: "1% de chance de míssil de death (200% do level)", situational: true },
        { label: "+5% base no Death Echo", spellBase: { "death-echo": 0.05 } },
      ],
      [
        { label: "+12,5% crit extra em feitiços e runas de fogo", elemCritExtra: { fire: 0.125 } },
        { label: "+2 Magic Level", ml: 2 },
        { label: "+12,5% crit extra em feitiços e runas de death", elemCritExtra: { death: 0.125 } },
      ],
      [
        { label: "+2,5% crit chance no Great Fire Wave", spellCritChance: { "great-fire-wave": 0.025 } },
        { label: "+2,5% crit chance na Sudden Death", spellCritChance: { "sudden-death": 0.025 } },
        { label: "+2,5% crit chance no Death Echo", spellCritChance: { "death-echo": 0.025 } },
      ],
      [
        { label: "+4% fire pierce", pierce: { fire: 0.04 } },
        { label: "+12% crit extra", critExtra: 0.12 },
        { label: "+4% death pierce", pierce: { death: 0.04 } },
      ],
      [{ label: "+6% de dano contra alvos abaixo de 30% de vida", situational: true }],
    ],
  },
  {
    wand: "Grand Sanguine Coil",
    levels: [
      [{ label: "+1 Magic Level", ml: 1 }],
      [
        { label: "+10% crit extra em feitiços e runas de energia", elemCritExtra: { energy: 0.1 } },
        { label: "+10% crit extra em feitiços e runas de fogo", elemCritExtra: { fire: 0.1 } },
        { label: "+7% crit extra", critExtra: 0.07 },
      ],
      [
        { label: "+8% base no Energy Wave", spellBase: { "energy-wave": 0.08 } },
        { label: "+25% crit extra no Hell's Core", spellCritExtra: { "hells-core": 0.25 } },
        { label: "+3% de dano contra bosses e Sinister Embraced", situational: true },
      ],
      [
        { label: "+8% do Magic Level como dano extra nos feitiços", mlAsFlatPct: 0.08 },
        { label: "+6% base no Hell's Core", spellBase: { "hells-core": 0.06 } },
      ],
      [
        { label: "+2 Energy Magic Level", eml: { energy: 2 } },
        { label: "+2 Fire Magic Level", eml: { fire: 2 } },
      ],
      [
        { label: "+2% crit chance em feitiços e runas de energia", elemCritChance: { energy: 0.02 } },
        { label: "+2% crit chance em feitiços e runas de fogo", elemCritChance: { fire: 0.02 } },
        { label: "+10% crit extra", critExtra: 0.1 },
      ],
      [{ label: "+3% crit chance", critChance: 0.03 }],
    ],
  },
  {
    wand: "Stellar Moonsilver Channeler",
    levels: [
      [{ label: "+12% crit extra", critExtra: 0.12 }],
      [
        { label: "+3% de dano contra Humans", situational: true },
        { label: "+1 Magic Level", ml: 1 },
        { label: "+6% crit extra", critExtra: 0.06 },
      ],
      [
        { label: "+7,5% base no Great Fire Wave", spellBase: { "great-fire-wave": 0.075 } },
        { label: "1% de chance de míssil de death (300% do level)", situational: true },
        { label: "+7,5% base no Death Echo", spellBase: { "death-echo": 0.075 } },
      ],
      [
        { label: "+12,5% crit extra em feitiços e runas de fogo", elemCritExtra: { fire: 0.125 } },
        { label: "+2 Magic Level", ml: 2 },
        { label: "+12,5% crit extra em feitiços e runas de death", elemCritExtra: { death: 0.125 } },
      ],
      [
        { label: "+2,5% crit chance no Great Fire Wave", spellCritChance: { "great-fire-wave": 0.025 } },
        { label: "+2,5% crit chance na Sudden Death", spellCritChance: { "sudden-death": 0.025 } },
        { label: "+2,5% crit chance no Death Echo", spellCritChance: { "death-echo": 0.025 } },
      ],
      [
        { label: "+4% fire pierce", pierce: { fire: 0.04 } },
        { label: "+12% crit extra", critExtra: 0.12 },
        { label: "+4% death pierce", pierce: { death: 0.04 } },
      ],
      [{ label: "+9% de dano contra alvos abaixo de 30% de vida", situational: true }],
    ],
  },
];

export interface ProfEffects {
  ml: number;
  eml: Partial<Record<Element, number>>;
  critExtra: number;
  critChance: number;
  elemCritExtra: Partial<Record<Element, number>>;
  elemCritChance: Partial<Record<Element, number>>;
  spellBase: Record<string, number>;
  spellCritExtra: Record<string, number>;
  spellCritChance: Record<string, number>;
  pierce: Partial<Record<Element, number>>;
  mlAsFlatPct: number;
}

export function profEffects(tree: WandTree | undefined, picks: number[], level: number): ProfEffects {
  const e: ProfEffects = { ml: 0, eml: {}, critExtra: 0, critChance: 0, elemCritExtra: {}, elemCritChance: {}, spellBase: {}, spellCritExtra: {}, spellCritChance: {}, pierce: {}, mlAsFlatPct: 0 };
  if (!tree) return e;
  const addMap = <K extends string>(dst: Partial<Record<K, number>>, src?: Partial<Record<K, number>>) => {
    if (!src) return;
    for (const [k, v] of Object.entries(src) as [K, number][]) dst[k] = (dst[k] ?? 0) + v;
  };
  tree.levels.slice(0, level).forEach((opts, i) => {
    const p = opts[picks[i] ?? 0];
    if (!p) return;
    e.ml += p.ml ?? 0;
    e.critExtra += p.critExtra ?? 0;
    e.critChance += p.critChance ?? 0;
    e.mlAsFlatPct += p.mlAsFlatPct ?? 0;
    addMap(e.eml, p.eml);
    addMap(e.elemCritExtra, p.elemCritExtra);
    addMap(e.elemCritChance, p.elemCritChance);
    addMap(e.spellBase, p.spellBase);
    addMap(e.spellCritExtra, p.spellCritExtra);
    addMap(e.spellCritChance, p.spellCritChance);
    addMap(e.pierce, p.pierce);
  });
  return e;
}
