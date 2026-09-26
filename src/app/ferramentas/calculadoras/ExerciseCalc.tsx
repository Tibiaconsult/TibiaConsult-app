"use client";

import { useState } from "react";
import Box from "@/components/Box";
import { wikiImage } from "@/lib/md5";
import { SKILL_LABEL, Skill, Voc, exerciseNeeded } from "@/lib/exercise";
import VocPicker, { VOC_OUTFIT } from "./VocPicker";

const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
const dur = (h: number) => {
  const d = Math.floor(h / 24);
  const hh = Math.floor(h % 24);
  const mm = Math.round((h * 60) % 60);
  return `${d ? `${d}d ` : ""}${hh}h${String(mm).padStart(2, "0")}`;
};

// Tipos de arma de exercício e o skill que cada uma treina (TibiaWiki, Exercise Weapons).
type WType = "Sword" | "Axe" | "Club" | "Bow" | "Shield" | "Wraps" | "Wand" | "Rod";
const W_SKILL: Record<WType, Skill> = { Sword: "melee", Axe: "melee", Club: "melee", Bow: "distance", Shield: "shielding", Wraps: "fist", Wand: "magic", Rod: "magic" };
const W_PT: Record<WType, string> = { Sword: "Espada", Axe: "Machado", Club: "Clava", Bow: "Arco", Shield: "Escudo", Wraps: "Wraps", Wand: "Wand", Rod: "Rod" };
// rod e wand treinam magic level em qualquer vocação; o resto segue a arma da vocação
const W_BY_VOC: Record<Voc, WType[]> = {
  sorcerer: ["Wand", "Rod"],
  druid: ["Rod", "Wand"],
  knight: ["Sword", "Axe", "Club", "Shield", "Wand", "Rod"],
  paladin: ["Bow", "Shield", "Wand", "Rod"],
  monk: ["Wraps", "Wand", "Rod"],
};
const PREFIX: Record<string, string> = { regular: "", durable: "Durable ", lasting: "Lasting " };
const sprite = (w: WType, tier = "regular") => wikiImage(`${PREFIX[tier]}Exercise ${w}`);

export default function ExerciseCalc() {
  const [voc, setVoc] = useState<Voc>("sorcerer");
  const [weapon, setWeapon] = useState<WType>("Wand");
  const [current, setCurrent] = useState(114);
  const [pctLeft, setPctLeft] = useState(100);
  const [target, setTarget] = useState(115);
  const [loyalty, setLoyalty] = useState(0);
  const [dummy, setDummy] = useState(false);
  const [double, setDouble] = useState(false);

  const types = W_BY_VOC[voc];
  const w = types.includes(weapon) ? weapon : types[0];
  const sk = W_SKILL[w];
  const r = target > current ? exerciseNeeded({ voc, skill: sk, current, pctLeft, target, loyalty, dummy, double }) : null;
  const dummyName = dummy ? (voc === "monk" ? "Monk Exercise Dummy" : "Demon Exercise Dummy") : "Exercise Dummy";

  const changeVoc = (v: Voc) => {
    setVoc(v);
    setWeapon(W_BY_VOC[v][0]);
  };

  return (
    <Box title="Exercise weapons">
      <div className="space-y-3 text-[12px]">
        <div>
          <span className="font-bold block mb-1">Vocação</span>
          <VocPicker value={voc} onChange={(v) => changeVoc(v as Voc)} />
        </div>
        <div>
          <span className="font-bold block mb-1">Arma de treino</span>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setWeapon(t)}
                className={`tc-item-card flex flex-col items-center border rounded px-2 py-1 bg-white/40 hover:bg-white/80 ${w === t ? "border-[#1a6b2d] bg-[#f3e2bd]" : "border-[#b98a5a]"}`}
                style={w === t ? { outline: "2px solid #1a6b2d" } : undefined}
                title={`Exercise ${t}: treina ${SKILL_LABEL[W_SKILL[t]]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sprite(t)} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
                <span className="text-[10px]">{W_PT[t]}</span>
              </button>
            ))}
          </div>
          <span className="muted text-[11px]">Treina: {SKILL_LABEL[sk]}</span>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* cena de treino: personagem batendo no dummy */}
          <div className="flex items-end gap-1 rounded border border-[#b98a5a] bg-[#2a3a1f] px-3 py-2" title="Treino no dummy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wikiImage(VOC_OUTFIT[voc][1])} alt="" width={46} height={46} style={{ imageRendering: "pixelated" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={w} src={sprite(w)} alt="" width={32} height={32} className="tc-swing mb-2" style={{ imageRendering: "pixelated" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wikiImage(dummyName)} alt={dummyName} width={32} height={32} style={{ imageRendering: "pixelated", transform: "scale(1.4)", transformOrigin: "bottom" }} />
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 flex-1 min-w-[260px]">
            <label>
              <span className="font-bold block">{sk === "magic" ? "Magic level atual" : "Skill atual"} (sem bônus)</span>
              <input type="number" className="w-full" value={current} min={0} onChange={(e) => setCurrent(Number(e.target.value) || 0)} />
            </label>
            <label>
              <span className="font-bold block">% que falta para o próximo</span>
              <input type="number" className="w-full" value={pctLeft} min={0} max={100} onChange={(e) => setPctLeft(Number(e.target.value) || 0)} />
            </label>
            <label>
              <span className="font-bold block">Desejado</span>
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
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={dummy} onChange={(e) => setDummy(e.target.checked)} /> dummy de casa (+10%)
            </label>
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={double} onChange={(e) => setDouble(e.target.checked)} /> evento de skill dobrada
            </label>
          </div>
        </div>
      </div>

      {!r ? (
        <p className="bad text-[12px] mt-3">O valor desejado precisa ser maior que o atual.</p>
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
                {r.weapons.map((x) => (
                  <tr key={x.id}>
                    <td className="font-bold whitespace-nowrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sprite(w, x.id)} alt="" width={32} height={32} className="inline-block align-middle mr-1" style={{ imageRendering: "pixelated" }} />
                      {PREFIX[x.id]}Exercise {w}
                    </td>
                    <td>
                      <b>{x.whole}</b> <span className="muted text-[10px]">({x.count.toFixed(2).replace(".", ",")})</span>
                    </td>
                    <td>{fmt(x.gold)}</td>
                    <td>{fmt(x.tc)}</td>
                    <td>{dur(x.hours)}</td>
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
          Fórmulas da TibiaWiki (Formulae e Exercise Weapons): cada carga de wand ou rod vale 600 de mana; espada, machado, clava e wraps 7,2 hits; arco
          4,32; escudo 14,4 blocks. Uma carga a cada 2 segundos. Rod e wand treinam magic level em qualquer vocação.
        </li>
        <li>Loyalty soma 5% a cada 360 pontos sobre os pontos de skill. Dummy de casa (Demon, Ferumbras ou Monk Exercise Dummy): +10%.</li>
        <li>O TibiaPal chega aos mesmos números. O Intibia mostra a metade das armas para magic level; não localizei fonte que explique essa diferença.</li>
      </ul>
    </Box>
  );
}
