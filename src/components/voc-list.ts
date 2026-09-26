export type AnyVoc = "sorcerer" | "druid" | "knight" | "paladin" | "monk";
export const ALL_VOCS: [AnyVoc, string, string][] = [
  ["sorcerer", "Master Sorcerer", "energywave"],
  ["druid", "Elder Druid", "eternalwinter"],
  ["knight", "Elite Knight", "fierceberserk"],
  ["paladin", "Royal Paladin", "divinecaldera"],
  ["monk", "Exalted Monk", "spiritualoutburst"],
];

export function parseVoc(v: string | string[] | undefined | null): AnyVoc {
  const s = Array.isArray(v) ? v[0] : v;
  return ALL_VOCS.some(([id]) => id === s) ? (s as AnyVoc) : "sorcerer";
}
