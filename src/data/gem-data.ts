// Gemas da Wheel of Destiny: itens por vocação (TibiaWiki, página Gem), mods básicos com posição e valor do grau IV
// (motor oficial do planner do tibia.com, getAvailableBasicModsPos1/Pos2, lido em 26/09/2026; iguais para as cinco vocações)
// e recomendações do TibiaPal (tibiapal.com/wheels, consulta em 26/09/2026).

import type { WodVocId } from "./wod-vocs";

export const GEM_ITEM: Record<WodVocId, string> = { knight: "Guardian", paladin: "Marksman", sorcerer: "Sage", druid: "Mystic", monk: "Spiritualist" };

export const GEM_TIERS = [
  { prefix: "Lesser ", label: "Lesser", mods: "1 mod básico", vr: "Vessel Resonance I", drop: "criaturas influenciadas", reveal: "125 mil" },
  { prefix: "", label: "Regular", mods: "2 mods básicos", vr: "Vessel Resonance II", drop: "bosses Archfoe com loot cooperativo", reveal: "1 kk" },
  { prefix: "Greater ", label: "Greater", mods: "2 básicos + 1 supremo", vr: "Vessel Resonance III", drop: "criaturas fiendish (e, raramente, Archfoe co-op)", reveal: "6 kk" },
] as const;

/** Grau IV = valor do motor; graus I a III = I×1, ×1,1 e ×1,2 (grau IV é +50% sobre o I). */
export const GRADE_MULT = [1 / 1.5, 1.1 / 1.5, 1.2 / 1.5, 1];

export interface BasicMod {
  /** posição do ícone na folha icons-skillwheel-basicmods.png e id do mod no motor */
  id: number;
  /** em que encaixe da gema o mod pode entrar */
  pos: (1 | 2)[];
  /** [id do efeito em WOD_BASIC, valor no grau IV] */
  effects: [number, number][];
}

const P1: [number, [number, number][]][] = [
  [3, [[3, 3]]], [4, [[4, 3]]], [5, [[5, 3]]], [6, [[6, 3]]],
  [31, [[10, 150]]], [38, [[10, 75], [3, 1.5]]], [39, [[10, 75], [6, 1.5]]], [40, [[10, 75], [4, 1.5]]], [41, [[10, 75], [5, 1.5]]],
  [37, [[11, 900]]], [33, [[11, 450], [3, 1.5]]], [34, [[11, 450], [6, 1.5]]], [35, [[11, 450], [4, 1.5]]], [36, [[11, 450], [5, 1.5]]],
  [48, [[12, 300]]], [44, [[12, 150], [3, 1.5]]], [45, [[12, 150], [6, 1.5]]], [46, [[12, 150], [4, 1.5]]], [47, [[12, 150], [5, 1.5]]],
  [30, [[9, 30]]],
];
const P2: [number, [number, number][]][] = [
  [0, [[0, 1.5]]], [1, [[1, 1.5]]], [2, [[2, 1.5]]], [3, [[3, 3]]], [4, [[4, 3]]], [5, [[5, 3]]], [6, [[6, 3]]],
  [7, [[1, 2.25], [2, -1]]], [8, [[2, 2.25], [1, -1]]],
  [9, [[3, 1.5], [4, 1.5]]], [10, [[3, 1.5], [5, 1.5]]], [11, [[3, 1.5], [6, 1.5]]], [12, [[4, 1.5], [5, 1.5]]], [13, [[4, 1.5], [6, 1.5]]], [14, [[5, 1.5], [6, 1.5]]],
  [15, [[3, 4.5], [4, -2]]], [16, [[3, 4.5], [5, -2]]], [17, [[3, 4.5], [6, -2]]], [18, [[4, 4.5], [3, -2]]], [19, [[4, 4.5], [5, -2]]], [20, [[4, 4.5], [6, -2]]],
  [21, [[5, 4.5], [4, -2]]], [22, [[5, 4.5], [3, -2]]], [23, [[5, 4.5], [6, -2]]], [24, [[6, 4.5], [4, -2]]], [25, [[6, 4.5], [5, -2]]], [26, [[6, 4.5], [3, -2]]],
  [27, [[7, 4.5]]], [28, [[8, 4.5]]], [29, [[7, 2.25], [8, 2.25]]],
];

export const BASIC_MODS: BasicMod[] = (() => {
  const map = new Map<number, BasicMod>();
  for (const [id, effects] of P1) map.set(id, { id, pos: [1], effects });
  for (const [id, effects] of P2) {
    const m = map.get(id);
    if (m) m.pos.push(2);
    else map.set(id, { id, pos: [2], effects });
  }
  return [...map.values()];
})();

export interface GemRec {
  label: string;
  /** mods básicos (ids) ou teste do mod supremo pelo nome e efeito oficiais */
  basic?: number[];
  supreme?: (name: string, effect: string) => boolean;
}

const sup = (name: string, kind?: "Base Damage" | "Critical" | "Cooldown" | "Healing") => (n: string, e: string) => n === name && (!kind || e.includes(kind));
const COMMON: GemRec[] = [
  { label: "Hit Points", basic: [31] },
  { label: "Mitigation", basic: [30] },
  { label: "Qualquer resistência elemental", basic: [3, 4, 5, 6] },
];

/** Mods que o TibiaPal recomenda por vocação, ligados aos mods do planner oficial. */
export const GEM_RECS: Record<WodVocId, { basic: GemRec[]; supreme: GemRec[]; missing?: string[] }> = {
  druid: {
    basic: [...COMMON, { label: "Mana", basic: [37] }],
    supreme: [
      { label: "Revelation Mastery: Twin Bursts", supreme: sup("Revelation Mastery Twin Bursts") },
      { label: "Revelation Mastery: Blessing of the Grove", supreme: sup("Revelation Mastery Blessing of the Grove") },
      { label: "Strong Ice Wave: dano base", supreme: sup("Augmented Strong Ice Wave", "Base Damage") },
    ],
  },
  knight: {
    basic: COMMON,
    supreme: [
      { label: "Fierce Berserk: dano base", supreme: sup("Augmented Fierce Berserk", "Base Damage") },
      { label: "Front Sweep: dano base", supreme: sup("Augmented Front Sweep", "Base Damage") },
      { label: "Fair Wound Cleansing: cura", supreme: sup("Augmented Fair Wound Cleansing") },
      { label: "Revelation Mastery: Combat Mastery", supreme: sup("Revelation Mastery Combat Mastery") },
      { label: "Revelation Mastery: Executioner's Throw", supreme: sup("Revelation Mastery Executioner's Throw") },
    ],
  },
  paladin: {
    basic: COMMON,
    supreme: [
      { label: "Divine Caldera: dano base", supreme: sup("Augmented Divine Caldera", "Base Damage") },
      { label: "Revelation Mastery: Divine Empowerment", supreme: sup("Revelation Mastery Divine Empowerment") },
      { label: "Salvation: cura", supreme: sup("Augmented Salvation") },
    ],
  },
  sorcerer: {
    basic: [...COMMON, { label: "Mana", basic: [37] }],
    supreme: [
      { label: "Revelation Mastery: Beam Mastery", supreme: sup("Revelation Mastery Beam Mastery") },
      { label: "Great Energy Beam: dano base", supreme: sup("Augmented Great Energy Beam", "Base Damage") },
      { label: "Great Death Beam: dano base", supreme: sup("Augmented Great Death Beam", "Base Damage") },
      { label: "Great Fire Wave: dano base", supreme: sup("Augmented Great Fire Wave", "Base Damage") },
      { label: "Energy Wave: cooldown", supreme: sup("Augmented Energy Wave", "Cooldown") },
    ],
    missing: ["UE Base Damage: o TibiaPal ainda cita, mas não existe mais mod supremo de Ultimate Energy Strike no planner oficial."],
  },
  monk: {
    basic: COMMON,
    supreme: [
      { label: "Flurry of Blows: dano base", supreme: sup("Augmented Flurry of Blows", "Base Damage") },
      { label: "Sweeping Takedown: dano base", supreme: sup("Augmented Sweeping Takedown", "Base Damage") },
      { label: "Revelation Mastery: Ascetic", supreme: sup("Revelation Mastery Ascetic") },
      { label: "Revelation Mastery: Spiritual Outburst", supreme: sup("Revelation Mastery Spiritual Outburst") },
    ],
  },
};
