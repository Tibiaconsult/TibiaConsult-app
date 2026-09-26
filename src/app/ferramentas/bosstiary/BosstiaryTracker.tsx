"use client";

import { useEffect, useMemo, useState } from "react";
import { BOSSES, BOSS_CATEGORY, BossCategory } from "@/data/bosses";
import { useActive } from "@/lib/active";
import { SECOND_SLOT, STAGE_LABEL, bossProgress, lootBonus, pointsToNextBonus } from "@/lib/bosstiary";
import { creatureIcon } from "@/lib/icons";

// Bosstiary Tracker: kills de cada boss, estágio (Prowess, Expertise, Mastery), boss points e o bônus de loot do slot.
// Os kills ficam neste navegador, separados por char ativo.

const PAGE = 100;
const fmt = (v: number) => v.toLocaleString("pt-BR");
const CATS: BossCategory[] = ["bane", "archfoe", "nemesis"];

export default function BosstiaryTracker() {
  const { char } = useActive();
  const key = `tc-bosstiary:${char?.id ?? "local"}`;
  const [kills, setKills] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<BossCategory | "">("");
  const [status, setStatus] = useState<"todos" | "comecados" | "faltam" | "mastery">("todos");
  const [limit, setLimit] = useState(PAGE);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setKills(JSON.parse(localStorage.getItem(key) ?? "{}"));
    } catch {
      setKills({});
    }
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setBoss = (name: string, n: number) => {
    const next = { ...kills };
    if (n > 0) next[name] = n;
    else delete next[name];
    setKills(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  };

  const summary = useMemo(() => {
    let points = 0;
    const byStage = [0, 0, 0];
    for (const [name, c] of BOSSES) {
      const p = bossProgress(c, kills[name] ?? 0);
      points += p.points;
      for (let s = 0; s < p.stage; s++) byStage[s]++;
    }
    return { points, byStage };
  }, [kills]);

  const t = q.trim().toLowerCase();
  const rows = BOSSES.filter(([name, c]) => {
    if (cat && c !== cat) return false;
    if (t && !name.toLowerCase().includes(t)) return false;
    const st = bossProgress(c, kills[name] ?? 0).stage;
    if (status === "comecados") return (kills[name] ?? 0) > 0;
    if (status === "faltam") return st < 3;
    if (status === "mastery") return st === 3;
    return true;
  });
  const bonus = lootBonus(summary.points);
  const maxPoints = BOSSES.reduce((a, [, c]) => a + BOSS_CATEGORY[c].points.reduce((x, y) => x + y, 0), 0);

  return (
    <div className="space-y-4 text-[12px]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Boss points", `${fmt(summary.points)} de ${fmt(maxPoints)}`],
          ["Bônus de loot no slot", `${bonus}%`],
          ["Próximo 1% de bônus", `faltam ${fmt(pointsToNextBonus(summary.points))} pontos`],
          ["Segundo boss slot", summary.points >= SECOND_SLOT ? "liberado" : `faltam ${fmt(SECOND_SLOT - summary.points)} pontos`],
        ].map(([l, v]) => (
          <div key={l} className="border border-[#b98a5a] rounded p-3 bg-white/40">
            <div className="muted text-[11px]">{l}</div>
            <div className="font-bold text-[16px] text-[#3a1a00]">{v}</div>
          </div>
        ))}
      </div>
      <p>
        {STAGE_LABEL.map((s, i) => `${s}: ${summary.byStage[i]}`).join(" · ")} de {BOSSES.length} bosses.{" "}
        <span className="muted">
          {char
            ? `Kills de ${char.name}, guardados neste navegador.`
            : "Kills guardados neste navegador. Escolha o char na barra do topo para separar por char."}
        </span>
      </p>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Kills (Prowess / Expertise / Mastery)</th>
              <th>Pontos (por estágio)</th>
              <th>Bosses</th>
            </tr>
          </thead>
          <tbody>
            {CATS.map((c) => (
              <tr key={c}>
                <td className="font-bold">
                  {BOSS_CATEGORY[c].label} <span className="muted font-normal">({BOSS_CATEGORY[c].text})</span>
                </td>
                <td>{BOSS_CATEGORY[c].kills.join(" / ")}</td>
                <td>{BOSS_CATEGORY[c].points.join(" + ")}</td>
                <td>{BOSSES.filter(([, x]) => x === c).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label>
          <span className="font-bold block">Buscar</span>
          <input value={q} onChange={(e) => (setQ(e.target.value), setLimit(PAGE))} placeholder="nome do boss" className="w-48" />
        </label>
        <label>
          <span className="font-bold block">Categoria</span>
          <select value={cat} onChange={(e) => (setCat(e.target.value as BossCategory | ""), setLimit(PAGE))}>
            <option value="">todas</option>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {BOSS_CATEGORY[c].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="font-bold block">Mostrar</span>
          <select value={status} onChange={(e) => (setStatus(e.target.value as typeof status), setLimit(PAGE))}>
            <option value="todos">todos</option>
            <option value="comecados">com kills</option>
            <option value="faltam">sem Mastery</option>
            <option value="mastery">com Mastery</option>
          </select>
        </label>
        <span className="muted">{rows.length} bosses</span>
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Boss</th>
              <th>Categoria</th>
              <th>Kills</th>
              <th>Estágio</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map(([name, c]) => {
              const k = kills[name] ?? 0;
              const p = bossProgress(c, k);
              return (
                <tr key={name}>
                  <td className="font-bold whitespace-nowrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={creatureIcon(name)} alt="" width={32} height={32} loading="lazy" className="sprite inline-block align-middle mr-1" />
                    <a href={`https://tibia.fandom.com/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`} target="_blank" rel="noreferrer">
                      {name}
                    </a>
                  </td>
                  <td>{BOSS_CATEGORY[c].label}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="tc-btn !py-0 !px-2"
                        onClick={() => setBoss(name, Math.max(0, k - 1))}
                        aria-label={`menos um kill de ${name}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        className="w-16"
                        value={k}
                        onChange={(e) => setBoss(name, Math.max(0, Number(e.target.value) || 0))}
                        aria-label={`Kills de ${name}`}
                      />
                      <button type="button" className="tc-btn !py-0 !px-2" onClick={() => setBoss(name, k + 1)} aria-label={`mais um kill de ${name}`}>
                        +
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    {STAGE_LABEL.map((s, i) => (
                      <span key={s} className={`tag mr-1 ${i < p.stage ? "font-bold" : "opacity-40"}`} title={`${s}: ${BOSS_CATEGORY[c].kills[i]} kills`}>
                        {s[0]}
                      </span>
                    ))}
                    {p.next !== null && <span className="muted text-[11px]">faltam {p.next - k}</span>}
                  </td>
                  <td>{p.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <button type="button" className="tc-btn" onClick={() => setLimit(limit + PAGE)}>
          mostrar mais {Math.min(PAGE, rows.length - limit)}
        </button>
      )}
      <p className="muted text-[10px]">
        Lista de bosses, categorias, kills por estágio, pontos e bônus de loot: TibiaWiki (Bosstiary/Categories e Cyclopedia), consulta em 26/09/2026. O boss
        diário (boosted) conta como 3 kills.
      </p>
    </div>
  );
}
