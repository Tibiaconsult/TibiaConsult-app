// Equipamento do sorcerer por slot. Fonte: TibiaWiki, 26/09/2026. Só itens com magic level que sorcerer usa.

export interface Item {
  name: string;
  level: number;
  ml: string;
  extras?: string;
  protection?: string;
  cls?: number;
  arm?: number;
  source?: string;
  best?: boolean;
}

export interface Slot {
  id: string;
  name: string;
  forgePerk: string;
  items: Item[];
  advice: string;
}

export const SLOTS: Slot[] = [
  {
    id: "wand",
    name: "Wand",
    forgePerk: "Onslaught (dano)",
    advice: "Sanguine Coil até o 1000, Moonsilver Channeler depois. Imbuements: Powerful Epiphany + Powerful Void.",
    items: [
      { name: "Moonsilver Channeler", level: 1000, ml: "+6", extras: "death ML +1", protection: "energy +7%", cls: 4, source: "Phosphorus (Make Believe)", best: true },
      { name: "Stellar Moonsilver Channeler", level: 1000, ml: "+6", extras: "death ML +1", protection: "energy +7% (wiki)", cls: 4, source: "craft: Soultainter + Sanguine Coil + Channeler T0 + Auric Moon Sigil" },
      { name: "Sanguine Coil / Grand Sanguine Coil", level: 600, ml: "+4", extras: "fire ML +1, energy ML +1, crit extra +5%, life leech 2%, mana leech 1%", protection: "earth +7%", cls: 4, source: "Bag You Covet (Rotten Blood)", best: true },
      { name: "Crypt Bile", level: 450, ml: "+4", protection: "fire +6%", cls: 4 },
      { name: "Soultainter", level: 400, ml: "+4", extras: "aceita imbuement Strike", protection: "death +12%", cls: 4, source: "Bag You Desire (Soul War)" },
      { name: "Amber Wand", level: 330, ml: "+2", extras: "energy ML +2", protection: "ice +6%", cls: 4 },
      { name: "Falcon Wand", level: 300, ml: "+3", protection: "fire +8%", cls: 4, source: "Grand Master Oberon" },
      { name: "Inferniarch Wand", level: 300, ml: "+3", extras: "fire ML +1", protection: "earth +5%", cls: 4, source: "Arbaziloth" },
      { name: "Eldritch Wand", level: 250, ml: "+2", extras: "fire ML +1, perfect shot", protection: "energy +4%", cls: 4, source: "The Brainstealer" },
    ],
  },
  {
    id: "helmet",
    name: "Elmo",
    forgePerk: "Momentum (reset de cooldown)",
    advice: "Nimbus Hat, depois Regalia. Em hunt de fogo com Great Fire Wave, o Stag Helmet compete. Imbuements: Epiphany + Void.",
    items: [
      { name: "Moonsilver Nimbus Hat", level: 800, arm: 10, ml: "+4", extras: "augment Death Echo +8% crit extra", protection: "physical +3%, ice +8%", cls: 4, source: "Make Believe (boss)", best: true },
      { name: "Arcanomancer Regalia", level: 400, arm: 9, ml: "+3", protection: "physical +3%, earth +7%", cls: 4, source: "Primal Ordeal / Magma Bubble / Plunder Patriarch" },
      { name: "Stag Helmet", level: 350, arm: 8, ml: "+2", extras: "fire ML +2, augment Great Fire Wave +6,5% crit extra", protection: "physical +2%, energy +8%", cls: 4 },
      { name: "Dreadfire Headpiece", level: 300, arm: 8, ml: "+2", extras: "augment Energy Wave +4% mana leech", protection: "physical +2%, death +6%", cls: 4, source: "Arbaziloth" },
      { name: "Falcon Circlet", level: 300, arm: 8, ml: "+2", protection: "fire +9%", cls: 4, source: "Grand Master Oberon" },
      { name: "Eldritch Cowl", level: 250, arm: 7, ml: "+2", protection: "ice +7%", cls: 4, source: "The Brainstealer" },
      { name: "Galea Mortis", level: 220, arm: 7, ml: "+2", protection: "death +6%, holy -3%", cls: 3, source: "King Zelos" },
      { name: "Gnome Helmet", level: 200, arm: 8, ml: "+2", protection: "physical +3%, energy +8%, ice -2%", cls: 3 },
    ],
  },
  {
    id: "armor",
    name: "Armadura",
    forgePerk: "Ruse (dodge)",
    advice: "Soulmantle (2 slots). Em energia ou fogo, a Norcferatu Bloodhide (energy ML +6, fire ML +3) rende mais dano, com 1 slot e sem proteção física.",
    items: [
      { name: "Soulmantle", level: 400, arm: 17, ml: "+4", protection: "physical +4%", cls: 4, source: "Bag You Desire (Soul War)", best: true },
      { name: "Norcferatu Bloodhide", level: 270, arm: 16, ml: "energy ML +6, fire ML +3", extras: "augments UE Strike +14% crit extra e +5% crit chance", protection: "earth +8%", cls: 4 },
      { name: "Dawnfire Sherwani", level: 270, arm: 16, ml: "+4", protection: "fire +10%, earth -2%", cls: 4, source: "Timira" },
      { name: "Arcane Dragon Robe", level: 300, arm: 15, ml: "+3", extras: "energy ML +1, augment Energy Wave +5% life leech", protection: "ice +12%, fire -6%", cls: 4, source: "Despor" },
      { name: "Toga Mortis", level: 220, arm: 16, ml: "+4", protection: "death +6%", cls: 3, source: "King Zelos" },
      { name: "Firemind / Thundermind / Frostmind / Earthmind Raiment", level: 200, arm: 15, ml: "+4", protection: "+8% do elemento, -8% do oposto", cls: 2 },
      { name: "Dream Shroud", level: 180, arm: 12, ml: "+3", protection: "energy +10%", cls: 3, source: "Alptramun" },
    ],
  },
  {
    id: "legs",
    name: "Pernas",
    forgePerk: "Transcendence (avatar por alguns segundos)",
    advice: "Soulshanks. Em hunt de beam com Beam Mastery, a Stoic Iks Faulds (+7% base nos dois great beams) compete.",
    items: [
      { name: "Soulshanks", level: 400, arm: 10, ml: "+3", protection: "death +10%", cls: 4, source: "Bag You Desire (Soul War)", best: true },
      { name: "Stoic Iks Faulds", level: 250, arm: 8, ml: "+2", extras: "augment Great Energy Beam +7% base e Great Death Beam +7% base", protection: "fire +6%", cls: 4, source: "Mitmah Vanguard (Iksupan)" },
      { name: "Dawnfire Pantaloons", level: 300, arm: 8, ml: "+2", protection: "physical +3%", cls: 4, source: "Timira" },
      { name: "Gnome Legs", level: 200, arm: 9, ml: "+2", protection: "energy +7%, ice -2%", cls: 3 },
      { name: "Gill Legs", level: 150, arm: 7, ml: "+1", protection: "earth +8%, fire -8%", cls: 2 },
    ],
  },
  {
    id: "boots",
    name: "Botas",
    forgePerk: "Amplification (amplia os outros perks)",
    advice: "Sanguine Boots, sem concorrente. Imbuement: Swiftness.",
    items: [
      { name: "Sanguine Boots", level: 500, arm: 3, ml: "+2", extras: "speed +10, death ML +1, augments Avatar of Storm -900 s, Hell's Core +8% crit extra, Energy Wave +8% crit extra", protection: "physical +2%, ice +8%", cls: 4, source: "Bag You Covet (Rotten Blood)", best: true },
      { name: "Norcferatu Fangstompers", level: 270, arm: 2, ml: "+1", extras: "augment UE Strike +33% base", protection: "death +3%", cls: 4 },
      { name: "Stoic Iks Sandals", level: 250, arm: 2, ml: "+1", extras: "augment Great Energy Beam e Great Death Beam +5% crit extra", protection: "ice +6%", cls: 4, source: "Mitmah Vanguard" },
      { name: "Alchemist's Boots", level: 250, arm: 2, ml: "+1", protection: "physical +2%", cls: 4, source: "The Monster" },
      { name: "Pair of Dreamwalkers", level: 180, arm: 2, ml: "+1", protection: "earth +8%", cls: 3, source: "Alptramun" },
      { name: "Pair of Nightmare Boots", level: 140, arm: 2, ml: "+1", protection: "energy +6%", cls: 3 },
    ],
  },
  {
    id: "spellbook",
    name: "Spellbook",
    forgePerk: "sem perk; defesa +60% desde 06/2026, conta para a mitigação",
    advice: "Arcanomancer Folio. Em fogo ou energia, o Alchemist's Notepad (fire ML +3, energy ML +3) compete.",
    items: [
      { name: "Arcanomancer Folio", level: 400, ml: "+5", extras: "fire ML +1, energy ML +1, def 36", protection: "physical +3%, fire +8%", cls: 4, source: "Primal Ordeal / Magma Bubble / Plunder Patriarch", best: true },
      { name: "Stag Spellbook", level: 350, ml: "+5", extras: "def 34", protection: "physical +2%, energy +6%", cls: 4 },
      { name: "Eldritch Folio", level: 300, ml: "+4", extras: "death ML +1, Magic Shield +80 e 8%, def 34", protection: "earth +6%", cls: 4, source: "The Brainstealer" },
      { name: "Alchemist's Notepad", level: 250, ml: "+2", extras: "fire ML +3, energy ML +3, def 32", protection: "death +5%", cls: 4, source: "The Monster" },
      { name: "Umbral Master Spellbook", level: 250, ml: "+4", extras: "def 32", protection: "+5% nos 4 elementos", source: "Gaz'haragoth" },
      { name: "Lion Spellbook", level: 220, ml: "+4", extras: "def 32", protection: "physical +3%, ice +7%", source: "Drume" },
      { name: "Cocoa Grimoire", level: 200, ml: "+3", extras: "fire ML +1, Magic Shield +150 e 3%, def 31", protection: "physical +2%, energy +5%", source: "Sugar Daddy" },
    ],
  },
  {
    id: "ring",
    name: "Anel",
    forgePerk: "sem perk",
    advice: "Charged Arcanomancer Sigil enquanto durar a carga (3 h); o Sigil comum fica no slot depois.",
    items: [
      { name: "Charged Arcanomancer Sigil", level: 400, ml: "+2", extras: "fire ML +1, energy ML +1, 3 h", protection: "fire, earth, energy, ice +4%", source: "Plunder Patriarch", best: true },
      { name: "Arcanomancer Sigil", level: 400, ml: "0", extras: "fire ML +1, energy ML +1, permanente", protection: "fire, earth, energy, ice +4%", source: "Primal Set" },
      { name: "Ring of Green Plasma", level: 100, ml: "+2", extras: "regeneração, 30 min" },
    ],
  },
  {
    id: "amulet",
    name: "Amuleto",
    forgePerk: "sem perk",
    advice: "Flamingo of Destruction (dura mais e dá energy ML). Theurgic em hunt de terra ou com chão de terra.",
    items: [
      { name: "Enchanted Flamingo Amulet of Destruction", level: 270, ml: "+3", extras: "energy ML +1, 180 min", protection: "physical +3%, fire +11%", source: "The Moonsnow Magnolia (Shards of a Broken Moon)", best: true },
      { name: "Enchanted Theurgic Amulet", level: 220, ml: "+3", extras: "120 min", protection: "physical +3%, earth +14%", source: "Bragrumol, Mozradek, Urmahlullu, Xogixath" },
      { name: "Collar of Green Plasma", level: 150, ml: "+3", extras: "regeneração, 30 min" },
    ],
  },
];

export const IMBUEMENTS = [
  { slot: "Elmo", best: "Powerful Epiphany (ML +4) + Powerful Void (8% mana leech)" },
  { slot: "Wand", best: "Epiphany + Void (dano e mana) ou Void + Vampirism (sustain). Strike só em Soultainter, Falcon, Naga, Lion e Wand of Destruction." },
  { slot: "Armadura", best: "Proteção do elemento da hunt a 15% (Dragon Hide fogo, Snake Skin terra, Quara Scale gelo, Cloud Fabric energia; Lich Shroud death 10%) ou Powerful Vampirism (25% life leech)." },
  { slot: "Spellbook", best: "Uma proteção elemental, mesma lógica da armadura." },
  { slot: "Botas", best: "Powerful Swiftness (+30 speed)." },
  { slot: "Taxas", best: "Basic 7.500 gp, Intricate 60.000 gp, Powerful 250.000 gp, limpar 15.000 gp. Powerful exige o boss ou quest correspondente." },
] as const;
