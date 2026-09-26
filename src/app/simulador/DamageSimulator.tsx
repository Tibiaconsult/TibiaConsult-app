"use client";

import { useMemo, useState } from "react";
import { ELEMENT_LABEL, Element, SPELLS, spellById } from "@/data/spells";
import { ROTATIONS } from "@/data/rotations";
import { HUNTS } from "@/data/hunts";
import { computeDamage, DamageInputs, Target, levelBonus } from "@/lib/damage";
import { effectiveElements } from "@/lib/rotation";

const ELEMENTS: Element[] = ["fire", "energy", "death", "ice", "earth", "physical", "holy"];

const TARGETS: Target[] = [
  { name: "Alvo neutro (100% em tudo)", sensitivity: { fire: 1, energy: 1, death: 1, ice: 1, earth: 1, physical: 1, holy: 1 }, mitigation: 0 },
  ...HUNTS.flatMap((h) =>
    h.creatures.map((c) => ({
      name: `${c.name} (${h.name})`,
      sensitivity: {
        fire: c.taken.fire / 100,
        energy: c.taken.energy / 100,
        death: c.taken.death / 100,
        ice: c.taken.ice / 100,
        earth: c.taken.earth / 100,
        physical: c.taken.physical / 100,
        holy: c.taken.holy / 100,
      },
      mitigation: 0.035,
    })),
  ),
];

const OFFENSIVE = SPELLS.filter((s) => s.base && s.element);

function num(v: string, fallback = 0) {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export default function DamageSimulator() {
  const [level, setLevel] = useState(896);
  const [ml, setMl] = useState(114);
  const [fireML, setFireML] = useState(2);
  const [energyML, setEnergyML] = useState(2);
  const [deathML, setDeathML] = useState(1);
  const [stance, setStance] = useState<Element | null>("fire");
  const [lod, setLod] = useState<0 | 1 | 2 | 3>(0);
  const [flat, setFlat] = useState(9);
  const [critChance, setCritChance] = useState(0);
  const [critExtra, setCritExtra] = useState(5);
  const [pierce, setPierce] = useState(8);
  const [targetIdx, setTargetIdx] = useState(0);
  const [areaTargets, setAreaTargets] = useState(4);
  const [calibSpell, setCalibSpell] = useState("energy-wave");
  const [calibHit, setCalibHit] = useState("");
  const [bonus, setBonus] = useState<Record<string, number>>({ "energy-wave": 0, "great-fire-wave": 0, "great-energy-beam": 0, "great-death-beam": 0, "death-echo": 0, "hells-core": 0, "rage-of-the-skies": 0 });

  const baseInputs: DamageInputs = useMemo(
    () => ({
      level,
      magicLevel: ml,
      elementalML: { fire: fireML, energy: energyML, death: deathML },
      stance,
      lordOfDestruction: lod,
      basePowerBonus: Object.fromEntries(Object.entries(bonus).map(([k, v]) => [k, v / 100])),
      flatBonus: flat,
      critChance: critChance / 100,
      critExtra: critExtra / 100,
      pierce: pierce / 100,
      calibration: 1,
    }),
    [level, ml, fireML, energyML, deathML, stance, lod, bonus, flat, critChance, critExtra, pierce],
  );

  // Calibração: hit máximo observado do feitiço escolhido, sem alvo (sensibilidade 100%).
  const calibration = useMemo(() => {
    const hit = num(calibHit);
    const sp = spellById(calibSpell);
    if (!hit || !sp) return 1;
    const pure = computeDamage(sp, sp.element, { ...baseInputs, calibration: 1 });
    return pure.max > 0 ? hit / pure.max : 1;
  }, [calibHit, calibSpell, baseInputs]);

  const inputs = useMemo(() => ({ ...baseInputs, calibration }), [baseInputs, calibration]);
  const target = TARGETS[targetIdx];

  const rows = OFFENSIVE.map((s) => {
    // elemento efetivo considerando a conversão da stance para feitiços de outro elemento
    const el = stance && s.element !== stance && s.kind === "spell" ? stance : s.element;
    const natural = computeDamage(s, s.element, inputs, target);
    const converted = el !== s.element ? computeDamage(s, el, inputs, target) : null;
    return { s, natural, converted, el };
  });

  const rotationStats = ROTATIONS.map((r) => {
    const ordered = [...r.cycle].sort((a, b) => a.t - b.t);
    const els = effectiveElements(ordered, r.stance);
    const rotInputs = { ...inputs, stance: r.stance };
    let total = 0;
    const detail = ordered.map((st, i) => {
      const sp = spellById(st.spellId)!;
      const el = els[i];
      const d = computeDamage(sp, el, rotInputs, target);
      const isArea = !/strike|lightning|sudden/.test(sp.id);
      const hits = isArea ? areaTargets : 1;
      // Death Echo: o eco repete 50% do dano após 1 s
      const echo = sp.id === "death-echo" ? 1.5 : 1;
      const dmg = d.expected * hits * echo;
      total += dmg;
      return { sp, el, d, hits, dmg };
    });
    const cycleSeconds = Math.max(...ordered.map((s) => s.t)) + 2;
    return { r, detail, total, cycleSeconds, dps: total / cycleSeconds };
  });

  const field = "w-24";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <label>
          Level
          <input type="number" className={`mt-1 ${field}`} value={level} onChange={(e) => setLevel(num(e.target.value, 1))} />
        </label>
        <label>
          Magic level
          <input type="number" className={`mt-1 ${field}`} value={ml} onChange={(e) => setMl(num(e.target.value))} />
        </label>
        <label>
          Fire ML extra
          <input type="number" className={`mt-1 ${field}`} value={fireML} onChange={(e) => setFireML(num(e.target.value))} />
        </label>
        <label>
          Energy ML extra
          <input type="number" className={`mt-1 ${field}`} value={energyML} onChange={(e) => setEnergyML(num(e.target.value))} />
        </label>
        <label>
          Death ML extra
          <input type="number" className={`mt-1 ${field}`} value={deathML} onChange={(e) => setDeathML(num(e.target.value))} />
        </label>
        <label>
          Bônus de level
          <input type="number" className={`mt-1 ${field}`} value={levelBonus(level)} readOnly />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <label>
          Stance
          <select className="mt-1 w-full" value={stance ?? ""} onChange={(e) => setStance((e.target.value || null) as Element | null)}>
            <option value="">nenhuma</option>
            <option value="fire">Master of Flames</option>
            <option value="energy">Master of Thunder</option>
            <option value="death">Master of Decay</option>
          </select>
        </label>
        <label>
          Lord of Destruction
          <select className="mt-1 w-full" value={lod} onChange={(e) => setLod(Number(e.target.value) as 0 | 1 | 2 | 3)}>
            <option value={0}>sem</option>
            <option value={1}>estágio 1</option>
            <option value={2}>estágio 2</option>
            <option value={3}>estágio 3</option>
          </select>
        </label>
        <label>
          Revelations (+dano flat)
          <input type="number" className={`mt-1 ${field}`} value={flat} onChange={(e) => setFlat(num(e.target.value))} />
        </label>
        <label>
          Crit chance extra %
          <input type="number" className={`mt-1 ${field}`} value={critChance} onChange={(e) => setCritChance(num(e.target.value))} />
        </label>
        <label>
          Crit extra %
          <input type="number" className={`mt-1 ${field}`} value={critExtra} onChange={(e) => setCritExtra(num(e.target.value))} />
        </label>
        <label>
          Pierce %
          <input type="number" className={`mt-1 ${field}`} value={pierce} onChange={(e) => setPierce(num(e.target.value))} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2">
          Alvo
          <select className="mt-1 w-full" value={targetIdx} onChange={(e) => setTargetIdx(Number(e.target.value))}>
            {TARGETS.map((t, i) => (
              <option key={t.name} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Alvos por feitiço de área
          <input type="number" className={`mt-1 ${field}`} min={1} value={areaTargets} onChange={(e) => setAreaTargets(Math.max(1, num(e.target.value, 1)))} />
        </label>
        <div className="muted text-[11px] self-end">
          Sensibilidade do alvo: {ELEMENTS.map((e) => `${ELEMENT_LABEL[e]} ${Math.round(target.sensitivity[e] * 100)}%`).join(" · ")}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 border border-[#b98a5a] rounded p-3 bg-white/40">
        <label>
          Calibrar por hit observado (feitiço)
          <select className="mt-1 w-full" value={calibSpell} onChange={(e) => setCalibSpell(e.target.value)}>
            {OFFENSIVE.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Hit máximo visto no jogo (alvo 100%)
          <input className="mt-1 w-full" value={calibHit} onChange={(e) => setCalibHit(e.target.value)} placeholder="ex.: 1180" />
        </label>
        <div className="self-end">
          Multiplicador de calibração: <span className="font-bold">{calibration.toFixed(3)}</span>
        </div>
      </div>

      <details className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <summary className="cursor-pointer font-bold">Bônus de base damage por feitiço (wheel, gemas, proficiência), em %</summary>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 mt-3">
          {Object.keys(bonus).map((id) => (
            <label key={id}>
              {spellById(id)?.name}
              <input type="number" className={`mt-1 ${field}`} value={bonus[id]} onChange={(e) => setBonus({ ...bonus, [id]: num(e.target.value) })} />
            </label>
          ))}
        </div>
      </details>

      <h2>Dano por feitiço</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Feitiço</th>
              <th>Base</th>
              <th>Elemento</th>
              <th>ML usado</th>
              <th>Min</th>
              <th>Média</th>
              <th>Máx</th>
              <th>Esperado no alvo</th>
              <th>Convertido pela stance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, natural, converted, el }) => (
              <tr key={s.id}>
                <td className="font-bold whitespace-nowrap">{s.name}</td>
                <td>{Math.round(natural.basePower)}</td>
                <td>{s.element && <span className={`tag tag-${s.element}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                <td>{natural.totalML}</td>
                <td>{natural.min}</td>
                <td className="font-bold">{natural.avg}</td>
                <td>{natural.max}</td>
                <td className={natural.sensitivity === 0 ? "bad" : "good"}>{Math.round(natural.expected)}</td>
                <td>
                  {converted && el ? (
                    <span>
                      <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span> {Math.round(converted.expected)}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>DPS das rotações no alvo escolhido</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {rotationStats.map(({ r, detail, total, cycleSeconds, dps }) => (
          <div key={r.id} className="border border-[#b98a5a] rounded p-3 bg-white/40">
            <div className="font-bold text-[#3a1a00] text-[14px]">{r.name}</div>
            <div className="muted text-[11px] mb-2">stance {ELEMENT_LABEL[r.stance]} · ciclo de {cycleSeconds} s</div>
            <table>
              <tbody>
                {detail.map(({ sp, el, d, hits, dmg }, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap">{sp.name}</td>
                    <td>{el && <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span>}</td>
                    <td>
                      {Math.round(d.expected)} × {hits}
                      {sp.id === "death-echo" && " × 1,5 (eco)"}
                    </td>
                    <td className="font-bold">{Math.round(dmg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2">
              Por ciclo: <span className="font-bold">{Math.round(total).toLocaleString("pt-BR")}</span> · DPS:{" "}
              <span className="font-bold">{Math.round(dps).toLocaleString("pt-BR")}</span> · por minuto:{" "}
              <span className="font-bold">{Math.round(dps * 60).toLocaleString("pt-BR")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
