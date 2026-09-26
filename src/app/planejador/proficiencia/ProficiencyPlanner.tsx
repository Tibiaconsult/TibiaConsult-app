"use client";

import { useEffect, useState } from "react";
import { PROFICIENCY } from "@/data/proficiency";
import { itemIcon } from "@/lib/icons";

export default function ProficiencyPlanner() {
  const [wandIdx, setWandIdx] = useState(0);
  const [level, setLevel] = useState(7);
  const [picks, setPicks] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [copied, setCopied] = useState(false);
  const tree = PROFICIENCY[wandIdx];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Lê a árvore compartilhada pela URL uma vez, depois da hidratação.
    const p = new URLSearchParams(window.location.search);
    const raw = p.get("prof");
    if (!raw) return;
    const [w, l, ...ps] = raw.split("-").map(Number);
    if (PROFICIENCY[w]) setWandIdx(w);
    if (l) setLevel(l);
    if (ps.length) setPicks(ps);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const code = `${wandIdx}-${level}-${picks.join("-")}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex gap-2">
          {PROFICIENCY.map((t, i) => (
            <button key={t.wand} type="button" onClick={() => setWandIdx(i)} className="border border-[#b98a5a] rounded p-2 bg-white/40 flex items-center gap-2" style={i === wandIdx ? { outline: "2px solid #1a6b2d" } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={itemIcon(t.wand)} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
              <span className="font-bold">{t.wand.split("/")[0].trim()}</span>
            </button>
          ))}
        </div>
        <label>
          Nível de proficiência alcançado
          <select className="mt-1" value={level} onChange={(e) => setLevel(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3">
        {tree.levels.map((opts, i) => (
          <div key={i} className="grid grid-cols-[60px_1fr] gap-2 items-stretch" style={i >= level ? { opacity: 0.45 } : undefined}>
            <div className="flex items-center justify-center font-bold text-[#3a1a00] border border-[#b98a5a] rounded bg-white/40">{i + 1}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {opts.map((p, j) => (
                <button
                  key={j}
                  type="button"
                  disabled={i >= level}
                  onClick={() => setPicks((prev) => prev.map((v, k) => (k === i ? j : v)))}
                  className="border border-[#b98a5a] rounded p-2 text-left bg-white/40 hover:bg-white/70 text-[12px]"
                  style={picks[i] === j && i < level ? { outline: "2px solid #1a6b2d", background: "rgba(255,255,255,0.75)" } : undefined}
                >
                  {p.label}
                  {p.situational && <span className="muted block text-[10px]">situacional: não entra no simulador</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <a className="tc-btn" href={`/simulador?prof=${code}`}>
          Usar esta proficiência no simulador de dano
        </a>
        <button
          type="button"
          className="tc-btn"
          onClick={async () => {
            const u = `${window.location.origin}/planejador/proficiencia?prof=${code}`;
            try {
              await navigator.clipboard.writeText(u);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copie o link:", u);
            }
          }}
        >
          {copied ? "Link copiado" : "Copiar link"}
        </button>
      </div>
      <p className="muted text-[11px]">
        Um perk por nível. Desde o Summer Update 2026 dá para trocar até dois perks por outros (250 dust com proficiência 3; 1.000 dust com a arma dominada); essas trocas ainda não estão aqui.
      </p>
    </div>
  );
}
