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
  /** stance ativa */
  stance: Element | null;
  /** estágio do Lord of Destruction 0..3 */
  lordOfDestruction: 0 | 1 | 2 | 3;
  /** bônus total de base damage por feitiço (wheel + gema + proficiência), em fração: 0.10 = +10% */
  basePowerBonus: Record<string, number>;
  /** bônus de dano flat das revelations (+4/+9/+20 somados) */
  flatBonus: number;
  /** crit chance geral (fração) além dos 5% intrínsecos */
  critChance: number;
  /** crit extra geral (fração) além dos 10% intrínsecos */
  critExtra: number;
  /** elemental pierce (fração), ex.: 0.08 da Aura of Exposed Weakness */
  pierce: number;
  /** multiplicador de calibração (1 = fórmula pura) */
  calibration: number;
}

export interface Target {
  name: string;
  /** sensibilidade por elemento em fração: 1 = 100% */
  sensitivity: Record<Element, number>;
  /** mitigação em fração, ex.: 0.0354 */
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
  /** média esperada já com crit, sensibilidade e mitigação */
  expected: number;
  sensitivity: number;
}

export function effectiveSensitivity(base: number, pierce: number): number {
  if (base <= 0) return 0;
  let inc = pierce;
  if (base > 1) inc = Math.ceil(pierce * 100 / 2) / 100;
  return Math.min(base * 2, base + inc);
}

export function computeDamage(spell: Spell, element: Element | null, inp: DamageInputs, target?: Target): DamageResult {
  const bp0 = spell.base ?? 0;
  let bpMult = 1 + (inp.basePowerBonus[spell.id] ?? 0);
  // Stance: +4% base em feitiço natural de fogo; LoD soma +2/3/4%.
  if (inp.stance === "fire" && spell.element === "fire") bpMult += 0.04 + [0, 0.02, 0.03, 0.04][inp.lordOfDestruction];
  const bp = bp0 * bpMult;

  const elementalML = element ? inp.elementalML[element] ?? 0 : 0;
  const totalML = inp.magicLevel + elementalML;
  const avgRaw = (levelBonus(inp.level) + totalML * Math.sqrt(0.4 * bp) + bp / 6 + inp.flatBonus) * inp.calibration;
  const min = Math.floor(avgRaw * 0.88);
  const max = Math.floor(avgRaw * 1.12);

  // Crit esperado
  let critChance = 0.05 + inp.critChance;
  let critExtra = 0.1 + inp.critExtra;
  if (inp.stance === "energy" && spell.element === "energy") critChance += 0.04 + [0, 0.02, 0.03, 0.04][inp.lordOfDestruction];
  if (inp.stance === "death" && spell.element === "death") critExtra += 0.3 + [0, 0.15, 0.255, 0.3][inp.lordOfDestruction];
  critChance = Math.min(1, critChance);
  const critMult = 1 + critChance * critExtra;

  let sens = 1;
  let mit = 0;
  if (target && element) {
    sens = effectiveSensitivity(target.sensitivity[element] ?? 1, inp.pierce);
    mit = target.mitigation;
  }
  const expected = avgRaw * critMult * sens * (1 - mit);
  return { element, totalML, basePower: bp, avgRaw, min, max, avg: Math.round(avgRaw), expected, sensitivity: sens };
}
