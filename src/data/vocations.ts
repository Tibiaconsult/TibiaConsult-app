// Druid, Knight e Paladin. Fonte: TibiaWiki (infobox de cada feitiço, Wheel of Destiny/Revelation Perks,
// Wheel of Destiny/Conviction Perks, Supreme Mod, Updates/15.25.3a4a52 de 16/06/2026 e o patch
// Updates/15.25.bd5a04 de 07/07/2026). Consulta em 26/09/2026.
// Quando o infobox da TibiaWiki não foi atualizado com o patch de 07/07/2026, vale o valor do patch
// (ex.: Strong Ice Wave 140, Divine Caldera 150, Divine Barrage 130, Blood Rage 25%, Sharpshooter 32%).

import type { Element } from "./spells";

export type VocId = "druid" | "knight" | "paladin" | "monk";

/** Como o dano escala: magic level, skill + ataque da arma, defesa do escudo (sem fórmula pública) ou dano ao longo do tempo. */
export type Scale = "ml" | "skill" | "shield" | "dot" | "monk";

export interface VSpell {
  id: string;
  name: string;
  words: string;
  level: number;
  mana: number;
  /** base power; null quando a TibiaWiki não publica */
  base: number | null;
  /** "weapon": o elemento segue a arma (magias de knight e paladin) */
  element: Element | "weapon";
  scale: Scale;
  cooldown: number;
  /** cooldown por estágio da revelation (1, 2, 3) */
  stageCooldown?: [number, number, number];
  /** trava do grupo de ataque (2 s padrão, 4 s nos focus) */
  lock: number;
  group?: { id: string; label: string; cooldown: number };
  hit: "single" | "area" | "chain";
  /** alvos extras de corrente (chain) */
  chain?: number;
  area: string;
  icon: string;
  rune?: boolean;
  /** vem da Wheel (revelation) */
  revelation?: string;
  notes?: string;
}

export interface Stance {
  name: string;
  effect: string;
}

export interface Augment {
  /** id da magia afetada */
  spell: string;
  label: string;
  t1: string;
  t2: string;
  /** efeito numérico por estágio: base (fração somada), cd (segundos a menos), chain (+alvos), mana (a menos) */
  fx: { t1: { base?: number; cd?: number; chain?: number; mana?: number }; t2: { base?: number; cd?: number; chain?: number; mana?: number } };
}

export interface Revelation {
  name: string;
  effect: string;
}

export interface SupremeMod {
  mod: string;
  values: [string, string, string, string];
}

export interface Weapon {
  name: string;
  level: number;
  hands: "Uma" | "Duas";
  kind: string;
  /** ataque físico + elemental (knight) ou atk mod (paladin) */
  attack: string;
  bonus: string;
  resist?: string;
}

export interface VocationData {
  id: VocId;
  name: string;
  promoted: string;
  /** elementos que a vocação escolhe na rotação */
  elements: Element[];
  intro: string;
  mainStat: "ml" | "melee" | "distance" | "fist";
  stances: Stance[];
  spells: VSpell[];
  revelations: Revelation[];
  convictions: Revelation[];
  augments: Augment[];
  supreme: SupremeMod[];
  weapons: Weapon[];
  weaponNote: string;
  tips: string[];
}

const SUP = (a: string, b: string, c: string, d: string): [string, string, string, string] => [a, b, c, d];

const GENERIC_REVELATIONS: Revelation[] = [
  { name: "Gift of Life", effect: "Cura antes de um golpe fatal, dando uma segunda chance. Desde 06/2026 também recupera 20/25/30% da mana máxima." },
];

// ---------------------------------------------------------------- DRUID
const DRUID: VocationData = {
  id: "druid",
  name: "Druid",
  promoted: "Elder Druid",
  elements: ["ice", "earth"],
  mainStat: "ml",
  intro:
    "Mago de gelo e terra, com a melhor cura da party. Desde 06/2026 escolhe uma stance: Elemental Synthesis para dano ou Shared Conservation para curar dois alvos ao mesmo tempo.",
  stances: [
    { name: "Elemental Synthesis", effect: "+10% do magic level como ML extra de gelo e de terra. É a stance de dano." },
    {
      name: "Shared Conservation",
      effect: "Heal Friend e Nature's Embrace curam também um segundo membro da party com 30% da cura. Auto-cura +10%. É a stance de suporte.",
    },
  ],
  spells: [
    { id: "strong-ice-wave", name: "Strong Ice Wave", words: "exevo gran frigo hur", level: 40, mana: 170, base: 140, element: "ice", scale: "ml", cooldown: 4, lock: 2, hit: "area", area: "Wave curta à frente (maior desde 06/2026)", icon: "strongicewave", notes: "Base 150 → 140 no patch de 07/07/2026." },
    { id: "terra-wave", name: "Terra Wave", words: "exevo tera hur", level: 38, mana: 170, base: 120, element: "earth", scale: "ml", cooldown: 4, lock: 2, hit: "area", area: "Wave à frente", icon: "terrawave" },
    { id: "eternal-winter", name: "Eternal Winter", words: "exevo gran mas frigo", level: 60, mana: 1050, base: 200, element: "ice", scale: "ml", cooldown: 40, lock: 4, group: { id: "focus", label: "Focus", cooldown: 40 }, hit: "area", area: "64 sqm em volta", icon: "eternalwinter" },
    { id: "wrath-of-nature", name: "Wrath of Nature", words: "exevo gran mas tera", level: 55, mana: 700, base: 175, element: "earth", scale: "ml", cooldown: 40, lock: 4, group: { id: "focus", label: "Focus", cooldown: 40 }, hit: "area", area: "101 sqm em volta", icon: "wrathofnature" },
    { id: "ice-burst", name: "Ice Burst", words: "exevo ulus frigo", level: 300, mana: 230, base: 115, element: "ice", scale: "ml", cooldown: 22, stageCooldown: [22, 18, 14], lock: 2, group: { id: "bursts", label: "Bursts of Nature", cooldown: 22 }, hit: "area", area: "Anel em volta", icon: "iceburst", revelation: "Twin Bursts", notes: "+20/40/60% contra alvos acima de 60% de vida (conta na simulação como metade do tempo)." },
    { id: "terra-burst", name: "Terra Burst", words: "exevo ulus tera", level: 300, mana: 230, base: 115, element: "earth", scale: "ml", cooldown: 22, stageCooldown: [22, 18, 14], lock: 2, group: { id: "bursts", label: "Bursts of Nature", cooldown: 22 }, hit: "area", area: "Anel em volta", icon: "terraburst", revelation: "Twin Bursts", notes: "Divide o grupo Bursts of Nature com o Ice Burst." },
    { id: "forked-glacier", name: "Forked Glacier", words: "exevo fur frigo", level: 90, mana: 180, base: 90, element: "ice", scale: "ml", cooldown: 6, lock: 2, hit: "chain", chain: 6, area: "Alvo + até 6 inimigos próximos (salto de 4 sqm)", icon: "forkedglacier", notes: "Novo em 06/2026. Base 97 → 90 no patch de 07/07/2026." },
    { id: "forked-thorns", name: "Forked Thorns", words: "exevo fur tera", level: 80, mana: 180, base: 97, element: "earth", scale: "ml", cooldown: 6, lock: 2, hit: "chain", chain: 5, area: "Alvo + até 5 inimigos próximos (salto de 4 sqm)", icon: "forkedthorns", notes: "Novo em 06/2026. Base 105 → 97 no patch de 07/07/2026." },
    { id: "ultimate-ice-strike", name: "Ultimate Ice Strike", words: "exori max frigo", level: 100, mana: 100, base: 195, element: "ice", scale: "ml", cooldown: 30, lock: 2, group: { id: "ultimate", label: "Ultimate Strikes", cooldown: 30 }, hit: "single", area: "Alvo único, alcance 7", icon: "ultimateicestrike" },
    { id: "ultimate-terra-strike", name: "Ultimate Terra Strike", words: "exori max tera", level: 90, mana: 100, base: 195, element: "earth", scale: "ml", cooldown: 30, lock: 2, group: { id: "ultimate", label: "Ultimate Strikes", cooldown: 30 }, hit: "single", area: "Alvo único, alcance 7", icon: "ultimateterrastrike" },
    { id: "strong-ice-strike", name: "Strong Ice Strike", words: "exori gran frigo", level: 80, mana: 60, base: 115, element: "ice", scale: "ml", cooldown: 8, lock: 2, group: { id: "special", label: "Special", cooldown: 8 }, hit: "single", area: "Alvo único, alcance 7", icon: "strongicestrike" },
    { id: "strong-terra-strike", name: "Strong Terra Strike", words: "exori gran tera", level: 70, mana: 60, base: 115, element: "earth", scale: "ml", cooldown: 8, lock: 2, group: { id: "special", label: "Special", cooldown: 8 }, hit: "single", area: "Alvo único, alcance 7", icon: "strongterrastrike" },
    { id: "ice-strike", name: "Ice Strike", words: "exori frigo", level: 8, mana: 20, base: 45, element: "ice", scale: "ml", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "icestrike" },
    { id: "terra-strike", name: "Terra Strike", words: "exori tera", level: 13, mana: 20, base: 45, element: "earth", scale: "ml", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "terrastrike" },
    { id: "ice-wave", name: "Ice Wave", words: "exevo frigo hur", level: 18, mana: 25, base: 35, element: "ice", scale: "ml", cooldown: 4, lock: 2, hit: "area", area: "Wave curta", icon: "icewave" },
    { id: "envenom", name: "Envenom", words: "utori pox", level: 50, mana: 30, base: 350, element: "earth", scale: "dot", cooldown: 40, lock: 2, hit: "single", area: "Veneno no alvo", icon: "envenom", notes: "Dano ao longo do tempo: fica fora do cálculo de DPS." },
    { id: "avalanche", name: "Avalanche (runa)", words: "adori mas frigo", level: 30, mana: 0, base: 50, element: "ice", scale: "ml", cooldown: 2, lock: 2, hit: "area", area: "Bola grande no alvo", icon: "avalancherune", rune: true, notes: "Base 50 desde 06/2026." },
    { id: "stone-shower", name: "Stone Shower (runa)", words: "adori mas tera", level: 28, mana: 0, base: 50, element: "earth", scale: "ml", cooldown: 2, lock: 2, hit: "area", area: "Bola grande no alvo", icon: "stoneshowerrune", rune: true, notes: "Base 50 desde 06/2026." },
    { id: "icicle", name: "Icicle (runa)", words: "adori frigo", level: 28, mana: 0, base: 60, element: "ice", scale: "ml", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "iciclerune", rune: true },
    { id: "stalagmite", name: "Stalagmite (runa)", words: "adori tera", level: 24, mana: 0, base: 30, element: "earth", scale: "ml", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "stalagmiterune", rune: true },
  ],
  revelations: [
    { name: "Twin Bursts", effect: "Libera Ice Burst e Terra Burst (anel em volta). +20/40/60% contra alvos acima de 60% de vida. Cooldown 22/18/14 s. Dividem o grupo Bursts of Nature." },
    { name: "Blessing of the Grove", effect: "Heal Friend e Nature's Embrace podem dar cura crítica. Cura +5/7,5/10% em alvos entre 30 e 60% de vida, dobrado abaixo de 30%." },
    { name: "Avatar of Nature", effect: "Vira avatar: redução de dano e todo ataque sai crítico com dano crítico extra." },
    ...GENERIC_REVELATIONS,
  ],
  convictions: [
    { name: "Healing Link", effect: "Ao curar alguém com Nature's Embrace ou Heal Friend, cura a si mesmo em 25% do valor (era 10% antes de 06/2026)." },
    { name: "Runic Mastery", effect: "Ao usar runa, 25% de chance de +10% de ML naquele uso (+20% se a vocação fabrica a runa: Avalanche e Stone Shower para druid)." },
  ],
  augments: [
    { spell: "terra-wave", label: "Terra Wave", t1: "+6,5% base", t2: "+10% life leech", fx: { t1: { base: 0.065 }, t2: {} } },
    { spell: "strong-ice-wave", label: "Strong Ice Wave", t1: "+6% base", t2: "Área maior", fx: { t1: { base: 0.06 }, t2: {} } },
    { spell: "forked", label: "Forked Spells", t1: "−2 s de cooldown", t2: "+1 alvo", fx: { t1: { cd: 2 }, t2: { chain: 1 } } },
    { spell: "heal-friend", label: "Heal Friend", t1: "+4% cura base", t2: "+6% cura base", fx: { t1: {}, t2: {} } },
    { spell: "mass-healing", label: "Mass Healing", t1: "+4% cura base", t2: "Área maior", fx: { t1: {}, t2: {} } },
  ],
  supreme: [
    { mod: "Eternal Winter: dano base", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Eternal Winter: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Strong Ice Wave: dano base", values: SUP("+8%", "+8,8%", "+9,5%", "+12%") },
    { mod: "Strong Ice Wave: crit extra", values: SUP("+15%", "+16,5%", "+18%", "+22,5%") },
    { mod: "Terra Wave: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Terra Wave: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Ice Burst: dano base", values: SUP("+7%", "+7,7%", "+8,4%", "+10,5%") },
    { mod: "Ice Burst: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Terra Burst: dano base", values: SUP("+7%", "+7,7%", "+8,4%", "+10,5%") },
    { mod: "Terra Burst: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Nature's Embrace: cooldown / momentum", values: SUP("−5 s", "−5 s / +0,33%", "−5 s / +0,66%", "−5 s / +1%") },
    { mod: "Avatar of Nature: cooldown / momentum", values: SUP("−900 s", "−900 s / +0,33%", "−900 s / +0,66%", "−900 s / +1%") },
    { mod: "Heal Friend, Mass Healing, Ultimate Healing: cura base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Revelation Mastery (Avatar, Blessing, Gift of Life, Twin Bursts)", values: SUP("+150 pts", "+165 pts", "+180 pts", "+225 pts") },
  ],
  weapons: [
    { name: "Stellar Moonsilver Sceptre", level: 1000, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +6, ice ML +1, healing ML +2", resist: "terra +7%" },
    { name: "Moonsilver Sceptre", level: 1000, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +6, ice ML +1, healing ML +2", resist: "terra +7%" },
    { name: "Grand Sanguine Rod", level: 600, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +4, ice ML +1, earth ML +1", resist: "death +7%" },
    { name: "Sanguine Rod", level: 600, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +4, ice ML +1, earth ML +1", resist: "death +7%" },
    { name: "Crypt Jaw", level: 450, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +4", resist: "energia +6%" },
    { name: "Soulhexer", level: 400, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +4", resist: "gelo +12%" },
    { name: "Amber Rod", level: 330, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +2, ice ML +2", resist: "fogo +6%" },
    { name: "Inferniarch Rod", level: 300, hands: "Uma", kind: "Rod", attack: "-", bonus: "ML +3, earth ML +1", resist: "death +5%" },
  ],
  weaponNote:
    "Outras peças de druid com sprite e atributos no Meu char: Arboreal Crown e Tome, Soulshroud, Soulstrider, Norcferatu Bonecloak (earth ML +6), Mystical Dragon Robe, Sanguine Galoshes, Stag Boots e Charged Arboreal Ring.",
  tips: [
    "Hunt de gelo: Strong Ice Wave a cada 4 s, Eternal Winter no focus, Ice Burst quando o lure estiver cheio e com vida alta.",
    "Hunt de terra: Terra Wave e Wrath of Nature. Forked Thorns entra quando os bichos estão espalhados.",
    "Elemental Synthesis soma 10% do ML no gelo e na terra: em ML 110 são 11 níveis a mais nas magias de dano.",
  ],
};

// ---------------------------------------------------------------- KNIGHT
const KNIGHT: VocationData = {
  id: "knight",
  name: "Knight",
  promoted: "Elite Knight",
  elements: ["physical"],
  mainStat: "melee",
  intro:
    "Tanque da party. O dano das magias segue o ataque e o elemento da arma. Desde 06/2026 escolhe entre Blood Rage (dano) e Protector (defesa), e ganhou Shield Bash e Shield Slam.",
  stances: [
    { name: "Blood Rage", effect: "+25% de skill de espada, machado ou clava sobre o total (era 30%, reduzido em 07/07/2026). Recebe 15% a mais de dano." },
    { name: "Protector", effect: "+30% de shielding. Recebe 15% a menos de dano, mas também causa 15% a menos." },
  ],
  spells: [
    { id: "fierce-berserk", name: "Fierce Berserk", words: "exori gran", level: 90, mana: 360, base: 92, element: "weapon", scale: "skill", cooldown: 6, lock: 2, hit: "area", area: "Todos os sqm em volta", icon: "fierceberserk", notes: "Mana 340 → 360 em 06/2026." },
    { id: "front-sweep", name: "Front Sweep", words: "exori min", level: 70, mana: 200, base: 80, element: "weapon", scale: "skill", cooldown: 6, lock: 2, hit: "area", area: "3 sqm à frente (5 com o augment T2)", icon: "frontsweep", notes: "Base 72 → 80 em 06/2026." },
    { id: "berserk", name: "Berserk", words: "exori", level: 35, mana: 125, base: 44, element: "weapon", scale: "skill", cooldown: 4, lock: 2, hit: "area", area: "Todos os sqm em volta", icon: "berserk" },
    { id: "groundshaker", name: "Groundshaker", words: "exori mas", level: 33, mana: 200, base: 32, element: "weapon", scale: "skill", cooldown: 8, lock: 2, hit: "area", area: "Raio de 3 sqm", icon: "groundshaker" },
    { id: "annihilation", name: "Annihilation", words: "exori gran ico", level: 110, mana: 300, base: 125, element: "weapon", scale: "skill", cooldown: 30, lock: 2, hit: "single", area: "Alvo adjacente", icon: "annihilation" },
    { id: "executioners-throw", name: "Executioner's Throw", words: "exori amp kor", level: 300, mana: 225, base: 60, element: "weapon", scale: "skill", cooldown: 18, stageCooldown: [18, 14, 10], lock: 2, hit: "chain", chain: 2, area: "Alvo + 2/3/4 próximos", icon: "executionersthrow", revelation: "Executioner's Throw", notes: "+100/125/150% em alvos abaixo de 30% de vida (fora da simulação)." },
    { id: "brutal-strike", name: "Brutal Strike", words: "exori ico", level: 16, mana: 30, base: 39, element: "weapon", scale: "skill", cooldown: 6, lock: 2, hit: "single", area: "Alvo adjacente", icon: "brutalstrike" },
    { id: "whirlwind-throw", name: "Whirlwind Throw", words: "exori hur", level: 28, mana: 40, base: 32, element: "weapon", scale: "skill", cooldown: 6, lock: 2, hit: "single", area: "Alvo até 5 sqm", icon: "whirlwindthrow" },
    { id: "shield-slam", name: "Shield Slam", words: "exori scu", level: 30, mana: 90, base: 52, element: "physical", scale: "shield", cooldown: 6, lock: 2, hit: "area", area: "Todos os adjacentes", icon: "shieldslam", notes: "Novo em 06/2026. Dano pela defesa do escudo e −50% no próximo ataque do alvo. Fórmula não publicada: fica fora do DPS." },
    { id: "shield-bash", name: "Shield Bash", words: "exori ico scu", level: 18, mana: 30, base: 55, element: "physical", scale: "shield", cooldown: 4, lock: 2, hit: "single", area: "Alvo adjacente", icon: "shieldbash", notes: "Novo em 06/2026. Pela defesa do escudo. Fórmula não publicada: fica fora do DPS." },
    { id: "inflict-wound", name: "Inflict Wound", words: "utori kor", level: 40, mana: 30, base: 90, element: "physical", scale: "dot", cooldown: 30, lock: 2, hit: "single", area: "Sangramento no alvo", icon: "inflictwound", notes: "Dano ao longo do tempo: fora do DPS." },
  ],
  revelations: [
    { name: "Executioner's Throw", effect: "Arremessa a arma no alvo e salta em 2/3/4 inimigos. +100/125/150% em alvos abaixo de 30% de vida. Cooldown 18/14/10 s." },
    { name: "Combat Mastery", effect: "1% menos dano recebido a cada 14/12/10% de vida perdida (dobra com escudo). 1% mais dano a cada 14/12/10% de vida perdida do alvo (dobra com arma de duas mãos). Valores do patch de 07/07/2026." },
    { name: "Avatar of Steel", effect: "Vira avatar: redução de dano e todo ataque sai crítico com dano crítico extra." },
    ...GENERIC_REVELATIONS,
  ],
  convictions: [
    { name: "Battle Healing", effect: "+10% nas magias de cura; o bônus dobra com escudo (era triplicado, reduzido em 07/07/2026)." },
  ],
  augments: [
    { spell: "fierce-berserk", label: "Fierce Berserk", t1: "−30 de mana", t2: "+10% base", fx: { t1: { mana: 30 }, t2: { base: 0.1 } } },
    { spell: "front-sweep", label: "Front Sweep", t1: "+40% base", t2: "+2 sqm (5 no total)", fx: { t1: { base: 0.4 }, t2: {} } },
    { spell: "groundshaker", label: "Groundshaker", t1: "−2 s de cooldown", t2: "+12,5% base", fx: { t1: { cd: 2 }, t2: { base: 0.125 } } },
    { spell: "shield-slam", label: "Shield Slam", t1: "+15% life leech", t2: "+25% de redução (75% no total)", fx: { t1: {}, t2: {} } },
    { spell: "intense-wound-cleansing", label: "Intense Wound Cleansing", t1: "+125% cura base", t2: "−60 s de cooldown", fx: { t1: {}, t2: {} } },
  ],
  supreme: [
    { mod: "Fierce Berserk: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Fierce Berserk: crit extra", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Front Sweep: dano base", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Front Sweep: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Annihilation: dano base", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Annihilation: crit extra", values: SUP("+15%", "+16,5%", "+18%", "+22,5%") },
    { mod: "Berserk: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Berserk: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Groundshaker: dano base", values: SUP("+6,5%", "+7,15%", "+7,8%", "+9,75%") },
    { mod: "Groundshaker: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Executioner's Throw: dano base", values: SUP("+6%", "+6,6%", "+7,2%", "+9%") },
    { mod: "Executioner's Throw: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Executioner's Throw: cooldown / momentum", values: SUP("−2 s", "−2 s / +0,33%", "−2 s / +0,66%", "−2 s / +1%") },
    { mod: "Fair Wound Cleansing: cura base", values: SUP("+10%", "+11%", "+12%", "+15%") },
    { mod: "Avatar of Steel: cooldown / momentum", values: SUP("−900 s", "−900 s / +0,33%", "−900 s / +0,66%", "−900 s / +1%") },
    { mod: "Revelation Mastery (Avatar, Combat Mastery, Executioner's, Gift of Life)", values: SUP("+150 pts", "+165 pts", "+180 pts", "+225 pts") },
  ],
  weapons: [
    { name: "Stellar Moonsilver Claymore", level: 1000, hands: "Duas", kind: "Espada", attack: "6 + 54 fogo", bonus: "sword +6" },
    { name: "Stellar Moonsilver Chopper", level: 1000, hands: "Duas", kind: "Machado", attack: "6 + 54 energia", bonus: "axe +6" },
    { name: "Stellar Moonsilver Mace", level: 1000, hands: "Duas", kind: "Clava", attack: "6 + 54 gelo", bonus: "club +6" },
    { name: "Stellar Moonsilver Epee", level: 1000, hands: "Uma", kind: "Espada", attack: "6 + 50 terra", bonus: "sword +6" },
    { name: "Moonsilver Claymore", level: 1000, hands: "Duas", kind: "Espada", attack: "6 + 54 fogo", bonus: "sword +6" },
    { name: "Moonsilver Chopper", level: 1000, hands: "Duas", kind: "Machado", attack: "6 + 54 energia", bonus: "axe +6" },
    { name: "Moonsilver Mace", level: 1000, hands: "Duas", kind: "Clava", attack: "6 + 54 gelo", bonus: "club +6" },
    { name: "Moonsilver Epee", level: 1000, hands: "Uma", kind: "Espada", attack: "6 + 50 terra", bonus: "sword +6" },
    { name: "Moonsilver Axe", level: 1000, hands: "Uma", kind: "Machado", attack: "6 + 50 terra", bonus: "axe +6" },
    { name: "Moonsilver Crusher", level: 1000, hands: "Uma", kind: "Clava", attack: "6 + 50 terra", bonus: "club +6" },
    { name: "Grand Sanguine Razor", level: 600, hands: "Duas", kind: "Espada", attack: "8 + 50 energia", bonus: "sword +4" },
    { name: "Grand Sanguine Battleaxe", level: 600, hands: "Duas", kind: "Machado", attack: "8 + 50 death", bonus: "axe +4" },
    { name: "Grand Sanguine Bludgeon", level: 600, hands: "Duas", kind: "Clava", attack: "8 + 50 terra", bonus: "club +4" },
    { name: "Grand Sanguine Blade", level: 600, hands: "Uma", kind: "Espada", attack: "8 + 46 fogo", bonus: "sword +4" },
    { name: "Grand Sanguine Hatchet", level: 600, hands: "Uma", kind: "Machado", attack: "8 + 46 fogo", bonus: "axe +4" },
    { name: "Grand Sanguine Cudgel", level: 600, hands: "Uma", kind: "Clava", attack: "8 + 46 death", bonus: "club +4" },
    { name: "Soulshredder", level: 400, hands: "Duas", kind: "Espada", attack: "10 + 47 gelo", bonus: "sword +4" },
    { name: "Soulmaimer", level: 400, hands: "Duas", kind: "Clava", attack: "10 + 47 energia", bonus: "club +4" },
    { name: "Soulcutter", level: 400, hands: "Uma", kind: "Espada", attack: "7 + 45 death", bonus: "sword +4" },
    { name: "Soulbiter", level: 400, hands: "Uma", kind: "Machado", attack: "7 + 45 death", bonus: "axe +4" },
    { name: "Soulcrusher", level: 400, hands: "Uma", kind: "Clava", attack: "6 + 46 gelo", bonus: "club +4" },
  ],
  weaponNote:
    "O elemento da arma define o elemento das magias: escolha a arma pelo ponto fraco da hunt. Grand Sanguine e Stellar Moonsilver são itens diferentes das versões comuns: mesmo ataque, mas proficiência mais forte (veja a tabela abaixo). Escudo de referência: Soulbastion (defesa 55, físico e death +10%).",
  tips: [
    "Solo: Fierce Berserk a cada 6 s, Front Sweep entre eles e Annihilation no alvo mais forte.",
    "Arma de duas mãos dobra o bônus de dano do Combat Mastery; escudo dobra a redução de dano.",
    "Shield Bash e Shield Slam cortam 50% do próximo ataque do bicho: bons para segurar a party.",
  ],
};

// ---------------------------------------------------------------- PALADIN
const PALADIN: VocationData = {
  id: "paladin",
  name: "Paladin",
  promoted: "Royal Paladin",
  elements: ["holy", "physical"],
  mainStat: "distance",
  intro:
    "Dano à distância com dois caminhos: magias holy, que escalam com o magic level, e magias físicas, que escalam com distance e o ataque de arma e munição. Desde 06/2026 escolhe entre Sharpshooter e Divine Defiance.",
  stances: [
    { name: "Sharpshooter", effect: "+32% de distance sobre o total (era 40%, reduzido em 07/07/2026)." },
    { name: "Divine Defiance", effect: "6% do distance vira holy ML e healing ML extra (era 7,5%). 12% de dodge contra inimigos não adjacentes (era 15%)." },
  ],
  spells: [
    { id: "divine-caldera", name: "Divine Caldera", words: "exevo mas san", level: 50, mana: 160, base: 150, element: "holy", scale: "ml", cooldown: 4, lock: 2, hit: "area", area: "Raio de 3 sqm em volta", icon: "divinecaldera", notes: "Base 140 → 160 em 06/2026 e 160 → 150 em 07/07/2026." },
    { id: "divine-barrage", name: "Divine Barrage", words: "exori dir san", level: 70, mana: 175, base: 130, element: "holy", scale: "ml", cooldown: 4, lock: 2, hit: "area", area: "Alvo e a área em volta dele", icon: "divinebarrage", notes: "Novo em 06/2026. Base 140 → 130 em 07/07/2026." },
    { id: "divine-grenade", name: "Divine Grenade", words: "exevo tempo mas san", level: 300, mana: 160, base: 190, element: "holy", scale: "ml", cooldown: 26, stageCooldown: [26, 20, 14], lock: 2, hit: "area", area: "Explode no pé do alvo após 3 s", icon: "divinegrenade", revelation: "Divine Grenade", notes: "+16% de base por estágio acima do 1 (conta na simulação)." },
    { id: "divine-missile", name: "Divine Missile", words: "exori san", level: 40, mana: 20, base: 60, element: "holy", scale: "ml", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "divinemissile" },
    { id: "strong-ethereal-spear", name: "Strong Ethereal Spear", words: "exori gran con", level: 90, mana: 55, base: 38, element: "weapon", scale: "skill", cooldown: 8, lock: 2, hit: "single", area: "Alvo único", icon: "strongetherealspear" },
    { id: "ethereal-spear", name: "Ethereal Spear", words: "exori con", level: 23, mana: 25, base: 25, element: "weapon", scale: "skill", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "etherealspear" },
    { id: "ethereal-barrage", name: "Ethereal Barrage", words: "exori dir moe", level: 60, mana: 135, base: null, element: "physical", scale: "skill", cooldown: 4, lock: 2, hit: "area", area: "Alvo e a área em volta dele", icon: "etherealbarrage", notes: "Novo em 06/2026. A TibiaWiki ainda não publica o base power: fica fora do DPS." },
    { id: "holy-flash", name: "Holy Flash", words: "utori san", level: 70, mana: 30, base: 200, element: "holy", scale: "dot", cooldown: 40, lock: 2, hit: "single", area: "Dano holy ao longo do tempo", icon: "holyflash", notes: "Fora do DPS." },
    { id: "holy-missile", name: "Holy Missile (runa)", words: "adori san", level: 27, mana: 0, base: 70, element: "holy", scale: "ml", cooldown: 2, lock: 2, hit: "single", area: "Alvo único", icon: "holymissilerune", rune: true },
  ],
  revelations: [
    { name: "Divine Grenade", effect: "Marca o pé do alvo e explode em 3 s com dano holy. +16% de base por estágio. Cooldown 26/20/14 s." },
    { name: "Divine Empowerment", effect: "Campo 3x3 no seu pé por 5 s: +8/10/12% de dano enquanto estiver nele. Cooldown 32/28/24 s." },
    { name: "Avatar of Light", effect: "Vira avatar: redução de dano e todo ataque sai crítico com dano crítico extra." },
    ...GENERIC_REVELATIONS,
  ],
  convictions: [
    { name: "Positional Tactics", effect: "+3 de distance sem monstro a 1 sqm; senão +3 de holy e healing ML." },
    { name: "Ballistic Mastery", effect: "Crossbow: +10% de crit extra. Bow: +4% de pierce físico e holy em ataques e magias." },
  ],
  augments: [
    { spell: "divine-caldera", label: "Divine Caldera", t1: "−20 de mana", t2: "+10% base", fx: { t1: { mana: 20 }, t2: { base: 0.1 } } },
    { spell: "divine-barrage", label: "Divine Barrage", t1: "+8% base", t2: "+12% base (somados)", fx: { t1: { base: 0.08 }, t2: { base: 0.12 } } },
    { spell: "strong-ethereal-spear", label: "Strong Ethereal Spear", t1: "−2 s de cooldown", t2: "+380% base (valor da TibiaWiki)", fx: { t1: { cd: 2 }, t2: { base: 3.8 } } },
    { spell: "ethereal-barrage", label: "Ethereal Barrage", t1: "+10% life leech", t2: "+10% crit chance", fx: { t1: {}, t2: {} } },
    { spell: "divine-dazzle", label: "Divine Dazzle", t1: "+2 alvos", t2: "+4 s de duração, −8 s de cooldown", fx: { t1: {}, t2: {} } },
  ],
  supreme: [
    { mod: "Divine Caldera: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Divine Caldera: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Divine Grenade: dano base", values: SUP("+6%", "+6,6%", "+7,2%", "+9%") },
    { mod: "Divine Grenade: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Divine Grenade: cooldown / momentum", values: SUP("−2 s", "−2 s / +0,33%", "−2 s / +0,66%", "−2 s / +1%") },
    { mod: "Divine Missile: dano base", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Divine Missile: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Ethereal Spear: dano base", values: SUP("+10%", "+11%", "+12%", "+15%") },
    { mod: "Ethereal Spear: crit extra", values: SUP("+15%", "+16,5%", "+18%", "+22,5%") },
    { mod: "Strong Ethereal Spear: dano base", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Strong Ethereal Spear: crit extra", values: SUP("+12%", "+13,2%", "+14,4%", "+18%") },
    { mod: "Divine Dazzle: cooldown / momentum", values: SUP("−4 s", "−4 s / +0,33%", "−4 s / +0,66%", "−4 s / +1%") },
    { mod: "Divine Empowerment: cooldown / momentum", values: SUP("−6 s", "−6 s / +0,33%", "−6 s / +0,66%", "−6 s / +1%") },
    { mod: "Salvation: cura base", values: SUP("+6%", "+6,6%", "+7,2%", "+9%") },
    { mod: "Avatar of Light: cooldown / momentum", values: SUP("−900 s", "−900 s / +0,33%", "−900 s / +0,66%", "−900 s / +1%") },
    { mod: "Revelation Mastery (Avatar, Empowerment, Grenade, Gift of Life)", values: SUP("+150 pts", "+165 pts", "+180 pts", "+225 pts") },
  ],
  weapons: [
    { name: "Stellar Moonsilver Crossbow", level: 1000, hands: "Duas", kind: "Crossbow", attack: "atk mod +11, hit +8", bonus: "distance +5", resist: "holy +7%" },
    { name: "Stellar Moonsilver Bow", level: 1000, hands: "Duas", kind: "Bow", attack: "atk mod +10, hit +7", bonus: "distance +5", resist: "fogo +7%" },
    { name: "Moonsilver Crossbow", level: 1000, hands: "Duas", kind: "Crossbow", attack: "atk mod +11, hit +8", bonus: "distance +5", resist: "holy +7%" },
    { name: "Moonsilver Bow", level: 1000, hands: "Duas", kind: "Bow", attack: "atk mod +10, hit +7", bonus: "distance +5", resist: "fogo +7%" },
    { name: "Grand Sanguine Crossbow", level: 600, hands: "Duas", kind: "Crossbow", attack: "atk mod +10, hit +7", bonus: "distance +3", resist: "fogo +6%" },
    { name: "Grand Sanguine Bow", level: 600, hands: "Duas", kind: "Bow", attack: "atk mod +9, hit +6", bonus: "distance +3", resist: "terra +6%" },
    { name: "Sanguine Crossbow", level: 600, hands: "Duas", kind: "Crossbow", attack: "atk mod +10, hit +7", bonus: "distance +3", resist: "fogo +6%" },
    { name: "Sanguine Bow", level: 600, hands: "Duas", kind: "Bow", attack: "atk mod +9, hit +6", bonus: "distance +3", resist: "terra +6%" },
    { name: "Soulpiercer", level: 400, hands: "Duas", kind: "Crossbow", attack: "atk mod +9, hit +6", bonus: "distance +3", resist: "death +7%" },
    { name: "Soulbleeder", level: 400, hands: "Duas", kind: "Bow", attack: "atk mod +8, hit +5", bonus: "distance +3", resist: "holy +7%" },
  ],
  weaponNote:
    "Ataque de munição na TibiaWiki: Spectral Bolt 78, Crystalline Arrow 65, Diamond Arrow 37 (área de 21 sqm), Shatterstorm Arrow 27 (área de 13 sqm, novas em 06/2026). No simulador, informe munição + atk mod da arma.",
  tips: [
    "Hunt de holy: Divine Caldera e Divine Barrage alternando a cada 2 s, Divine Grenade no lure. Divine Defiance soma holy ML.",
    "Hunt de físico: Sharpshooter, Strong Ethereal Spear no cooldown e ataque automático com munição de área.",
    "Crossbow favorece crit (Ballistic Mastery); bow dá pierce físico e holy.",
  ],
};


// ---------------------------------------------------------------- MONK
// Fonte: TibiaWiki (Category:Monk Spells, Harmony, Serene, Mantra, Supreme Mod, Wheel of Destiny), consulta em 26/09/2026.
const M = (
  id: string,
  name: string,
  words: string,
  level: number,
  mana: number,
  base: number,
  cooldown: number,
  hit: VSpell["hit"],
  area: string,
  icon: string,
  notes?: string,
  extra: Partial<VSpell> = {},
): VSpell => ({ id, name, words, level, mana, base, element: "weapon", scale: "monk", cooldown, lock: 2, hit, area, icon, notes, ...extra });

const MONK: VocationData = {
  id: "monk",
  name: "Monk",
  promoted: "Exalted Monk",
  elements: ["physical"],
  mainStat: "fist",
  intro:
    "Lutador de mãos nuas que também cura a party. Magias construtoras geram Harmony (até 5); magias gastadoras consomem toda a Harmony e ficam muito mais fortes. Cada ponto gerado ou gasto cura o membro da party com menor % de vida.",
  stances: [
    { name: "Virtue of Justice", effect: "+8% de fist fighting, ou +16% quando Serene." },
    { name: "Virtue of Harmony", effect: "+3% no bônus base de Harmony (+6% quando Serene) e devolve 1 Harmony a cada gastadora usada." },
    { name: "Virtue of Sustain", effect: "+35% em toda a cura das magias de monk (+70% quando Serene), incluindo a cura passiva das virtudes." },
  ],
  spells: [
    M("spiritual-outburst", "Spiritual Outburst", "exori gran mas nia", 300, 425, 42, 24, "chain", "Alvo + até 7 inimigos em corrente", "spiritualoutburst", "Gastadora (Wheel: revelation). Com Harmony cheia, repete após 1 s com 37,5/50/62,5% do dano.", { revelation: "Spiritual Outburst", chain: 7, stageCooldown: [24, 20, 16] }),
    M("sweeping-takedown", "Sweeping Takedown", "exori mas nia", 60, 195, 48, 8, "area", "Caixa 3x2 à frente + 75% na caixa seguinte", "sweepingtakedown", "Gastadora."),
    M("devastating-knockout", "Devastating Knockout", "exori gran nia", 125, 210, 62, 8, "single", "Inimigo adjacente", "devastatingknockout", "Gastadora: usa toda a Harmony num alvo."),
    M("greater-tiger-clash", "Greater Tiger Clash", "exori nia", 18, 50, 44, 8, "single", "Inimigo adjacente", "greatertigerclash", "Gastadora."),
    M("tiger-clash", "Tiger Clash", "exori infir nia", 0, 18, 15, 8, "single", "Inimigo adjacente", "tigerclash", "Gastadora."),
    M("greater-flurry-of-blows", "Greater Flurry of Blows", "exori gran mas pug", 90, 300, 86, 16, "area", "Área grande", "greaterflurryofblows", "Construtora."),
    M("thousand-fist-blows", "Thousand Fist Blows", "exori mas amp pug", 120, 145, 62, 8, "area", "Alvo e a área em volta dele", "thousandfistblow", "Construtora. Nova em 06/2026."),
    M("flurry-of-blows", "Flurry of Blows", "exori mas pug", 35, 110, 55, 4, "area", "Frente e laterais", "flurryofblows", "Construtora."),
    M("chained-penance", "Chained Penance", "exori med pug", 70, 180, 70, 4, "chain", "Alvo + 4 em corrente (raio inicial 4 desde 07/2026)", "chainedpenance", "Construtora.", { chain: 4 }),
    M("double-jab", "Double Jab", "exori pug", 14, 30, 40, 4, "single", "Inimigo adjacente", "doublejab", "Construtora."),
    M("swift-jab", "Swift Jab", "exori infir pug", 0, 3, 12, 2, "single", "Inimigo adjacente", "swiftjab", "Construtora."),
    M("forceful-uppercut", "Forceful Uppercut", "exori gran pug", 110, 325, 130, 60, "single", "Alvo adjacente", "forcefuluppercut"),
    M("mystic-repulse", "Mystic Repulse", "exori amp pug", 30, 150, 85, 12, "single", "Alvo a até 7 sqm", "mysticrepulse", "Base 72 → 85 e cooldown 20 → 12 s em 06/2026 (o infobox da TibiaWiki ainda mostra 72)."),
  ],
  revelations: [
    { name: "Spiritual Outburst", effect: "Gastadora que salta em 7 inimigos. Com Harmony cheia, repete após 1 s com 37,5/50/62,5% do dano. Cooldown 24/20/16 s." },
    { name: "Ascetic", effect: "+1/2/3% no bônus base de Harmony, e o ataque automático soma 100/200/300% do seu Mantra." },
    { name: "Avatar of Balance", effect: "Vira avatar: redução de dano e todo ataque sai crítico com dano crítico extra." },
    ...GENERIC_REVELATIONS,
  ],
  convictions: [
    { name: "Guiding Presence", effect: "Aura que divide 100% do seu Mantra com a party e aumenta em 33% os bônus passivos de party." },
    { name: "Sanctuary", effect: "Gastar Harmony cria um campo de 5 s: +2% de dano e cura por Harmony gasta, +10% de dano em inimigos adjacentes e +10% de cura em aliados adjacentes." },
  ],
  augments: [
    { spell: "mass-spirit-mend", label: "Mass Spirit Mend", t1: "+8% cura base", t2: "−4 s de cooldown", fx: { t1: {}, t2: {} } },
    { spell: "flurry-of-blows", label: "Flurry of Blows", t1: "Área maior", t2: "+15% base", fx: { t1: {}, t2: { base: 0.15 } } },
    { spell: "mystic-repulse", label: "Mystic Repulse", t1: "−6 s de cooldown", t2: "+40% base", fx: { t1: { cd: 6 }, t2: { base: 0.4 } } },
    { spell: "thousand-fist-blows", label: "Thousand Fist Blows", t1: "+40% crit extra", t2: "−6 s de cooldown", fx: { t1: {}, t2: { cd: 6 } } },
    { spell: "chained-penance", label: "Chained Penance", t1: "+1 alvo na corrente", t2: "+18% base", fx: { t1: { chain: 1 }, t2: { base: 0.18 } } },
  ],
  supreme: [
    { mod: "Spiritual Outburst: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Spiritual Outburst: crit extra", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Sweeping Takedown: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Sweeping Takedown: crit extra", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Forceful Uppercut: dano base", values: SUP("+10%", "+11%", "+12%", "+15%") },
    { mod: "Forceful Uppercut: crit extra", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Flurry of Blows: dano base", values: SUP("+6,5%", "+7,2%", "+7,9%", "+9,75%") },
    { mod: "Flurry of Blows: crit extra", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Greater Flurry of Blows: dano base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Greater Flurry of Blows: crit extra", values: SUP("+8%", "+8,8%", "+9,6%", "+12%") },
    { mod: "Focus Harmony: cooldown / momentum", values: SUP("−30 s", "−30 s / +0,33%", "−30 s / +0,66%", "−30 s / +1%") },
    { mod: "Focus Serenity: cooldown / momentum", values: SUP("−150 s", "−150 s / +0,33%", "−150 s / +0,66%", "−150 s / +1%") },
    { mod: "Spirit Mend: cura base", values: SUP("+6%", "+6,6%", "+7,2%", "+9%") },
    { mod: "Mass Spirit Mend: cura base", values: SUP("+5%", "+5,5%", "+6%", "+7,5%") },
    { mod: "Avatar of Balance: cooldown / momentum", values: SUP("−900 s", "−900 s / +0,33%", "−900 s / +0,66%", "−900 s / +1%") },
    { mod: "Revelation Mastery (Ascetic, Avatar, Gift of Life, Spiritual Outburst)", values: SUP("+150 pts", "+165 pts", "+180 pts", "+225 pts") },
  ],
  weapons: [],
  weaponNote: "As armas de punho do monk estão no Equipamento por slot, aba Arma.",
  tips: [
    "Bônus de Harmony: 7% com 1 ponto, dobrando a cada ponto até 112% com 5. Com Virtue of Harmony e Serene, chega a 208%.",
    "Serene: o monk fica Serene sempre que está solo. Em party, perde o estado se houver membros perto e 6 ou mais monstros adjacentes.",
    "Rotação base: construtoras até 5 de Harmony, depois a gastadora certa (Spiritual Outburst ou Sweeping Takedown em área, Devastating Knockout em alvo único).",
    "Runas não geram Harmony: o monk rende mais nas magias próprias.",
    "Mantra é proteção fixa contra fogo, gelo, energia e terra; dobra quando Serene.",
  ],
};

export const VOCATIONS: Record<VocId, VocationData> = { druid: DRUID, knight: KNIGHT, paladin: PALADIN, monk: MONK };
export const VOC_IDS: VocId[] = ["druid", "knight", "paladin", "monk"];
