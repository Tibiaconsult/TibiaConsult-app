"use client";

import { useState } from "react";
import { ROTATIONS } from "@/data/rotations";
import { manaPerCycle } from "@/lib/rotation";

const POTIONS = [
  { id: "ump", name: "Ultimate Mana Potion", avg: 500, price: 488 },
  { id: "smp", name: "Superior Mana Potion", avg: 300, price: 254 },
  { id: "gmp", name: "Great Mana Potion", avg: 200, price: 158 },
];

function n(v: string) {
  const x = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(x) ? x : 0;
}

export default function ManaSimulator() {
  const [level, setLevel] = useState("896");
  const [ml, setMl] = useState("141");
  const [maxMana, setMaxMana] = useState(String(30 * 896 - 150));
  const [enhanced, setEnhanced] = useState(false);
  const [rotId, setRotId] = useState("energia");
  const [burst, setBurst] = useState<"rage" | "hells" | "none">("rage");
  const [focusCd, setFocusCd] = useState("40");
  const [dps, setDps] = useState("2000");
  const [leech, setLeech] = useState("10");
  const [areaFactor, setAreaFactor] = useState("50");
  const [potion, setPotion] = useState("ump");
  const [overflow, setOverflow] = useState("1500");

  const L = n(level);
  const M = n(ml);
  const shield = enhanced ? 8 * M + 8.6 * L + Math.max(300, 0.4 * L) : 7 * M + 7.6 * L + Math.max(300, 0.4 * L);
  const rot = ROTATIONS.find((r) => r.id === rotId)!;
  const cycleSec = Math.max(...rot.cycle.map((s) => s.t)) + 2;
  const cycleMana = manaPerCycle(rot.cycle);
  const burstMana = burst === "rage" ? 600 : burst === "hells" ? 1100 : 0;
  const cd = Math.max(20, n(focusCd));
  const spendPerMin = (cycleMana / cycleSec) * 60 + (burstMana ? (burstMana + 100) * (60 / cd) : 0);
  const leechPerMin = n(dps) * 60 * (n(leech) / 100) * (n(areaFactor) / 100);
  const deficit = Math.max(0, spendPerMin - leechPerMin);
  const pot = POTIONS.find((p) => p.id === potion)!;
  const potsPerHour = (deficit * 60) / pot.avg;
  const goldPerHour = potsPerHour * pot.price;
  const barrierCost = 10 * n(overflow) + 0.25 * n(maxMana);
  const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");

  return (
    <div className="space-y-5">
      <h2 className="mt-0">Magic Shield</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <label>
          Level
          <input className="mt-1 w-full" value={level} onChange={(e) => setLevel(e.target.value)} />
        </label>
        <label>
          Magic level total (com o set)
          <input className="mt-1 w-full" value={ml} onChange={(e) => setMl(e.target.value)} />
        </label>
        <label>
          Mana máxima
          <input className="mt-1 w-full" value={maxMana} onChange={(e) => setMaxMana(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={enhanced} onChange={(e) => setEnhanced(e.target.checked)} /> Perk Enhanced Magic Shield
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Capacidade do escudo</td>
            <td className="font-bold">{fmt(shield)} de dano</td>
          </tr>
          <tr>
            <td>Fórmula</td>
            <td>{enhanced ? "8 × ML + 8,6 × level + máx(300; 0,4 × level)" : "7 × ML + 7,6 × level + máx(300; 0,4 × level)"}</td>
          </tr>
          <tr>
            <td>Duração e cooldown</td>
            <td>180 s; recast a cada 14 s; Magic Shield Potion renova durante o cooldown</td>
          </tr>
        </tbody>
      </table>
      <p className="muted text-[11px]">A mana máxima vem preenchida com uma estimativa (30 × level − 150). Troque pelo valor real do seu char, que inclui Wheel e gemas.</p>

      <h2>Barrier (golpe letal)</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          Dano que passaria do seu HP
          <input className="mt-1 w-full" value={overflow} onChange={(e) => setOverflow(e.target.value)} />
        </label>
        <div className="self-end">
          Mana consumida: <span className="font-bold">{fmt(barrierCost)}</span> (10 × excedente + 25% da mana máxima)
        </div>
        <div className={`self-end ${barrierCost > n(maxMana) ? "bad" : "good"}`}>{barrierCost > n(maxMana) ? "Você morreria: mana insuficiente." : "Você sobrevive com 1 HP."}</div>
      </div>

      <h2>Gasto e reposição de mana</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <label>
          Rotação
          <select className="mt-1 w-full" value={rotId} onChange={(e) => setRotId(e.target.value)}>
            {ROTATIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Burst
          <select className="mt-1 w-full" value={burst} onChange={(e) => setBurst(e.target.value as "rage" | "hells" | "none")}>
            <option value="rage">Rage of the Skies (600) + UE</option>
            <option value="hells">Hell&apos;s Core (1100) + UE</option>
            <option value="none">sem burst</option>
          </select>
        </label>
        <label>
          Cooldown do burst (s)
          <input className="mt-1 w-full" value={focusCd} onChange={(e) => setFocusCd(e.target.value)} />
        </label>
        <label>
          Potion
          <select className="mt-1 w-full" value={potion} onChange={(e) => setPotion(e.target.value)}>
            {POTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.avg} de média, {p.price} gp)
              </option>
            ))}
          </select>
        </label>
        <label>
          DPS médio (do simulador de dano)
          <input className="mt-1 w-full" value={dps} onChange={(e) => setDps(e.target.value)} />
        </label>
        <label>
          Mana leech total %
          <input className="mt-1 w-full" value={leech} onChange={(e) => setLeech(e.target.value)} />
        </label>
        <label>
          Aproveitamento do leech em área %
          <input className="mt-1 w-full" value={areaFactor} onChange={(e) => setAreaFactor(e.target.value)} />
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Mana gasta por minuto</td>
            <td className="font-bold">{fmt(spendPerMin)}</td>
          </tr>
          <tr>
            <td>Mana recuperada pelo leech por minuto</td>
            <td>{fmt(leechPerMin)}</td>
          </tr>
          <tr>
            <td>Déficit por minuto</td>
            <td>{fmt(deficit)}</td>
          </tr>
          <tr>
            <td>Potions por hora</td>
            <td className="font-bold">{fmt(potsPerHour)}</td>
          </tr>
          <tr>
            <td>Gasto em potions por hora</td>
            <td className="font-bold">{(goldPerHour / 1000).toFixed(0)}k gp</td>
          </tr>
        </tbody>
      </table>
      <ul className="list-disc pl-5 text-[12px]">
        <li>Mana leech tem retorno decrescente quando o mesmo golpe acerta vários bichos (TibiaWiki, Imbuing); o campo de aproveitamento em área é o seu ajuste para isso.</li>
        <li>Não entram a regeneração natural nem a mana gerada pelo ataque da wand (que agora gera mana), então o gasto real em potions tende a ser menor.</li>
        <li>Potions: média e preço de NPC da TibiaWiki (26/09/2026).</li>
      </ul>
    </div>
  );
}
