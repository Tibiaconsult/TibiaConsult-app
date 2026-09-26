// Imbuements. Fonte: TibiaWiki, página Imbuing (tabelas por tipo, taxas e duração), consulta em 26/09/2026.
// Cada nível exige os materiais dos níveis anteriores: Basic usa o 1º, Intricate o 1º e o 2º, Powerful os três.

export interface Imbuement {
  id: string;
  name: string;
  pt: string;
  slots: string;
  /** efeito em Basic, Intricate e Powerful */
  tiers: [string, string, string];
  /** materiais na ordem de exigência; `item` é o nome singular usado para a imagem */
  materials: { qty: number; label: string; item: string }[];
}

export const IMBUE_GOLD = [7500, 60000, 250000];
export const IMBUE_TIER = ["Basic", "Intricate", "Powerful"];
export const IMBUE_CLEAR = 15000;
export const IMBUE_HOURS = 20;

export const IMBUEMENTS: Imbuement[] = [
 {
  "id": "chop",
  "name": "Chop",
  "pt": "Machado (skill)",
  "slots": "elmos e machados",
  "tiers": [
   "+1 de axe",
   "+2 de axe",
   "+4 de axe"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Orc Teeth",
    "item": "Orc Tooth"
   },
   {
    "qty": 25,
    "label": "Battle Stones",
    "item": "Battle Stone"
   },
   {
    "qty": 20,
    "label": "Moohtant Horns",
    "item": "Moohtant Horn"
   }
  ]
 },
 {
  "id": "featherweight",
  "name": "Featherweight",
  "pt": "Capacidade",
  "slots": "mochilas",
  "tiers": [
   "+3% de capacidade",
   "+8% de capacidade",
   "+15% de capacidade"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Fairy Wings",
    "item": "Fairy Wings"
   },
   {
    "qty": 10,
    "label": "Little Bowls of Myrrh",
    "item": "Little Bowl of Myrrh"
   },
   {
    "qty": 5,
    "label": "Goosebump Leather",
    "item": "Goosebump Leather"
   }
  ]
 },
 {
  "id": "bash",
  "name": "Bash",
  "pt": "Clava (skill)",
  "slots": "elmos e clavas",
  "tiers": [
   "+1 de club",
   "+2 de club",
   "+4 de club"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Cyclops Toes",
    "item": "Cyclops Toe"
   },
   {
    "qty": 15,
    "label": "Ogre Nose Rings",
    "item": "Ogre Nose Ring"
   },
   {
    "qty": 10,
    "label": "Warmaster's Wristguards",
    "item": "Warmaster's Wristguards"
   }
  ]
 },
 {
  "id": "strike",
  "name": "Strike",
  "pt": "Crítico",
  "slots": "armas corpo a corpo, bows, crossbows e algumas wands e rods",
  "tiers": [
   "5% de chance de crítico, +5% de dano crítico",
   "5% de chance de crítico, +15% de dano crítico",
   "5% de chance de crítico, +40% de dano crítico"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Protective Charms",
    "item": "Protective Charm"
   },
   {
    "qty": 25,
    "label": "Sabreteeth",
    "item": "Sabretooth"
   },
   {
    "qty": 5,
    "label": "Vexclaw Talons",
    "item": "Vexclaw Talon"
   }
  ]
 },
 {
  "id": "reap",
  "name": "Reap",
  "pt": "Dano de death",
  "slots": "armas corpo a corpo, bows e crossbows",
  "tiers": [
   "10% do dano físico vira death",
   "25% do dano físico vira death",
   "50% do dano físico vira death"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Piles of Grave Earth",
    "item": "Pile of Grave Earth"
   },
   {
    "qty": 20,
    "label": "Demonic Skeletal Hands",
    "item": "Demonic Skeletal Hand"
   },
   {
    "qty": 5,
    "label": "Petrified Screams",
    "item": "Petrified Scream"
   }
  ]
 },
 {
  "id": "lich-shroud",
  "name": "Lich Shroud",
  "pt": "Proteção de death",
  "slots": "armaduras, escudos e spellbooks",
  "tiers": [
   "2% de proteção de death",
   "5% de proteção de death",
   "10% de proteção de death"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Flasks of Embalming Fluid",
    "item": "Flask of Embalming Fluid"
   },
   {
    "qty": 20,
    "label": "Gloom Wolf Furs",
    "item": "Gloom Wolf Fur"
   },
   {
    "qty": 5,
    "label": "Mystical Hourglasses",
    "item": "Mystical Hourglass"
   }
  ]
 },
 {
  "id": "precision",
  "name": "Precision",
  "pt": "Distance (skill)",
  "slots": "elmos, bows e crossbows",
  "tiers": [
   "+1 de distance",
   "+2 de distance",
   "+4 de distance"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Elven Scouting Glasses",
    "item": "Elven Scouting Glass"
   },
   {
    "qty": 20,
    "label": "Elven Hoofs",
    "item": "Elven Hoof"
   },
   {
    "qty": 10,
    "label": "Metal Spikes",
    "item": "Metal Spike"
   }
  ]
 },
 {
  "id": "venom",
  "name": "Venom",
  "pt": "Dano de terra",
  "slots": "armas corpo a corpo, bows e crossbows",
  "tiers": [
   "10% do dano físico vira terra",
   "25% do dano físico vira terra",
   "50% do dano físico vira terra"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Swamp Grass",
    "item": "Swamp Grass"
   },
   {
    "qty": 20,
    "label": "Poisonous Slimes",
    "item": "Poisonous Slime"
   },
   {
    "qty": 2,
    "label": "Slime Hearts",
    "item": "Slime Heart"
   }
  ]
 },
 {
  "id": "snake-skin",
  "name": "Snake Skin",
  "pt": "Proteção de terra",
  "slots": "armaduras, escudos e spellbooks",
  "tiers": [
   "3% de proteção de terra",
   "8% de proteção de terra",
   "15% de proteção de terra"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Pieces of Swampling Wood",
    "item": "Piece of Swampling Wood"
   },
   {
    "qty": 20,
    "label": "Snake Skins",
    "item": "Snake Skin"
   },
   {
    "qty": 10,
    "label": "Brimstone Fangs",
    "item": "Brimstone Fangs"
   }
  ]
 },
 {
  "id": "electrify",
  "name": "Electrify",
  "pt": "Dano de energia",
  "slots": "armas corpo a corpo, bows e crossbows",
  "tiers": [
   "10% do dano físico vira energia",
   "25% do dano físico vira energia",
   "50% do dano físico vira energia"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Rorc Feathers",
    "item": "Rorc Feather"
   },
   {
    "qty": 5,
    "label": "Peacock Feather Fans",
    "item": "Peacock Feather Fan"
   },
   {
    "qty": 1,
    "label": "Energy Vein",
    "item": "Energy Vein"
   }
  ]
 },
 {
  "id": "cloud-fabric",
  "name": "Cloud Fabric",
  "pt": "Proteção de energia",
  "slots": "armaduras, escudos e spellbooks",
  "tiers": [
   "3% de proteção de energia",
   "8% de proteção de energia",
   "15% de proteção de energia"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Wyvern Talismans",
    "item": "Wyvern Talisman"
   },
   {
    "qty": 15,
    "label": "Crawler Head Platings",
    "item": "Crawler Head Plating"
   },
   {
    "qty": 10,
    "label": "Wyrm Scales",
    "item": "Wyrm Scale"
   }
  ]
 },
 {
  "id": "scorch",
  "name": "Scorch",
  "pt": "Dano de fogo",
  "slots": "armas corpo a corpo, bows e crossbows",
  "tiers": [
   "10% do dano físico vira fogo",
   "25% do dano físico vira fogo",
   "50% do dano físico vira fogo"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Fiery Hearts",
    "item": "Fiery Heart"
   },
   {
    "qty": 5,
    "label": "Green Dragon Scales",
    "item": "Green Dragon Scale"
   },
   {
    "qty": 5,
    "label": "Demon Horns",
    "item": "Demon Horn"
   }
  ]
 },
 {
  "id": "dragon-hide",
  "name": "Dragon Hide",
  "pt": "Proteção de fogo",
  "slots": "armaduras, escudos e spellbooks",
  "tiers": [
   "3% de proteção de fogo",
   "8% de proteção de fogo",
   "15% de proteção de fogo"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Green Dragon Leathers",
    "item": "Green Dragon Leather"
   },
   {
    "qty": 10,
    "label": "Blazing Bones",
    "item": "Blazing Bone"
   },
   {
    "qty": 5,
    "label": "Draken Sulphur",
    "item": "Draken Sulphur"
   }
  ]
 },
 {
  "id": "punch",
  "name": "Punch",
  "pt": "Fist (skill)",
  "slots": "elmos e armas de punho",
  "tiers": [
   "+1 de fist",
   "+2 de fist",
   "+4 de fist"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Tarantula Egg",
    "item": "Tarantula Egg"
   },
   {
    "qty": 20,
    "label": "Mantassin Tails",
    "item": "Mantassin Tail"
   },
   {
    "qty": 15,
    "label": "Gold-Brocaded Cloth",
    "item": "Gold-Brocaded Cloth"
   }
  ]
 },
 {
  "id": "demon-presence",
  "name": "Demon Presence",
  "pt": "Proteção holy",
  "slots": "armaduras, escudos e spellbooks",
  "tiers": [
   "3% de proteção holy",
   "8% de proteção holy",
   "15% de proteção holy"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Cultish Robes",
    "item": "Cultish Robe"
   },
   {
    "qty": 25,
    "label": "Cultish Masks",
    "item": "Cultish Mask"
   },
   {
    "qty": 20,
    "label": "Hellspawn Tails",
    "item": "Hellspawn Tail"
   }
  ]
 },
 {
  "id": "frost",
  "name": "Frost",
  "pt": "Dano de gelo",
  "slots": "armas corpo a corpo, bows e crossbows",
  "tiers": [
   "10% do dano físico vira gelo",
   "25% do dano físico vira gelo",
   "50% do dano físico vira gelo"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Frosty Hearts",
    "item": "Frosty Heart"
   },
   {
    "qty": 10,
    "label": "Seacrest Hair",
    "item": "Seacrest Hair"
   },
   {
    "qty": 5,
    "label": "Polar Bear Paws",
    "item": "Polar Bear Paw"
   }
  ]
 },
 {
  "id": "quara-scale",
  "name": "Quara Scale",
  "pt": "Proteção de gelo",
  "slots": "armaduras, escudos e spellbooks",
  "tiers": [
   "3% de proteção de gelo",
   "8% de proteção de gelo",
   "15% de proteção de gelo"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Winter Wolf Furs",
    "item": "Winter Wolf Fur"
   },
   {
    "qty": 15,
    "label": "Thick Furs",
    "item": "Thick Fur"
   },
   {
    "qty": 10,
    "label": "Deepling Warts",
    "item": "Deepling Warts"
   }
  ]
 },
 {
  "id": "vampirism",
  "name": "Vampirism",
  "pt": "Roubo de vida",
  "slots": "todas as armas e armaduras",
  "tiers": [
   "5% de roubo de vida",
   "10% de roubo de vida",
   "25% de roubo de vida"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Vampire Teeth",
    "item": "Vampire Teeth"
   },
   {
    "qty": 15,
    "label": "Bloody Pincers",
    "item": "Bloody Pincers"
   },
   {
    "qty": 5,
    "label": "Piece of Dead Brain",
    "item": "Piece of Dead Brain"
   }
  ]
 },
 {
  "id": "epiphany",
  "name": "Epiphany",
  "pt": "Magic level",
  "slots": "wands, rods e elmos de mago",
  "tiers": [
   "+1 de magic level",
   "+2 de magic level",
   "+4 de magic level"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Elvish Talismans",
    "item": "Elvish Talisman"
   },
   {
    "qty": 15,
    "label": "Broken Shamanic Staffs",
    "item": "Broken Shamanic Staff"
   },
   {
    "qty": 15,
    "label": "Strands of Medusa Hair",
    "item": "Strand of Medusa Hair"
   }
  ]
 },
 {
  "id": "void",
  "name": "Void",
  "pt": "Roubo de mana",
  "slots": "todas as armas e elmos",
  "tiers": [
   "3% de roubo de mana",
   "5% de roubo de mana",
   "8% de roubo de mana"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Rope Belts",
    "item": "Rope Belt"
   },
   {
    "qty": 25,
    "label": "Silencer Claws",
    "item": "Silencer Claws"
   },
   {
    "qty": 5,
    "label": "Some Grimeleech Wings",
    "item": "Some Grimeleech Wings"
   }
  ]
 },
 {
  "id": "vibrancy",
  "name": "Vibrancy",
  "pt": "Anti-paralisia",
  "slots": "botas",
  "tiers": [
   "15% de chance de desviar paralisia",
   "25% de chance de desviar paralisia",
   "50% de chance de desviar paralisia"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Wereboar Hooves",
    "item": "Wereboar Hooves"
   },
   {
    "qty": 15,
    "label": "Crystallized Anger",
    "item": "Crystallized Anger"
   },
   {
    "qty": 5,
    "label": "Quills",
    "item": "Quill"
   }
  ]
 },
 {
  "id": "blockade",
  "name": "Blockade",
  "pt": "Shielding (skill)",
  "slots": "elmos, escudos e spellbooks",
  "tiers": [
   "+1 de shielding",
   "+2 de shielding",
   "+4 de shielding"
  ],
  "materials": [
   {
    "qty": 20,
    "label": "Pieces of Scarab Shell",
    "item": "Piece of Scarab Shell"
   },
   {
    "qty": 25,
    "label": "Brimstone Shells",
    "item": "Brimstone Shell"
   },
   {
    "qty": 25,
    "label": "Frazzle Skins",
    "item": "Frazzle Skin"
   }
  ]
 },
 {
  "id": "slash",
  "name": "Slash",
  "pt": "Espada (skill)",
  "slots": "elmos e espadas",
  "tiers": [
   "+1 de sword",
   "+2 de sword",
   "+4 de sword"
  ],
  "materials": [
   {
    "qty": 25,
    "label": "Lion's Manes",
    "item": "Lion's Mane"
   },
   {
    "qty": 25,
    "label": "Mooh'tah Shells",
    "item": "Mooh'tah Shell"
   },
   {
    "qty": 5,
    "label": "War Crystals",
    "item": "War Crystal"
   }
  ]
 },
 {
  "id": "swiftness",
  "name": "Swiftness",
  "pt": "Velocidade",
  "slots": "botas",
  "tiers": [
   "+10 de velocidade",
   "+15 de velocidade",
   "+30 de velocidade"
  ],
  "materials": [
   {
    "qty": 15,
    "label": "Damselfly Wings",
    "item": "Damselfly Wing"
   },
   {
    "qty": 25,
    "label": "Compasses",
    "item": "Compass"
   },
   {
    "qty": 20,
    "label": "Waspoid Wings",
    "item": "Waspoid Wing"
   }
  ]
 }
];
