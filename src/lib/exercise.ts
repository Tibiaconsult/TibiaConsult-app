// Exercise weapons. Fontes (TibiaWiki, consulta em 26/09/2026):
// - Formulae, seção Skills: pontos para o próximo nível P = A·b^(skill−c); total Tp = A·(b^(skill−c) − 1)/(b − 1).
//   A: magic 1600, melee 50, distance 30, shielding 100 (fist usa a constante de melee). c: 0 no magic level, 10 nos demais.
// - Exercise Weapons: carga de wand/rod = 600 de mana; melee (e wraps) = 7,2 hits; bow = 4,32 hits; shield = 14,4 blocks.
//   Regular 500 cargas (347.222 gp ou 25 TC), durable 1.800 (1.250.000 gp ou 90 TC), lasting 14.400 (10.000.000 gp ou 720 TC). Uma carga a cada 2 s.
//   Dummies de casa (Demon, Ferumbras, Monk Exercise Dummy): +10%.
// - Loyalty: +5% a cada 360 pontos (máx. 50%) sobre os pontos de skill.

export type Skill = "magic" | "melee" | "fist" | "distance" | "shielding";
export type Voc = "sorcerer" | "druid" | "knight" | "paladin" | "monk";

export const SKILL_LABEL: Record<Skill, string> = { magic: "Magic level", melee: "Espada, machado ou clava", fist: "Fist", distance: "Distance", shielding: "Shielding" };
export const VOC_LABEL: Record<Voc, string> = { sorcerer: "Sorcerer", druid: "Druid", knight: "Knight", paladin: "Paladin", monk: "Monk" };

const A: Record<Skill, number> = { magic: 1600, melee: 50, fist: 50, distance: 30, shielding: 100 };
const C: Record<Skill, number> = { magic: 0, melee: 10, fist: 10, distance: 10, shielding: 10 };
const B: Record<Voc, Record<Skill, number>> = {
  knight: { magic: 3.0, melee: 1.1, fist: 1.1, distance: 1.4, shielding: 1.1 },
  paladin: { magic: 1.4, melee: 1.2, fist: 1.2, distance: 1.1, shielding: 1.1 },
  sorcerer: { magic: 1.1, melee: 2.0, fist: 1.5, distance: 2.0, shielding: 1.5 },
  druid: { magic: 1.1, melee: 1.8, fist: 1.5, distance: 1.8, shielding: 1.5 },
  monk: { magic: 1.25, melee: 1.4, fist: 1.1, distance: 1.5, shielding: 1.15 },
};
export const PER_CHARGE: Record<Skill, number> = { magic: 600, melee: 7.2, fist: 7.2, distance: 4.32, shielding: 14.4 };
export const WEAPONS = [
  { id: "regular", label: "Exercise", charges: 500, gold: 347222, tc: 25 },
  { id: "durable", label: "Durable", charges: 1800, gold: 1250000, tc: 90 },
  { id: "lasting", label: "Lasting", charges: 14400, gold: 10000000, tc: 720 },
] as const;

export function totalPoints(voc: Voc, skill: Skill, level: number): number {
  const b = B[voc][skill];
  return (A[skill] * (b ** (level - C[skill]) - 1)) / (b - 1);
}

export interface ExerciseResult {
  points: number;
  charges: number;
  weapons: { id: string; label: string; count: number; whole: number; gold: number; tc: number; hours: number }[];
}

/** Cargas e armas para ir de `current` (faltando `pctLeft`% para o próximo nível) até `target`. */
export function exerciseNeeded(opts: { voc: Voc; skill: Skill; current: number; pctLeft: number; target: number; loyalty: number; dummy: boolean; double: boolean }): ExerciseResult {
  const { voc, skill, current, pctLeft, target } = opts;
  const next = totalPoints(voc, skill, current + 1);
  const start = next - (next - totalPoints(voc, skill, current)) * (Math.min(100, Math.max(0, pctLeft)) / 100);
  const need = Math.max(0, totalPoints(voc, skill, target) - start);
  // loyalty, dummy de casa e evento multiplicam os pontos ganhos por carga
  const mult = (1 + opts.loyalty / 100) * (opts.dummy ? 1.1 : 1) * (opts.double ? 2 : 1);
  const charges = need / (PER_CHARGE[skill] * mult);
  return {
    points: need,
    charges,
    weapons: WEAPONS.map((w) => {
      const count = charges / w.charges;
      const whole = Math.ceil(count - 1e-9);
      return { id: w.id, label: w.label, count, whole, gold: whole * w.gold, tc: whole * w.tc, hours: (charges * 2) / 3600 };
    }),
  };
}
