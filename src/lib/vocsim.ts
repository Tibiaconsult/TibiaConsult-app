// Simulador de Druid, Knight e Paladin.
// Magias por magic level: avg = B(L) + ML × sqrt(0,4 × bp) + bp/6 (mesma fórmula do sorcerer, ver damage.ts).
// Magias por skill: avg = B(L) + (bp/1000) × skill × ataque + bp/6 (crystalserver, register_spells.lua, spellSkillDamage).
// As duas são reconstruções da comunidade, não fórmula publicada pela CipSoft: o simulador aceita calibração.
// Rotação: a cada liberação do grupo de ataque, usa a magia disponível que dá mais dano naquele cast (guloso).

import type { Element } from "@/data/spells";
import type { Hunt } from "@/data/hunts";
import { levelBonus } from "@/lib/damage";
import type { VSpell, VocationData } from "@/data/vocations";

export interface VocInputs {
  level: number;
  magicLevel: number;
  /** skill de ataque sem stance (melee para knight, distance para paladin) */
  skill: number;
  /** ataque físico da arma (knight) ou munição + atk mod (paladin) */
  atkPhysical: number;
  /** ataque elemental da arma */
  atkElemental: number;
  weaponElement: Element;
  stance: string;
  /** estágio de cada revelation (0 a 3), pela ordem de VocationData.revelations */
  revelationStages: number[];
  /** estágio de cada augment (0 a 2), por label */
  augmentStages: Record<string, number>;
  critChance: number;
  critExtra: number;
  /** bônus flat extra (proficiência, gemas com vessel) */
  flatExtra: number;
  targets: number;
  useRunes: boolean;
  calibration: number;
}

export const REVELATION_FLAT = [0, 4, 9, 20];

export function defaultInputs(v: VocationData): VocInputs {
  const base = {
    level: 800,
    magicLevel: v.mainStat === "ml" ? 110 : v.id === "paladin" ? 40 : 12,
    skill: v.mainStat === "ml" ? 10 : 125,
    atkPhysical: v.id === "knight" ? 8 : 88,
    atkElemental: v.id === "knight" ? 50 : 0,
    weaponElement: (v.id === "knight" ? "energy" : "physical") as Element,
    stance: v.stances[0].name,
    revelationStages: v.revelations.map((_, i) => (i === 0 ? 2 : i === 1 ? 1 : 0)),
    augmentStages: Object.fromEntries(v.augments.map((a) => [a.label, 1])),
    critChance: 0,
    critExtra: 0,
    flatExtra: 0,
    targets: 4,
    useRunes: v.id === "druid",
    calibration: 1,
  };
  return base;
}

/** Soma de uma chave dos augments que afetam a magia, pelo estágio escolhido. */
function augmentFx(v: VocationData, inp: VocInputs, spell: VSpell, key: "base" | "cd" | "chain" | "mana"): number {
  let total = 0;
  for (const a of v.augments) {
    const hits = a.spell === spell.id || (a.spell === "forked" && spell.id.startsWith("forked-"));
    if (!hits) continue;
    const st = inp.augmentStages[a.label] ?? 0;
    if (st >= 1) total += a.fx.t1[key] ?? 0;
    if (st >= 2) total += a.fx.t2[key] ?? 0;
  }
  return total;
}

function revelationStage(v: VocationData, inp: VocInputs, name?: string): number {
  if (!name) return 0;
  const i = v.revelations.findIndex((r) => r.name === name);
  return i < 0 ? 0 : inp.revelationStages[i] ?? 0;
}

export function flatBonus(inp: VocInputs): number {
  return inp.revelationStages.reduce((a, s) => a + REVELATION_FLAT[s], 0) + inp.flatExtra;
}

/** Disponível na simulação? (dot, escudo e base desconhecida ficam fora; revelation precisa de estágio; runa só com a opção) */
export function usable(v: VocationData, inp: VocInputs, s: VSpell): boolean {
  if (s.scale === "dot" || s.scale === "shield" || s.scale === "monk" || s.base === null) return false;
  if (s.level > inp.level) return false;
  if (s.revelation && revelationStage(v, inp, s.revelation) === 0) return false;
  if (s.rune && !inp.useRunes) return false;
  return true;
}

export function spellCooldown(v: VocationData, inp: VocInputs, s: VSpell): number {
  const st = revelationStage(v, inp, s.revelation);
  const base = s.stageCooldown && st > 0 ? s.stageCooldown[st - 1] : s.cooldown;
  return Math.max(s.lock, base - augmentFx(v, inp, s, "cd"));
}

export function spellMana(v: VocationData, inp: VocInputs, s: VSpell): number {
  return Math.max(0, s.mana - augmentFx(v, inp, s, "mana"));
}

export function targetsHit(v: VocationData, inp: VocInputs, s: VSpell): number {
  const n = Math.max(1, inp.targets);
  if (s.hit === "single") return 1;
  if (s.id === "front-sweep") return Math.min(n, (inp.augmentStages["Front Sweep"] ?? 0) >= 2 ? 5 : 3);
  if (s.hit === "area") return n;
  let chain = s.chain ?? 0;
  if (s.id === "executioners-throw") chain = [2, 2, 3, 4][revelationStage(v, inp, s.revelation)];
  chain += augmentFx(v, inp, s, "chain");
  return Math.min(n, 1 + chain);
}

/** Skill efetiva (stances de skill somam sobre o total). */
export function effectiveSkill(inp: VocInputs): number {
  if (inp.stance === "Blood Rage") return inp.skill * 1.25;
  if (inp.stance === "Sharpshooter") return inp.skill * 1.32;
  return inp.skill;
}

/** ML efetivo para o elemento da magia. */
export function effectiveML(inp: VocInputs, element: Element): number {
  let ml = inp.magicLevel;
  if (inp.stance === "Elemental Synthesis" && (element === "ice" || element === "earth")) ml += Math.floor(inp.magicLevel * 0.1);
  if (inp.stance === "Divine Defiance" && element === "holy") ml += Math.floor(inp.skill * 0.06);
  return ml;
}

export interface SpellDamage {
  spell: VSpell;
  /** partes de elemento (fração do dano) */
  parts: { element: Element; share: number }[];
  avg: number;
  min: number;
  max: number;
  /** dano esperado por alvo contra a hunt (crit, resistência, mitigação) */
  expectedPerTarget: number;
  targets: number;
  perCast: number;
  cooldown: number;
  mana: number;
}

/** Sensibilidade média ponderada da hunt a um elemento, já com a mitigação. */
export function huntFactor(hunt: Hunt | null, weights: Record<string, number> | null, element: Element): number {
  if (!hunt) return 1;
  let sum = 0;
  let w = 0;
  for (const c of hunt.creatures) {
    const wt = weights?.[c.name] ?? c.weight ?? 1;
    if (wt <= 0) continue;
    const sens = (c.taken[element] ?? 100) / 100;
    const mit = (c.mitigation ?? 3.5) / 100;
    sum += wt * sens * (1 - mit);
    w += wt;
  }
  return w ? sum / w : 1;
}

export function spellDamage(v: VocationData, inp: VocInputs, s: VSpell, hunt: Hunt | null, weights: Record<string, number> | null): SpellDamage {
  const st = revelationStage(v, inp, s.revelation);
  let bpMult = 1 + augmentFx(v, inp, s, "base");
  if (s.id === "divine-grenade" && st > 1) bpMult += 0.16 * (st - 1);
  const bp = (s.base ?? 0) * bpMult;

  let parts: { element: Element; share: number }[];
  if (s.element === "weapon") {
    const tot = inp.atkPhysical + inp.atkElemental;
    const el = tot > 0 ? inp.atkElemental / tot : 0;
    parts = [{ element: "physical" as Element, share: 1 - el }, { element: inp.weaponElement, share: el }].filter((p) => p.share > 0);
    if (inp.weaponElement === "physical") parts = [{ element: "physical", share: 1 }];
  } else parts = [{ element: s.element, share: 1 }];

  const B = levelBonus(inp.level) + flatBonus(inp);
  let avg: number;
  if (s.scale === "skill") avg = B + (bp / 1000) * effectiveSkill(inp) * (inp.atkPhysical + inp.atkElemental) + bp / 6;
  else {
    const el = parts[0].element;
    avg = B + effectiveML(inp, el) * Math.sqrt(0.4 * bp) + bp / 6;
  }
  if (inp.stance === "Protector") avg *= 0.85;
  avg *= inp.calibration;

  // Twin Bursts: bônus contra alvos acima de 60% de vida; aproximação de metade do tempo.
  if (s.revelation === "Twin Bursts" && st > 0) avg *= 1 + [0, 0.2, 0.4, 0.6][st] * 0.5;

  const critMult = 1 + Math.min(1, 0.05 + inp.critChance) * (0.1 + inp.critExtra);
  const factor = parts.reduce((a, p) => a + p.share * huntFactor(hunt, weights, p.element), 0);
  const expectedPerTarget = avg * critMult * factor;
  const targets = targetsHit(v, inp, s);
  return {
    spell: s,
    parts,
    avg: Math.round(avg),
    min: Math.floor(avg * 0.88),
    max: Math.floor(avg * 1.12),
    expectedPerTarget,
    targets,
    perCast: expectedPerTarget * targets,
    cooldown: spellCooldown(v, inp, s),
    mana: spellMana(v, inp, s),
  };
}

export interface RotationResult {
  seconds: number;
  total: number;
  dps: number;
  manaPerMinute: number;
  casts: { t: number; id: string; name: string; dmg: number }[];
  countBy: Record<string, number>;
}

/** Rotação gulosa em `seconds` segundos: sempre a magia disponível com mais dano por cast. */
export function simulateRotation(v: VocationData, dmg: SpellDamage[], seconds = 120): RotationResult {
  const ready: Record<string, number> = {};
  const groupReady: Record<string, number> = {};
  const casts: RotationResult["casts"] = [];
  const countBy: Record<string, number> = {};
  let t = 0;
  let total = 0;
  let mana = 0;
  const pool = dmg.filter((d) => d.perCast > 0);
  while (t < seconds) {
    const avail = pool.filter((d) => (ready[d.spell.id] ?? 0) <= t + 1e-9 && (!d.spell.group || (groupReady[d.spell.group.id] ?? 0) <= t + 1e-9));
    if (!avail.length) {
      const next = Math.min(...pool.map((d) => Math.max(ready[d.spell.id] ?? 0, d.spell.group ? groupReady[d.spell.group.id] ?? 0 : 0)));
      if (!isFinite(next) || next <= t) break;
      t = Math.ceil(next / 2) * 2;
      continue;
    }
    avail.sort((a, b) => b.perCast - a.perCast);
    const d = avail[0];
    const s = d.spell;
    ready[s.id] = t + d.cooldown;
    if (s.group) {
      const gcd = s.revelation === "Twin Bursts" ? d.cooldown : s.group.cooldown;
      groupReady[s.group.id] = t + gcd;
    }
    total += d.perCast;
    mana += d.mana;
    casts.push({ t, id: s.id, name: s.name, dmg: d.perCast });
    countBy[s.id] = (countBy[s.id] ?? 0) + 1;
    t += s.lock;
  }
  return { seconds, total, dps: total / seconds, manaPerMinute: (mana * 60) / seconds, casts, countBy };
}
