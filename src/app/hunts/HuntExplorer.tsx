"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@/components/Box";
import { HUNTS, Hunt } from "@/data/hunts";
import { getActive } from "@/lib/active";
import { HUNT_RECS, REC_VOC_LABEL, RecVoc, SHARE_BONUS } from "@/data/hunt-recs";
import HuntSheet from "./HuntSheet";

type Mode = "todas" | "solo" | "time";
interface Member {
  voc: RecVoc;
  level: number;
}

const VOCS = Object.keys(REC_VOC_LABEL) as RecVoc[];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function bestElement(h: Hunt): string {
  const m = h.element.match(/^([A-ZÁÉÍÓÚÇ ]+?)(:| OU|\s*\()/);
  return m ? m[1].trim() : h.element.split(":")[0];
}

export default function HuntExplorer() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("todas");
  const [voc, setVoc] = useState<RecVoc>("sorcerer");
  const [level, setLevel] = useState(800);
  const [party, setParty] = useState<Member[]>([
    { voc: "knight", level: 800 },
    { voc: "sorcerer", level: 800 },
    { voc: "druid", level: 700 },
    { voc: "paladin", level: 750 },
  ]);
  const [selected, setSelected] = useState<string>("");
  const sheetRef = useRef<HTMLDivElement>(null);

  // abre a hunt da URL (?h=id), para links compartilhados
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const h = new URLSearchParams(window.location.search).get("h");
    if (h && HUNTS.some((x) => x.id === h)) setSelected(h);
    // filtro solo parte da vocação e do level ativos (barra do topo)
    const a = getActive();
    if (a.voc) setVoc(a.voc);
    if (a.char) setLevel(a.char.level);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const pick = (id: string) => {
    setSelected(id);
    try {
      window.history.replaceState(null, "", `/hunts?h=${id}`);
    } catch {
      // sem histórico: segue sem mudar a URL
    }
    setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const lowest = Math.min(...party.map((m) => m.level));
  const highest = Math.max(...party.map((m) => m.level));
  const shares = lowest * 3 >= highest * 2;
  const distinct = new Set(party.map((m) => m.voc)).size;
  const bonus = party.length > 1 ? SHARE_BONUS[Math.min(4, distinct)] : 0;

  const { fit, others } = useMemo(() => {
    const term = norm(q.trim());
    const text = HUNTS.filter((h) => !term || norm([h.name, h.city, ...h.creatures.map((c) => c.name)].join(" ")).includes(term));
    if (mode === "todas") return { fit: text, others: [] as Hunt[] };
    const ok = (h: Hunt) => {
      const r = HUNT_RECS[h.id];
      if (!r) return false;
      if (mode === "solo") return r.solo[voc] !== undefined && r.solo[voc]! <= level;
      return r.team !== undefined && r.team <= lowest;
    };
    const minOf = (h: Hunt) => (mode === "solo" ? HUNT_RECS[h.id]?.solo[voc] : HUNT_RECS[h.id]?.team) ?? 0;
    const fit = text.filter(ok).sort((a, b) => minOf(b) - minOf(a));
    return { fit, others: text.filter((h) => !ok(h)) };
  }, [q, mode, voc, level, lowest]);

  const current = HUNTS.find((h) => h.id === selected) ?? null;

  const card = (h: Hunt, dim = false) => {
    const r = HUNT_RECS[h.id];
    const soloTxt = r
      ? VOCS.filter((v) => r.solo[v])
          .map((v) => `${REC_VOC_LABEL[v]} ${r.solo[v]}+`)
          .join(" · ") || "sem recomendação solo"
      : "sem recomendação";
    return (
      <button
        key={h.id}
        type="button"
        onClick={() => pick(h.id)}
        className={`text-left border rounded p-2 ${selected === h.id ? "border-[#3a1a00] bg-[#f3e2bd]" : "border-[#b98a5a] bg-white/40 hover:bg-white/70"} ${dim ? "opacity-60" : ""}`}
      >
        <div className="font-bold text-[#3a1a00]">{h.name}</div>
        <div className="muted text-[11px]">
          {h.city} · {h.creatures.length} bichos · sorc: {bestElement(h)}
        </div>
        <div className="text-[11px] mt-1">
          <span className="mr-2">Solo: {soloTxt}</span>
          {r?.team && <span className="tag tag-energy">Time {r.team}+</span>}
        </div>
      </button>
    );
  };

  return (
    <div>
      <Box title="Encontrar hunt">
        <div className="space-y-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar por hunt, cidade ou bicho (ex.: ingol, darashia, harpy)" className="w-full" />
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["todas", "Todas"],
                ["solo", "Solo"],
                ["time", "Time (party)"],
              ] as [Mode, string][]
            ).map(([m, l]) => (
              <button key={m} type="button" className={`tc-btn ${mode === m ? "" : "opacity-60"}`} onClick={() => setMode(m)}>
                {l}
              </button>
            ))}
          </div>

          {mode === "solo" && (
            <div className="flex flex-wrap gap-3 items-end">
              <label className="text-[12px]">
                <span className="font-bold block">Vocação</span>
                <select value={voc} onChange={(e) => setVoc(e.target.value as RecVoc)}>
                  {VOCS.map((v) => (
                    <option key={v} value={v}>
                      {REC_VOC_LABEL[v]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[12px]">
                <span className="font-bold block">Seu level</span>
                <input type="number" className="w-24" value={level} min={8} onChange={(e) => setLevel(Number(e.target.value) || 0)} />
              </label>
              <span className="muted text-[11px]">Mostra as hunts que o TibiaPal recomenda para essa vocação até o seu level, das mais altas para as mais baixas.</span>
            </div>
          )}

          {mode === "time" && (
            <div className="space-y-2">
              <div className="font-bold text-[12px]">Membros do time</div>
              {party.map((m, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-center">
                  <select
                    value={m.voc}
                    onChange={(e) => setParty(party.map((x, j) => (j === i ? { ...x, voc: e.target.value as RecVoc } : x)))}
                  >
                    {VOCS.map((v) => (
                      <option key={v} value={v}>
                        {REC_VOC_LABEL[v]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-24"
                    value={m.level}
                    min={8}
                    onChange={(e) => setParty(party.map((x, j) => (j === i ? { ...x, level: Number(e.target.value) || 0 } : x)))}
                  />
                  {party.length > 1 && (
                    <button type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={() => setParty(party.filter((_, j) => j !== i))}>
                      tirar
                    </button>
                  )}
                </div>
              ))}
              {party.length < 10 && (
                <button type="button" className="tc-btn" onClick={() => setParty([...party, { voc: "knight", level: lowest }])}>
                  + membro
                </button>
              )}
              <div className="grid gap-2 sm:grid-cols-3 text-[12px]">
                <div className={`border rounded p-2 ${shares ? "border-[#5a7d2a] bg-[#dfe9c8]" : "border-[#a33] bg-[#f6d8d0]"}`}>
                  <b>{shares ? "Divide exp" : "Não divide exp"}</b>
                  <div className="text-[11px]">
                    Menor {lowest}, maior {highest}. O menor precisa ter pelo menos 2/3 do maior (mínimo {Math.ceil((highest * 2) / 3)}).
                  </div>
                </div>
                <div className="border border-[#b98a5a] rounded p-2 bg-white/40">
                  <b>Bônus de exp: +{Math.round(bonus * 100)}%</b>
                  <div className="text-[11px]">{distinct} vocação(ões) diferente(s). 1: 20%, 2: 35%, 3: 70%, 4: 100%.</div>
                </div>
                <div className="border border-[#b98a5a] rounded p-2 bg-white/40">
                  <b>Filtro pelo menor level: {lowest}</b>
                  <div className="text-[11px]">A recomendação de time do TibiaPal vale para o time inteiro nesse level.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Box>

      <Box title={mode === "todas" ? `Hunts (${fit.length})` : `Recomendadas (${fit.length})`}>
        {fit.length === 0 ? (
          <p>Nenhuma hunt do site bate com esse filtro.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {fit.map((h) => card(h))}
          </div>
        )}
        {others.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[12px]">Outras hunts do site ({others.length}): level acima do seu ou sem recomendação para esse modo</summary>
            <div className="grid gap-2 sm:grid-cols-2 mt-2">
              {others.map((h) => card(h, true))}
            </div>
          </details>
        )}
      </Box>

      <div ref={sheetRef}>
        {current ? (
          <Box title={`${current.name} · ${current.city}`}>
            <HuntSheet h={current} />
          </Box>
        ) : (
          <p className="on-dark">Selecione uma hunt acima para abrir a ficha completa.</p>
        )}
      </div>
    </div>
  );
}
