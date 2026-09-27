// Planejador de efeitos da Wheel of Destiny do sorcerer (só o que mexe em dano e cooldown).
// Fontes: TibiaWiki (Wheel of Destiny, Revelation Perks, Conviction Perks, Supreme Mod) e planner oficial, 26/09/2026.

export const DOMAINS = [
  { id: "tl", name: "Superior esquerdo", revelation: "Gift of Life" },
  { id: "tr", name: "Superior direito", revelation: "Beam Mastery" },
  { id: "bl", name: "Inferior esquerdo", revelation: "Lord of Destruction" },
  { id: "br", name: "Inferior direito", revelation: "Avatar of Storm" },
] as const;
export type DomainId = (typeof DOMAINS)[number]["id"];

export const AUGMENTS = {
  greatFireWave: { label: "Great Fire Wave", t1: "+10% crit chance e +15% crit extra", t2: "+5% base" },
  energyWave: { label: "Energy Wave", t1: "área maior", t2: "+10% base" },
  deathEcho: { label: "Death Echo", t1: "−2 s de cooldown", t2: "+12% base" },
  specialSpells: { label: "Special Spells (Lightning, Strong Strikes)", t1: "−4 s de cooldown", t2: "+50% base" },
  focusSpells: { label: "Focus Spells (Rage, Hell's Core)", t1: "+5% base", t2: "−4 s no grupo Focus" },
} as const;
export type AugmentId = keyof typeof AUGMENTS;

export const SUPREME_OPTIONS = [
  { id: "", label: "nenhum", values: [0, 0, 0, 0] },
  { id: "rm-tl", label: "Revelation Mastery: Gift of Life", values: [150, 165, 180, 225] },
  { id: "rm-tr", label: "Revelation Mastery: Beam Mastery", values: [150, 165, 180, 225] },
  { id: "rm-bl", label: "Revelation Mastery: Lord of Destruction", values: [150, 165, 180, 225] },
  { id: "rm-br", label: "Revelation Mastery: Avatar of Storm", values: [150, 165, 180, 225] },
  { id: "base-great-energy-beam", label: "Great Energy Beam: base", values: [10, 11, 12, 15] },
  { id: "base-great-death-beam", label: "Great Death Beam: base", values: [10, 11, 12, 15] },
  { id: "base-energy-wave", label: "Energy Wave: base", values: [5, 5.5, 6, 7.5] },
  { id: "base-great-fire-wave", label: "Great Fire Wave: base", values: [5, 5.5, 6, 7.5] },
  { id: "base-hells-core", label: "Hell's Core: base", values: [8, 8.8, 9.6, 12] },
  { id: "base-rage-of-the-skies", label: "Rage of the Skies: base", values: [8, 8.8, 9.6, 12] },
  { id: "crit-great-energy-beam", label: "Great Energy Beam: crit extra", values: [15, 16.5, 18, 22.5] },
  { id: "crit-great-death-beam", label: "Great Death Beam: crit extra", values: [15, 16.5, 18, 22.5] },
  { id: "crit-energy-wave", label: "Energy Wave: crit extra", values: [12, 13.2, 14.4, 18] },
  { id: "crit-great-fire-wave", label: "Great Fire Wave: crit extra", values: [8, 8.8, 9.6, 12] },
  { id: "crit-hells-core", label: "Hell's Core: crit extra", values: [12, 13.2, 14.4, 18] },
  { id: "crit-rage-of-the-skies", label: "Rage of the Skies: crit extra", values: [12, 13.2, 14.4, 18] },
  { id: "cd-energy-wave", label: "Energy Wave: −1 s de cooldown", values: [1, 1, 1, 1] },
  { id: "cd-avatar", label: "Avatar of Storm: −900 s", values: [900, 900, 900, 900] },
  { id: "general-crit", label: "Geral: crit extra", values: [2, 2.2, 2.4, 3] },
] as const;

export interface WheelConfig {
  level: number;
  extraPoints: number;
  points: Record<DomainId, number>;
  augments: Record<AugmentId, 0 | 1 | 2>;
  focusMastery: boolean;
  gems: { supreme: string; grade: 1 | 2 | 3 | 4 }[];
}

export function defaultWheel(level = 896): WheelConfig {
  return {
    level,
    extraPoints: 0,
    points: { tl: 0, tr: 500, bl: 250, br: 0 },
    augments: { greatFireWave: 1, energyWave: 1, deathEcho: 1, specialSpells: 1, focusSpells: 0 },
    focusMastery: true,
    gems: [{ supreme: "rm-tr", grade: 1 }],
  };
}

export function availablePoints(w: WheelConfig): number {
  return Math.max(0, w.level - 50) + w.extraPoints;
}

export function stages(w: WheelConfig): Record<DomainId, 0 | 1 | 2 | 3> {
  const out = { tl: 0, tr: 0, bl: 0, br: 0 } as Record<DomainId, 0 | 1 | 2 | 3>;
  for (const d of DOMAINS) {
    let pts = w.points[d.id];
    for (const g of w.gems) {
      const opt = SUPREME_OPTIONS.find((o) => o.id === g.supreme);
      if (opt && g.supreme === `rm-${d.id}`) pts += opt.values[g.grade - 1];
    }
    out[d.id] = pts >= 1000 ? 3 : pts >= 500 ? 2 : pts >= 250 ? 1 : 0;
  }
  return out;
}

export interface WheelEffects {
  flatBonus: number;
  lordOfDestruction: 0 | 1 | 2 | 3;
  beamMastery: 0 | 1 | 2 | 3;
  avatar: 0 | 1 | 2 | 3;
  giftOfLife: 0 | 1 | 2 | 3;
  basePowerBonus: Record<string, number>;
  spellCritExtra: Record<string, number>;
  spellCritChance: Record<string, number>;
  critExtra: number;
  modifiers: { focusMastery: boolean; focusAugmentT2: boolean; specialAugmentT1: boolean; deathEchoAugmentT1: boolean; energyWaveGem: boolean };
}

export function wheelEffects(w: WheelConfig): WheelEffects {
  const st = stages(w);
  const flat = [0, 4, 9, 20];
  const e: WheelEffects = {
    flatBonus: flat[st.tl] + flat[st.tr] + flat[st.bl] + flat[st.br],
    lordOfDestruction: st.bl,
    beamMastery: st.tr,
    avatar: st.br,
    giftOfLife: st.tl,
    basePowerBonus: {},
    spellCritExtra: {},
    spellCritChance: {},
    critExtra: 0,
    modifiers: {
      focusMastery: w.focusMastery,
      focusAugmentT2: w.augments.focusSpells >= 2,
      specialAugmentT1: w.augments.specialSpells >= 1,
      deathEchoAugmentT1: w.augments.deathEcho >= 1,
      energyWaveGem: false,
    },
  };
  const add = (rec: Record<string, number>, id: string, v: number) => (rec[id] = (rec[id] ?? 0) + v);
  if (w.augments.greatFireWave >= 1) {
    add(e.spellCritChance, "great-fire-wave", 0.1);
    add(e.spellCritExtra, "great-fire-wave", 0.15);
  }
  if (w.augments.greatFireWave >= 2) add(e.basePowerBonus, "great-fire-wave", 0.05);
  if (w.augments.energyWave >= 2) add(e.basePowerBonus, "energy-wave", 0.1);
  if (w.augments.deathEcho >= 2) add(e.basePowerBonus, "death-echo", 0.12);
  if (w.augments.specialSpells >= 2) for (const id of ["lightning", "strong-energy-strike", "strong-flame-strike"]) add(e.basePowerBonus, id, 0.5);
  if (w.augments.focusSpells >= 1) for (const id of ["hells-core", "rage-of-the-skies"]) add(e.basePowerBonus, id, 0.05);
  for (const g of w.gems) {
    const opt = SUPREME_OPTIONS.find((o) => o.id === g.supreme);
    if (!opt || !g.supreme) continue;
    const v = opt.values[g.grade - 1];
    if (g.supreme.startsWith("base-")) add(e.basePowerBonus, g.supreme.slice(5), v / 100);
    if (g.supreme.startsWith("crit-")) add(e.spellCritExtra, g.supreme.slice(5), v / 100);
    if (g.supreme === "cd-energy-wave") e.modifiers.energyWaveGem = true;
    if (g.supreme === "general-crit") e.critExtra += v / 100;
  }
  return e;
}

export function encodeWheel(w: WheelConfig): string {
  return encodeURIComponent(btoa(JSON.stringify(w)));
}

export function decodeWheel(raw: string | null): WheelConfig | null {
  if (!raw) return null;
  try {
    return { ...defaultWheel(), ...JSON.parse(atob(decodeURIComponent(raw))) };
  } catch {
    return null;
  }
}
