// Fórmula de dano por "base power".
// Bônus de level B(L): TibiaWiki, Formulae, seção Base Damage and Healing (oficial desde 18/10/2022).
// Termo de magic level e faixa min/max: reconstrução da comunidade a partir de dados reais
// (crystalserver PR #797, "15.25 Base Spell Power"): avg = B(L) + ML × sqrt(0,4 × bp) + bp/6; min 0,88 × avg; max 1,12 × avg.
// Não é fórmula publicada pela CipSoft: por isso o simulador aceita calibração por um hit observado.

import { Element, Spell } from "@/data/spells";

export function levelBonus(level: number): number {
  const s = Math.floor((Math.sqrt(2 * level + 2025) + 5) / 10);
  return Math.floor((level + 1000) / s) + 50 * s - 450;
}

export interface DamageInputs {
  level: number;
  magicLevel: number;
  /** ML elemental extra (fire ML, energy ML, death ML) */
  elementalML: Partial<Record<Element, number>>;
  stance: Element | null;
  lordOfDestruction: 0 | 1 | 2 | 3;
  /** bônus de base damage por feitiço, em fração (0.10 = +10%) */
  basePowerBonus: Record<string, number>;
  /** dano flat somado (revelations +4/+9/+20, perks de proficiência) */
  flatBonus: number;
  /** crit chance geral extra (fração), além dos 5% intrínsecos */
  critChance: number;
  /** crit extra geral (fração), além dos 10% intrínsecos */
  critExtra: number;
  /** crit chance extra por feitiço (fração) */
  spellCritChance?: Record<string, number>;
  /** crit extra por feitiço (fração) */
  spellCritExtra?: Record<string, number>;
  /** crit extra por elemento do feitiço (fração) */
  elementCritExtra?: Partial<Record<Element, number>>;
  /** crit chance por elemento do feitiço (fração) */
  elementCritChance?: Partial<Record<Element, number>>;
  /** elemental pierce geral (fração), ex.: 0,08 da Aura of Exposed Weakness */
  pierce: number;
  /** pierce extra por elemento (fração), ex.: proficiência */
  elementPierce?: Partial<Record<Element, number>>;
  /** Onslaught: chance (fração) de +60% de dano */
  onslaught?: number;
  /** multiplicador de calibração (1 = fórmula pura) */
  calibration: number;
}

export interface Target {
  name: string;
  sensitivity: Record<Element, number>;
  mitigation: number;
}

export interface DamageResult {
  element: Element | null;
  totalML: number;
  basePower: number;
  avgRaw: number;
  min: number;
  max: number;
  avg: number;
  expected: number;
  sensitivity: number;
}

export function effectiveSensitivity(base: number, pierce: number): number {
  if (base <= 0) return 0;
  let inc = pierce;
  if (base > 1) inc = Math.ceil((pierce * 100) / 2) / 100;
  return Math.min(base * 2, base + inc);
}

export function computeDamage(spell: Spell, element: Element | null, inp: DamageInputs, target?: Target): DamageResult {
  const bp0 = spell.base ?? 0;
  let bpMult = 1 + (inp.basePowerBonus[spell.id] ?? 0);
  if (inp.stance === "fire" && spell.element === "fire") bpMult += 0.04 + [0, 0.02, 0.03, 0.04][inp.lordOfDestruction];
  const bp = bp0 * bpMult;

  const elementalML = element ? (inp.elementalML[element] ?? 0) : 0;
  const totalML = inp.magicLevel + elementalML;
  const avgRaw = (levelBonus(inp.level) + totalML * Math.sqrt(0.4 * bp) + bp / 6 + inp.flatBonus) * inp.calibration;
  const min = Math.floor(avgRaw * 0.88);
  const max = Math.floor(avgRaw * 1.12);

  let critChance = 0.05 + inp.critChance + (inp.spellCritChance?.[spell.id] ?? 0) + (element ? (inp.elementCritChance?.[element] ?? 0) : 0);
  let critExtra = 0.1 + inp.critExtra + (inp.spellCritExtra?.[spell.id] ?? 0) + (element ? (inp.elementCritExtra?.[element] ?? 0) : 0);
  if (inp.stance === "energy" && spell.element === "energy") critChance += 0.04 + [0, 0.02, 0.03, 0.04][inp.lordOfDestruction];
  if (inp.stance === "death" && spell.element === "death") critExtra += 0.3 + [0, 0.15, 0.255, 0.3][inp.lordOfDestruction];
  critChance = Math.min(1, critChance);
  const critMult = 1 + critChance * critExtra;
  const onslaughtMult = 1 + (inp.onslaught ?? 0) * 0.6;

  let sens = 1;
  let mit = 0;
  if (target && element) {
    const pierce = inp.pierce + (inp.elementPierce?.[element] ?? 0);
    sens = effectiveSensitivity(target.sensitivity[element] ?? 1, pierce);
    mit = target.mitigation;
  }
  const expected = avgRaw * critMult * onslaughtMult * sens * (1 - mit);
  return { element, totalML, basePower: bp, avgRaw, min, max, avg: Math.round(avgRaw), expected, sensitivity: sens };
}
