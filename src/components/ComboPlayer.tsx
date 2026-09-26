"use client";

import { useEffect, useMemo, useState } from "react";
import { SPELL_ANIMATIONS } from "@/data/spell-animations";
import { wikiImage } from "@/lib/md5";

// Toca o combo no tempo do jogo: cada magia aparece no segundo em que sai, com a animação da TibiaWiki
// (ou o ícone, quando a wiki não tem animação daquela magia). O palco tem a grade de sqm de 32 px do Tibia.
// Embaixo, a barra de magias como a do jogo: cada magia do combo com o relógio do cooldown, a trava do grupo de ataque
// e a próxima magia da ordem.

export interface PlayerStep {
  t: number;
  id: string;
  name: string;
  icon: string | null;
  /** cooldown próprio efetivo, em segundos */
  cd?: number;
  /** trava do grupo de ataque (2 s na maioria, 4 s nos focus) */
  lock?: number;
  /** grupo secundário (ex.: great beams, focus) */
  group?: { id: string; label: string; cd: number };
}

/** Ícone com o relógio de cooldown: a parte escura encolhe no sentido horário até a magia voltar. */
function CooldownSlot({ step, remaining, total, why, active, next }: { step: PlayerStep; remaining: number; total: number; why: string; active: boolean; next: boolean }) {
  const frac = total > 0 ? Math.min(1, remaining / total) : 0;
  return (
    <div className="flex flex-col items-center gap-0.5 w-[58px]" title={remaining > 0 ? `${step.name}: volta em ${remaining.toFixed(1)} s (${why})` : `${step.name}: pronta`}>
      <div
        className="relative w-[44px] h-[44px] rounded-sm overflow-hidden"
        style={{ outline: active ? "2px solid #ffd700" : next ? "2px dashed #7fd35b" : "1px solid #000", boxShadow: active ? "0 0 10px #ffd700" : undefined }}
      >
        {step.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={step.icon} alt="" width={44} height={44} style={{ imageRendering: "pixelated" }} />
        ) : (
          <div className="w-full h-full bg-black/60 text-[9px] leading-tight p-0.5">{step.name}</div>
        )}
        {frac > 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center font-bold text-[14px] text-white [text-shadow:0_1px_2px_#000]"
            style={{ background: `conic-gradient(transparent ${(1 - frac) * 360}deg, rgba(0,0,0,.72) 0)` }}
          >
            {Math.ceil(remaining - 1e-9)}
          </div>
        )}
      </div>
      <span className="text-[9px] leading-tight text-center text-white/80 line-clamp-2">{step.name}</span>
    </div>
  );
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

  // casts que já saíram nesta volta e, repetindo, os da volta anterior (o cooldown atravessa o fim do combo)
  const cast = ordered.filter((st) => st.t <= now + 1e-9);
  const past = loop && round > 0 ? ordered.map((st) => ({ ...st, t: st.t - end })) : [];
  const history = [...past, ...cast];
  const lastOf = (pred: (st: PlayerStep) => boolean) => {
    for (let i = history.length - 1; i >= 0; i--) if (pred(history[i])) return history[i];
    return null;
  };
  // uma casa por magia, na ordem em que aparece no combo
  const slots = ordered.filter((st, i) => ordered.findIndex((x) => x.id === st.id) === i);
  const slotState = (st: PlayerStep) => {
    const own = lastOf((x) => x.id === st.id);
    const ownRem = own && own.cd ? own.t + own.cd - now : 0;
    const grp = st.group ? lastOf((x) => x.group?.id === st.group!.id) : null;
    const grpRem = grp && grp.group ? grp.t + grp.group.cd - now : 0;
    if (grpRem > ownRem && grpRem > 0) return { remaining: grpRem, total: grp!.group!.cd, why: `grupo ${st.group!.label}` };
    return { remaining: Math.max(0, ownRem), total: own?.cd ?? 0, why: "cooldown próprio" };
  };
  const lastAny = history[history.length - 1] ?? null;
  const lock = lastAny?.lock ?? 2;
  const lockRem = lastAny ? Math.max(0, lastAny.t + lock - now) : 0;
  const nextStep = ordered.find((st) => st.t > now + 1e-9) ?? (loop ? { ...ordered[0], t: ordered[0].t + end } : null);

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

      {/* barra de magias: cooldown de cada uma, trava do grupo de ataque e a próxima da ordem */}
      <div className="mt-2 rounded bg-black/40 p-2">
        <div className="flex flex-wrap gap-1">
          {slots.map((st) => {
            const s = slotState(st);
            return <CooldownSlot key={st.id} step={st} {...s} active={cur?.id === st.id && now - (cur?.t ?? 0) < (cur?.lock ?? 2)} next={nextStep?.id === st.id} />;
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            Grupo de ataque
            <span className="relative inline-block w-[90px] h-[8px] rounded bg-white/15 overflow-hidden">
              <span className="absolute inset-y-0 left-0 bg-[#e0a33a]" style={{ width: `${(lockRem / lock) * 100}%` }} />
            </span>
            {lockRem > 0 ? `${lockRem.toFixed(1).replace(".", ",")} s` : "livre"}
          </span>
          {nextStep && (
            <span>
              Próxima: <b>{nextStep.name}</b> em {Math.max(0, nextStep.t - now).toFixed(1).replace(".", ",")} s
            </span>
          )}
        </div>
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
      <p className="mt-1 text-[10px] text-white/50">
        Animações: TibiaWiki. Cada quadrado do palco é um sqm. Na barra, o número é quantos segundos faltam para a magia voltar; a borda dourada é a
        que está saindo e a tracejada verde é a próxima do combo.
      </p>
    </div>
  );
}
