// Equipamento de level 250+ por vocação. Lista de itens: TibiaPal, Vocation Equipment Reference (tibiapal.com/equipment).
// Atributos, proteções, ataque e slots de imbuement: TibiaWiki (infobox de cada item). Consulta em 26/09/2026.

export interface EquipRow {
  name: string;
  level: number;
  slot: string;
  kind: string;
  stats: string;
  bonus: string;
  resist: string;
  imb: number;
  hands: string;
  /** proteções em % por elemento (inglês, como na TibiaWiki) */
  res: Record<string, number>;
  /** bônus de skill e magic level (rótulos da TibiaWiki) */
  sk: Record<string, number>;
  arm: number;
}

export const SLOT_ORDER = ["Arma", "Escudo", "Spellbook", "Aljava", "Elmo", "Armadura", "Pernas", "Botas", "Anel", "Amuleto"];

export const VOC_EQUIPMENT: Record<string, EquipRow[]> = {
 "druid": [
  {
   "res": {
    "earth": 7
   },
   "sk": {
    "magic level": 2
   },
   "arm": 7,
   "name": "Eldritch Hood",
   "level": 250,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 7",
   "bonus": "ML +2",
   "resist": "terra +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 4
   },
   "sk": {
    "magic level": 2,
    "healing magic level": 2
   },
   "arm": 0,
   "name": "Eldritch Rod",
   "level": 250,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +2, healing ML +2",
   "resist": "terra +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "ice": 7
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Midnight Sarong",
   "level": 250,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "gelo +7%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "death": 3
   },
   "sk": {
    "magic level": 1
   },
   "arm": 2,
   "name": "Mutant Bone Boots",
   "level": 250,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "ML +1",
   "resist": "death +3%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "fire": 4
   },
   "sk": {
    "magic level": 2,
    "ice magic level": 1
   },
   "arm": 0,
   "name": "Naga Rod",
   "level": 250,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +2, gelo ML +1",
   "resist": "fogo +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "death": 5
   },
   "sk": {
    "magic level": 4
   },
   "arm": 15,
   "name": "Stoic Iks Cuirass",
   "level": 250,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 15",
   "bonus": "ML +4",
   "resist": "death +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "death": 3
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Stoic Iks Headpiece",
   "level": 250,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "death +3%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 5,
    "fire": 5,
    "ice": 5,
    "energy": 5
   },
   "sk": {
    "magic level": 4
   },
   "arm": 0,
   "name": "Umbral Master Spellbook",
   "level": 250,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 32",
   "bonus": "ML +4",
   "resist": "terra +5%, fogo +5%, gelo +5%, energia +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {},
   "arm": 0,
   "name": "Flamingo Amulet of Nature",
   "level": 270,
   "slot": "Amuleto",
   "kind": "",
   "stats": "",
   "bonus": "",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "magic level": 2
   },
   "arm": 0,
   "name": "Lion Rod",
   "level": 270,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +2",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "ice": 8
   },
   "sk": {
    "earth magic level": 6,
    "healing magic level": 3
   },
   "arm": 16,
   "name": "Norcferatu Bonecloak",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 16",
   "bonus": "terra ML +6, healing ML +3",
   "resist": "gelo +8%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "death": 4
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Norcferatu Bloodstrider",
   "level": 270,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "death +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "death": 5
   },
   "sk": {
    "magic level": 2,
    "healing magic level": 1
   },
   "arm": 8,
   "name": "Demonfang Mask",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2, healing ML +1",
   "resist": "físico +2%, death +5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 6
   },
   "sk": {
    "magic level": 4,
    "earth magic level": 1,
    "apacity": 80
   },
   "arm": 0,
   "name": "Eldritch Tome",
   "level": 300,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 34",
   "bonus": "ML +4, terra ML +1, Magic Shield Capacity +80 and 8%",
   "resist": "fogo +6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "fire": 9
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Falcon Circlet",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "fogo +9%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 8
   },
   "sk": {
    "magic level": 3
   },
   "arm": 0,
   "name": "Falcon Rod",
   "level": 300,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +3",
   "resist": "energia +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "death": 5
   },
   "sk": {
    "magic level": 3,
    "earth magic level": 1
   },
   "arm": 0,
   "name": "Inferniarch Rod",
   "level": 300,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +3, terra ML +1",
   "resist": "death +5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 3
   },
   "sk": {
    "magic level": 4
   },
   "arm": 16,
   "name": "Midnight Tunic",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 16",
   "bonus": "ML +4",
   "resist": "físico +3%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 3
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Mutant Bone Kilt",
   "level": 300,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "físico +3%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "fire": 12,
    "ice": -6
   },
   "sk": {
    "magic level": 3,
    "earth magic level": 1
   },
   "arm": 15,
   "name": "Mystical Dragon Robe",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 15",
   "bonus": "ML +3, terra ML +1",
   "resist": "fogo +12%, gelo -6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "fire": 6
   },
   "sk": {
    "magic level": 2,
    "ice magic level": 2
   },
   "arm": 0,
   "name": "Amber Rod",
   "level": 330,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +2, gelo ML +2",
   "resist": "fogo +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 8
   },
   "sk": {
    "magic level": 1,
    "earth magic level": 1
   },
   "arm": 2,
   "name": "Stag Boots",
   "level": 350,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "ML +1, terra ML +1",
   "resist": "energia +8%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "death": 5
   },
   "sk": {
    "magic level": 5
   },
   "arm": 0,
   "name": "Stag Scrolls",
   "level": 350,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 34",
   "bonus": "ML +5",
   "resist": "físico +2%, death +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "ice": 9
   },
   "sk": {
    "magic level": 3
   },
   "arm": 9,
   "name": "Arboreal Crown",
   "level": 400,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 9",
   "bonus": "ML +3",
   "resist": "físico +2%, gelo +9%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 4,
    "earth": 4,
    "energy": 4,
    "ice": 4
   },
   "sk": {
    "healing magic level": 2
   },
   "arm": 0,
   "name": "Arboreal Ring",
   "level": 400,
   "slot": "Anel",
   "kind": "",
   "stats": "",
   "bonus": "healing ML +2",
   "resist": "fogo +4%, terra +4%, energia +4%, gelo +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 4,
    "energy": 6
   },
   "sk": {
    "magic level": 5,
    "healing magic level": 1,
    "ice magic level": 1
   },
   "arm": 0,
   "name": "Arboreal Tome",
   "level": 400,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 36",
   "bonus": "ML +5, healing ML +1, gelo ML +1",
   "resist": "físico +4%, energia +6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "ice": 12
   },
   "sk": {
    "magic level": 4
   },
   "arm": 0,
   "name": "Soulhexer",
   "level": 400,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +4",
   "resist": "gelo +12%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "death": 10
   },
   "sk": {
    "magic level": 4
   },
   "arm": 17,
   "name": "Soulshroud",
   "level": 400,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 17",
   "bonus": "ML +4",
   "resist": "death +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 10
   },
   "sk": {
    "magic level": 3
   },
   "arm": 10,
   "name": "Soulstrider",
   "level": 400,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 10",
   "bonus": "ML +3",
   "resist": "fogo +10%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "energy": 6
   },
   "sk": {
    "magic level": 4
   },
   "arm": 0,
   "name": "Crypt Jaw",
   "level": 450,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +4",
   "resist": "energia +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "fire": 8
   },
   "sk": {
    "speed": 10,
    "magic level": 2,
    "healing magic level": 1
   },
   "arm": 3,
   "name": "Sanguine Galoshes",
   "level": 500,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 3",
   "bonus": "speed +10, ML +2, healing ML +1",
   "resist": "físico +2%, fogo +8%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "death": 7
   },
   "sk": {
    "magic level": 4,
    "ice magic level": 1,
    "earth magic level": 1
   },
   "arm": 0,
   "name": "Sanguine Rod",
   "level": 600,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +4, gelo ML +1, terra ML +1",
   "resist": "death +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "energy": 8
   },
   "sk": {
    "magic level": 4
   },
   "arm": 10,
   "name": "Moonsilver Spirit Mask",
   "level": 800,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 10",
   "bonus": "ML +4",
   "resist": "físico +3%, energia +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 7
   },
   "sk": {
    "magic level": 6,
    "ice magic level": 1,
    "healing magic level": 2
   },
   "arm": 0,
   "name": "Moonsilver Sceptre",
   "level": 1000,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +6, gelo ML +1, healing ML +2",
   "resist": "terra +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 7
   },
   "sk": {
    "magic level": 6,
    "ice magic level": 1,
    "healing magic level": 2
   },
   "arm": 0,
   "name": "Stellar Moonsilver Sceptre",
   "level": 1000,
   "slot": "Arma",
   "kind": "Rod",
   "stats": "",
   "bonus": "ML +6, gelo ML +1, healing ML +2",
   "resist": "terra +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "death": 7
   },
   "sk": {
    "magic level": 4,
    "ice magic level": 1,
    "earth magic level": 1
   },
   "arm": 0,
   "name": "Grand Sanguine Rod",
   "level": 600,
   "slot": "Arma",
   "kind": "Rod · proficiência mais forte",
   "stats": "",
   "bonus": "ML +4, gelo ML +1, terra ML +1",
   "resist": "death +7%",
   "imb": 2,
   "hands": ""
  }
 ],
 "knight": [
  {
   "res": {
    "physical": 3,
    "ice": 7
   },
   "sk": {
    "sword fighting": 1,
    "axe fighting": 1,
    "club fighting": 1
   },
   "arm": 9,
   "name": "Antler-Horn Helmet",
   "level": 250,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 9",
   "bonus": "sword fighting +1, axe fighting +1, club fighting +1",
   "resist": "físico +3%, gelo +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 10
   },
   "sk": {},
   "arm": 16,
   "name": "Eldritch Cuirass",
   "level": 250,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 16",
   "bonus": "",
   "resist": "físico +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 6
   },
   "sk": {
    "sword fighting": 1
   },
   "arm": 0,
   "name": "Gnome Sword",
   "level": 250,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 29 +3, ataque 10 + energia 41",
   "bonus": "sword fighting +1",
   "resist": "energia +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 7,
    "earth": 10
   },
   "sk": {},
   "arm": 0,
   "name": "Lion Shield",
   "level": 250,
   "slot": "Escudo",
   "kind": "",
   "stats": "def 51",
   "bonus": "",
   "resist": "físico +7%, terra +10%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 8
   },
   "sk": {
    "shielding": 3
   },
   "arm": 16,
   "name": "Stoic Iks Chestplate",
   "level": 250,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 16",
   "bonus": "shielding +3",
   "resist": "físico +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 4,
    "energy": 2
   },
   "sk": {
    "sword fighting": 2,
    "axe fighting": 2,
    "club fighting": 2
   },
   "arm": 9,
   "name": "Stoic Iks Culet",
   "level": 250,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 9",
   "bonus": "sword fighting +2, axe fighting +2, club fighting +2",
   "resist": "físico +4%, energia +2%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Tagralt Blade",
   "level": 250,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 32, ataque 7 + terra 49",
   "bonus": "sword fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 1
   },
   "arm": 0,
   "name": "Umbral Masterblade",
   "level": 250,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 31 +3, ataque 52",
   "bonus": "sword fighting +1",
   "resist": "",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 1
   },
   "arm": 0,
   "name": "Umbral Master Axe",
   "level": 250,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 30 +3, ataque 53",
   "bonus": "axe fighting +1",
   "resist": "",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 3
   },
   "arm": 0,
   "name": "Umbral Master Chopper",
   "level": 250,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 34, ataque 54",
   "bonus": "axe fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 3
   },
   "arm": 0,
   "name": "Umbral Master Hammer",
   "level": 250,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 34, ataque 55",
   "bonus": "club fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 1
   },
   "arm": 0,
   "name": "Umbral Master Mace",
   "level": 250,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 30 +3, ataque 52",
   "bonus": "club fighting +1",
   "resist": "",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Umbral Master Slayer",
   "level": 250,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 35, ataque 54",
   "bonus": "sword fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {},
   "arm": 0,
   "name": "Flamingo Amulet of Valor",
   "level": 270,
   "slot": "Amuleto",
   "kind": "",
   "stats": "",
   "bonus": "",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 5
   },
   "sk": {
    "sword fighting": 1,
    "club fighting": 1,
    "axe fighting": 1
   },
   "arm": 9,
   "name": "Cobra Hood",
   "level": 270,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 9",
   "bonus": "sword fighting +1, club fighting +1, axe fighting +1",
   "resist": "físico +5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 5,
    "ice": 5
   },
   "sk": {},
   "arm": 3,
   "name": "Frostflower Boots",
   "level": 270,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 3",
   "bonus": "| armor         = 3",
   "resist": "físico +5%, gelo +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 3
   },
   "arm": 0,
   "name": "Lion Axe",
   "level": 270,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 31 +2, ataque 8 + terra 44",
   "bonus": "axe fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 3
   },
   "arm": 0,
   "name": "Lion Hammer",
   "level": 270,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 31 +2, ataque 8 + terra 44",
   "bonus": "club fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Lion Longsword",
   "level": 270,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 31 +2, ataque 8 + terra 44",
   "bonus": "sword fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 6
   },
   "sk": {
    "sword fighting": 3,
    "club fighting": 3,
    "axe fighting": 3
   },
   "arm": 17,
   "name": "Lion Plate",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 17",
   "bonus": "sword fighting +3, club fighting +3, axe fighting +3",
   "resist": "físico +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Eldritch Claymore",
   "level": 270,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 33 | imbueslots    = 2, ataque 6 + fogo 50",
   "bonus": "sword fighting +3, Cleave 3%",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 3
   },
   "arm": 0,
   "name": "Eldritch Greataxe",
   "level": 270,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 33, ataque 56",
   "bonus": "axe fighting +3, Cleave 3%",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {},
   "arm": 0,
   "name": "Eldritch Shield",
   "level": 270,
   "slot": "Escudo",
   "kind": "",
   "stats": "def 51",
   "bonus": "42 Damage Reflection",
   "resist": "físico 4%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 3
   },
   "arm": 0,
   "name": "Eldritch Warmace",
   "level": 270,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33 | imbueslots    = 2, ataque 6 + fogo 50",
   "bonus": "club fighting +3, Cleave 3%",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 5,
    "earth": 5
   },
   "sk": {
    "sword fighting": 2,
    "axe fighting": 2,
    "club fighting": 2
   },
   "arm": 9,
   "name": "Stitched Mutant Hide Legs",
   "level": 270,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 9",
   "bonus": "sword fighting +2, axe fighting +2, club fighting +2",
   "resist": "físico +5%, terra +5%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 4
   },
   "sk": {
    "sword fighting": 3,
    "club fighting": 3,
    "axe fighting": 3
   },
   "arm": 22,
   "name": "Norcferatu Tuskplate",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 22",
   "bonus": "sword fighting +3, club fighting +3, axe fighting +3",
   "resist": "físico +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 5,
    "earth": 5
   },
   "sk": {
    "speed": 15
   },
   "arm": 3,
   "name": "Norcferatu Goretrampers",
   "level": 270,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 3",
   "bonus": "speed +15",
   "resist": "físico +5%, terra +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 8
   },
   "sk": {
    "sword fighting": 3,
    "axe fighting": 3,
    "club fighting": 3
   },
   "arm": 18,
   "name": "Dauntless Dragon Scale Armor",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 18",
   "bonus": "sword fighting +3, axe fighting +3, club fighting +3",
   "resist": "físico +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 12
   },
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Falcon Battleaxe",
   "level": 300,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 33, ataque 10 + energia 47",
   "bonus": "axe fighting +4",
   "resist": "energia +12%",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "fire": 10
   },
   "sk": {
    "distance fighting": 2,
    "shielding": 2
   },
   "arm": 10,
   "name": "Falcon Coif",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 10",
   "bonus": "distance fighting +2, shielding +2",
   "resist": "físico +3%, fogo +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 7,
    "fire": 15
   },
   "sk": {},
   "arm": 0,
   "name": "Falcon Escutcheon",
   "level": 300,
   "slot": "Escudo",
   "kind": "",
   "stats": "def 52",
   "bonus": "",
   "resist": "físico +7%, fogo +15%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 7,
    "ice": 7
   },
   "sk": {
    "distance fighting": 3,
    "sword fighting": 3,
    "club fighting": 3,
    "axe fighting": 3
   },
   "arm": 10,
   "name": "Falcon Greaves",
   "level": 300,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 10",
   "bonus": "distance fighting +3, sword fighting +3, club fighting +3, axe fighting +3",
   "resist": "físico +7%, gelo +7%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "earth": 10
   },
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Falcon Longsword",
   "level": 300,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 34, ataque 56",
   "bonus": "sword fighting +4",
   "resist": "terra +10%",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "energy": 7
   },
   "sk": {
    "club fighting": 3
   },
   "arm": 0,
   "name": "Falcon Mace",
   "level": 300,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33 +3, ataque 11 + energia 41",
   "bonus": "club fighting +3",
   "resist": "energia +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 12
   },
   "sk": {
    "shielding": 4
   },
   "arm": 18,
   "name": "Falcon Plate",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 18",
   "bonus": "shielding +4",
   "resist": "físico +12%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 3
   },
   "arm": 0,
   "name": "Inferniarch Battleaxe",
   "level": 300,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 31 +3, ataque 8 + fogo 44",
   "bonus": "axe fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Inferniarch Blade",
   "level": 300,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 31 +3, ataque 8 + fogo 44",
   "bonus": "sword fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 3
   },
   "arm": 0,
   "name": "Inferniarch Flail",
   "level": 300,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 31 +3, ataque 8 + death 44",
   "bonus": "club fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Inferniarch Greataxe",
   "level": 300,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 33 +3, ataque 8 + fogo 48",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Inferniarch Slayer",
   "level": 300,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 33 +4, ataque 8 + energia 48",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Inferniarch Warhammer",
   "level": 300,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33 +4, ataque 8 + gelo 48",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "death": 6
   },
   "sk": {
    "sword fighting": 2,
    "axe fighting": 2,
    "club fighting": 2
   },
   "arm": 10,
   "name": "Maliceforged Helmet",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 10",
   "bonus": "sword fighting +2, axe fighting +2, club fighting +2",
   "resist": "físico +3%, death +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 2
   },
   "arm": 0,
   "name": "Naga Axe",
   "level": 300,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 31 +3, ataque 8 + energia 44",
   "bonus": "axe fighting +2",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 2
   },
   "arm": 0,
   "name": "Naga Club",
   "level": 300,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 31 +3, ataque 52",
   "bonus": "club fighting +2",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 2
   },
   "arm": 0,
   "name": "Naga Sword",
   "level": 300,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 31 +3, ataque 8 + gelo 44",
   "bonus": "sword fighting +2",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 3
   },
   "arm": 0,
   "name": "Amber Axe",
   "level": 330,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 32 +3, ataque | ice_attack    = 46 + gelo 46",
   "bonus": "axe fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 3
   },
   "arm": 0,
   "name": "Amber Bludgeon",
   "level": 330,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 34, ataque | death_attack  = 50 + death 50",
   "bonus": "club fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Amber Cudgel",
   "level": 330,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 32 +3, ataque | fire_attack   = 46 + fogo 46",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 3
   },
   "arm": 0,
   "name": "Amber Greataxe",
   "level": 330,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 34, ataque | earth_attack  = 50 + terra 50",
   "bonus": "axe fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Amber Sabre",
   "level": 330,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 32 +3, ataque | energy_attack = 46 + energia 46",
   "bonus": "sword fighting +3",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 3
   },
   "arm": 0,
   "name": "Amber Slayer",
   "level": 330,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 34 | imbueslots    = 2, ataque | death_attack  = 50 + death 50",
   "bonus": "sword fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 5,
    "ice": 12
   },
   "sk": {
    "sword fighting": 2,
    "axe fighting": 2,
    "club fighting": 2
   },
   "arm": 0,
   "name": "Refined Stag Shield",
   "level": 350,
   "slot": "Escudo",
   "kind": "",
   "stats": "def 54",
   "bonus": "sword fighting +2, axe fighting +2, club fighting +2",
   "resist": "físico +5%, gelo +12%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 7,
    "fire": 7
   },
   "sk": {
    "sword fighting": 3,
    "club fighting": 3,
    "axe fighting": 3,
    "shielding": 2
   },
   "arm": 10,
   "name": "Stag Legs",
   "level": 350,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 10",
   "bonus": "sword fighting +3, club fighting +3, axe fighting +3, shielding +2",
   "resist": "físico +7%, fogo +7%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 7,
    "fire": 5
   },
   "sk": {
    "sword fighting": 1,
    "club fighting": 1,
    "axe fighting": 1,
    "speed": 15
   },
   "arm": 4,
   "name": "Pair of Soulwalkers",
   "level": 400,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 4",
   "bonus": "sword fighting +1, club fighting +1, axe fighting +1, speed +15",
   "resist": "físico +7%, fogo +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 10,
    "death": 10
   },
   "sk": {},
   "arm": 0,
   "name": "Soulbastion",
   "level": 400,
   "slot": "Escudo",
   "kind": "",
   "stats": "def 55",
   "bonus": "",
   "resist": "físico +10%, death +10%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Soulbiter",
   "level": 400,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 32 +3, ataque 7 + death 45",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Soulcrusher",
   "level": 400,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33 +3, ataque 6 + gelo 46",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Soulcutter",
   "level": 400,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 32 +3, ataque 7 + death 45",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {},
   "arm": 30,
   "name": "Souleater",
   "level": 400,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "arm 30",
   "bonus": "",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Soulmaimer",
   "level": 400,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 35, ataque 10 + energia 47",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Soulshredder",
   "level": 400,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 35, ataque 10 + gelo 47",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 13
   },
   "sk": {
    "sword fighting": 4,
    "axe fighting": 4,
    "club fighting": 4
   },
   "arm": 20,
   "name": "Spiritthorn Armor",
   "level": 400,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 20",
   "bonus": "sword fighting +4, axe fighting +4, club fighting +4, 19 damage reflection",
   "resist": "físico +13%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 6,
    "energy": 10
   },
   "sk": {
    "sword fighting": 3,
    "axe fighting": 3,
    "club fighting": 3
   },
   "arm": 12,
   "name": "Spiritthorn Helmet",
   "level": 400,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 12",
   "bonus": "sword fighting +3, axe fighting +3, club fighting +3, 13 damage reflection",
   "resist": "físico +6%, energia +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "fire": 4,
    "earth": 4,
    "energy": 4,
    "ice": 4
   },
   "sk": {},
   "arm": 0,
   "name": "Spiritthorn Ring",
   "level": 400,
   "slot": "Anel",
   "kind": "",
   "stats": "",
   "bonus": "",
   "resist": "físico +2%, fogo +4%, terra +4%, energia +4%, gelo +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Crypt Breaker",
   "level": 450,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33, ataque 58",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Crypt Slicer",
   "level": 450,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 33, ataque 58",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Crypt Splitter",
   "level": 450,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 33, ataque 58",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 9,
    "death": 6
   },
   "sk": {
    "sword fighting": 4,
    "axe fighting": 4,
    "club fighting": 4
   },
   "arm": 12,
   "name": "Sanguine Legs",
   "level": 500,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 12",
   "bonus": "sword fighting +4, axe fighting +4, club fighting +4",
   "resist": "físico +9%, death +6%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Sanguine Battleaxe",
   "level": 600,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 35, ataque 8 + death 50",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Sanguine Blade",
   "level": 600,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 32 +3, ataque 8 + fogo 46",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Sanguine Bludgeon",
   "level": 600,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 35, ataque 8 + terra 50",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Sanguine Cudgel",
   "level": 600,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 32 +3, ataque 8 + death 46",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Sanguine Hatchet",
   "level": 600,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 32 +3, ataque 8 + fogo 46",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Sanguine Razor",
   "level": 600,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 35, ataque 8 + energia 50",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 8,
    "fire": 10
   },
   "sk": {
    "sword fighting": 4,
    "axe fighting": 4,
    "club fighting": 4,
    "magic level": 1
   },
   "arm": 14,
   "name": "Moonsilver Battle Visor",
   "level": 800,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 14",
   "bonus": "sword fighting +4, axe fighting +4, club fighting +4, ML +1",
   "resist": "físico +8%, fogo +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 6
   },
   "arm": 0,
   "name": "Moonsilver Axe",
   "level": 1000,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 33 +3, ataque 6 + terra 50",
   "bonus": "axe fighting +6",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 6
   },
   "arm": 0,
   "name": "Stellar Moonsilver Axe",
   "level": 1000,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 33 +3, ataque 6 + terra 50",
   "bonus": "axe fighting +6",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 6
   },
   "arm": 0,
   "name": "Moonsilver Chopper",
   "level": 1000,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 36 | imbueslots    = 3, ataque 6 + energia 54",
   "bonus": "axe fighting +6",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 6
   },
   "arm": 0,
   "name": "Stellar Moonsilver Chopper",
   "level": 1000,
   "slot": "Arma",
   "kind": "Machado",
   "stats": "def 36 | imbueslots    = 3, ataque 6 + energia 54",
   "bonus": "axe fighting +6",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 6
   },
   "arm": 0,
   "name": "Moonsilver Crusher",
   "level": 1000,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33 +3, ataque 6 + terra 50",
   "bonus": "club fighting +6",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 6
   },
   "arm": 0,
   "name": "Stellar Moonsilver Crusher",
   "level": 1000,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 33 +3, ataque 6 + terra 50",
   "bonus": "club fighting +6",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 6
   },
   "arm": 0,
   "name": "Moonsilver Mace",
   "level": 1000,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 36, ataque 6 + gelo 54",
   "bonus": "club fighting +6",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 6
   },
   "arm": 0,
   "name": "Stellar Moonsilver Mace",
   "level": 1000,
   "slot": "Arma",
   "kind": "Clava",
   "stats": "def 36, ataque 6 + gelo 54",
   "bonus": "club fighting +6",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 6
   },
   "arm": 0,
   "name": "Moonsilver Epee",
   "level": 1000,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 33 +3, ataque 6 + terra 50",
   "bonus": "sword fighting +6",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 6
   },
   "arm": 0,
   "name": "Stellar Moonsilver Epee",
   "level": 1000,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 33 +3, ataque 6 + terra 50",
   "bonus": "sword fighting +6",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 6
   },
   "arm": 0,
   "name": "Moonsilver Claymore",
   "level": 1000,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 36, ataque 6 + fogo 54",
   "bonus": "sword fighting +6",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 6
   },
   "arm": 0,
   "name": "Stellar Moonsilver Claymore",
   "level": 1000,
   "slot": "Arma",
   "kind": "Espada",
   "stats": "def 36, ataque 6 + fogo 54",
   "bonus": "sword fighting +6",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Grand Sanguine Battleaxe",
   "level": 600,
   "slot": "Arma",
   "kind": "Machado · proficiência mais forte",
   "stats": "def 35, ataque 8 + death 50",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Grand Sanguine Blade",
   "level": 600,
   "slot": "Arma",
   "kind": "Espada · proficiência mais forte",
   "stats": "def 32 +3, ataque 8 + fogo 46",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Grand Sanguine Bludgeon",
   "level": 600,
   "slot": "Arma",
   "kind": "Clava · proficiência mais forte",
   "stats": "def 35, ataque 8 + terra 50",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "club fighting": 4
   },
   "arm": 0,
   "name": "Grand Sanguine Cudgel",
   "level": 600,
   "slot": "Arma",
   "kind": "Clava · proficiência mais forte",
   "stats": "def 32 +3, ataque 8 + death 46",
   "bonus": "club fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "axe fighting": 4
   },
   "arm": 0,
   "name": "Grand Sanguine Hatchet",
   "level": 600,
   "slot": "Arma",
   "kind": "Machado · proficiência mais forte",
   "stats": "def 32 +3, ataque 8 + fogo 46",
   "bonus": "axe fighting +4",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "sword fighting": 4
   },
   "arm": 0,
   "name": "Grand Sanguine Razor",
   "level": 600,
   "slot": "Arma",
   "kind": "Espada · proficiência mais forte",
   "stats": "def 35, ataque 8 + energia 50",
   "bonus": "sword fighting +4",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  }
 ],
 "paladin": [
  {
   "res": {
    "physical": 2,
    "holy": 7
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 9,
   "name": "Eldritch Breeches",
   "level": 250,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 9",
   "bonus": "distance fighting +2",
   "resist": "físico +2%, holy +7%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "perfect shot": 20
   },
   "arm": 0,
   "name": "Eldritch Quiver",
   "level": 250,
   "slot": "Aljava",
   "kind": "",
   "stats": "",
   "bonus": "perfect shot +20 at range 4",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Umbral Master Bow",
   "level": 250,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +6, hit +5",
   "bonus": "distance fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Umbral Master Crossbow",
   "level": 250,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +9, hit +4",
   "bonus": "distance fighting +3",
   "resist": "",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "death": 4
   },
   "sk": {
    "distance fighting": 1
   },
   "arm": 0,
   "name": "Bow of Cataclysm",
   "level": 250,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +6, hit +4",
   "bonus": "distance fighting +1",
   "resist": "death +4%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "distance fighting": 2,
    "holy magic level": 1
   },
   "arm": 0,
   "name": "Eldritch Bow",
   "level": 250,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +6, hit +6",
   "bonus": "distance fighting +2, holy ML +1",
   "resist": "| weight        = 58.00",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "ice": 2
   },
   "sk": {},
   "arm": 0,
   "name": "Naga Quiver",
   "level": 250,
   "slot": "Aljava",
   "kind": "",
   "stats": "",
   "bonus": "",
   "resist": "gelo +2%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "fire": 5
   },
   "sk": {
    "distance fighting": 1,
    "speed": 15
   },
   "arm": 2,
   "name": "Stoic Iks Boots",
   "level": 250,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "distance fighting +1, speed +15",
   "resist": "fogo +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "energy": 6
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 8,
   "name": "Stoic Iks Casque",
   "level": 250,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "distance fighting +2",
   "resist": "físico +3%, energia +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {},
   "arm": 0,
   "name": "Flamingo Amulet of Precision",
   "level": 270,
   "slot": "Amuleto",
   "kind": "",
   "stats": "",
   "bonus": "",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "ice": 7
   },
   "sk": {
    "distance fighting": 1,
    "speed": 15
   },
   "arm": 2,
   "name": "Feverbloom Boots",
   "level": 270,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "distance fighting +1, speed +15",
   "resist": "gelo +7%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "ice": 5
   },
   "sk": {
    "distance fighting": 1
   },
   "arm": 0,
   "name": "Lion Longbow",
   "level": 270,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +6, hit +6",
   "bonus": "distance fighting +1",
   "resist": "gelo +5%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "earth": 8
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 17,
   "name": "Mutated Skin Armor",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 17",
   "bonus": "distance fighting +3",
   "resist": "físico +3%, terra +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 4,
    "earth": 4
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 9,
   "name": "Mutated Skin Legs",
   "level": 270,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 9",
   "bonus": "distance fighting +2",
   "resist": "físico +4%, terra +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 4,
    "death": 4
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 9,
   "name": "Norcferatu Thornwraps",
   "level": 270,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 9",
   "bonus": "distance fighting +2",
   "resist": "físico +4%, death +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "ice": 6
   },
   "sk": {
    "physical": 3,
    "ice": 6
   },
   "arm": 9,
   "name": "Norcferatu Skullguard",
   "level": 270,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 9",
   "bonus": "| resist        = físico +3%, gelo +6%",
   "resist": "físico +3%, gelo +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 5
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 0,
   "name": "Falcon Bow",
   "level": 300,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +6, hit +5",
   "bonus": "distance fighting +2",
   "resist": "fogo +5%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "fire": 10
   },
   "sk": {
    "distance fighting": 2,
    "shielding": 2
   },
   "arm": 10,
   "name": "Falcon Coif",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 10",
   "bonus": "distance fighting +2, shielding +2",
   "resist": "físico +3%, fogo +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 7,
    "ice": 7
   },
   "sk": {
    "distance fighting": 3,
    "sword fighting": 3,
    "club fighting": 3,
    "axe fighting": 3
   },
   "arm": 10,
   "name": "Falcon Greaves",
   "level": 300,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 10",
   "bonus": "distance fighting +3, sword fighting +3, club fighting +3, axe fighting +3",
   "resist": "físico +7%, gelo +7%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "death": 6
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 10,
   "name": "Hellstalker Visor",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 10",
   "bonus": "distance fighting +2",
   "resist": "físico +3%, death +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 4
   },
   "sk": {
    "distance fighting": 1
   },
   "arm": 0,
   "name": "Naga Crossbow",
   "level": 300,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +8, hit +6",
   "bonus": "distance fighting +1",
   "resist": "terra +4%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "earth": 5
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 0,
   "name": "Inferniarch Bow",
   "level": 300,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +6, hit +5",
   "bonus": "distance fighting +2",
   "resist": "terra +5%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "ice": 4
   },
   "sk": {
    "distance fighting": 2
   },
   "arm": 0,
   "name": "Inferniarch Arbalest",
   "level": 300,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +7, hit +6",
   "bonus": "distance fighting +2",
   "resist": "gelo +4%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "energy": 10,
    "earth": -5
   },
   "sk": {
    "distance fighting": 3,
    "holy magic level": 1
   },
   "arm": 17,
   "name": "Unerring Dragon Scale Armor",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 17",
   "bonus": "distance fighting +3, holy ML +1",
   "resist": "energia +10%, terra -5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 5
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Amber Bow",
   "level": 330,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque | defense       =",
   "bonus": "distance fighting +3",
   "resist": "energia +5%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "energy": 5
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Amber Crossbow",
   "level": 330,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque | defense       =",
   "bonus": "distance fighting +3",
   "resist": "energia +5%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "ice": 8
   },
   "sk": {
    "distance fighting": 3,
    "shielding": 3
   },
   "arm": 17,
   "name": "Stag Plate",
   "level": 350,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 17",
   "bonus": "distance fighting +3, shielding +3",
   "resist": "físico +3%, gelo +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "energy": 5
   },
   "sk": {
    "distance fighting": 1,
    "speed": 10
   },
   "arm": 2,
   "name": "Stag Shinguards",
   "level": 350,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "distance fighting +1, speed +10",
   "resist": "físico +2%, energia +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "fire": 5,
    "earth": 5,
    "energy": 5,
    "ice": 5,
    "holy": 5,
    "death": 5,
    "physical": 5
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 11,
   "name": "Alicorn Headguard",
   "level": 400,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 11",
   "bonus": "distance fighting +3",
   "resist": "fogo +5%, terra +5%, energia +5%, gelo +5%, holy +5%, death +5%, físico +5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "magic level": 1,
    "perfect shot": 20
   },
   "arm": 0,
   "name": "Alicorn Quiver",
   "level": 400,
   "slot": "Aljava",
   "kind": "",
   "stats": "",
   "bonus": "ML +1, perfect shot +20 at range 3",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "fire": 4,
    "earth": 4,
    "energy": 4,
    "ice": 4
   },
   "sk": {
    "holy magic level": 1
   },
   "arm": 0,
   "name": "Alicorn Ring",
   "level": 400,
   "slot": "Anel",
   "kind": "",
   "stats": "",
   "bonus": "holy ML +1",
   "resist": "fogo +4%, terra +4%, energia +4%, gelo +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 5
   },
   "sk": {
    "distance fighting": 1,
    "speed": 20
   },
   "arm": 3,
   "name": "Pair of Soulstalkers",
   "level": 400,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 3",
   "bonus": "distance fighting +1, speed +20",
   "resist": "físico +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "holy": 7
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Soulbleeder",
   "level": 400,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +8, hit +5",
   "bonus": "distance fighting +3",
   "resist": "holy +7%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "fire": 15
   },
   "sk": {
    "distance fighting": 4
   },
   "arm": 18,
   "name": "Soulshell",
   "level": 400,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 18",
   "bonus": "distance fighting +4",
   "resist": "físico +3%, fogo +15%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "death": 7
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Soulpiercer",
   "level": 400,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +9, hit +6",
   "bonus": "distance fighting +3",
   "resist": "death +7%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "ice": 5
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Crypt Spine",
   "level": 450,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +8, hit +5",
   "bonus": "distance fighting +3",
   "resist": "gelo +5%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 7,
    "energy": 9
   },
   "sk": {
    "distance fighting": 4,
    "holy magic level": 1
   },
   "arm": 11,
   "name": "Sanguine Greaves",
   "level": 500,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 11",
   "bonus": "distance fighting +4, holy ML +1",
   "resist": "físico +7%, energia +9%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "earth": 6
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Sanguine Bow",
   "level": 600,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +9, hit +6",
   "bonus": "distance fighting +3",
   "resist": "terra +6%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "fire": 6
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Sanguine Crossbow",
   "level": 600,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +10, hit +7",
   "bonus": "distance fighting +3",
   "resist": "fogo +6%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 6,
    "earth": 10
   },
   "sk": {
    "distance fighting": 4,
    "holy magic level": 2
   },
   "arm": 12,
   "name": "Moonsilver Trail Hood",
   "level": 800,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 12",
   "bonus": "distance fighting +4, holy ML +2",
   "resist": "físico +6%, terra +10%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 7
   },
   "sk": {
    "distance fighting": 5
   },
   "arm": 0,
   "name": "Moonsilver Bow",
   "level": 1000,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +10, hit +7",
   "bonus": "distance fighting +5",
   "resist": "fogo +7%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "fire": 7
   },
   "sk": {
    "distance fighting": 5
   },
   "arm": 0,
   "name": "Stellar Moonsilver Bow",
   "level": 1000,
   "slot": "Arma",
   "kind": "Bow",
   "stats": "ataque atk mod +10, hit +7",
   "bonus": "distance fighting +5",
   "resist": "fogo +7%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "holy": 7
   },
   "sk": {
    "distance fighting": 5
   },
   "arm": 0,
   "name": "Moonsilver Crossbow",
   "level": 1000,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +11, hit +8",
   "bonus": "distance fighting +5",
   "resist": "holy +7%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "holy": 7
   },
   "sk": {
    "distance fighting": 5
   },
   "arm": 0,
   "name": "Stellar Moonsilver Crossbow",
   "level": 1000,
   "slot": "Arma",
   "kind": "Crossbow",
   "stats": "ataque atk mod +11, hit +8",
   "bonus": "distance fighting +5",
   "resist": "holy +7%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "earth": 6
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Grand Sanguine Bow",
   "level": 600,
   "slot": "Arma",
   "kind": "Bow · proficiência mais forte",
   "stats": "ataque atk mod +9, hit +6",
   "bonus": "distance fighting +3",
   "resist": "terra +6%",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "fire": 6
   },
   "sk": {
    "distance fighting": 3
   },
   "arm": 0,
   "name": "Grand Sanguine Crossbow",
   "level": 600,
   "slot": "Arma",
   "kind": "Crossbow · proficiência mais forte",
   "stats": "ataque atk mod +10, hit +7",
   "bonus": "distance fighting +3",
   "resist": "fogo +6%",
   "imb": 3,
   "hands": "Duas"
  }
 ],
 "monk": [
  {
   "res": {
    "physical": 2,
    "energy": 5
   },
   "sk": {
    "fist fighting": 4
   },
   "arm": 9,
   "name": "Stoic Iks Robe",
   "level": 250,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 9",
   "bonus": "fist fighting +4",
   "resist": "físico +2%, energia +5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 4
   },
   "sk": {
    "fist fighting": 2
   },
   "arm": 2,
   "name": "Iks Footwraps",
   "level": 250,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "fist fighting +2",
   "resist": "fogo +4%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4
   },
   "arm": 0,
   "name": "Cobra Bo",
   "level": 250,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 20, ataque 42",
   "bonus": "fist fighting +4",
   "resist": "| augments      =",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 2,
    "magic level": 2
   },
   "arm": 0,
   "name": "Eldritch Crescent Moon Spade",
   "level": 250,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 20, ataque 42",
   "bonus": "fist fighting +2, ML +2, 50 damage reflection",
   "resist": "| augments      =",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 3
   },
   "arm": 0,
   "name": "Umbral Master Katar",
   "level": 250,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 18, ataque 41",
   "bonus": "fist fighting +3",
   "resist": "| augments      =",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 4,
    "ice": 12
   },
   "sk": {
    "fist fighting": 4,
    "magic level": 2
   },
   "arm": 0,
   "name": "Enchanted Swan Amulet of Balance",
   "level": 270,
   "slot": "Amuleto",
   "kind": "",
   "stats": "",
   "bonus": "fist fighting +4, ML +2",
   "resist": "físico +4%, gelo +12%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4
   },
   "arm": 0,
   "name": "Lion Claws",
   "level": 270,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 19, ataque 43",
   "bonus": "fist fighting +4",
   "resist": "| augments      =",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 2,
    "fire": 6
   },
   "sk": {
    "fist fighting": 3,
    "magic level": 2
   },
   "arm": 10,
   "name": "Naga Tanko",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 10",
   "bonus": "fist fighting +3, ML +2",
   "resist": "físico +2%, fogo +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "earth": 5
   },
   "sk": {
    "fist fighting": 2,
    "magic level": 1
   },
   "arm": 6,
   "name": "Mutant Hide Trousers",
   "level": 300,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 6",
   "bonus": "fist fighting +2, ML +1",
   "resist": "físico +2%, terra +5%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "earth": 10,
    "energy": -5
   },
   "sk": {
    "fist fighting": 4,
    "magic level": 1
   },
   "arm": 10,
   "name": "Merudri Battle Mail",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 10",
   "bonus": "fist fighting +4, ML +1",
   "resist": "terra +10%, energia -5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "death": 6
   },
   "sk": {
    "fist fighting": 2,
    "magic level": 1
   },
   "arm": 6,
   "name": "Demon Mengu",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 6",
   "bonus": "fist fighting +2, ML +1",
   "resist": "físico +2%, death +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 5
   },
   "sk": {
    "fist fighting": 2,
    "magic level": 1
   },
   "arm": 2,
   "name": "Eldritch Monk Boots",
   "level": 300,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "fist fighting +2, ML +1",
   "resist": "energia +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4
   },
   "arm": 0,
   "name": "Falcon Sai",
   "level": 300,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 20, ataque 43",
   "bonus": "fist fighting +4",
   "resist": "| augments      =",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4
   },
   "arm": 0,
   "name": "Inferniarch Claws",
   "level": 300,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 21, ataque 43",
   "bonus": "fist fighting +4",
   "resist": "| notes         = Part of the [[Inferniarch Set]], can be used in the [[Doomforge]] to be turned into either a [[Siphoning Inferniarch Claws]], [[Rending Inferniarch Claws]], or [[Draining Inferniarch Claws]].",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 3,
    "magic level": 1
   },
   "arm": 0,
   "name": "Naga Katar",
   "level": 300,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 21, ataque 43",
   "bonus": "fist fighting +3, ML +1",
   "resist": "| augments      =",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4,
    "magic level": 1
   },
   "arm": 0,
   "name": "Amber Kusarigama",
   "level": 330,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 20, ataque 44",
   "bonus": "fist fighting +4, ML +1",
   "resist": "| attrib        = fist fighting +4, magic level +1",
   "imb": 2,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 4
   },
   "sk": {
    "fist fighting": 4
   },
   "arm": 10,
   "name": "Stag Robe",
   "level": 350,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 10",
   "bonus": "fist fighting +4",
   "resist": "físico +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "death": 3
   },
   "sk": {
    "fist fighting": 2
   },
   "arm": 2,
   "name": "Stag Footwraps",
   "level": 350,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "fist fighting +2",
   "resist": "físico +2%, death +3%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 4,
    "ice": 8
   },
   "sk": {
    "fist fighting": 4,
    "magic level": 2
   },
   "arm": 11,
   "name": "Soulgarb",
   "level": 400,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 11",
   "bonus": "fist fighting +4, ML +2",
   "resist": "físico +4%, gelo +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4,
    "magic level": 1
   },
   "arm": 0,
   "name": "Soulkamas",
   "level": 400,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 21, ataque 44",
   "bonus": "fist fighting +4, ML +1",
   "resist": "| augments      =",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 3,
    "ice": 6
   },
   "sk": {
    "fist fighting": 3,
    "speed": 20
   },
   "arm": 2,
   "name": "Soulsoles",
   "level": 400,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "fist fighting +3, speed +20",
   "resist": "físico +3%, gelo +6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 1,
    "fire": 4,
    "earth": 4,
    "energy": 4,
    "ice": 4
   },
   "sk": {
    "physical": 1,
    "fire": 4,
    "earth": 4,
    "energy": 4,
    "ice": 4
   },
   "arm": 0,
   "name": "Ethereal Ring",
   "level": 400,
   "slot": "Anel",
   "kind": "",
   "stats": "",
   "bonus": "| resist        = físico +1%, fogo +4%, terra +4%, energia +4%, gelo +4%",
   "resist": "físico +1%, fogo +4%, terra +4%, energia +4%, gelo +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 4,
    "fire": 8
   },
   "sk": {
    "fist fighting": 3,
    "magic level": 2
   },
   "arm": 7,
   "name": "Ethereal Coned Hat",
   "level": 400,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 7",
   "bonus": "fist fighting +3, ML +2",
   "resist": "físico +4%, fogo +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4,
    "magic level": 1
   },
   "arm": 0,
   "name": "Crypt Strike",
   "level": 450,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 20, ataque 45",
   "bonus": "fist fighting +4, ML +1",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 4,
    "energy": 8
   },
   "sk": {
    "fist fighting": 4,
    "magic level": 2
   },
   "arm": 6,
   "name": "Sanguine Trousers",
   "level": 500,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 6",
   "bonus": "fist fighting +4, ML +2",
   "resist": "físico +4%, energia +8%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4,
    "magic level": 2
   },
   "arm": 0,
   "name": "Sanguine Claws",
   "level": 600,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 21 | imbueslots    = 3, ataque 45 + terra | defense       = 21",
   "bonus": "fist fighting +4, ML +2",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {
    "physical": 5,
    "earth": 8
   },
   "sk": {
    "fist fighting": 4,
    "magic level": 3
   },
   "arm": 8,
   "name": "Moonsilver Strike Helm",
   "level": 800,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "fist fighting +4, ML +3",
   "resist": "físico +5%, terra +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 6,
    "magic level": 2
   },
   "arm": 0,
   "name": "Moonsilver Katar",
   "level": 1000,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 22 | imbueslots    = 3, ataque 46",
   "bonus": "fist fighting +6, ML +2",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 6,
    "magic level": 2
   },
   "arm": 0,
   "name": "Stellar Moonsilver Katar",
   "level": 1000,
   "slot": "Arma",
   "kind": "Arma de punho",
   "stats": "def 22 | imbueslots    = 3, ataque 46",
   "bonus": "fist fighting +6, ML +2",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  },
  {
   "res": {},
   "sk": {
    "fist fighting": 4,
    "magic level": 2
   },
   "arm": 0,
   "name": "Grand Sanguine Claws",
   "level": 600,
   "slot": "Arma",
   "kind": "Arma de punho · proficiência mais forte",
   "stats": "def 21 | imbueslots    = 3, ataque 45 + terra | defense       = 21",
   "bonus": "fist fighting +4, ML +2",
   "resist": "",
   "imb": 3,
   "hands": "Duas"
  }
 ],
 "sorcerer": [
  {
   "res": {
    "fire": 6
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Stoic Iks Faulds",
   "level": 250,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "fogo +6%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "ice": 4
   },
   "sk": {
    "magic level": 2,
    "energy magic level": 1
   },
   "arm": 0,
   "name": "Naga Wand",
   "level": 250,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +2, energia ML +1",
   "resist": "gelo +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "ice": 6
   },
   "sk": {
    "magic level": 1
   },
   "arm": 2,
   "name": "Stoic Iks Sandals",
   "level": 250,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "ML +1",
   "resist": "gelo +6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "earth": 5,
    "fire": 5,
    "ice": 5,
    "energy": 5
   },
   "sk": {
    "magic level": 4
   },
   "arm": 0,
   "name": "Umbral Master Spellbook",
   "level": 250,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 32",
   "bonus": "ML +4",
   "resist": "terra +5%, fogo +5%, gelo +5%, energia +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "death": 5
   },
   "sk": {
    "magic level": 2,
    "fire magic level": 3,
    "energy magic level": 3
   },
   "arm": 0,
   "name": "Alchemist's Notepad",
   "level": 250,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 32",
   "bonus": "ML +2, fogo ML +3, energia ML +3",
   "resist": "death +5%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 2
   },
   "sk": {
    "magic level": 1
   },
   "arm": 2,
   "name": "Alchemist's Boots",
   "level": 250,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "ML +1",
   "resist": "físico +2%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "energy": 4
   },
   "sk": {
    "magic level": 2,
    "fire magic level": 1,
    "perfect shot": 65
   },
   "arm": 0,
   "name": "Eldritch Wand",
   "level": 250,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +2, fogo ML +1, perfect shot +65 at range 4",
   "resist": "energia +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "ice": 7
   },
   "sk": {
    "magic level": 2
   },
   "arm": 7,
   "name": "Eldritch Cowl",
   "level": 250,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 7",
   "bonus": "ML +2",
   "resist": "gelo +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {},
   "sk": {},
   "arm": 0,
   "name": "Flamingo Amulet of Destruction",
   "level": 270,
   "slot": "Amuleto",
   "kind": "",
   "stats": "",
   "bonus": "",
   "resist": "",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {},
   "sk": {
    "magic level": 2
   },
   "arm": 0,
   "name": "Cobra Wand",
   "level": 270,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +2",
   "resist": "",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 8
   },
   "sk": {
    "energy magic level": 6,
    "fire magic level": 3
   },
   "arm": 16,
   "name": "Norcferatu Bloodhide",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 16",
   "bonus": "energia ML +6, fogo ML +3",
   "resist": "terra +8%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "death": 3
   },
   "sk": {
    "magic level": 1
   },
   "arm": 2,
   "name": "Norcferatu Fangstompers",
   "level": 270,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 2",
   "bonus": "ML +1",
   "resist": "death +3%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "fire": 10,
    "earth": -2
   },
   "sk": {
    "magic level": 4
   },
   "arm": 16,
   "name": "Dawnfire Sherwani",
   "level": 270,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 16",
   "bonus": "ML +4",
   "resist": "fogo +10%, terra -2%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "physical": 3
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Dawnfire Pantaloons",
   "level": 300,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "físico +3%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "ice": 12,
    "fire": -6
   },
   "sk": {
    "magic level": 3,
    "energy magic level": 1
   },
   "arm": 15,
   "name": "Arcane Dragon Robe",
   "level": 300,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 15",
   "bonus": "ML +3, energia ML +1",
   "resist": "gelo +12%, fogo -6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "earth": 6
   },
   "sk": {
    "magic level": 4,
    "death magic level": 1,
    "apacity": 80
   },
   "arm": 0,
   "name": "Eldritch Folio",
   "level": 300,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 34",
   "bonus": "ML +4, death ML +1, Magic Shield Capacity +80 and 8%",
   "resist": "terra +6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "earth": 5
   },
   "sk": {
    "magic level": 3,
    "fire magic level": 1
   },
   "arm": 0,
   "name": "Inferniarch Wand",
   "level": 300,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "ataque }}",
   "bonus": "ML +3, fogo ML +1",
   "resist": "terra +5%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 8
   },
   "sk": {
    "magic level": 3
   },
   "arm": 0,
   "name": "Falcon Wand",
   "level": 300,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +3",
   "resist": "fogo +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 9
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Falcon Circlet",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "fogo +9%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "death": 6
   },
   "sk": {
    "magic level": 2
   },
   "arm": 8,
   "name": "Dreadfire Headpiece",
   "level": 300,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2",
   "resist": "físico +2%, death +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "ice": 6
   },
   "sk": {
    "magic level": 2,
    "energy magic level": 2
   },
   "arm": 0,
   "name": "Amber Wand",
   "level": 330,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +2, energia ML +2",
   "resist": "gelo +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "energy": 8
   },
   "sk": {
    "magic level": 2,
    "fire magic level": 2
   },
   "arm": 8,
   "name": "Stag Helmet",
   "level": 350,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 8",
   "bonus": "ML +2, fogo ML +2",
   "resist": "físico +2%, energia +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "energy": 6
   },
   "sk": {
    "magic level": 5
   },
   "arm": 0,
   "name": "Stag Spellbook",
   "level": 350,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 34",
   "bonus": "ML +5",
   "resist": "físico +2%, energia +6%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "death": 12
   },
   "sk": {
    "magic level": 4
   },
   "arm": 0,
   "name": "Soultainter",
   "level": 400,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +4",
   "resist": "death +12%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 4
   },
   "sk": {
    "magic level": 4
   },
   "arm": 17,
   "name": "Soulmantle",
   "level": 400,
   "slot": "Armadura",
   "kind": "",
   "stats": "arm 17",
   "bonus": "ML +4",
   "resist": "físico +4%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "death": 10
   },
   "sk": {
    "magic level": 3
   },
   "arm": 10,
   "name": "Soulshanks",
   "level": 400,
   "slot": "Pernas",
   "kind": "",
   "stats": "arm 10",
   "bonus": "ML +3",
   "resist": "death +10%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "fire": 8
   },
   "sk": {
    "magic level": 5,
    "fire magic level": 1,
    "energy magic level": 1
   },
   "arm": 0,
   "name": "Arcanomancer Folio",
   "level": 400,
   "slot": "Spellbook",
   "kind": "",
   "stats": "def 36",
   "bonus": "ML +5, fogo ML +1, energia ML +1",
   "resist": "físico +3%, fogo +8%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "fire": 4,
    "earth": 4,
    "energy": 4,
    "ice": 4
   },
   "sk": {
    "fire magic level": 1,
    "energy magic level": 1
   },
   "arm": 0,
   "name": "Arcanomancer Sigil",
   "level": 400,
   "slot": "Anel",
   "kind": "",
   "stats": "",
   "bonus": "fogo ML +1, energia ML +1",
   "resist": "fogo +4%, terra +4%, energia +4%, gelo +4%",
   "imb": 0,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "earth": 7
   },
   "sk": {
    "magic level": 3
   },
   "arm": 9,
   "name": "Arcanomancer Regalia",
   "level": 400,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 9",
   "bonus": "ML +3",
   "resist": "físico +3%, terra +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "fire": 6
   },
   "sk": {
    "magic level": 4
   },
   "arm": 0,
   "name": "Crypt Bile",
   "level": 450,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +4",
   "resist": "fogo +6%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 2,
    "ice": 8
   },
   "sk": {
    "speed": 10,
    "magic level": 2,
    "death magic level": 1
   },
   "arm": 3,
   "name": "Sanguine Boots",
   "level": 500,
   "slot": "Botas",
   "kind": "",
   "stats": "arm 3",
   "bonus": "speed +10, ML +2, death ML +1",
   "resist": "físico +2%, gelo +8%",
   "imb": 1,
   "hands": ""
  },
  {
   "res": {
    "earth": 7
   },
   "sk": {
    "magic level": 4,
    "fire magic level": 1,
    "energy magic level": 1
   },
   "arm": 0,
   "name": "Sanguine Coil",
   "level": 600,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +4, fogo ML +1, energia ML +1",
   "resist": "terra +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "physical": 3,
    "ice": 8
   },
   "sk": {
    "magic level": 4
   },
   "arm": 10,
   "name": "Moonsilver Nimbus Hat",
   "level": 800,
   "slot": "Elmo",
   "kind": "",
   "stats": "arm 10",
   "bonus": "ML +4",
   "resist": "físico +3%, gelo +8%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 7
   },
   "sk": {
    "magic level": 6,
    "death magic level": 1
   },
   "arm": 0,
   "name": "Moonsilver Channeler",
   "level": 1000,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +6, death ML +1",
   "resist": "energia +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "energy": 7
   },
   "sk": {
    "magic level": 6,
    "death magic level": 1
   },
   "arm": 0,
   "name": "Stellar Moonsilver Channeler",
   "level": 1000,
   "slot": "Arma",
   "kind": "Wand",
   "stats": "",
   "bonus": "ML +6, death ML +1",
   "resist": "energia +7%",
   "imb": 2,
   "hands": ""
  },
  {
   "res": {
    "earth": 7
   },
   "sk": {
    "magic level": 4,
    "fire magic level": 1,
    "energy magic level": 1
   },
   "arm": 0,
   "name": "Grand Sanguine Coil",
   "level": 600,
   "slot": "Arma",
   "kind": "Wand · proficiência mais forte",
   "stats": "",
   "bonus": "ML +4, fogo ML +1, energia ML +1",
   "resist": "terra +7%",
   "imb": 2,
   "hands": ""
  }
 ]
};
