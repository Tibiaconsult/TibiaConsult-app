"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ELEMENT_LABEL, Element, SPELLS, spellById } from "@/data/spells";
import { ROTATIONS } from "@/data/rotations";
import { HUNTS } from "@/data/hunts";
import { PROFICIENCY, profEffects } from "@/data/proficiency";
import { computeDamage, DamageInputs, Target, levelBonus } from "@/lib/damage";
import { DEFAULT_MODIFIERS, RotationStep, effectiveElements, manaPerCycle, validateRotation } from "@/lib/rotation";
import { SetChoice, computeSet, decodeSet, encodeSet, recommendedSet } from "@/lib/set";
import { WheelConfig, decodeWheel, defaultWheel, encodeWheel, wheelEffects } from "@/lib/wheel";
import { spellIcon } from "@/lib/icons";

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
        sensitivity: { fire: c.taken.fire / 100, energy: c.taken.energy / 100, death: c.taken.death / 100, ice: c.taken.ice / 100, earth: c.taken.earth / 100, physical: c.taken.physical / 100, holy: c.taken.holy / 100 },
        mitigation: (c.mitigation ?? 3.5) / 100,
      },
    })),
  ),
];

const OFFENSIVE = SPELLS.filter((s) => s.base && s.element);
const BEAMS = new Set(["great-energy-beam", "great-death-beam", "energy-beam"]);
const BEAM_BONUS = [0, 0.1, 0.12, 0.14];

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

function mergeMaps(...maps: (Record<string, number> | undefined)[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of maps) if (m) for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + v;
  return out;
}

function parseRot(raw: string | null): RotationStep[] | null {
  if (!raw) return null;
  const steps = raw
    .split(",")
    .map((p) => p.split(":"))
    .filter(([, id]) => id && spellById(id))
    .map(([t, id]) => ({ t: Number(t) || 0, spellId: id }));
  return steps.length ? steps : null;
}

function SpellName({ id }: { id: string }) {
  const sp = spellById(id);
  const ic = spellIcon(id);
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {ic && <img src={ic} alt="" width={18} height={18} />}
      {sp?.name ?? id}
    </span>
  );
}

export default function DamageSimulator() {
  const [level, setLevel] = useState(896);
  const [baseML, setBaseML] = useState(114);
  const [extraFire, setExtraFire] = useState(0);
  const [extraEnergy, setExtraEnergy] = useState(0);
  const [extraDeath, setExtraDeath] = useState(0);
  const [stance, setStance] = useState<Element | null>("energy");
  const [manualLod, setManualLod] = useState<0 | 1 | 2 | 3>(0);
  const [manualFlat, setManualFlat] = useState(0);
  const [critChance, setCritChance] = useState(0);
  const [critExtra, setCritExtra] = useState(0);
  const [pierce, setPierce] = useState(8);
  const [areaTargets, setAreaTargets] = useState(4);
  const [calibSpell, setCalibSpell] = useState("energy-wave");
  const [calibHit, setCalibHit] = useState("");
  const [burst, setBurst] = useState<"rage" | "hells" | "none">("rage");

  const [useSet, setUseSet] = useState(true);
  const [setChoice, setSetChoice] = useState<SetChoice>(recommendedSet);
  const [useWheel, setUseWheel] = useState(true);
  const [wheel, setWheel] = useState<WheelConfig>(() => defaultWheel());
  const [useProf, setUseProf] = useState(true);
  const [prof, setProf] = useState<{ wand: number; level: number; picks: number[] }>({ wand: 0, level: 7, picks: [0, 0, 0, 0, 0, 0, 0] });

  const [huntId, setHuntId] = useState<string>(HUNTS[1]?.id ?? HUNTS[0]?.id ?? "");
  const [group, setGroup] = useState<Record<string, number>>(() => initialGroup(HUNTS[1]?.id ?? HUNTS[0]?.id ?? ""));

  const [customStance, setCustomStance] = useState<Element>("energy");
  const [custom, setCustom] = useState<RotationStep[]>([
    { t: 0, spellId: "energy-wave" },
    { t: 2, spellId: "great-energy-beam" },
    { t: 4, spellId: "great-fire-wave" },
    { t: 6, spellId: "lightning" },
  ]);
  const [copied, setCopied] = useState(false);

  // Lê a simulação compartilhada pela URL uma vez, depois da hidratação.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("level")) setLevel(num(p.get("level")!, 896));
    if (p.get("ml")) setBaseML(num(p.get("ml")!, 114));
    const s = decodeSet(p.get("set"));
    if (s) setSetChoice(s);
    const w = decodeWheel(p.get("wheel"));
    if (w) setWheel(w);
    else if (p.get("level")) setWheel((x) => ({ ...x, level: num(p.get("level")!, 896) }));
    const pr = p.get("prof");
    if (pr) {
      const [wIdx, l, ...ps] = pr.split("-").map(Number);
      setProf({ wand: PROFICIENCY[wIdx] ? wIdx : 0, level: l || 7, picks: ps.length ? ps : [0, 0, 0, 0, 0, 0, 0] });
    }
    if (p.get("hunt")) {
      setHuntId(p.get("hunt")!);
      setGroup(initialGroup(p.get("hunt")!));
    }
    if (p.get("targets")) setAreaTargets(Math.max(1, num(p.get("targets")!, 4)));
    if (p.get("calib")) {
      const [sp, hit] = p.get("calib")!.split(":");
      if (spellById(sp)) setCalibSpell(sp);
      if (hit) setCalibHit(hit);
    }
    const rot = parseRot(p.get("rot"));
    if (rot) setCustom(rot);
    const st = p.get("stance");
    if (st === "fire" || st === "energy" || st === "death") setCustomStance(st);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setTotals = useMemo(() => (useSet ? computeSet(setChoice) : null), [useSet, setChoice]);
  const wfx = useMemo(() => (useWheel ? wheelEffects(wheel) : null), [useWheel, wheel]);
  const pfx = useMemo(() => (useProf ? profEffects(PROFICIENCY[prof.wand], prof.picks, prof.level) : null), [useProf, prof]);

  const totalML = baseML + (setTotals?.ml ?? 0) + (pfx?.ml ?? 0);
  const lod = wfx ? wfx.lordOfDestruction : manualLod;
  const modifiers = { ...DEFAULT_MODIFIERS, ...(wfx?.modifiers ?? {}), stance: customStance };

  const baseInputs: DamageInputs = useMemo(
    () => ({
      level,
      magicLevel: totalML,
      elementalML: {
        fire: extraFire + (setTotals?.eml.fire ?? 0) + (pfx?.eml.fire ?? 0),
        energy: extraEnergy + (setTotals?.eml.energy ?? 0) + (pfx?.eml.energy ?? 0),
        death: extraDeath + (setTotals?.eml.death ?? 0) + (pfx?.eml.death ?? 0),
      },
      stance,
      lordOfDestruction: lod,
      basePowerBonus: mergeMaps(wfx?.basePowerBonus, pfx?.spellBase),
      flatBonus: manualFlat + (wfx?.flatBonus ?? 0) + (pfx ? pfx.mlAsFlatPct * totalML : 0),
      critChance: critChance / 100 + (pfx?.critChance ?? 0),
      critExtra: critExtra / 100 + (setTotals ? setTotals.critExtra / 100 : 0) + (pfx?.critExtra ?? 0) + (wfx?.critExtra ?? 0),
      spellCritChance: mergeMaps(wfx?.spellCritChance, pfx?.spellCritChance),
      spellCritExtra: mergeMaps(wfx?.spellCritExtra, pfx?.spellCritExtra),
      elementCritExtra: pfx?.elemCritExtra,
      elementCritChance: pfx?.elemCritChance,
      pierce: pierce / 100,
      elementPierce: pfx?.pierce,
      onslaught: setTotals ? setTotals.onslaught / 100 : 0,
      calibration: 1,
    }),
    [level, totalML, extraFire, extraEnergy, extraDeath, setTotals, pfx, wfx, stance, lod, manualFlat, critChance, critExtra, pierce],
  );

  const calibration = useMemo(() => {
    const hit = num(calibHit);
    const sp = spellById(calibSpell);
    if (!hit || !sp) return 1;
    const pure = computeDamage(sp, sp.element, { ...baseInputs, calibration: 1, stance: null });
    return pure.max > 0 ? hit / pure.max : 1;
  }, [calibHit, calibSpell, baseInputs]);

  const inputs = useMemo(() => ({ ...baseInputs, calibration }), [baseInputs, calibration]);

  const members = CREATURES.filter((c) => c.key in group && group[c.key] > 0);
  const totalWeight = members.reduce((a, c) => a + group[c.key], 0) || 1;

  function expectedOnGroup(spellId: string, element: Element | null, inp: DamageInputs): number {
    const sp = spellById(spellId)!;
    const beam = wfx && BEAMS.has(spellId) ? 1 + BEAM_BONUS[wfx.beamMastery] * Math.min(3, areaTargets) : 1;
    if (members.length === 0) return computeDamage(sp, element, inp).expected * beam;
    return (members.reduce((acc, c) => acc + computeDamage(sp, element, inp, c.target).expected * group[c.key], 0) / totalWeight) * beam;
  }

  const hitsFor = (id: string) => (id === "lightning" ? Math.min(3, areaTargets) : /strike|sudden/.test(id) ? 1 : areaTargets);

  const focusCd = Math.max(20, 40 - (modifiers.focusMastery ? 2 : 0) - (modifiers.focusAugmentT2 ? 4 : 0));

  function evalRotation(cycle: RotationStep[], rotStance: Element) {
    const ordered = [...cycle].sort((a, b) => a.t - b.t);
    const els = effectiveElements(ordered, rotStance);
    const rotInputs = { ...inputs, stance: rotStance };
    let total = 0;
    const detail = ordered.map((st, i) => {
      const sp = spellById(st.spellId)!;
      const el = els[i];
      const expected = expectedOnGroup(sp.id, el, rotInputs);
      const hits = hitsFor(sp.id);
      const echo = sp.id === "death-echo" ? 1.5 : 1;
      const dmg = expected * hits * echo;
      total += dmg;
      return { sp, el, expected, hits, echo, dmg };
    });
    const cycleSeconds = Math.max(...ordered.map((s) => s.t)) + 2;
    const cycleDps = total / cycleSeconds;

    // Burst: Focus (convertido pela stance) + Ultimate Strike a cada 30 s; o strike depois do Focus ganha +35% com Focus Mastery.
    let burstDps = 0;
    let burstMana = 0;
    let lostFraction = 0;
    let focusDmg = 0;
    let ultDmg = 0;
    if (burst !== "none") {
      const focusId = burst === "rage" ? "rage-of-the-skies" : "hells-core";
      focusDmg = expectedOnGroup(focusId, rotStance, rotInputs) * areaTargets;
      const ultId = rotStance === "fire" ? "ultimate-flame-strike" : "ultimate-energy-strike";
      ultDmg = expectedOnGroup(ultId, rotStance, rotInputs);
      burstDps = focusDmg / focusCd + ultDmg / 30 + (modifiers.focusMastery ? (ultDmg * 0.35) / focusCd : 0);
      burstMana = (burst === "rage" ? 600 : 1100) * (60 / focusCd) + 100 * 2;
      lostFraction = 4 / focusCd + 2 / 30;
    }
    const dps = cycleDps * (1 - lostFraction) + burstDps;
    const manaMin = (manaPerCycle(ordered) / cycleSeconds) * 60 * (1 - lostFraction) + burstMana;
    return { detail, total, cycleSeconds, cycleDps, burstDps, dps, manaMin, focusDmg, ultDmg };
  }

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

  const presetStats = ROTATIONS.map((r) => ({ r, ...evalRotation(r.cycle, r.stance) }));
  const customConflicts = validateRotation(custom, modifiers);
  const customStats = evalRotation(custom, customStance);
  const allStats = [...presetStats.map((p) => ({ id: p.r.id, name: p.r.name, stance: p.r.stance, stats: p })), { id: "custom", name: "Sua rotação", stance: customStance, stats: customStats }].sort((a, b) => b.stats.dps - a.stats.dps);

  const rows = OFFENSIVE.map((s) => {
    const el = stance && s.element !== stance && s.kind === "spell" ? stance : s.element;
    const natural = computeDamage(s, s.element, inputs);
    const onGroup = expectedOnGroup(s.id, s.element, inputs);
    const converted = el !== s.element ? expectedOnGroup(s.id, el, inputs) : null;
    return { s, natural, onGroup, converted, el };
  });

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

  const shareUrl = () => {
    const params = new URLSearchParams();
    params.set("level", String(level));
    params.set("ml", String(baseML));
    if (useSet) params.set("set", decodeURIComponent(encodeSet(setChoice)));
    if (useWheel) params.set("wheel", decodeURIComponent(encodeWheel(wheel)));
    if (useProf) params.set("prof", `${prof.wand}-${prof.level}-${prof.picks.join("-")}`);
    if (huntId) params.set("hunt", huntId);
    params.set("targets", String(areaTargets));
    if (calibHit) params.set("calib", `${calibSpell}:${calibHit}`);
    params.set("rot", custom.map((s) => `${s.t}:${s.spellId}`).join(","));
    params.set("stance", customStance);
    return `${window.location.origin}/simulador?${params.toString()}`;
  };

  const field = "w-24";
  const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");

  return (
    <div className="space-y-5">
      <h2 className="mt-0">Char e fontes de bônus</h2>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <label>
          Level
          <input type="number" className={`mt-1 ${field}`} value={level} onChange={(e) => setLevel(num(e.target.value, 1))} />
        </label>
        <label>
          Magic level base
          <input type="number" className={`mt-1 ${field}`} value={baseML} onChange={(e) => setBaseML(num(e.target.value))} />
        </label>
        <div className="self-end">
          ML total: <span className="font-bold">{totalML}</span>
        </div>
        <div className="self-end">
          Bônus de level: <span className="font-bold">{levelBonus(level)}</span>
        </div>
        <div className="self-end">
          Flat: <span className="font-bold">+{Math.round(inputs.flatBonus)}</span>
        </div>
        <div className="self-end">
          Onslaught: <span className="font-bold">{((inputs.onslaught ?? 0) * 100).toFixed(2)}%</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={useSet} onChange={(e) => setUseSet(e.target.checked)} /> Set
          </label>
          {setTotals && (
            <div className="text-[11px] mt-1">
              ML +{setTotals.ml} · fire +{setTotals.eml.fire ?? 0} · energy +{setTotals.eml.energy ?? 0} · death +{setTotals.eml.death ?? 0} · crit extra +{setTotals.critExtra}%
            </div>
          )}
          <a className="text-[11px] font-bold" href={`/simulador/set?level=${level}&ml=${baseML}&a=${encodeSet(setChoice)}`}>
            editar no montador de set
          </a>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={useWheel} onChange={(e) => setUseWheel(e.target.checked)} /> Wheel of Destiny
          </label>
          {wfx && (
            <div className="text-[11px] mt-1">
              flat +{wfx.flatBonus} · LoD {wfx.lordOfDestruction} · Beam Mastery {wfx.beamMastery} · Focus a cada {focusCd} s
            </div>
          )}
          <a className="text-[11px] font-bold" href={`/planejador/wheel?wheel=${encodeWheel(wheel)}`}>
            editar no planejador
          </a>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={useProf} onChange={(e) => setUseProf(e.target.checked)} /> Proficiência da wand
          </label>
          {pfx && (
            <div className="text-[11px] mt-1">
              {PROFICIENCY[prof.wand].wand.split("/")[0]} nível {prof.level} · ML +{pfx.ml} · crit extra +{Math.round(pfx.critExtra * 100)}%
            </div>
          )}
          <a className="text-[11px] font-bold" href={`/planejador/proficiencia?prof=${prof.wand}-${prof.level}-${prof.picks.join("-")}`}>
            editar no planejador
          </a>
        </div>
      </div>

      <details className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <summary className="cursor-pointer font-bold">Ajustes manuais (somam às fontes acima)</summary>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 mt-3">
          <label>
            Fire ML extra
            <input type="number" className={`mt-1 ${field}`} value={extraFire} onChange={(e) => setExtraFire(num(e.target.value))} />
          </label>
          <label>
            Energy ML extra
            <input type="number" className={`mt-1 ${field}`} value={extraEnergy} onChange={(e) => setExtraEnergy(num(e.target.value))} />
          </label>
          <label>
            Death ML extra
            <input type="number" className={`mt-1 ${field}`} value={extraDeath} onChange={(e) => setExtraDeath(num(e.target.value))} />
          </label>
          <label>
            Dano flat extra
            <input type="number" className={`mt-1 ${field}`} value={manualFlat} onChange={(e) => setManualFlat(num(e.target.value))} />
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
            Pierce % (Exposed Weakness = 8)
            <input type="number" className={`mt-1 ${field}`} value={pierce} onChange={(e) => setPierce(num(e.target.value))} />
          </label>
          {!useWheel && (
            <label>
              Lord of Destruction
              <select className="mt-1 w-full" value={manualLod} onChange={(e) => setManualLod(Number(e.target.value) as 0 | 1 | 2 | 3)}>
                {[0, 1, 2, 3].map((x) => (
                  <option key={x} value={x}>
                    {x === 0 ? "sem" : `estágio ${x}`}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </details>

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
          Hit máximo visto no jogo (sem stance, alvo 100%)
          <input className="mt-1 w-full" value={calibHit} onChange={(e) => setCalibHit(e.target.value)} placeholder="ex.: 1180" />
        </label>
        <div className="self-end">
          Multiplicador de calibração: <span className="font-bold">{calibration.toFixed(3)}</span>
        </div>
      </div>

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
        <label>
          Burst
          <select className="mt-1 w-full" value={burst} onChange={(e) => setBurst(e.target.value as "rage" | "hells" | "none")}>
            <option value="rage">Rage of the Skies + Ultimate Strike</option>
            <option value="hells">Hell&apos;s Core + Ultimate Strike</option>
            <option value="none">sem burst</option>
          </select>
        </label>
      </div>
      <details className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <summary className="cursor-pointer font-bold">Bichos do grupo ({members.length}) e peso no lure</summary>
        <div className="overflow-x-auto mt-2">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Bicho</th>
                <th>Hunt</th>
                <th>Peso</th>
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
      </details>

      <h2>Qual elemento rende mais neste grupo</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {elementRank.map((r, i) => (
          <div key={r.el} className="border border-[#b98a5a] rounded p-3 bg-white/40" style={i === 0 ? { outline: "2px solid #1a6b2d" } : undefined}>
            <div className="flex items-center gap-2">
              <span className={`tag tag-${r.el}`}>{ELEMENT_LABEL[r.el]}</span>
              <span className="font-bold text-[14px]">{fmt(r.avg)}</span>
              <span className="muted text-[11px]">por alvo</span>
              {i === 0 ? <span className="good text-[11px]">melhor</span> : best.avg > 0 && <span className="muted text-[11px]">{Math.round((r.avg / best.avg) * 100)}% do melhor</span>}
            </div>
            <table className="mt-2">
              <tbody>
                {r.perCreature.map((p) => (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap">{p.name}</td>
                    <td>{p.sens}%</td>
                    <td className="font-bold">{fmt(p.dmg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <p className="muted text-[11px]">Mesma wave (base 150) em cada elemento, sem stance, ponderada pelo peso de cada bicho e pela mitigação.</p>

      <h2>DPS das rotações neste grupo</h2>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {allStats.map(({ id, name, stance: st, stats }, i) => (
          <div key={id} className="border border-[#b98a5a] rounded p-3 bg-white/40" style={i === 0 ? { outline: "2px solid #1a6b2d" } : undefined}>
            <div className="font-bold text-[#3a1a00] text-[14px]">
              {name} {i === 0 && <span className="good text-[11px]">maior DPS</span>}
            </div>
            <div className="muted text-[11px] mb-2">
              stance {ELEMENT_LABEL[st]} · ciclo de {stats.cycleSeconds} s{id === "death" && " · supõe o augment T1 do Death Echo"}
            </div>
            <table>
              <tbody>
                {stats.detail.map(({ sp, el, expected, hits, echo, dmg }, j) => (
                  <tr key={j}>
                    <td>
                      <SpellName id={sp.id} />
                    </td>
                    <td>{el && <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span>}</td>
                    <td className="whitespace-nowrap">
                      {fmt(expected)} × {hits}
                      {echo > 1 && " × 1,5"}
                    </td>
                    <td className="font-bold">{fmt(dmg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-[12px] space-y-0.5">
              <div>
                DPS do ciclo: <span className="font-bold">{fmt(stats.cycleDps)}</span>
              </div>
              {burst !== "none" && (
                <div>
                  Burst: {burst === "rage" ? "Rage" : "Hell's Core"} {fmt(stats.focusDmg)} a cada {focusCd} s · Ultimate {fmt(stats.ultDmg)}
                </div>
              )}
              <div>
                DPS total: <span className="font-bold good">{fmt(stats.dps)}</span> · por minuto <span className="font-bold">{fmt(stats.dps * 60)}</span>
              </div>
              <div>Mana por minuto: {fmt(stats.manaMin)}</div>
            </div>
          </div>
        ))}
      </div>

      <h2>Sua rotação</h2>
      <div className="border border-[#b98a5a] rounded p-3 bg-white/40 space-y-2">
        <div className="flex flex-wrap gap-3 items-end">
          <label>
            Stance
            <select className="mt-1" value={customStance} onChange={(e) => setCustomStance(e.target.value as Element)}>
              <option value="fire">Master of Flames</option>
              <option value="energy">Master of Thunder</option>
              <option value="death">Master of Decay</option>
            </select>
          </label>
          <button type="button" className="tc-btn" onClick={() => setCustom([...custom, { t: Math.max(-2, ...custom.map((s) => s.t)) + 2, spellId: "energy-wave" }])}>
            + feitiço
          </button>
          {ROTATIONS.map((r) => (
            <button key={r.id} type="button" className="tc-btn" onClick={() => (setCustom(r.cycle.map((s) => ({ t: s.t, spellId: s.spellId }))), setCustomStance(r.stance))}>
              Copiar {r.name}
            </button>
          ))}
        </div>
        <table>
          <tbody>
            {custom.map((s, i) => (
              <tr key={i}>
                <td>
                  <input type="number" step={2} min={0} className="w-16" value={s.t} onChange={(e) => setCustom(custom.map((x, j) => (j === i ? { ...x, t: num(e.target.value) } : x)))} />
                </td>
                <td>
                  <select value={s.spellId} onChange={(e) => setCustom(custom.map((x, j) => (j === i ? { ...x, spellId: e.target.value } : x)))}>
                    {OFFENSIVE.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button type="button" className="tc-btn tc-btn-danger !py-0.5 !px-2" onClick={() => setCustom(custom.filter((_, j) => j !== i))}>
                    remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customConflicts.length === 0 ? (
          <div className="good">Sem conflito de cooldown.</div>
        ) : (
          <ul className="bad list-disc pl-5">
            {customConflicts.map((c, i) => (
              <li key={i}>{c.message}</li>
            ))}
          </ul>
        )}
      </div>

      <h2>Dano por feitiço</h2>
      <div className="flex flex-wrap gap-3 items-end mb-2">
        <label>
          Stance da tabela
          <select className="mt-1" value={stance ?? ""} onChange={(e) => setStance((e.target.value || null) as Element | null)}>
            <option value="">nenhuma</option>
            <option value="fire">Master of Flames</option>
            <option value="energy">Master of Thunder</option>
            <option value="death">Master of Decay</option>
          </select>
        </label>
      </div>
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
                <td className="font-bold">
                  <SpellName id={s.id} />
                </td>
                <td>{Math.round(natural.basePower)}</td>
                <td>{s.element && <span className={`tag tag-${s.element}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                <td>{natural.totalML}</td>
                <td>{natural.min}</td>
                <td className="font-bold">{natural.avg}</td>
                <td>{natural.max}</td>
                <td className={onGroup === 0 ? "bad" : "good"}>{fmt(onGroup)}</td>
                <td>
                  {converted !== null && el ? (
                    <span>
                      <span className={`tag tag-${el}`}>{ELEMENT_LABEL[el]}</span> {fmt(converted)}
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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="tc-btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shareUrl());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copie o link:", shareUrl());
            }
          }}
        >
          {copied ? "Link copiado" : "Copiar link desta simulação"}
        </button>
        <Link className="tc-btn" href="/simulador/mana">
          Ver sustain de mana
        </Link>
      </div>
      <ul className="list-disc pl-5 text-[11px] muted">
        <li>Burst: Focus convertido pela stance (confirmado no jogo) e Ultimate Strike a cada 30 s; o strike depois do Focus ganha +35% com Focus Mastery. O tempo gasto no burst sai do ciclo.</li>
        <li>Beam Mastery: +10/12/14% por alvo no feixe (máx. 3) nos beams. A redução de cooldown dele ainda não entra.</li>
        <li>Onslaught da wand com tier entra como média (+60% de dano na chance do tier). Avatar e Transcendence não entram no DPS médio.</li>
      </ul>
    </div>
  );
}
