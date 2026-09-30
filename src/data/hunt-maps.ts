// Posição de cada hunt no mapa (x, y, andar) e a imagem da área na TibiaWiki. Gerado por scripts/hunt-maps.mjs em 30/09/2026.
// Sem coordenada: radiant-ascendancy, radiant-skyhold, bloodfire-gorge, issavi-goannas, issavi-ogres.

export interface HuntMap {
  /** página da hunt na TibiaWiki */
  page: string;
  x?: number;
  y?: number;
  z?: number;
  /** imagem da área na TibiaWiki */
  img?: string;
  /** de onde veio a coordenada quando não é da página da wiki (ex.: entrada, marcador do TibiaMaps) */
  ref?: string;
}

export const HUNT_MAPS: Record<string, HuntMap> = {
  "lost-souls": {
    "page": "Brain Grounds",
    "x": 31965,
    "y": 32328,
    "z": 8,
    "img": "Brain Grounds -1.png"
  },
  "nimmersatt": {
    "page": "Nimmersatt's Breeding Ground",
    "x": 33213,
    "y": 31068,
    "z": 14
  },
  "asura-citadel": {
    "page": "Asura Citadel",
    "x": 33894,
    "y": 32713,
    "z": 7,
    "ref": "marcador Asura Citadel (TibiaMaps)"
  },
  "asura-vaults": {
    "page": "Asura Vaults",
    "x": 32812,
    "y": 32755,
    "z": 9
  },
  "azzilon-castle": {
    "page": "Azzilon Castle",
    "x": 33281,
    "y": 31848,
    "z": 8
  },
  "azzilon-catacombs": {
    "page": "Azzilon Catacombs",
    "x": 33281,
    "y": 31848,
    "z": 8
  },
  "iksupan": {
    "page": "Iksupan Occupied Sanctuary",
    "x": 34071,
    "y": 31484,
    "z": 11
  },
  "putrefactory": {
    "page": "Putrefactory",
    "x": 34100,
    "y": 31688,
    "z": 14
  },
  "crystal-enigma": {
    "page": "Crystal Enigma",
    "img": "Gnomprona Map.png",
    "x": 33594,
    "y": 32909,
    "z": 15,
    "ref": "marcador Crystal Enigma (TibiaMaps)"
  },
  "podzilla-quaras": {
    "page": "Podzilla",
    "x": 33805,
    "y": 31995,
    "z": 4,
    "ref": "entrada: marcador To Podzilla (TibiaMaps)"
  },
  "ingol": {
    "page": "Ingol",
    "img": "[[File:Ingol Map.png",
    "x": 33356,
    "y": 31985,
    "z": 7,
    "ref": "entrada: marcador To Ingol (TibiaMaps)"
  },
  "norcferatu": {
    "page": "Norcferatu Fortress",
    "x": 32914,
    "y": 31451,
    "z": 7
  },
  "falcon-bastion": {
    "page": "Falcon Bastion",
    "x": 33362,
    "y": 31343,
    "z": 7
  },
  "ebb-and-flow": {
    "page": "Ebb and Flow",
    "x": 33894,
    "y": 31020,
    "z": 8,
    "img": "Ebb and Flow Map 1.png"
  },
  "furious-crater": {
    "page": "Furious Crater",
    "x": 33860,
    "y": 31833,
    "z": 3
  },
  "claustrophobic-inferno": {
    "page": "Claustrophobic Inferno",
    "x": 34011,
    "y": 31014,
    "z": 9
  },
  "rotten-wasteland": {
    "page": "Rotten Wasteland",
    "x": 33975,
    "y": 31044,
    "z": 11
  },
  "mirrored-nightmare": {
    "page": "Mirrored Nightmare",
    "x": 33887,
    "y": 31189,
    "z": 10
  },
  "monster-graveyard": {
    "page": "Monster Graveyard",
    "img": "Gnomprona Map.png",
    "x": 33632,
    "y": 32844,
    "z": 15,
    "ref": "marcador Monster Graveyard (TibiaMaps)"
  },
  "sparkling-pools": {
    "page": "Sparkling Pools",
    "img": "Gnomprona Map.png",
    "x": 33564,
    "y": 32860,
    "z": 15,
    "ref": "marcador Sparkling Pools (TibiaMaps)"
  },
  "jaded-roots": {
    "page": "Jaded Roots",
    "x": 33842,
    "y": 31664,
    "z": 14
  },
  "gloom-pillars": {
    "page": "Gloom Pillars",
    "x": 33810,
    "y": 31824,
    "z": 14
  },
  "darklight-core": {
    "page": "Darklight Core",
    "x": 34118,
    "y": 31880,
    "z": 14
  },
  "radiant-ascendancy": {
    "page": "Radiant Ascendancy"
  },
  "radiant-skyhold": {
    "page": "Radiant Skyhold"
  },
  "forsaken-crypt": {
    "page": "Forsaken Crypt",
    "x": 32881,
    "y": 31594,
    "z": 11,
    "ref": "entrada: marcador To Forsaken Crypt (TibiaMaps)"
  },
  "unhallowed-crypt": {
    "page": "Unhallowed Crypt",
    "x": 32823,
    "y": 31534,
    "z": 10,
    "ref": "marcador Unhallowed Crypt (TibiaMaps)"
  },
  "bloodfire-gorge": {
    "page": "Bloodfire Gorge"
  },
  "bulltaur-lair": {
    "page": "Bulltaur Lair",
    "x": 32883,
    "y": 32363,
    "z": 8
  },
  "secret-library-fire": {
    "page": "Secret Library",
    "x": 32177,
    "y": 31927,
    "z": 7,
    "img": "Secret Library Sections 1.png"
  },
  "secret-library-energy": {
    "page": "Secret Library",
    "x": 32177,
    "y": 31927,
    "z": 7,
    "img": "Secret Library Sections 1.png"
  },
  "secret-library-ice": {
    "page": "Secret Library",
    "x": 32177,
    "y": 31927,
    "z": 7,
    "img": "Secret Library Sections 1.png"
  },
  "antrum-of-the-fallen": {
    "page": "Antrum of the Fallen",
    "x": 32674,
    "y": 31787,
    "z": 10
  },
  "grotto-of-the-lost": {
    "page": "Grotto of the Lost",
    "x": 32143,
    "y": 31446,
    "z": 14
  },
  "dwelling-of-the-forgotten": {
    "page": "Dwelling of the Forgotten",
    "x": 32062,
    "y": 31462,
    "z": 11
  },
  "grounds-of-plague": {
    "page": "Grounds of Plague",
    "x": 33231,
    "y": 31441,
    "z": 11,
    "img": "Grounds of Plague 1.png"
  },
  "grounds-of-deceit": {
    "page": "Grounds of Deceit",
    "x": 33642,
    "y": 32686,
    "z": 11,
    "img": "Grounds of Deceit 1.png"
  },
  "grounds-of-fire": {
    "page": "Grounds of Fire",
    "x": 33612,
    "y": 32630,
    "z": 14,
    "img": "Grounds of Fire 1.png"
  },
  "grounds-of-destruction": {
    "page": "Grounds of Destruction",
    "x": 33426,
    "y": 32447,
    "z": 13,
    "img": "Grounds of Destruction 1.png"
  },
  "grounds-of-undeath": {
    "page": "Grounds of Undeath",
    "x": 33394,
    "y": 32336,
    "z": 10,
    "img": "Grounds of Undeath 1.png"
  },
  "grounds-of-despair": {
    "page": "Grounds of Despair",
    "x": 33463,
    "y": 32798,
    "z": 8,
    "img": "Grounds of Despair 1.png"
  },
  "grounds-of-damnation": {
    "page": "Grounds of Damnation",
    "x": 33420,
    "y": 32685,
    "z": 13,
    "img": "Grounds of Damnation 1.png"
  },
  "cobra-bastion": {
    "page": "Cobra Bastion",
    "x": 33301,
    "y": 32647,
    "z": 7
  },
  "issavi-catacombs": {
    "page": "Kilmaresh Catacombs",
    "x": 33857,
    "y": 31529,
    "z": 7,
    "ref": "entrada: marcador Kilmaresh Catacombs (TibiaMaps)"
  },
  "issavi-sewers": {
    "page": "Issavi Sewers",
    "x": 33875,
    "y": 31477,
    "z": 7,
    "ref": "entrada: marcador Issavi sewers (TibiaMaps)"
  },
  "issavi-goannas": {
    "page": "Kilmaresh Central Steppe"
  },
  "issavi-ogres": {
    "page": "Kilmaresh Central Steppe"
  },
  "upper-roshamuul": {
    "page": "Upper Roshamuul",
    "x": 33632,
    "y": 32401,
    "z": 7
  },
  "forgotten-crypt": {
    "page": "Forgotten Crypt",
    "x": 32925,
    "y": 31779,
    "z": 11,
    "ref": "embaixo de Draconia (TibiaWiki, The Roost of the Graveborn Quest)"
  },
  "ferumbras-way": {
    "page": "Ferumbras' Ascension Quest",
    "x": 33271,
    "y": 32395,
    "z": 7,
    "ref": "entrada: Mazarius, nordeste de Darashia (TibiaWiki, Ferumbras' Ascension Quest)"
  },
  "deep-desert": {
    "page": "Deep Desert",
    "x": 33106,
    "y": 32383,
    "z": 7
  },
  "raubritter-mines": {
    "page": "Isle of Ada",
    "x": 33872,
    "y": 32193,
    "z": 7,
    "ref": "minas da Isle of Ada (TibiaWiki, The Order of the Stag Quest)"
  },
  "netherworld": {
    "page": "Netherworld",
    "x": 33543,
    "y": 31438,
    "z": 8
  }
};
