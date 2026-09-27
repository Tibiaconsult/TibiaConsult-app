"use client";

import NumberInput from "@/components/NumberInput";
import { useEffect, useState } from "react";
import { setActiveVoc, useActive } from "@/lib/active";
import Box from "@/components/Box";
import ExerciseCalc from "./ExerciseCalc";
import VocPicker from "./VocPicker";
import { StatVoc, blessEnhanced, blessRegular, expForLevel, staminaAfterOffline, staminaOfflineMinutes, twistOfFate, vocStats } from "@/lib/calcs";

const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
const hm = (min: number) => `${Math.floor(min / 60)}h${String(Math.round(min % 60)).padStart(2, "0")}`;
const parseHm = (s: string) => {
  const m = s.trim().match(/^(\d{1,2})(?:[:h](\d{1,2}))?$/);
  return m ? Number(m[1]) * 60 + Number(m[2] ?? 0) : NaN;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[12px]">
      <span className="font-bold block">{label}</span>
      {children}
    </label>
  );
}

function Result({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 mt-3">
      {items.map(([l, v]) => (
        <div key={l} className="border border-[#b98a5a] rounded p-2 bg-white/40">
          <div className="muted text-[11px]">{l}</div>
          <div className="font-bold text-[15px] text-[#3a1a00]">{v}</div>
        </div>
      ))}
    </div>
  );
}

function ExpCalc() {
  const [level, setLevel] = useState(896);
  const [pct, setPct] = useState(0);
  const [target, setTarget] = useState(900);
  const [perHour, setPerHour] = useState(5000000);
  const { voc: activeVoc, char } = useActive();
  const voc: StatVoc = activeVoc ?? "sorcerer";
  const setVoc = (v: StatVoc) => setActiveVoc(v);
  // char ativo: level atual e meta de +10 levels
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!char) return;
    setLevel(char.level);
    setTarget(char.level + 10);
  }, [char]);
  /* eslint-enable react-hooks/set-state-in-effect */
  const now = vocStats(voc, level);
  const then = vocStats(voc, Math.max(level, target));
  const cur = expForLevel(level) + (expForLevel(level + 1) - expForLevel(level)) * (pct / 100);
  const need = Math.max(0, expForLevel(target) - cur);
  return (
    <Box title="Experiência até o level">
      <div className="mb-3">
        <span className="font-bold block text-[12px] mb-1">Vocação</span>
        <VocPicker value={voc} onChange={setVoc} />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Level atual">
          <NumberInput className="w-full" value={level} min={1} max={5000} onValue={setLevel} />
        </Field>
        <Field label="% para o próximo (barra)">
          <input type="number" className="w-full" value={pct} min={0} max={99} onChange={(e) => setPct(Math.min(99, Math.max(0, Number(e.target.value) || 0)))} />
        </Field>
        <Field label="Level desejado">
          <input type="number" className="w-full" value={target} min={1} onChange={(e) => setTarget(Number(e.target.value) || 1)} />
        </Field>
        <Field label="Exp por hora (da sua hunt)">
          <input type="number" className="w-full" value={perHour} min={0} step={100000} onChange={(e) => setPerHour(Number(e.target.value) || 0)} />
        </Field>
      </div>
      <Result
        items={[
          ["Exp que falta", fmt(need)],
          ["Horas de hunt", perHour ? (need / perHour).toFixed(1).replace(".", ",") + " h" : "-"],
          ["Exp total no level desejado", fmt(expForLevel(target))],
        ]}
      />
      <Result
        items={[
          ["Vida no level desejado", `${fmt(then.hp)} (+${fmt(then.hp - now.hp)})`],
          ["Mana no level desejado", `${fmt(then.mana)} (+${fmt(then.mana - now.mana)})`],
          ["Capacidade no level desejado", `${fmt(then.cap)} oz (+${fmt(then.cap - now.cap)})`],
        ]}
      />
      <p className="muted text-[10px] mt-2">
        Fórmula oficial de experiência (TibiaWiki, Experience Formula). Exp por hora conta a exp que o char recebe, com bônus. Vida, mana e capacidade
        base da vocação, sem itens, Wheel ou bônus (TibiaWiki, Formulae).
      </p>
    </Box>
  );
}

function BlessCalc() {
  const [level, setLevel] = useState(896);
  const [inquisition, setInquisition] = useState(false);
  const [phoenix, setPhoenix] = useState(false);
  const r = blessRegular(level);
  const e = blessEnhanced(level);
  const tof = twistOfFate(level);
  const five = inquisition ? r * 5 * 1.1 : r * 5 - (phoenix ? r * 0.1 : 0);
  return (
    <Box title="Blessings">
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="Level">
          <NumberInput className="w-28" value={level} min={1} max={5000} onValue={setLevel} />
        </Field>
        <label className="text-[12px] flex items-center gap-1">
          <input type="checkbox" checked={inquisition} onChange={(ev) => setInquisition(ev.target.checked)} /> comprar as 5 regulares no Henricus (Inquisition, +10%)
        </label>
        {!inquisition && (
          <label className="text-[12px] flex items-center gap-1">
            <input type="checkbox" checked={phoenix} onChange={(ev) => setPhoenix(ev.target.checked)} /> tenho Phoenix Egg (−10% na Spark of the Phoenix)
          </label>
        )}
      </div>
      <Result
        items={[
          ["Cada regular (5)", fmt(r)],
          ["Cada enhanced (2)", fmt(e)],
          ["Twist of Fate", fmt(tof)],
          ["As 5 regulares", fmt(five)],
          ["As 7 blessings", fmt(five + 2 * e)],
          ["7 blessings + Twist of Fate", fmt(five + 2 * e + tof)],
        ]}
      />
      <p className="muted text-[10px] mt-2">
        Regulares: Spiritual Shielding, Embrace of Tibia, Fire of the Suns, Spark of the Phoenix e Wisdom of Solitude. Enhanced: Blood e Heart of the
        Mountain. Preços pela fórmula da TibiaWiki (Blessings, seção Price).
      </p>
    </Box>
  );
}

function StaminaCalc() {
  const [cur, setCur] = useState("38:00");
  const [target, setTarget] = useState("42:00");
  const [offline, setOffline] = useState("8:00");
  const a = parseHm(cur);
  const b = parseHm(target);
  const off = parseHm(offline);
  const ok = !isNaN(a) && !isNaN(b);
  const need = ok ? staminaOfflineMinutes(a, b) : 0;
  const after = !isNaN(a) && !isNaN(off) ? staminaAfterOffline(a, off) : null;
  return (
    <Box title="Stamina">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Stamina atual (hh:mm)">
          <input className="w-full" value={cur} onChange={(e) => setCur(e.target.value)} />
        </Field>
        <Field label="Quero chegar em (hh:mm)">
          <input className="w-full" value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Field label="Ou: vou ficar offline por (hh:mm)">
          <input className="w-full" value={offline} onChange={(e) => setOffline(e.target.value)} />
        </Field>
      </div>
      <Result
        items={[
          ["Tempo offline necessário", ok ? (need ? hm(need) : "já está lá") : "-"],
          ["Stamina depois do offline", after !== null ? hm(after) : "-"],
          ["Horas verdes (bônus de 50%)", "de 42h a 39h"],
        ]}
      />
      <p className="muted text-[10px] mt-2">
        Offline: 1 minuto de stamina a cada 3 minutos; acima de 39h, a cada 6 minutos; só começa depois de 10 minutos deslogado. Abaixo de 14h a
        exp cai pela metade e não há loot. Fonte: TibiaWiki, Stamina.
      </p>
    </Box>
  );
}

export default function Calculators() {
  return (
    <div>
      <ExpCalc />
      <ExerciseCalc />
      <StaminaCalc />
      <BlessCalc />
    </div>
  );
}
