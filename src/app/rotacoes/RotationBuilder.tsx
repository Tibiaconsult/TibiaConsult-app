"use client";

import SaveToChar from "@/components/SaveToChar";
import { useEffect, useMemo, useState } from "react";
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

const LABELS: Record<keyof Modifiers, string> = {
  focusMastery: "Focus Mastery (-2 s no Focus)",
  focusAugmentT2: "Augment Focus Spells T2 (-4 s)",
  specialAugmentT1: "Augment Special Spells T1 (-4 s)",
  deathEchoAugmentT1: "Augment Death Echo T1 (-2 s)",
  energyWaveGem: "Gema Energy Wave (-1 s)",
  stance: "Stance",
};

export default function RotationBuilder() {
  const [steps, setSteps] = useState<RotationStep[]>(START);
  const [mods, setMods] = useState<Modifiers>({ ...DEFAULT_MODIFIERS, stance: "fire" });

  // ?add= vem do botão "+ combo" da página de Cooldowns
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    // ?combo= vem da rotação salva no char (Minha área)
    const saved = (u.get("combo") ?? "")
      .split(",")
      .map((p) => p.split(":"))
      .filter((p) => p.length === 2 && spellById(p[1]))
      .map(([t, spellId]) => ({ t: Number(t), spellId }));
    if (saved.length) setSteps(saved);
    const st = u.get("stance");
    if (st === "fire" || st === "energy" || st === "death") setMods((m) => ({ ...m, stance: st }));
    const add = u.get("add");
    if (add && spellById(add)) setSteps((prev) => [...prev, { t: prev.reduce((m, s) => Math.max(m, s.t), -2) + 2, spellId: add }]);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={Boolean(mods[k])} onChange={(e) => setMods({ ...mods, [k]: e.target.checked })} />
      {LABELS[k]}
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          Stance
          <select value={mods.stance ?? ""} onChange={(e) => setMods({ ...mods, stance: (e.target.value || null) as Element | null })}>
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
                <tr key={s.i} style={bad ? { outline: "2px solid #a01a1a" } : undefined}>
                  <td>
                    <input type="number" step={2} min={0} className="w-16" value={s.t} onChange={(e) => update(s.i, { t: Number(e.target.value) })} />
                  </td>
                  <td>
                    <select value={s.spellId} onChange={(e) => update(s.i, { spellId: e.target.value })}>
                      {SPELLS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {el ? <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span> : "-"}
                    {converted && <span className="ml-2 warn text-[11px]">convertido pela stance</span>}
                  </td>
                  <td>{sp ? `${effectiveCooldown(sp, mods)} s` : "-"}</td>
                  <td>{sp?.mana || "-"}</td>
                  <td>
                    <button className="tc-btn tc-btn-danger !py-0.5 !px-2" onClick={() => remove(s.i)}>
                      remover
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <button className="tc-btn" onClick={add}>
          + feitiço
        </button>
        <span className="muted">Mana da sequência: {manaPerCycle(steps)}</span>
        <a className="tc-btn" href="/cooldowns">
          Ver cooldowns
        </a>
        <SaveToChar voc="sorcerer" field="combo_code" value={`combo=${steps.map((s) => `${s.t}:${s.spellId}`).join(",")}&stance=${mods.stance ?? ""}`} what="a rotação" />
        <a className="tc-btn" href={`/simulador?voc=sorcerer&rot=${steps.map((s) => `${s.t}:${s.spellId}`).join(",")}&stance=${mods.stance ?? "energy"}`}>
          Calcular o dano desta rotação
        </a>
      </div>

      {conflicts.length === 0 ? (
        <div className="good">Sem conflito de cooldown.</div>
      ) : (
        <ul className="bad list-disc pl-5 space-y-1">
          {conflicts.map((c, i) => (
            <li key={i}>{c.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
