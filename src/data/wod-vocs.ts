// Revelations por domínio e mods supremos disponíveis de cada vocação, lidos do motor oficial da Wheel
// (static.tibia.com/javascripts/wheelofdestiny/skillgrid.js: getCornerParameters e getAvailableSupremeMods) em 26/09/2026.
// Os mods básicos são os mesmos para as cinco vocações (getAvailableBasicModsPos1/Pos2 iguais).

export type WodVocId = "sorcerer" | "druid" | "knight" | "paladin" | "monk";

/** ids de WOD_LARGE nos domínios superior esquerdo, superior direito, inferior esquerdo e inferior direito */
export const WOD_DOMAINS: Record<WodVocId, [number, number, number, number]> = {
  knight: [0, 1, 2, 3],
  paladin: [0, 4, 5, 6],
  sorcerer: [0, 7, 8, 9],
  druid: [0, 11, 10, 12],
  monk: [0, 13, 14, 15],
};

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** ids de mod supremo (ver supremeName/supremeEffect em wod-strings) */
export const WOD_SUPREME: Record<WodVocId, number[]> = {
  knight: [0, 1, 2, 3, 5, ...range(6, 23)],
  paladin: [0, 1, 2, 3, 5, ...range(24, 41)],
  sorcerer: [0, 1, 2, 3, 4, 5, ...range(42, 58)],
  druid: [0, 1, 2, 3, 4, 5, ...range(59, 75)],
  monk: [0, 1, 2, 3, 5, ...range(76, 93)],
};
