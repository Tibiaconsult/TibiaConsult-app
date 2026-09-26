// Converte o combo de cada montador nos passos do tocador (src/components/ComboPlayer.tsx), com o cooldown efetivo,
// a trava do grupo de ataque e o grupo secundário de cada magia: as mesmas regras dos validadores.

import type { PlayerStep } from "@/components/ComboPlayer";
import { SECONDARY_GROUP_LABEL, spellById } from "@/data/spells";
import { VOCATIONS, type VocId } from "@/data/vocations";
import { ComboOptions, ComboStep, comboCooldown } from "@/lib/combo";
import { spellIcon } from "@/lib/icons";
import { DEFAULT_MODIFIERS, Modifiers, effectiveCooldown, effectiveSecondaryCooldown } from "@/lib/rotation";

const libIcon = (i: string) => `https://static.tibia.com/images/library/${i}.png`;

/** Sorcerer: cooldowns com Wheel, augments e gema (modificadores do montador de rotação). */
export function sorcererSteps(steps: { t: number; spellId: string }[], mods: Modifiers = DEFAULT_MODIFIERS): PlayerStep[] {
  return steps.map((s) => {
    const sp = spellById(s.spellId);
    if (!sp) return { t: s.t, id: s.spellId, name: s.spellId, icon: null };
    return {
      t: s.t,
      id: sp.id,
      name: sp.name,
      icon: spellIcon(sp.id),
      cd: effectiveCooldown(sp, mods),
      lock: sp.attackLock,
      group: sp.secondary
        ? { id: sp.secondary.group, label: SECONDARY_GROUP_LABEL[sp.secondary.group].replace(/ \(.*\)$/, ""), cd: effectiveSecondaryCooldown(sp, mods) ?? sp.secondary.cooldown }
        : undefined,
    };
  });
}

/** Druid, knight, paladin e monk: cooldown pelo estágio das revelations e pelos augments. */
export function vocSteps(voc: VocId, steps: ComboStep[], opts: ComboOptions = { stage: 3, augments: {} }): PlayerStep[] {
  const v = VOCATIONS[voc];
  return steps.map((s) => {
    const sp = v.spells.find((x) => x.id === s.spellId);
    if (!sp) return { t: s.t, id: s.spellId, name: s.spellId, icon: null };
    return {
      t: s.t,
      id: sp.id,
      name: sp.name,
      icon: libIcon(sp.icon),
      cd: comboCooldown(sp, v.augments, opts),
      lock: sp.lock,
      group: sp.group ? { id: sp.group.id, label: sp.group.label, cd: sp.group.cooldown } : undefined,
    };
  });
}
