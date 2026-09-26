// Anéis, amuletos e munição para o montador de set. Fonte: TibiaWiki (infobox de cada item, categorias Rings,
// Amulets and Necklaces e Ammunition), consulta em 26/09/2026. `vocs` vazio = qualquer vocação.

import type { EquipRow } from "./voc-equipment";

export interface ExtraRow extends EquipRow {
  vocs: string[];
  /** duração ou cargas, como na TibiaWiki */
  dur?: string;
}

const EL_PT: Record<string, string> = { physical: "físico", fire: "fogo", ice: "gelo", earth: "terra", energy: "energia", death: "death", holy: "holy" };
const ALL_ELEM = { fire: 4, earth: 4, energy: 4, ice: 4 };

function j(
  name: string,
  level: number,
  slot: "Anel" | "Amuleto",
  vocs: string[],
  sk: Record<string, number>,
  res: Record<string, number>,
  arm = 0,
  dur = "",
  extra = "",
): ExtraRow {
  const bonus = [
    ...Object.entries(sk).map(([k, v]) => `${k.replace("magic level", "ML")} ${v > 0 ? "+" : ""}${v}`),
    ...(extra ? [extra] : []),
  ].join(", ");
  const resist = Object.entries(res)
    .map(([k, v]) => `${EL_PT[k] ?? k} ${v > 0 ? "+" : ""}${v}%`)
    .join(", ");
  return { name, level, slot, kind: "", stats: arm ? `arm ${arm}` : "", bonus, resist, imb: 0, hands: "", res, sk, arm, vocs, dur };
}

const MELEE3 = { "sword fighting": 3, "axe fighting": 3, "club fighting": 3 };
const MELEE4 = { "sword fighting": 4, "axe fighting": 4, "club fighting": 4 };
const MAGE = ["sorcerer", "druid"];

export const JEWELRY: ExtraRow[] = [
  // anéis
  j("Charged Arcanomancer Sigil", 400, "Anel", ["sorcerer"], { "magic level": 2, "fire magic level": 1, "energy magic level": 1 }, ALL_ELEM, 0, "3 horas"),
  j("Arcanomancer Sigil", 400, "Anel", ["sorcerer"], { "fire magic level": 1, "energy magic level": 1 }, ALL_ELEM),
  j("Charged Arboreal Ring", 400, "Anel", ["druid"], { "magic level": 2, "healing magic level": 2 }, ALL_ELEM, 0, "3 horas"),
  j("Arboreal Ring", 400, "Anel", ["druid"], { "healing magic level": 2 }, ALL_ELEM),
  j("Charged Alicorn Ring", 400, "Anel", ["paladin"], { "distance fighting": 3, "magic level": 1, "holy magic level": 1 }, { ...ALL_ELEM, holy: 4, death: 4 }, 0, "3 horas"),
  j("Alicorn Ring", 400, "Anel", ["paladin"], { "holy magic level": 1 }, ALL_ELEM),
  j("Charged Spiritthorn Ring", 400, "Anel", ["knight"], MELEE3, { physical: 8, ...ALL_ELEM }, 2, "3 horas"),
  j("Spiritthorn Ring", 400, "Anel", ["knight"], {}, { physical: 2, ...ALL_ELEM }),
  j("Charged Ethereal Ring", 400, "Anel", ["monk"], { "fist fighting": 3, "magic level": 2 }, { physical: 4, ...ALL_ELEM }, 0, "3 horas", "life leech +2%"),
  j("Ethereal Ring", 400, "Anel", ["monk"], {}, { physical: 1, ...ALL_ELEM }),
  j("Enchanted Blister Ring", 220, "Anel", [], {}, { fire: 6 }, 0, "60 minutos"),
  j("Ring of Souls", 200, "Anel", [], {}, { physical: 2 }, 0, "2 horas", "life drain +10%"),
  j("Prismatic Ring", 120, "Anel", [], {}, { physical: 10, energy: 8 }, 0, "60 minutos"),
  j("Ring of Blue Plasma", 100, "Anel", ["paladin"], { "distance fighting": 3, "magic level": 1 }, {}, 0, "30 minutos"),
  j("Ring of Green Plasma", 100, "Anel", MAGE, { "magic level": 2 }, {}, 0, "30 minutos", "regeneração mais rápida"),
  j("Ring of Orange Plasma", 100, "Anel", ["monk"], { "fist fighting": 3, "magic level": 1 }, { physical: 2 }, 0, "30 minutos"),
  j("Ring of Red Plasma", 100, "Anel", ["knight"], MELEE3, { physical: 3 }, 0, "30 minutos"),
  j("Butterfly Ring", 50, "Anel", [], {}, { death: 3 }, 2),
  j("Might Ring", 0, "Anel", [], {}, { physical: 20, fire: 20, earth: 20, energy: 20, ice: 20, holy: 20, death: 20 }, 0, "20 cargas"),
  j("Death Ring", 0, "Anel", [], { shielding: -10 }, { death: 5 }, 1, "7,5 minutos"),
  j("Time Ring", 0, "Anel", [], {}, {}, 0, "10 minutos", "speed +30"),
  j("Sword Ring", 0, "Anel", [], { "sword fighting": 4 }, {}, 0, "30 minutos"),
  j("Axe Ring", 0, "Anel", [], { "axe fighting": 4 }, {}, 0, "30 minutos"),
  j("Club Ring", 0, "Anel", [], { "club fighting": 4 }, {}, 0, "30 minutos"),
  j("Power Ring", 0, "Anel", [], { "fist fighting": 4 }, {}, 0, "30 minutos"),
  // amuletos
  j("Enchanted Flamingo Amulet of Destruction", 270, "Amuleto", ["sorcerer"], { "magic level": 3, "energy magic level": 1 }, { physical: 3, fire: 11 }, 3, "180 minutos"),
  j("Enchanted Flamingo Amulet of Nature", 270, "Amuleto", ["druid"], { "magic level": 3, "ice magic level": 1 }, { physical: 3, fire: 11 }, 3, "180 minutos"),
  j("Enchanted Flamingo Amulet of Precision", 270, "Amuleto", ["paladin"], { "distance fighting": 4, "holy magic level": 1 }, { physical: 5, fire: 14 }, 4, "180 minutos"),
  j("Enchanted Flamingo Amulet of Valor", 270, "Amuleto", ["knight"], { ...MELEE4, shielding: 1 }, { physical: 7, fire: 12 }, 4, "180 minutos"),
  j("Enchanted Swan Amulet of Balance", 270, "Amuleto", ["monk"], { "fist fighting": 4, "magic level": 2 }, { physical: 4, ice: 12 }, 0, "180 minutos"),
  j("The Cobra Amulet", 250, "Amuleto", [], {}, { death: 9 }, 4),
  j("Lion Amulet", 230, "Amuleto", [], {}, { physical: 3, ice: 7 }, 3),
  j("Enchanted Theurgic Amulet", 220, "Amuleto", MAGE, { "magic level": 3 }, { physical: 3, earth: 14 }, 2, "120 minutos"),
  j("Enchanted Merudri Brooch", 220, "Amuleto", ["monk"], { "fist fighting": 3, "magic level": 1 }, { physical: 4, fire: 15 }, 0, "2 horas"),
  j("Rainbow Amulet", 220, "Amuleto", [], {}, { physical: 5, fire: 6, ice: -10 }, 3),
  j("Candy Necklace", 220, "Amuleto", [], {}, { physical: 3, energy: 6, earth: -5 }, 2),
  j("Enchanted Turtle Amulet", 200, "Amuleto", ["knight"], MELEE3, { physical: 7, ice: 15 }, 3, "2 horas"),
  j("Enchanted Pendulet", 180, "Amuleto", ["paladin"], { "distance fighting": 3 }, { physical: 5, energy: 18 }, 2, "2 horas"),
  j("Enchanted Sleep Shawl", 180, "Amuleto", ["paladin"], { "distance fighting": 3 }, { physical: 7, earth: 24 }, 3, "1 hora"),
  j("Exotic Amulet", 180, "Amuleto", [], {}, { physical: 4, earth: 5 }),
  j("Collar of Blue Plasma", 150, "Amuleto", ["paladin"], { "distance fighting": 4, "magic level": 2 }, {}, 0, "30 minutos"),
  j("Collar of Green Plasma", 150, "Amuleto", MAGE, { "magic level": 3 }, {}, 0, "30 minutos", "regeneração mais rápida"),
  j("Collar of Orange Plasma", 150, "Amuleto", ["monk"], { "fist fighting": 4, "magic level": 2 }, {}, 0, "30 minutos"),
  j("Collar of Red Plasma", 150, "Amuleto", ["knight"], MELEE4, { physical: 5 }, 0, "30 minutos"),
  j("Gill Necklace", 150, "Amuleto", [], {}, { physical: 15, earth: 10 }, 0, "750 cargas"),
  j("Prismatic Necklace", 150, "Amuleto", [], {}, { physical: 10, energy: 15 }, 0, "750 cargas"),
  j("Foxtail Amulet", 100, "Amuleto", [], {}, { physical: 5 }, 2),
  j("Sacred Tree Amulet", 80, "Amuleto", [], {}, { physical: 60, earth: 40 }, 0, "5 cargas"),
  j("Bonfire Amulet", 80, "Amuleto", [], {}, { physical: 60, fire: 40 }, 0, "5 cargas"),
  j("Leviathan's Amulet", 80, "Amuleto", [], {}, { physical: 60, ice: 40 }, 0, "5 cargas"),
  j("Shockwave Amulet", 80, "Amuleto", [], {}, { physical: 60, energy: 40 }, 0, "5 cargas"),
  j("Stone Skin Amulet", 0, "Amuleto", [], {}, { physical: 80, death: 80 }, 0, "5 cargas"),
  j("Elven Amulet", 0, "Amuleto", [], {}, { physical: 5, fire: 5, earth: 5, energy: 5, ice: 5, holy: 5, death: 5 }, 0, "50 cargas"),
];

function a(name: string, level: number, kind: "Arrow" | "Bolt", atk: number, el?: [string, number], note = ""): ExtraRow {
  const stats = `ataque ${atk}${el ? ` + ${EL_PT[el[0]]} ${el[1]}` : ""}`;
  return { name, level, slot: "Munição", kind, stats, bonus: note, resist: "", imb: 0, hands: "", res: {}, sk: {}, arm: 0, vocs: ["paladin"] };
}

/** Munição de paladin: flechas para bow, bolts para crossbow. Ataque físico + elemental. */
export const AMMO: ExtraRow[] = [
  a("Crystalline Arrow Fire", 300, "Arrow", 12, ["fire", 48]),
  a("Crystalline Arrow Ice", 300, "Arrow", 12, ["ice", 48]),
  a("Crystalline Arrow Earth", 300, "Arrow", 12, ["earth", 48]),
  a("Crystalline Arrow Energy", 300, "Arrow", 12, ["energy", 48]),
  a("Diamond Arrow", 150, "Arrow", 37, undefined, "dano em área"),
  a("Firestorm Arrow", 125, "Arrow", 0, ["fire", 21]),
  a("Froststorm Arrow", 125, "Arrow", 0, ["ice", 21]),
  a("Terrastorm Arrow", 125, "Arrow", 0, ["earth", 21]),
  a("Thunderstorm Arrow", 125, "Arrow", 0, ["energy", 21]),
  a("Crystalline Arrow", 90, "Arrow", 65),
  a("Envenomed Arrow", 70, "Arrow", 27, ["earth", 27]),
  a("Shatterstorm Arrow", 50, "Arrow", 27),
  a("Onyx Arrow", 40, "Arrow", 38),
  a("Tarsal Arrow", 30, "Arrow", 33),
  a("Spectral Bolt", 150, "Bolt", 78),
  a("Infernal Bolt", 110, "Bolt", 72),
  a("Prismatic Bolt", 90, "Bolt", 66),
  a("Drill Bolt", 70, "Bolt", 56),
  a("Power Bolt", 55, "Bolt", 40),
  a("Vortex Bolt", 40, "Bolt", 36),
  a("Piercing Bolt", 30, "Bolt", 33),
];
