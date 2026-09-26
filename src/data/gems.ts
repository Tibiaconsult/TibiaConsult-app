// Gemas da Wheel of Destiny (Sage Gem). Fonte: TibiaWiki (Basic Mod, Supreme Mod) e planner do TibiaPal, 26/09/2026.

export const DOMAINS = [
  { id: "top-left", name: "Superior esquerdo", revelation: "Gift of Life", color: "verde" },
  { id: "top-right", name: "Superior direito", revelation: "Beam Mastery", color: "vermelho" },
  { id: "bottom-left", name: "Inferior esquerdo", revelation: "Lord of Destruction", color: "azul-esverdeado" },
  { id: "bottom-right", name: "Inferior direito", revelation: "Avatar of Storm", color: "roxo" },
] as const;

export interface Mod {
  name: string;
  grades: [string, string, string, string];
  slot?: "1" | "2" | "1-2";
}

export const BASIC_SLOT1: Mod[] = [
  { name: "Mana", grades: ["+600", "+660", "+720", "+900"] },
  { name: "Mana + Fire Resistance", grades: ["+300 / +1%", "+330 / +1,1%", "+360 / +1,2%", "+450 / +1,5%"] },
  { name: "Mana + Energy Resistance", grades: ["+300 / +1%", "+330 / +1,1%", "+360 / +1,2%", "+450 / +1,5%"] },
  { name: "Mana + Earth Resistance", grades: ["+300 / +1%", "+330 / +1,1%", "+360 / +1,2%", "+450 / +1,5%"] },
  { name: "Mana + Ice Resistance", grades: ["+300 / +1%", "+330 / +1,1%", "+360 / +1,2%", "+450 / +1,5%"] },
  { name: "Hit Points", grades: ["+100", "+110", "+120", "+150"] },
  { name: "Hit Points + resistência (fogo, terra, energia ou gelo)", grades: ["+50 / +1%", "+55 / +1,1%", "+60 / +1,2%", "+75 / +1,5%"] },
  { name: "Capacity", grades: ["+200", "+220", "+240", "+300"] },
  { name: "Capacity + resistência (fogo, terra, energia ou gelo)", grades: ["+100 / +1%", "+110 / +1,1%", "+120 / +1,2%", "+150 / +1,5%"] },
  { name: "Fire / Earth / Energy / Ice Resistance", grades: ["+2%", "+2,2%", "+2,4%", "+3%"] },
  { name: "Mitigation Multiplier", grades: ["20%", "22%", "24%", "30%"] },
];

export const BASIC_SLOT2: Mod[] = [
  { name: "Physical Resistance", grades: ["+1%", "+1,1%", "+1,2%", "+1,5%"] },
  { name: "Holy Resistance", grades: ["+1%", "+1,1%", "+1,2%", "+1,5%"] },
  { name: "Death Resistance", grades: ["+1%", "+1,1%", "+1,2%", "+1,5%"] },
  { name: "Fire / Earth / Energy / Ice Resistance", grades: ["+2%", "+2,2%", "+2,4%", "+3%"] },
  { name: "Par positivo entre dois elementos (ex.: fogo + gelo)", grades: ["+1% / +1%", "+1,1% / +1,1%", "+1,2% / +1,2%", "+1,5% / +1,5%"] },
  { name: "Par com penalidade (ex.: fogo +3% / terra -2%)", grades: ["+3% / -2%", "+3,3% / -2%", "+3,6% / -2%", "+4,5% / -2%"] },
  { name: "Holy +1,5% / Death -1% (ou o inverso)", grades: ["+1,5% / -1%", "+1,65% / -1%", "+1,8% / -1%", "+2,25% / -1%"] },
  { name: "Mana Drain Resistance", grades: ["+3%", "+3,3%", "+3,6%", "+4,5%"] },
  { name: "Life Drain Resistance", grades: ["+3%", "+3,3%", "+3,6%", "+4,5%"] },
  { name: "Mana Drain + Life Drain Resistance", grades: ["+1,5% / +1,5%", "+1,65% / +1,65%", "+1,8% / +1,8%", "+2,25% / +2,25%"] },
];

export const SUPREME: Mod[] = [
  { name: "Energy Wave: base damage", grades: ["+5%", "+5,5%", "+6%", "+7,5%"] },
  { name: "Energy Wave: critical extra damage", grades: ["+12%", "+13,2%", "+14,4%", "+18%"] },
  { name: "Energy Wave: cooldown", grades: ["-1 s", "-1 s, +0,33% Momentum", "-1 s, +0,66% Momentum", "-1 s, +1% Momentum"] },
  { name: "Great Energy Beam: base damage", grades: ["+10%", "+11%", "+12%", "+15%"] },
  { name: "Great Energy Beam: critical extra damage", grades: ["+15%", "+16,5%", "+18%", "+22,5%"] },
  { name: "Great Death Beam: base damage", grades: ["+10%", "+11%", "+12%", "+15%"] },
  { name: "Great Death Beam: critical extra damage", grades: ["+15%", "+16,5%", "+18%", "+22,5%"] },
  { name: "Great Fire Wave: base damage", grades: ["+5%", "+5,5%", "+6%", "+7,5%"] },
  { name: "Great Fire Wave: critical extra damage", grades: ["+8%", "+8,8%", "+9,6%", "+12%"] },
  { name: "Hell's Core: base damage", grades: ["+8%", "+8,8%", "+9,6%", "+12%"] },
  { name: "Hell's Core: critical extra damage", grades: ["+12%", "+13,2%", "+14,4%", "+18%"] },
  { name: "Rage of the Skies: base damage", grades: ["+8%", "+8,8%", "+9,6%", "+12%"] },
  { name: "Rage of the Skies: critical extra damage", grades: ["+12%", "+13,2%", "+14,4%", "+18%"] },
  { name: "Avatar of Storm: cooldown", grades: ["-900 s", "-900 s, +0,33% Momentum", "-900 s, +0,66% Momentum", "-900 s, +1% Momentum"] },
  { name: "Ultimate Healing: base healing", grades: ["+5%", "+5,5%", "+6%", "+7,5%"] },
  { name: "Revelation Mastery: Beam Mastery", grades: ["+150", "+165", "+180", "+225"] },
  { name: "Revelation Mastery: Lord of Destruction", grades: ["+150", "+165", "+180", "+225"] },
  { name: "Revelation Mastery: Avatar of Storm", grades: ["+150", "+165", "+180", "+225"] },
  { name: "Revelation Mastery: Gift of Life", grades: ["+150", "+165", "+180", "+225"] },
  { name: "Dodge (geral)", grades: ["+0,28%", "+0,31%", "+0,34%", "+0,42%"] },
  { name: "Critical Extra Damage (geral)", grades: ["+2%", "+2,2%", "+2,4%", "+3%"] },
  { name: "Life Leech (geral)", grades: ["+2%", "+2,2%", "+2,4%", "+3%"] },
  { name: "Mana Leech (geral)", grades: ["+0,8%", "+0,88%", "+0,96%", "+1,2%"] },
];

export const GEM_RULES = [
  "Gema lesser: 1 mod básico (criaturas influenciadas). Regular: 2 básicos (Archfoe co-op). Greater: 2 básicos + 1 supremo (fiendish). O nome muda por vocação (Guardian, Marksman, Sage, Mystic e Spiritualist).",
  "Revelar: 125k lesser, 1kk regular, 6kk greater. Girar afinidade de domínio: 125k / 250k / 500k. Até 225 gemas reveladas.",
  "Uma gema por domínio, quatro no total. Vessel Resonance I libera o mod 1, II o mod 2, III o supremo.",
  "Casamento gema × VR: lesser em VR I = +1 dano e cura; regular em VR II = +1; greater em VR III = +2.",
  "Slot 1 só aceita resistência básica, HP, Mana, Capacity (puros ou com uma resistência) ou Mitigation. Slot 2 só aceita resistências. Sem mod repetido.",
  "Grade II = 5 fragmentos + 2kk (5kk supremo); III = 15 + 5kk (12,5kk); IV = 30 + 30kk (75kk). Grade IV = +50% sobre o grade I e +1 ponto permanente na Wheel.",
  "Revelation Mastery conta para o domínio da própria revelation, esteja a gema onde estiver.",
  "Nenhum cooldown cai abaixo de 50% do base. Nos mods de cooldown, subir o grade só adiciona Momentum.",
] as const;

export const GEM_BUILDS = [
  {
    name: "Energia e Death (Beam Mastery)",
    gems: [
      "[Sup. direito, Beam Mastery] Mana | Energy +2% | Revelation Mastery Beam Mastery (VR III). T2 com 350 pontos; T3 com 775 se a gema chegar ao grade IV.",
      "[Inf. esquerdo, LoD] Mana + resistência | resistência | Energy Wave cooldown -1 s (VR III).",
      "[Sup. esquerdo, GoL] Lesser: Mitigation Multiplier (VR I).",
      "[Inf. direito, Avatar] Lesser: Mana + resistência da hunt (VR I).",
    ],
  },
  {
    name: "Fogo solo (Lord of Destruction)",
    gems: [
      "[Inf. esquerdo, LoD] Mana | Fire +2% | Revelation Mastery Lord of Destruction (VR III).",
      "[Sup. direito, Beam] Mana | resistência | Great Fire Wave base ou Hell's Core base (VR III).",
      "[Sup. esquerdo, GoL] Lesser Mitigation (VR I).",
      "[Inf. direito, Avatar] Lesser Mana + resistência (VR I).",
    ],
  },
  {
    name: "Team hunt de burst",
    gems: [
      "Greater: Mana | resistência | Rage of the Skies base (energia) ou Hell's Core base (fogo).",
      "Greater: Mana | resistência | Avatar of Storm -900 s.",
      "Lesser Mitigation e lesser Mana nos outros dois domínios.",
    ],
  },
  {
    name: "Sobrevivência (Soul War, Rotten Blood)",
    gems: [
      "Greater: Mitigation | resistência principal +3% / -2% | Dodge ou Life Leech.",
      "Regular: HP + resistência | Death +1% ou Physical +1%.",
      "Lesser: Mana + resistência.",
    ],
  },
] as const;
