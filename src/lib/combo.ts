// Combos das vocações druid, knight, paladin e monk: mesmas regras do validador do sorcerer
// (grupo de ataque, cooldown individual e grupo secundário). Dados das magias em src/data/vocations.ts.

import type { Augment, VSpell } from "@/data/vocations";

export interface ComboStep {
  t: number;
  spellId: string;
}

export interface ComboOptions {
  /** estágio das revelations (1 a 3), para magias com cooldown por estágio */
  stage: 1 | 2 | 3;
  /** nível do augment por magia (0, 1 ou 2) */
  augments: Record<string, number>;
}

export interface ComboConflict {
  index: number;
  message: string;
}

/** Segundos a menos no cooldown vindos dos augments escolhidos. */
function augmentCut(spellId: string, augs: Augment[], o: ComboOptions): number {
  let cut = 0;
  for (const a of augs) {
    // "forked" vale para forked-glacier e forked-thorns
    if (a.spell !== spellId && !spellId.startsWith(a.spell + "-")) continue;
    const lvl = o.augments[a.spell] ?? 0;
    if (lvl >= 1) cut += a.fx.t1.cd ?? 0;
    if (lvl >= 2) cut += a.fx.t2.cd ?? 0;
  }
  return cut;
}

/** Cooldown efetivo: estágio da revelation, augments e o piso de 50% do cooldown base. */
export function comboCooldown(s: VSpell, augs: Augment[], o: ComboOptions): number {
  const base = s.stageCooldown ? s.stageCooldown[o.stage - 1] : s.cooldown;
  return Math.max(base / 2, base - augmentCut(s.id, augs, o));
}

export function validateCombo(steps: ComboStep[], spells: VSpell[], augs: Augment[], o: ComboOptions): ComboConflict[] {
  const out: ComboConflict[] = [];
  const byId = new Map(spells.map((s) => [s.id, s]));
  let attackFree = -Infinity;
  const own = new Map<string, number>();
  const group = new Map<string, number>();
  const ordered = steps.map((s, index) => ({ ...s, index })).sort((a, b) => a.t - b.t);
  for (const st of ordered) {
    const s = byId.get(st.spellId);
    if (!s) {
      out.push({ index: st.index, message: `Magia desconhecida: ${st.spellId}` });
      continue;
    }
    if (st.t < attackFree) out.push({ index: st.index, message: `${s.name} no segundo ${st.t}: o grupo de ataque só libera no segundo ${attackFree}.` });
    const f = own.get(s.id);
    if (f !== undefined && st.t < f) out.push({ index: st.index, message: `${s.name} no segundo ${st.t}: o cooldown próprio só volta no segundo ${f}.` });
    if (s.group) {
      const g = group.get(s.group.id);
      if (g !== undefined && st.t < g) out.push({ index: st.index, message: `${s.name} no segundo ${st.t}: o grupo ${s.group.label} está travado até o segundo ${g}.` });
    }
    attackFree = st.t + s.lock;
    own.set(s.id, st.t + comboCooldown(s, augs, o));
    if (s.group) group.set(s.group.id, st.t + s.group.cooldown);
  }
  return out;
}

/** Reposiciona os passos, na ordem atual, no primeiro segundo em que cada magia pode sair. */
export function autoTime(steps: ComboStep[], spells: VSpell[], augs: Augment[], o: ComboOptions): ComboStep[] {
  const byId = new Map(spells.map((s) => [s.id, s]));
  let attackFree = 0;
  const own = new Map<string, number>();
  const group = new Map<string, number>();
  return [...steps]
    .sort((a, b) => a.t - b.t)
    .map((st) => {
      const s = byId.get(st.spellId);
      if (!s) return st;
      const t = Math.max(attackFree, own.get(s.id) ?? 0, s.group ? (group.get(s.group.id) ?? 0) : 0);
      attackFree = t + s.lock;
      own.set(s.id, t + comboCooldown(s, augs, o));
      if (s.group) group.set(s.group.id, t + s.group.cooldown);
      return { ...st, t };
    });
}

export const encodeCombo = (steps: ComboStep[]) => steps.map((s) => `${s.t}:${s.spellId}`).join(",");
export function decodeCombo(raw: string | null): ComboStep[] | null {
  if (!raw) return null;
  const out = raw
    .split(",")
    .map((p) => p.split(":"))
    .filter((p) => p.length === 2 && !isNaN(Number(p[0])))
    .map(([t, spellId]) => ({ t: Number(t), spellId }));
  return out.length ? out : null;
}
