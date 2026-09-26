"use client";

import { useMemo, useState } from "react";
import { ELEMENT_LABEL, Element, SPELLS, spellById } from "@/data/spells";
import { ROTATIONS } from "@/data/rotations";
import { HUNTS } from "@/data/hunts";
import { computeDamage, DamageInputs, Target, levelBonus } from "@/lib/damage";
import { effectiveElements } from "@/lib/rotation";

const ELEMENTS: Element[] = ["fire", "energy", "death", "ice", "earth", "physical", "holy"];
const SORC_ELEMENTS: Element[] = ["fire", "energy", "death"];

interface CreatureOption {
  key: string;
  name: string;
  hunt: string;
  target: Target;
  defaultWeight: number;
}

const NEUTRAL: CreatureOption = {
  key: "neutro",
  name: "Alvo neutro (100% em tudo)",
  hunt: "",
  target: { name: "Alvo neutro", sensitivity: { fire: 1, energy: 1, death: 1, ice: 1, earth: 1, physical: 1, holy: 1 }, mitigation: 0 },
  defaultWeight: 1,
};

const CREATURES: CreatureOption[] = [
  NEUTRAL,
  ...HUNTS.flatMap((h) =>
    h.creatures.map((c) => ({
      key: `${h.id}:${c.name}`,
      name: c.name,
      hunt: h.name,
      defaultWeight: c.weight ?? 1,
      target: {
        name: c.name,
        sensitivity: {
          fire: c.taken.fire / 100,
          energy: c.taken.energy / 100,
          death: c.taken.death / 100,
          ice: c.taken.ice / 100,
          earth: c.taken.earth / 100,
          physical: c.taken.physical / 100,
          holy: c.taken.holy / 100,
        },
        mitigation: (c.mitigation ?? 3.5) / 100,
      },
    })),
  ),
];

const OFFENSIVE = SPELLS.filter((s) => s.base && s.element);

function initialGroup(id: string): Record<string, number> {
  if (!id) return { [NEUTRAL.key]: 1 };
  const g: Record<string, number> = {};
  CREATURES.filter((c) => c.key.startsWith(id + ":")).forEach((c) => (g[c.key] = c.defaultWeight));
  return g;
}

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
  const [areaTargets, setAreaTargets] = useState(4);
  const [calibSpell, setCalibSpell] = useState("energy-wave");
  const [calibHit, setCalibHit] = useState("");
  const [bonus, setBonus] = useState<Record<string, number>>({ "energy-wave": 0, "great-fire-wave": 0, "great-energy-beam": 0, "great-death-beam": 0, "death-echo": 0, "hells-core": 0, "rage-of-the-skies": 0 });

  // Grupo de alvos: hunt inteira ou seleção manual, com peso por bicho.
  const [huntId, setHuntId] = useState<string>(HUNTS[0]?.id ?? "");
  const [group, setGroup] = useState<Record<string, number>>(() => initialGroup(HUNTS[0]?.id ?? ""));

  function chooseHunt(id: string) {
    setHuntId(id);
    setGroup(initialGroup(id));
  }
  function toggleCreature(key: string) {
    setGroup((g) => {
      const next = { ...g };
      if (key in next) delete next[key];
      else next[key] = CREATURES.find((c) => c.key === key)?.defaultWeight ?? 1;
      return next;
    });
  }

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

  const calibration = useMemo(() => {
    const hit = num(calibHit);
    const sp = spellById(calibSpell);
    if (!hit || !sp) return 1;
    const pure = computeDamage(sp, sp.element, { ...baseInputs, calibration: 1 });
    return pure.max > 0 ? hit / pure.max : 1;
  }, [calibHit, calibSpell, baseInputs]);

  const inputs = useMemo(() => ({ ...baseInputs, calibration }), [baseInputs, calibration]);

  const members = CREATURES.filter((c) => c.key in group && group[c.key] > 0);
  const totalWeight = members.reduce((a, c) => a + group[c.key], 0) || 1;

  /** Dano esperado de um feitiço no grupo: média ponderada pelos pesos. */
  function expectedOnGroup(spellId: string, element: Element | null, inp: DamageInputs): number {
    const sp = spellById(spellId)!;
    if (members.length === 0) return computeDamage(sp, element, inp).expected;
    return members.reduce((acc, c) => acc + computeDamage(sp, element, inp, c.target).expected * group[c.key], 0) / totalWeight;
  }

  // Ranking de elementos: mesma wave (Energy Wave, base 150) lançada em cada elemento, sem stance, no grupo.
  const neutralInputs: DamageInputs = { ...inputs, stance: null };
  const elementRank = SORC_ELEMENTS.map((el) => {
    const perCreature = members.map((c) => ({
      name: c.name,
      weight: group[c.key],
      sens: Math.round((c.target.sensitivity[el] ?? 1) * 100),
      dmg: computeDamage(spellById("energy-wave")!, el, neutralInputs, c.target).expected,
    }));
    const avg = perCreature.length ? perCreature.reduce((a, p) => a + p.dmg * p.weight, 0) / totalWeight : 0;
    return { el, avg, perCreature };
  }).sort((a, b) => b.avg - a.avg);
  const best = elementRank[0];

  const rows = OFFENSIVE.map((s) => {
    const el = stance && s.element !== stance && s.kind === "spell" ? stance : s.element;
    const natural = computeDamage(s, s.element, inputs);
    const onGroup = expectedOnGroup(s.id, s.element, inputs);
    const converted = el !== s.element ? expectedOnGroup(s.id, el, inputs) : null;
    return { s, natural, onGroup, converted, el };
  });

  const rotationStats = ROTATIONS.map((r) => {
    const ordered = [...r.cycle].sort((a, b) => a.t - b.t);
    const els = effectiveElements(ordered, r.stance);
    const rotInputs = { ...inputs, stance: r.stance };
    let total = 0;
    const detail = ordered.map((st, i) => {
      const sp = spellById(st.spellId)!;
      const el = els[i];
      const expected = expectedOnGroup(sp.id, el, rotInputs);
      // Lightning acorrenta em 2 alvos extras (3 no total); strikes e SD são alvo único; o resto é área.
      const hits = sp.id === "lightning" ? Math.min(3, areaTargets) : /strike|sudden/.test(sp.id) ? 1 : areaTargets;
      const echo = sp.id === "death-echo" ? 1.5 : 1;
      const dmg = expected * hits * echo;
      total += dmg;
      return { sp, el, expected, hits, echo, dmg };
    });
    const cycleSeconds = Math.max(...ordered.map((s) => s.t)) + 2;
    return { r, detail, total, cycleSeconds, dps: total / cycleSeconds };
  }).sort((a, b) => b.dps - a.dps);

  const field = "w-24";

  return (
    <div className="space-y-5">
      <h2 className="mt-0">Char</h2>
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
          Stance (tabela de feitiços)
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

      <h2>Hunt ou grupo de bichos</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          Hunt
          <select className="mt-1 w-full" value={huntId} onChange={(e) => chooseHunt(e.target.value)}>
            {HUNTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
            <option value="">Grupo manual</option>
          </select>
        </label>
        <label>
          Alvos por feitiço de área
          <input type="number" className={`mt-1 ${field}`} min={1} value={areaTargets} onChange={(e) => setAreaTargets(Math.max(1, num(e.target.value, 1)))} />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Bicho</th>
              <th>Hunt</th>
              <th>Peso no lure</th>
              {ELEMENTS.map((e) => (
                <th key={e}>{ELEMENT_LABEL[e]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CREATURES.map((c) => {
              const on = c.key in group;
              return (
                <tr key={c.key} style={on ? undefined : { opacity: 0.55 }}>
                  <td>
                    <input type="checkbox" checked={on} onChange={() => toggleCreature(c.key)} />
                  </td>
                  <td className="font-bold whitespace-nowrap">{c.name}</td>
                  <td className="whitespace-nowrap">{c.hunt || "-"}</td>
                  <td>
                    <input type="number" min={0} className="w-16" value={on ? group[c.key] : 0} disabled={!on} onChange={(e) => setGroup({ ...group, [c.key]: Math.max(0, num(e.target.value)) })} />
                  </td>
                  {ELEMENTS.map((e) => {
                    const v = Math.round(c.target.sensitivity[e] * 100);
                    return (
                      <td key={e} className={v === 0 ? "bad" : v >= 110 ? "good" : v < 70 ? "warn" : ""}>
                        {v}%
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>Qual elemento rende mais neste grupo</h2>
      <p className="muted text-[11px] mb-2">
        Mesma wave (base 150) lançada em cada elemento, sem stance, ponderada pelo peso de cada bicho e pela mitigação. O melhor é o
        primeiro.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {elementRank.map((r, i) => (
          <div key={r.el} className="border border-[#b98a5a] rounded p-3 bg-white/40" style={i === 0 ? { outline: "2px solid #1a6b2d" } : undefined}>
            <div className="flex items-center gap-2">
              <span className={`tag tag-${r.el}`}>{ELEMENT_LABEL[r.el]}</span>
              <span className="font-bold text-[14px]">{Math.round(r.avg)}</span>
              <span className="muted text-[11px]">por alvo</span>
              {i === 0 && <span className="good text-[11px]">melhor</span>}
              {i > 0 && best.avg > 0 && <span className="muted text-[11px]">{Math.round((r.avg / best.avg) * 100)}% do melhor</span>}
            </div>
            <table className="mt-2">
              <tbody>
                {r.perCreature.map((p) => (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap">{p.name}</td>
                    <td>{p.sens}%</td>
                    <td className="font-bold">{Math.round(p.dmg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <h2>DPS das rotações neste grupo</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {rotationStats.map(({ r, detail, total, cycleSeconds, dps }, i) => (
          <div key={r.id} className="border border-[#b98a5a] rounded p-3 bg-white/40" style={i === 0 ? { outline: "2px solid #1a6b2d" } : undefined}>
            <div className="font-bold text-[#3a1a00] text-[14px]">
              {r.name} {i === 0 && <span className="good text-[11px]">melhor rotação</span>}
            </div>
            <div className="muted text-[11px] mb-2">
              stance {ELEMENT_LABEL[r.stance]} · ciclo de {cycleSeconds} s
              {r.id === "death" && " · supõe o augment T1 do Death Echo (cooldown 4 s) na Wheel"}
            </div>
            <table>
              <tbody>
                {detail.map(({ sp, el, expected, hits, echo, dmg }, j) => (
                  <tr key={j}>
                    <td className="whitespace-nowrap">{sp.name}</td>
                    <td>{el && <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span>}</td>
                    <td>
                      {Math.round(expected)} × {hits}
                      {echo > 1 && " × 1,5"}
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

      <h2>Dano por feitiço (stance escolhida acima)</h2>
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
              <th>Esperado no grupo</th>
              <th>Convertido pela stance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, natural, onGroup, converted, el }) => (
              <tr key={s.id}>
                <td className="font-bold whitespace-nowrap">{s.name}</td>
                <td>{Math.round(natural.basePower)}</td>
                <td>{s.element && <span className={`tag tag-${s.element}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                <td>{natural.totalML}</td>
                <td>{natural.min}</td>
                <td className="font-bold">{natural.avg}</td>
                <td>{natural.max}</td>
                <td className={onGroup === 0 ? "bad" : "good"}>{Math.round(onGroup)}</td>
                <td>
                  {converted !== null && el ? (
                    <span>
                      <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span> {Math.round(converted)}
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
    </div>
  );
}
