// Bosstiary: estágio e pontos de cada boss pelos kills, e o bônus de loot de equipamento pelo total de boss points.
// Regras: TibiaWiki, Cyclopedia (seção Boss Points) e Bosstiary/Categories.

import { BOSS_CATEGORY, BossCategory } from "@/data/bosses";

export const STAGE_LABEL = ["Prowess", "Expertise", "Mastery"];

/** Estágios completos (0 a 3) e pontos ganhos com esses kills. */
export function bossProgress(cat: BossCategory, kills: number): { stage: number; points: number; next: number | null } {
  const c = BOSS_CATEGORY[cat];
  const stage = c.kills.filter((k) => kills >= k).length;
  return { stage, points: c.points.slice(0, stage).reduce((a, b) => a + b, 0), next: stage < 3 ? c.kills[stage] : null };
}

/**
 * Bônus de loot de equipamento do boss no slot, em %.
 * 0 a 250 pontos: 25% + 1% a cada 10 pontos; 250 a 1250: 50% + 1% a cada 20; depois de 1250 (100%),
 * cada 1% custa 5 pontos a mais que o anterior (25, 30, 35...). Mesma fórmula da wiki.
 */
export function lootBonus(points: number): number {
  if (points < 250) return 25 + Math.floor(points / 10);
  if (points < 1250) return 50 + Math.floor((points - 250) / 20);
  return Math.floor(100 + (Math.sqrt((8 * (points - 1250)) / 5 + 81) - 9) / 2);
}

/** Pontos que faltam para o próximo 1% de bônus. */
export function pointsToNextBonus(points: number): number {
  const now = lootBonus(points);
  let p = points;
  while (lootBonus(p) === now) p++;
  return p - points;
}

export const SECOND_SLOT = 1500;
