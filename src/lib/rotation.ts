import { spellById, Spell, SECONDARY_GROUP_LABEL, Element } from "@/data/spells";

export interface RotationStep {
  /** segundo em que o feitiço é lançado */
  t: number;
  spellId: string;
  note?: string;
}

export interface Conflict {
  index: number;
  message: string;
}

export interface Modifiers {
  /** Focus Mastery na Wheel: -2 s no grupo Focus */
  focusMastery: boolean;
  /** Augment "Focus Spells" T2: -4 s no grupo Focus */
  focusAugmentT2: boolean;
  /** Augment "Special Spells" T1: -4 s no grupo Special */
  specialAugmentT1: boolean;
  /** Augment "Death Echo" T1: -2 s */
  deathEchoAugmentT1: boolean;
  /** Supremo Energy Wave: -1 s */
  energyWaveGem: boolean;
  /** Stance elemental ativa */
  stance: Element | null;
}

export const DEFAULT_MODIFIERS: Modifiers = {
  focusMastery: false,
  focusAugmentT2: false,
  specialAugmentT1: false,
  deathEchoAugmentT1: false,
  energyWaveGem: false,
  stance: null,
};

function floor50(base: number, reduced: number): number {
  return Math.max(base / 2, reduced);
}

export function effectiveCooldown(spell: Spell, m: Modifiers): number {
  let cd = spell.cooldown;
  if (spell.id === "death-echo" && m.deathEchoAugmentT1) cd -= 2;
  if (spell.id === "energy-wave" && m.energyWaveGem) cd -= 1;
  if (spell.secondary?.group === "special" && m.specialAugmentT1) cd -= 4;
  if (spell.secondary?.group === "focus") {
    if (m.focusMastery) cd -= 2;
    if (m.focusAugmentT2) cd -= 4;
  }
  return floor50(spell.cooldown, cd);
}

export function effectiveSecondaryCooldown(spell: Spell, m: Modifiers): number | null {
  if (!spell.secondary) return null;
  let cd = spell.secondary.cooldown;
  if (spell.secondary.group === "special" && m.specialAugmentT1) cd -= 4;
  if (spell.secondary.group === "focus") {
    if (m.focusMastery) cd -= 2;
    if (m.focusAugmentT2) cd -= 4;
  }
  return floor50(spell.secondary.cooldown, cd);
}

/** Elemento efetivo de cada passo considerando a conversão da stance. */
export function effectiveElements(steps: RotationStep[], stance: Element | null): (Element | null)[] {
  const out: (Element | null)[] = [];
  let armed = false;
  for (const step of [...steps].sort((a, b) => a.t - b.t)) {
    const spell = spellById(step.spellId);
    if (!spell) {
      out.push(null);
      continue;
    }
    if (!stance) {
      out.push(spell.element);
      continue;
    }
    if (spell.element === stance) {
      armed = true;
      out.push(spell.element);
    } else if (armed) {
      out.push(stance);
      armed = false;
    } else {
      out.push(spell.element);
    }
  }
  return out;
}

export function validateRotation(steps: RotationStep[], m: Modifiers = DEFAULT_MODIFIERS): Conflict[] {
  const conflicts: Conflict[] = [];
  const ordered = steps.map((s, i) => ({ ...s, index: i })).sort((a, b) => a.t - b.t);

  let attackFreeAt = -Infinity;
  const individualFreeAt = new Map<string, number>();
  const secondaryFreeAt = new Map<string, number>();

  for (const step of ordered) {
    const spell = spellById(step.spellId);
    if (!spell) {
      conflicts.push({ index: step.index, message: `Feitiço desconhecido: ${step.spellId}` });
      continue;
    }
    if (step.t < attackFreeAt) {
      conflicts.push({
        index: step.index,
        message: `${spell.name} no segundo ${step.t}: grupo de ataque só libera no segundo ${attackFreeAt}.`,
      });
    }
    const indFree = individualFreeAt.get(spell.id);
    if (indFree !== undefined && step.t < indFree) {
      conflicts.push({
        index: step.index,
        message: `${spell.name} no segundo ${step.t}: cooldown individual de ${effectiveCooldown(spell, m)} s só volta no segundo ${indFree}.`,
      });
    }
    if (spell.secondary) {
      const secFree = secondaryFreeAt.get(spell.secondary.group);
      if (secFree !== undefined && step.t < secFree) {
        conflicts.push({
          index: step.index,
          message: `${spell.name} no segundo ${step.t}: grupo ${SECONDARY_GROUP_LABEL[spell.secondary.group]} travado até o segundo ${secFree}.`,
        });
      }
    }
    attackFreeAt = step.t + spell.attackLock;
    individualFreeAt.set(spell.id, step.t + effectiveCooldown(spell, m));
    if (spell.secondary) {
      secondaryFreeAt.set(spell.secondary.group, step.t + (effectiveSecondaryCooldown(spell, m) ?? 0));
    }
  }
  return conflicts;
}

export function manaPerCycle(steps: RotationStep[]): number {
  return steps.reduce((acc, s) => acc + (spellById(s.spellId)?.mana ?? 0), 0);
}
