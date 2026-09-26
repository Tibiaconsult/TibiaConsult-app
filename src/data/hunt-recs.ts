// Level mínimo recomendado por vocação (solo) e para time, por hunt.
// Fonte: TibiaPal, Hunting Places (tibiapal.com/hunting), abas Knight, Paladin, Monk, Sorcerer, Druid e Teamhunts,
// dados refeitos depois do rebalanceamento de 06/2026. Consulta em 26/09/2026.
// Quando o TibiaPal separa andares com levels diferentes, vale o menor e o detalhe vai em `detail`.

export type RecVoc = "knight" | "paladin" | "sorcerer" | "druid" | "monk";

export const REC_VOC_LABEL: Record<RecVoc, string> = { knight: "Knight", paladin: "Paladin", sorcerer: "Sorcerer", druid: "Druid", monk: "Monk" };

export interface HuntRec {
  solo: Partial<Record<RecVoc, number>>;
  team?: number;
  /** elemento ou estilo que o TibiaPal indica, por vocação */
  style?: Partial<Record<RecVoc, string>>;
  detail?: string;
}

export const REC_SOURCE = "TibiaPal, Hunting Places (dados pós-rebalanceamento de 06/2026), consulta em 26/09/2026";

/** Regras de party (TibiaWiki, Party, Sharing Experience): o menor level precisa ser pelo menos 2/3 do maior. */
export const SHARE_BONUS = [0, 0.2, 0.35, 0.7, 1];

export const HUNT_RECS: Record<string, HuntRec> = {
  // Hunts de level alto (adicionadas em 26/09/2026). TibiaPal lista Soul War, Gnomprona, Rotten Blood, Unhallowed Crypt e as áreas Radiant só na aba de times.
  ...Object.fromEntries(
    ["ebb-and-flow", "furious-crater", "claustrophobic-inferno", "rotten-wasteland", "mirrored-nightmare"].map((id) => [
      id,
      { solo: {}, team: 600, detail: "O TibiaPal lista as áreas do Soul War só como hunt de time, a partir de 600." },
    ]),
  ),
  ...Object.fromEntries(
    ["monster-graveyard", "sparkling-pools"].map((id) => [id, { solo: {}, team: 600, detail: "O TibiaPal lista Gnomprona só como hunt de time, a partir de 600." }]),
  ),
  ...Object.fromEntries(
    ["jaded-roots", "gloom-pillars", "darklight-core"].map((id) => [id, { solo: {}, team: 800, detail: "O TibiaPal lista Rotten Blood só como hunt de time, a partir de 800." }]),
  ),
  "radiant-ascendancy": { solo: {}, team: 1000, detail: "O TibiaPal lista Radiant Ascendancy como hunt de time, a partir de 1000." },
  "radiant-skyhold": { solo: {}, team: 1200, detail: "O TibiaPal lista Radiant Skyhold como hunt de time, a partir de 1200." },
  "unhallowed-crypt": { solo: {}, team: 800, detail: "O TibiaPal lista Unhallowed Crypt como hunt de time, a partir de 800." },
  "forsaken-crypt": {
    solo: { paladin: 1000, sorcerer: 1000, druid: 1000 },
    style: { paladin: "Diamond Arrows, Ethereal", sorcerer: "Death", druid: "Forked Thorns + Forked Glacier" },
    detail: "O TibiaPal não lista Forsaken Crypt para knight nem monk. A área é feita para solo.",
  },
  "bloodfire-gorge": {
    solo: { knight: 800, paladin: 800, sorcerer: 800, druid: 800, monk: 800 },
    team: 500,
    style: { knight: "Físico", paladin: "Diamond Arrows, Ethereal", sorcerer: "Fogo", druid: "Forked Thorns + Forked Glacier", monk: "Físico" },
  },
  "bulltaur-lair": {
    solo: { knight: 800, paladin: 800, sorcerer: 800, druid: 600, monk: 800 },
    style: { knight: "Terra", paladin: "Diamond Arrows, Ethereal", sorcerer: "Death", druid: "Forked Thorns + Forked Glacier", monk: "Terra" },
    detail: "Monk: andar -2.",
  },
  ...Object.fromEntries(
    ["secret-library-fire", "secret-library-energy", "secret-library-ice"].map((id) => [
      id,
      { solo: { monk: 1000 }, team: 500, style: { monk: "Terra" }, detail: "TibiaPal: monk solo 1000+ nas alas de energia, fogo e gelo; time a partir de 500." },
    ]),
  ),

  nimmersatt: {
    solo: { knight: 700, paladin: 600, sorcerer: 600, druid: 500, monk: 600 },
    style: { sorcerer: "Energia", druid: "Forked Thorns + Forked Glacier", knight: "Terra", monk: "Terra" },
    detail: "Paladin: andar de baixo (-7) a partir de 600 e andar do boss (-6) a partir de 700.",
  },
  "asura-citadel": {
    solo: { knight: 1000, paladin: 800, sorcerer: 800, druid: 800, monk: 800 },
    style: { sorcerer: "Energia", druid: "Forked Thorns + Forked Glacier", knight: "Terra", monk: "Terra" },
  },
  "asura-vaults": {
    solo: { knight: 1000, paladin: 800, sorcerer: 800, druid: 800, monk: 800 },
    team: 400,
    style: { sorcerer: "Energia", druid: "Forked Thorns + Forked Glacier", knight: "Energia" },
  },
  "azzilon-castle": {
    solo: { knight: 700, paladin: 600, sorcerer: 600, druid: 500, monk: 450 },
    team: 400,
    style: { sorcerer: "Energia", druid: "Forked Thorns + Forked Glacier", knight: "Gelo ou energia", monk: "Energia" },
  },
  "azzilon-catacombs": {
    solo: { paladin: 1000, sorcerer: 800, druid: 600, monk: 800 },
    team: 600,
    style: { sorcerer: "Death", druid: "Forked Thorns + Forked Glacier", monk: "Terra" },
  },
  iksupan: {
    solo: { paladin: 300, sorcerer: 400, druid: 300, monk: 350 },
    style: { sorcerer: "Energia", druid: "Forked Thorns + Forked Glacier", monk: "Energia" },
  },
  putrefactory: {
    solo: {},
    team: 800,
    detail: "O TibiaPal lista Rotten Blood só como hunt de time, a partir de 800.",
  },
  "crystal-enigma": {
    solo: {},
    team: 600,
    detail: "O TibiaPal lista Gnomprona só como hunt de time, a partir de 600.",
  },
  "podzilla-quaras": {
    solo: { paladin: 1000, sorcerer: 800, druid: 800, monk: 1000 },
    style: { sorcerer: "Energia", druid: "Forked Thorns + Stone Shower", monk: "Terra" },
  },
  ingol: {
    solo: { paladin: 800, sorcerer: 800, druid: 600, monk: 800 },
    team: 400,
    style: { sorcerer: "Death na surface, -1 e -2; fogo no -3", druid: "Forked Thorns + Forked Glacier (surface a -2); Forked Glacier + Avalanche (-3)", monk: "Físico" },
    detail: "Paladin: surface, -1 e -2 a partir de 800; -3, -4 e -5 a partir de 1000. Druid: surface a -2 a partir de 600; -3 a partir de 800.",
  },
  norcferatu: {
    solo: { knight: 600, paladin: 600, sorcerer: 600, druid: 500, monk: 600 },
    team: 400,
    style: { sorcerer: "Fogo", druid: "Forked Thorns + Forked Glacier", knight: "Gelo ou terra", monk: "Terra" },
    detail: "Fortress a partir dos levels acima. Dungeons: knight 800, paladin 600 (oeste) e 700 (leste), druid 600, monk 700. Time: Dungeons a partir de 400.",
  },
  "falcon-bastion": {
    solo: { paladin: 500, sorcerer: 400, druid: 400, monk: 400 },
    team: 300,
    style: { sorcerer: "Fogo ou energia", druid: "Forked Thorns + Forked Glacier", monk: "Energia ou terra" },
  },
};
