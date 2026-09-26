"use client";

import { useState } from "react";
import Box from "@/components/Box";
import { SKILL_LABEL, Skill, VOC_LABEL, Voc, exerciseNeeded } from "@/lib/exercise";

const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
const dur = (h: number) => {
  const d = Math.floor(h / 24);
  const hh = Math.floor(h % 24);
  const mm = Math.round((h * 60) % 60);
  return `${d ? `${d}d ` : ""}${hh}h${String(mm).padStart(2, "0")}`;
};

const SKILLS_BY_VOC: Record<Voc, Skill[]> = {
  sorcerer: ["magic"],
  druid: ["magic"],
  knight: ["melee", "shielding", "magic"],
  paladin: ["distance", "magic"],
  monk: ["fist", "magic"],
};

export default function ExerciseCalc() {
  const [voc, setVoc] = useState<Voc>("sorcerer");
  const [skill, setSkill] = useState<Skill>("magic");
  const [current, setCurrent] = useState(114);
  const [pctLeft, setPctLeft] = useState(100);
  const [target, setTarget] = useState(115);
  const [loyalty, setLoyalty] = useState(0);
  const [dummy, setDummy] = useState(false);
  const [double, setDouble] = useState(false);

  const skills = SKILLS_BY_VOC[voc];
  const sk = skills.includes(skill) ? skill : skills[0];
  const r = target > current ? exerciseNeeded({ voc, skill: sk, current, pctLeft, target, loyalty, dummy, double }) : null;

  return (
    <Box title="Exercise weapons">
      <div className="grid gap-3 sm:grid-cols-4 text-[12px]">
        <label>
          <span className="font-bold block">Vocação</span>
          <select className="w-full" value={voc} onChange={(e) => setVoc(e.target.value as Voc)}>
            {(Object.keys(VOC_LABEL) as Voc[]).map((v) => (
              <option key={v} value={v}>
                {VOC_LABEL[v]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="font-bold block">Skill</span>
          <select className="w-full" value={sk} onChange={(e) => setSkill(e.target.value as Skill)}>
            {skills.map((s) => (
              <option key={s} value={s}>
                {SKILL_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="font-bold block">Skill atual (sem bônus de item)</span>
          <input type="number" className="w-full" value={current} min={0} onChange={(e) => setCurrent(Number(e.target.value) || 0)} />
        </label>
        <label>
          <span className="font-bold block">% que falta para o próximo</span>
          <input type="number" className="w-full" value={pctLeft} min={0} max={100} onChange={(e) => setPctLeft(Number(e.target.value) || 0)} />
        </label>
        <label>
          <span className="font-bold block">Skill desejado</span>
          <input type="number" className="w-full" value={target} min={1} onChange={(e) => setTarget(Number(e.target.value) || 0)} />
        </label>
        <label>
          <span className="font-bold block">Loyalty</span>
          <select className="w-full" value={loyalty} onChange={(e) => setLoyalty(Number(e.target.value))}>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((l) => (
              <option key={l} value={l}>
                {l ? `${l}% (${(l / 5) * 360} pontos)` : "nenhum"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 mt-5">
          <input type="checkbox" checked={dummy} onChange={(e) => setDummy(e.target.checked)} /> dummy de casa (+10%)
        </label>
        <label className="flex items-center gap-2 mt-5">
          <input type="checkbox" checked={double} onChange={(e) => setDouble(e.target.checked)} /> evento de skill dobrada
        </label>
      </div>

      {!r ? (
        <p className="bad text-[12px] mt-3">O skill desejado precisa ser maior que o atual.</p>
      ) : (
        <>
          <div className="overflow-x-auto mt-3">
            <table>
              <thead>
                <tr>
                  <th>Arma</th>
                  <th>Quantas</th>
                  <th>Gold (NPC)</th>
                  <th>Tibia Coins (Store)</th>
                  <th>Tempo de treino</th>
                </tr>
              </thead>
              <tbody>
                {r.weapons.map((w) => (
                  <tr key={w.id}>
                    <td className="font-bold">{w.label}</td>
                    <td>
                      <b>{w.whole}</b> <span className="muted text-[10px]">({w.count.toFixed(2).replace(".", ",")})</span>
                    </td>
                    <td>{fmt(w.gold)}</td>
                    <td>{fmt(w.tc)}</td>
                    <td>{dur(w.hours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] mt-2">
            Pontos de skill que faltam: <b>{fmt(r.points)}</b> {sk === "magic" ? "de mana" : sk === "shielding" ? "blocks" : "hits"} · cargas necessárias:{" "}
            <b>{fmt(r.charges)}</b>.
          </p>
        </>
      )}
      <ul className="list-disc pl-5 muted text-[10px] mt-2 space-y-0.5">
        <li>
          Fórmulas da TibiaWiki (Formulae e Exercise Weapons): cada carga de wand ou rod vale 600 de mana; melee e wraps 7,2 hits; bow 4,32; shield
          14,4 blocks. Uma carga a cada 2 segundos.
        </li>
        <li>Loyalty soma 5% a cada 360 pontos sobre os pontos de skill. Dummy de casa (Demon, Ferumbras ou Monk Exercise Dummy): +10%.</li>
        <li>O TibiaPal chega aos mesmos números. O Intibia mostra a metade das armas para magic level; não localizei fonte que explique essa diferença.</li>
      </ul>
    </Box>
  );
}
