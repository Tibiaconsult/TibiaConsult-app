"use client";

import { useMemo, useState } from "react";
import { SPELLS, spellById, ELEMENT_LABEL, Element } from "@/data/spells";
import {
  DEFAULT_MODIFIERS,
  Modifiers,
  RotationStep,
  effectiveCooldown,
  effectiveElements,
  manaPerCycle,
  validateRotation,
} from "@/lib/rotation";

const START: RotationStep[] = [
  { t: 0, spellId: "great-fire-wave" },
  { t: 2, spellId: "energy-wave" },
  { t: 4, spellId: "great-fire-wave" },
  { t: 6, spellId: "great-death-beam" },
];

export default function RotationBuilder() {
  const [steps, setSteps] = useState<RotationStep[]>(START);
  const [mods, setMods] = useState<Modifiers>({ ...DEFAULT_MODIFIERS, stance: "fire" });

  const conflicts = useMemo(() => validateRotation(steps, mods), [steps, mods]);
  const elements = useMemo(() => effectiveElements(steps, mods.stance), [steps, mods.stance]);
  const ordered = useMemo(() => [...steps].map((s, i) => ({ ...s, i })).sort((a, b) => a.t - b.t), [steps]);

  function update(i: number, patch: Partial<RotationStep>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function remove(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add() {
    const last = steps.reduce((m, s) => Math.max(m, s.t), -2);
    setSteps((prev) => [...prev, { t: last + 2, spellId: "energy-wave" }]);
  }

  const toggle = (k: keyof Modifiers) => (
    <label className="flex items-center gap-2 text-sm text-zinc-300">
      <input
        type="checkbox"
        checked={Boolean(mods[k])}
        onChange={(e) => setMods({ ...mods, [k]: e.target.checked })}
      />
      {LABELS[k]}
    </label>
  );

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-sm text-zinc-300 flex items-center gap-2">
          Stance
          <select
            className="bg-zinc-800 rounded px-2 py-1"
            value={mods.stance ?? ""}
            onChange={(e) => setMods({ ...mods, stance: (e.target.value || null) as Element | null })}
          >
            <option value="">nenhuma</option>
            <option value="fire">Master of Flames</option>
            <option value="energy">Master of Thunder</option>
            <option value="death">Master of Decay</option>
          </select>
        </label>
        {toggle("focusMastery")}
        {toggle("focusAugmentT2")}
        {toggle("specialAugmentT1")}
        {toggle("deathEchoAugmentT1")}
        {toggle("energyWaveGem")}
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="w-20">Segundo</th>
              <th>Feitiço</th>
              <th>Elemento efetivo</th>
              <th>CD efetivo</th>
              <th>Mana</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((s, pos) => {
              const sp = spellById(s.spellId);
              const bad = conflicts.some((c) => c.index === s.i);
              const el = elements[pos];
              const converted = sp && el && el !== sp.element;
              return (
                <tr key={s.i} className={bad ? "bg-red-950/40" : ""}>
                  <td>
                    <input
                      type="number"
                      step={2}
                      min={0}
                      className="w-16 bg-zinc-800 rounded px-2 py-1"
                      value={s.t}
                      onChange={(e) => update(s.i, { t: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <select
                      className="bg-zinc-800 rounded px-2 py-1"
                      value={s.spellId}
                      onChange={(e) => update(s.i, { spellId: e.target.value })}
                    >
                      {SPELLS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {el ? ELEMENT_LABEL[el] : "-"}
                    {converted && <span className="ml-2 text-xs text-amber-300">convertido pela stance</span>}
                  </td>
                  <td>{sp ? `${effectiveCooldown(sp, mods)} s` : "-"}</td>
                  <td>{sp?.mana || "-"}</td>
                  <td>
                    <button className="text-xs text-zinc-400 hover:text-red-300" onClick={() => remove(s.i)}>
                      remover
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 items-center text-sm">
        <button className="rounded bg-amber-500/20 text-amber-200 px-3 py-1 hover:bg-amber-500/30" onClick={add}>
          + feitiço
        </button>
        <span className="text-zinc-400">Mana da sequência: {manaPerCycle(steps)}</span>
      </div>

      {conflicts.length === 0 ? (
        <div className="text-sm text-green-300">Sem conflito de cooldown.</div>
      ) : (
        <ul className="text-sm text-red-300 list-disc pl-5 space-y-1">
          {conflicts.map((c, i) => (
            <li key={i}>{c.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const LABELS: Record<keyof Modifiers, string> = {
  focusMastery: "Focus Mastery (-2 s no Focus)",
  focusAugmentT2: "Augment Focus Spells T2 (-4 s)",
  specialAugmentT1: "Augment Special Spells T1 (-4 s)",
  deathEchoAugmentT1: "Augment Death Echo T1 (-2 s)",
  energyWaveGem: "Gema Energy Wave (-1 s)",
  stance: "Stance",
};
