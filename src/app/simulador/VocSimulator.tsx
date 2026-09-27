"use client";

import NumberInput from "@/components/NumberInput";
import { useEffect, useMemo, useState } from "react";
import { ELEMENT_LABEL, Element } from "@/data/spells";
import { HUNTS } from "@/data/hunts";
import { VOCATIONS, VocId } from "@/data/vocations";
import { VocInputs, defaultInputs, flatBonus, simulateRotation, spellDamage, usable } from "@/lib/vocsim";
import { levelBonus } from "@/lib/damage";
import { getActive } from "@/lib/active";

const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
const WEAPON_ELEMENTS: Element[] = ["physical", "fire", "energy", "ice", "earth", "death", "holy"];

function Num({ label, value, onChange, step = 1, min = 0, hint }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; hint?: string }) {
  return (
    <label className="block text-[12px]">
      <span className="font-bold">{label}</span>
      <NumberInput className="mt-1 w-full" value={value} step={step} min={min} onValue={onChange} />
      {hint && <span className="muted text-[10px]">{hint}</span>}
    </label>
  );
}

export default function VocSimulator({ voc }: { voc: VocId }) {
  const v = VOCATIONS[voc];
  const [inp, setInp] = useState<VocInputs>(() => defaultInputs(v));
  const [huntId, setHuntId] = useState("");
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [observed, setObserved] = useState("");
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof VocInputs>(k: K, val: VocInputs[K]) => setInp((p) => ({ ...p, [k]: val }));

  // Char vindo do link (?level=&ml=&skill=&atk=, da Minha área ou de um link compartilhado) ou, sem ele, o char ativo da vocação.
  // ?hunt= abre a hunt já escolhida (ficha de hunt e "Preparar para esta hunt"); ?targets= e ?stance= também valem.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const n = (k: string) => {
      const v = Number(u.get(k));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    const ch = getActive().char;
    const own = ch && ch.vocation === voc ? ch : null;
    const level = n("level") ?? own?.level ?? null;
    const ml = n("ml") ?? (own?.magic_level || null);
    const skill = n("skill") ?? (own?.skill || null);
    const atk = n("atk");
    const targets = n("targets");
    const stance = u.get("stance");
    setInp((p) => ({
      ...p,
      level: level ?? p.level,
      magicLevel: ml ?? p.magicLevel,
      skill: skill ?? p.skill,
      ...(atk ? { atkPhysical: atk, atkElemental: 0 } : {}),
      ...(targets ? { targets } : {}),
      ...(stance && v.stances.some((s) => s.name === stance) ? { stance } : {}),
    }));
    const h = u.get("hunt");
    if (h && HUNTS.some((x) => x.id === h)) setHuntId(h);
  }, [voc, v]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hunt = HUNTS.find((h) => h.id === huntId) ?? null;
  const w = useMemo(() => (hunt ? Object.fromEntries(hunt.creatures.map((c) => [c.name, weights[c.name] ?? c.weight ?? 1])) : null), [hunt, weights]);

  const rows = useMemo(() => v.spells.filter((s) => usable(v, inp, s)).map((s) => spellDamage(v, inp, s, hunt, w)), [v, inp, hunt, w]);
  const rotation = useMemo(() => simulateRotation(v, rows, 120), [v, rows]);
  const opening = rotation.casts.filter((c) => c.t < 20);
  const skillBased = v.mainStat !== "ml";

  const calibrate = () => {
    const hit = Number(observed.replace(/\D/g, ""));
    const main = rows.slice().sort((a, b) => b.perCast - a.perCast)[0];
    if (!hit || !main) return;
    // o hit máximo observado corresponde a 1,12 × média (sem crit); a média atual já inclui a calibração anterior
    const pure = main.avg / inp.calibration;
    set("calibration", Math.round((hit / 1.12 / pure) * 1000) / 1000);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Num label="Level" value={inp.level} onChange={(x) => set("level", x)} min={8} />
        <Num label="Magic level" value={inp.magicLevel} onChange={(x) => set("magicLevel", x)} hint={voc === "paladin" ? "conta nas magias holy" : undefined} />
        {skillBased && <Num label={voc === "knight" ? "Skill de arma (sem stance)" : "Distance (sem stance)"} value={inp.skill} onChange={(x) => set("skill", x)} />}
        {skillBased && (
          <Num
            label={voc === "knight" ? "Ataque físico da arma" : "Munição + atk mod"}
            value={inp.atkPhysical}
            onChange={(x) => set("atkPhysical", x)}
            hint={voc === "paladin" ? "ex.: Spectral Bolt 78 + crossbow 10" : "ex.: Grand Sanguine Razor 8"}
          />
        )}
        {skillBased && <Num label="Ataque elemental" value={inp.atkElemental} onChange={(x) => set("atkElemental", x)} hint={voc === "knight" ? "ex.: 50 de energia" : "0 para munição física"} />}
        {skillBased && (
          <label className="block text-[12px]">
            <span className="font-bold">Elemento da arma</span>
            <select className="mt-1 w-full" value={inp.weaponElement} onChange={(e) => set("weaponElement", e.target.value as Element)}>
              {WEAPON_ELEMENTS.map((e) => (
                <option key={e} value={e}>
                  {ELEMENT_LABEL[e]}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-[12px]">
          <span className="font-bold">Stance</span>
          <select className="mt-1 w-full" value={inp.stance} onChange={(e) => set("stance", e.target.value)}>
            {v.stances.map((s) => (
              <option key={s.name}>{s.name}</option>
            ))}
          </select>
        </label>
        <Num label="Alvos no lure" value={inp.targets} onChange={(x) => set("targets", Math.max(1, x))} min={1} />
        <Num label="Crit chance extra (%)" value={Math.round(inp.critChance * 1000) / 10} onChange={(x) => set("critChance", x / 100)} step={0.5} hint="além dos 5% intrínsecos" />
        <Num label="Crit extra (%)" value={Math.round(inp.critExtra * 1000) / 10} onChange={(x) => set("critExtra", x / 100)} step={1} hint="além dos 10% intrínsecos" />
        <Num label="Dano flat extra" value={inp.flatExtra} onChange={(x) => set("flatExtra", x)} hint="proficiência, vessels" />
        {voc !== "knight" && (
          <label className="flex items-center gap-2 text-[12px] mt-5">
            <input type="checkbox" checked={inp.useRunes} onChange={(e) => set("useRunes", e.target.checked)} />
            usar runas nos buracos
          </label>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="font-bold mb-2">Wheel: revelations</div>
          {v.revelations.map((r, i) => (
            <label key={r.name} className="flex items-center justify-between gap-2 text-[12px] mb-1">
              <span>{r.name}</span>
              <select
                value={inp.revelationStages[i]}
                onChange={(e) => {
                  const st = inp.revelationStages.slice();
                  st[i] = Number(e.target.value);
                  set("revelationStages", st);
                }}
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "não liberado" : `estágio ${n}`}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <p className="muted text-[11px] mt-1">
            Bônus de level {levelBonus(inp.level)} + flat da Wheel e extras {flatBonus(inp)}.
          </p>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="font-bold mb-2">Wheel: augments</div>
          {v.augments.map((a) => (
            <label key={a.label} className="flex items-center justify-between gap-2 text-[12px] mb-1">
              <span>
                {a.label} <span className="muted">(T1 {a.t1}; T2 {a.t2})</span>
              </span>
              <select value={inp.augmentStages[a.label] ?? 0} onChange={(e) => set("augmentStages", { ...inp.augmentStages, [a.label]: Number(e.target.value) })}>
                <option value={0}>sem</option>
                <option value={1}>T1</option>
                <option value={2}>T1 + T2</option>
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <label className="block text-[12px]">
          <span className="font-bold">Hunt</span>
          <select className="mt-1 w-full" value={huntId} onChange={(e) => (setHuntId(e.target.value), setWeights({}))}>
            <option value="">Alvo neutro (100% em tudo, sem mitigação)</option>
            {HUNTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        {hunt && (
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {hunt.creatures.map((c) => (
              <label key={c.name} className="flex items-center justify-between gap-2 text-[11px]">
                <span>{c.name}</span>
                <input
                  type="number"
                  className="w-16"
                  min={0}
                  value={weights[c.name] ?? c.weight ?? 1}
                  onChange={(e) => setWeights({ ...weights, [c.name]: Math.max(0, Number(e.target.value) || 0) })}
                  title="peso no lure"
                />
              </label>
            ))}
            <p className="muted text-[10px] sm:col-span-3">Peso = quantas dessa creature vêm no lure. Zero tira a creature da conta.</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["DPS estimado", fmt(rotation.dps)],
          ["Dano em 2 min", fmt(rotation.total)],
          ["Mana por minuto", fmt(rotation.manaPerMinute)],
          ["Calibração", inp.calibration.toString()],
        ].map(([l, val]) => (
          <div key={l} className="border border-[#b98a5a] rounded p-3 bg-white/40">
            <div className="muted text-[11px]">{l}</div>
            <div className="font-bold text-[18px] text-[#3a1a00]">{val}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Magia</th>
              <th>Elemento</th>
              <th>Min</th>
              <th>Média</th>
              <th>Máx</th>
              <th>Esperado por alvo</th>
              <th>Alvos</th>
              <th>Por cast</th>
              <th>CD</th>
              <th>Mana</th>
              <th>Usos em 2 min</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .slice()
              .sort((a, b) => b.perCast - a.perCast)
              .map((r) => (
                <tr key={r.spell.id}>
                  <td className="font-bold whitespace-nowrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://static.tibia.com/images/library/${r.spell.icon}.png`} alt="" width={20} height={20} className="inline-block align-middle mr-1" />
                    {r.spell.name}
                  </td>
                  <td>
                    {r.parts.map((p) => (
                      <span key={p.element} className={`tag tag-${p.element} mr-1`}>
                        {ELEMENT_LABEL[p.element]}
                        {r.parts.length > 1 ? ` ${Math.round(p.share * 100)}%` : ""}
                      </span>
                    ))}
                  </td>
                  <td>{fmt(r.min)}</td>
                  <td>{fmt(r.avg)}</td>
                  <td>{fmt(r.max)}</td>
                  <td>{fmt(r.expectedPerTarget)}</td>
                  <td>{r.targets}</td>
                  <td className="font-bold">{fmt(r.perCast)}</td>
                  <td>{r.cooldown} s</td>
                  <td>{r.mana || "runa"}</td>
                  <td>{rotation.countBy[r.spell.id] ?? 0}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Rotação sugerida (primeiros 20 s)</h2>
        <p className="text-[12px]">
          A cada vez que o grupo de ataque libera, o simulador usa a magia pronta que dá mais dano naquele cast, respeitando cooldown próprio e
          grupo secundário. Com outro número de alvos a ordem muda.
        </p>
        <ol className="flex flex-wrap gap-2 mt-2">
          {opening.map((c, i) => (
            <li key={i} className="border border-[#b98a5a] rounded px-2 py-1 bg-white/40 text-[11px]">
              <span className="muted">{c.t}s</span> {c.name}
            </li>
          ))}
        </ol>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <div className="font-bold mb-1">Calibrar com um hit real</div>
        <p className="text-[12px] mb-2">
          Sem buff temporário, lance a magia do topo da tabela num alvo neutro e anote o maior hit sem crítico. O simulador ajusta o
          multiplicador para o seu char.
        </p>
        <div className="flex gap-2">
          <input value={observed} onChange={(e) => setObserved(e.target.value)} placeholder="maior hit observado" className="w-48" />
          <button type="button" className="tc-btn" onClick={calibrate}>
            calibrar
          </button>
          <button type="button" className="tc-btn" onClick={() => set("calibration", 1)}>
            zerar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          className="tc-btn"
          onClick={async () => {
            const p = new URLSearchParams({ voc, level: String(inp.level), ml: String(inp.magicLevel), targets: String(inp.targets), stance: inp.stance });
            if (skillBased) p.set("skill", String(inp.skill));
            if (huntId) p.set("hunt", huntId);
            const url = `${window.location.origin}/simulador?${p.toString()}`;
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copie o link:", url);
            }
          }}
        >
          {copied ? "Link copiado" : "Copiar link da simulação"}
        </button>
        {huntId && (
          <a className="tc-btn" href={`/hunts/preparar?h=${huntId}&voc=${voc}`}>
            Preparar para esta hunt
          </a>
        )}
      </div>

      <ul className="list-disc pl-5 text-[11px] muted space-y-0.5">
        <li>Fórmula por magic level: bônus de level + ML × raiz de 0,4 × base + base/6.</li>
        <li>Fórmula por skill: bônus de level + (base/1000) × skill × ataque + base/6. As duas são reconstruções da comunidade; a CipSoft não publica.</li>
        <li>Magias de knight e paladin seguem o elemento da arma: o dano é dividido na proporção do ataque físico e elemental.</li>
        <li>Fora do DPS: dano ao longo do tempo (Envenom, Holy Flash, Inflict Wound), magias de escudo e Ethereal Barrage (sem base publicada).</li>
        <li>Ice Burst e Terra Burst: o bônus contra alvos acima de 60% de vida entra pela metade, como aproximação.</li>
      </ul>
    </div>
  );
}
