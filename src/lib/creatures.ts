// Apoio à lista e à ficha de criaturas: bestiário (kills e charm points), elementos, raridade e hunts onde aparece.
// Só roda no servidor: os dados das criaturas não vão para o navegador.

import { CHARMS, CHARMS_VERY_RARE, DIFFICULTIES, KILLS, KILLS_VERY_RARE } from "@/data/bestiary";
import { CREATURES, Creature } from "@/data/creatures";
import { HUNTS } from "@/data/hunts";
import { ATTACK_ELEMENTS } from "@/lib/creature-labels";

export * from "@/lib/creature-labels";

/** Kills para completar o bestiário (1º, 2º e 3º estágio) e charm points. */
export function bestiaryOf(c: Creature): { kills: [number, number, number]; charms: number } | null {
  const i = DIFFICULTIES.indexOf((c.level ?? "") as (typeof DIFFICULTIES)[number]);
  if (i < 0) return null;
  const rare = /very rare/i.test(c.occurrence ?? "");
  return { kills: rare ? KILLS_VERY_RARE : KILLS[i], charms: rare ? CHARMS_VERY_RARE[i] : CHARMS[i] };
}

/** Elemento de ataque em que a criatura mais sofre (e o dano recebido nele). */
export function weakness(c: Creature): { el: string; pct: number } | null {
  let best: { el: string; pct: number } | null = null;
  for (const el of ATTACK_ELEMENTS) {
    const v = c.mods[el];
    if (v !== undefined && (!best || v > best.pct)) best = { el, pct: v };
  }
  return best;
}

export function huntsOf(name: string) {
  return HUNTS.filter((h) => h.creatures.some((c) => c.name === name)).map((h) => ({ id: h.id, name: h.name, city: h.city }));
}

export const ALL_CREATURES = Object.values(CREATURES);
export const getCreature = (name: string): Creature | undefined => CREATURES[name];
