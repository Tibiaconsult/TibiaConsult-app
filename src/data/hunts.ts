// Fichas de hunt. Fonte: TibiaWiki, 26/09/2026.

export interface Creature {
  name: string;
  hp: number;
  exp: number;
  /** dano recebido por elemento, em % */
  taken: { physical: number; death: number; holy: number; ice: number; fire: number; energy: number; earth: number };
  attacks: string;
}

export interface Hunt {
  id: string;
  name: string;
  city: string;
  access: string;
  floors: string[];
  creatures: Creature[];
  element: string;
  set: { slot: string; item: string; why: string }[];
  play: string[];
  warning?: string;
}

export const HUNTS: Hunt[] = [
  {
    id: "lost-souls",
    name: "Lost Souls (Brain Grounds / Netherworld)",
    city: "Darashia",
    access: "Feaster of Souls Quest (level 250, recomendado 300). Teleport invisível ao norte do Jakundaf Desert. Chão amarelo (ulcer) tira 15%, 20% e 25% do HP máximo em terra por andar.",
    floors: [
      "1º andar: Grim Reaper e Flimsy Lost Soul.",
      "2º andar: Grim Reaper, Flimsy e Mean Lost Soul, com portal para o Netherworld.",
      "3º andar: Flimsy, Mean e Freakish Lost Soul.",
      "Netherworld: as três Lost Souls e os bosses Unaz the Mean, Irgix the Flimsy e Vok the Freakish.",
    ],
    creatures: [
      { name: "Grim Reaper", hp: 3900, exp: 5500, taken: { physical: 75, death: 20, holy: 110, ice: 35, fire: 110, energy: 110, earth: 60 }, attacks: "Melee até 320 (815 com Blood Rage), Blood Ball 225-275, Death Beam 350-720, Explosion Wave físico até 300, SD físico até 165, haste, cura própria." },
      { name: "Flimsy Lost Soul", hp: 4000, exp: 4500, taken: { physical: 50, death: 0, holy: 120, ice: 100, fire: 100, energy: 80, earth: 80 }, attacks: "Melee até 350, Envenom (terra) 200-350, Death Berserk 360-500, Energy Beam 300-420, Life Drain 320-400, Drill Bolt até 450." },
      { name: "Mean Lost Soul", hp: 5000, exp: 5580, taken: { physical: 45, death: 0, holy: 130, ice: 100, fire: 100, energy: 70, earth: 80 }, attacks: "Melee; mana drain só contra druid." },
      { name: "Freakish Lost Soul", hp: 7000, exp: 7020, taken: { physical: 40, death: 0, holy: 140, ice: 100, fire: 100, energy: 65, earth: 30 }, attacks: "Melee; mana drain só contra druid." },
    ],
    element: "FOGO. Death é zero nas Lost Souls e 20% no Grim Reaper. Fogo bate 100% nas Lost Souls e 110% no Grim Reaper. Holy seria o melhor (110 a 140%), só pelo charm Divine Wrath.",
    set: [
      { slot: "Wand", item: "Sanguine Coil", why: "fire ML +1; Epiphany + Void" },
      { slot: "Elmo", item: "Stag Helmet ou Moonsilver Nimbus Hat", why: "Stag dá fire ML +2 e crit no Great Fire Wave" },
      { slot: "Armadura", item: "Soulmantle", why: "phys +4%; Vampirism + Lich Shroud (Death Beam e Death Berserk) ou Cloud Fabric" },
      { slot: "Pernas", item: "Soulshanks", why: "death +10%" },
      { slot: "Botas", item: "Sanguine Boots", why: "Hell's Core +8% crit extra" },
      { slot: "Spellbook", item: "Arcanomancer Folio", why: "imbuement Lich Shroud ou Snake Skin, nunca Dragon Hide" },
      { slot: "Amuleto", item: "Enchanted Theurgic Amulet", why: "earth +14% contra o Envenom e o chão de terra" },
      { slot: "Anel", item: "Charged Arcanomancer Sigil", why: "+4% nos quatro elementos" },
    ],
    play: [
      "Master of Flames + Aura of Exposed Weakness (Sapped Strength no 3º andar).",
      "Great Fire Wave nos segundos 0 e 4, Energy Wave convertida no 2, Great Death Beam ou Death Echo convertidos no 6. Hell's Core e Ultimate Flame Strike no burst.",
      "Nunca SD, Great Death Beam natural nem Death Echo natural.",
      "Charms: Divine Wrath nas Lost Souls (holy 120 a 140%). No Grim Reaper, Divine Wrath, Zap ou Enflame empatam (110%). Curse é inútil.",
      "Prey de dano na Freakish (7.020 exp) e na Flimsy.",
    ],
    warning: "Spawn de level 300 a 500: no 896 o exp por hora tende a ser baixo. Faz sentido para bestiário (4 × 50 charm points), Stone Skin Amulet ou task.",
  },
];
