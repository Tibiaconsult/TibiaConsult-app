"use client";

import { useEffect, useMemo, useState } from "react";
import { SPELL_ANIMATIONS } from "@/data/spell-animations";
import { wikiImage } from "@/lib/md5";

// Toca o combo no tempo do jogo: cada magia aparece no segundo em que sai, com a animação da TibiaWiki
// (ou o ícone, quando a wiki não tem animação daquela magia). O palco tem a grade de sqm de 32 px do Tibia.

export interface PlayerStep {
  t: number;
  id: string;
  name: string;
  icon: string | null;
}

const SPEEDS = [0.5, 1, 2];
const MAX_SIDE = 288;

export default function ComboPlayer({ steps }: { steps: PlayerStep[] }) {
  const ordered = useMemo(() => [...steps].sort((a, b) => a.t - b.t), [steps]);
  const end = ordered.length ? ordered[ordered.length - 1].t + 2 : 0;
  // tempo corrido desde o início (não volta a zero); a volta atual e o segundo do combo saem dele
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  // muda a cada clique para o GIF recomeçar mesmo parado na mesma magia
  const [bump, setBump] = useState(0);

  const done = !loop && elapsed >= end;
  const running = playing && !done;
  const now = !end ? 0 : loop ? elapsed % end : Math.min(elapsed, end);
  const round = !end ? 0 : Math.floor(elapsed / end);

  // baixa as animações do combo uma vez, antes de tocar, para cada magia entrar na hora
  useEffect(() => {
    for (const st of ordered) {
      const a = SPELL_ANIMATIONS[st.id];
      if (a) new Image().src = wikiImage(a.file);
    }
  }, [ordered]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 0.1 * speed), 100);
    return () => clearInterval(id);
  }, [running, speed]);

  if (!ordered.length) return null;

  // magia em cena: a última que já saiu
  let idx = -1;
  for (let i = 0; i < ordered.length; i++) if (ordered[i].t <= now + 1e-9) idx = i;
  const cur = idx >= 0 ? ordered[idx] : null;
  const anim = cur ? SPELL_ANIMATIONS[cur.id] : undefined;
  const scale = anim ? Math.min(1, MAX_SIDE / Math.max(anim.w, anim.h)) : 1;
  const src = anim ? wikiImage(anim.file) : null;

  const jump = (t: number) => {
    setElapsed(round * end + t);
    setBump((b) => b + 1);
  };
  const start = () => {
    if (done) setElapsed(0);
    setPlaying(true);
  };

  return (
    <div className="border border-[#5f4d41] rounded bg-[#2b221b] p-2 text-[#f3e9d2]">
      <div
        className="relative mx-auto flex items-center justify-center overflow-hidden rounded"
        style={{
          height: MAX_SIDE + 24,
          maxWidth: MAX_SIDE + 160,
          backgroundColor: "#1d2a14",
          backgroundImage: "linear-gradient(rgba(0,0,0,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.25) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-live="polite"
      >
        {!cur ? (
          <span className="text-[12px] text-white/70">Aperte tocar para ver o combo.</span>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${round}-${idx}-${bump}`}
            src={src}
            alt={cur.name}
            width={anim!.w * scale}
            height={anim!.h * scale}
            style={{ imageRendering: "pixelated" }}
            // se a wiki falhar, fica o ícone da magia
            onError={(e) => {
              if (cur.icon && e.currentTarget.src !== cur.icon) e.currentTarget.src = cur.icon;
            }}
          />
        ) : cur.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${round}-${idx}-${bump}`}
            src={cur.icon}
            alt={cur.name}
            width={64}
            height={64}
            className="tc-spell-pop"
            style={{ imageRendering: "pixelated" }}
          />
        ) : null}
        {cur && (
          <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[12px]">
            <b>{cur.t}s</b> {cur.name}
            {!anim && <span className="text-white/60"> · sem animação na wiki</span>}
          </div>
        )}
      </div>

      {/* linha do tempo com o cursor */}
      <div className="relative mt-2 h-[30px] rounded bg-black/40">
        {ordered.map((s, i) => (
          <button
            key={i}
            type="button"
            title={`${s.t}s: ${s.name}`}
            onClick={() => jump(s.t)}
            className="absolute top-[3px]"
            style={{ left: `calc(${(s.t / end) * 100}% - 0px)`, opacity: i === idx ? 1 : 0.6 }}
          >
            {s.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.icon} alt="" width={24} height={24} style={{ outline: i === idx ? "2px solid #ffd700" : "1px solid #000" }} />
            ) : (
              <span className="text-[10px]">{s.name}</span>
            )}
          </button>
        ))}
        <div className="absolute top-0 bottom-0 w-[2px] bg-[#ffd700] pointer-events-none" style={{ left: `${Math.min(100, (now / end) * 100)}%` }} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
        {running ? (
          <button type="button" className="tc-btn !py-0.5" onClick={() => setPlaying(false)}>
            pausar
          </button>
        ) : (
          <button type="button" className="tc-btn !py-0.5" onClick={start}>
            tocar
          </button>
        )}
        <button type="button" className="tc-btn !py-0.5" onClick={() => jump(0)}>
          do início
        </button>
        <span>velocidade</span>
        {SPEEDS.map((s) => (
          <button key={s} type="button" className={`tc-btn !py-0.5 !px-2 ${speed === s ? "" : "opacity-60"}`} onClick={() => setSpeed(s)}>
            {String(s).replace(".", ",")}x
          </button>
        ))}
        <label className="flex items-center gap-1" style={{ color: "#f3e9d2" }}>
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> repetir
        </label>
        <span className="text-white/60">
          {now.toFixed(1).replace(".", ",")} s de {end} s
        </span>
      </div>
      <p className="mt-1 text-[10px] text-white/50">Animações: TibiaWiki. Cada quadrado do palco é um sqm.</p>
    </div>
  );
}
