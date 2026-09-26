"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// os botões só leem os refs do motor no clique; o lint confunde isso com leitura durante o render
/* eslint-disable react-hooks/refs */
import SaveToChar from "@/components/SaveToChar";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CODE_PREFIX, QUARTER_COLOR, QUARTERS, VOC_NAMES, WodVoc, loadWodEngine, plain } from "@/lib/wod-engine";
import { WOD_BASIC, WOD_LARGE, WOD_MEDIUM, WOD_SMALL, formatGem, formatPerk, shortName, supremeEffect, supremeName } from "@/data/wod-strings";
import { WOD_PRESETS } from "@/data/wod-presets";
import { WheelConfig, encodeWheel } from "@/lib/wheel";
import WodCanvas, { Pick, Q } from "./WodCanvas";
import GemEditor from "./GemEditor";
import { GEM_ITEM } from "@/data/gem-data";
import { WodIcon } from "@/components/WodIcons";
import { wikiImage } from "@/lib/md5";
import type { WodVocId } from "@/data/wod-vocs";
import { Voc as ActiveVoc, getActive, setActiveVoc, useActive } from "@/lib/active";

const VOC_PT: Record<WodVoc, string> = { Knight: "Knight", Paladin: "Paladin", Sorcerer: "Sorcerer", Druid: "Druid", Monk: "Monk" };
const Q_PT: Record<string, string> = { TL: "Superior esquerdo", TR: "Superior direito", BL: "Inferior esquerdo", BR: "Inferior direito" };
const STAGE = ["bloqueada", "estágio 1", "estágio 2", "estágio 3"];
const CAT_PT: Record<number, string> = { 0: "Únicos", 1: "Skill", 2: "Leech", 3: "Augments", 4: "Vessel Resonance", 5: "Resistências" };
const LESSER_GEMS = ["Hit Points", "Mitigation", "Any Elemental Resistance", "Mana"];
const ROMAN = ["0", "I", "II", "III"];

interface Slice {
  id: string;
  mediumPerkId: number;
  smallPerkId: number;
  fillPercent: number;
  unlocked: boolean;
  editable: boolean;
  currentSkillPoints: number;
  maxSkillPoints: number;
  smallPerkPrimaryEffectValue: number;
  smallPerkPrimaryEffectIncrease: number;
  smallPerkSecondaryEffectValue: number;
  smallPerkSecondaryEffectIncrease: number;
  smallPerkHasSecondaryEffect: boolean;
  mediumPerkCategory: number;
  mediumPerkValue: number;
}

interface State {
  voc: WodVoc;
  code: string;
  spent: number;
  gridBonus: number;
  vesselBonus: number;
  momentum: number;
  slices: Record<string, Slice>;
  corners: any[];
  small: { id: number; value: number }[];
  medium: { id: number; value: number; category: number }[];
  gemBasic: { id: number; value: number }[];
  gemSupreme: { id: number; value: number }[];
  basic1: any[];
  basic2: any[];
  supremeAvail: number[];
}

/** Caixa no estilo das caixas "Selection" e "Information" do planner oficial. */
function WodBox({ title, children, className = "", id }: { title: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`border-2 border-[#5f4d41] rounded-[3px] bg-[#f1e0c6] shadow-[0_2px_4px_rgba(0,0,0,.35)] ${className}`}>
      <div className="bg-gradient-to-b from-[#6f5b4d] to-[#4e3d31] text-white font-bold text-[12px] px-2 py-1 border-b-2 border-[#3b2d23]">{title}</div>
      <div className="p-2 text-[12px] text-[#3a2a1a]">{children}</div>
    </div>
  );
}

/** Botão que repete enquanto está pressionado, como os +1/−1 do planner oficial. */
function HoldButton({ label, onFire, title, danger }: { label: string; onFire: (n: number) => void; title: string; danger?: boolean }) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  return (
    <button
      type="button"
      title={title}
      className={`tc-btn !py-0.5 !px-2 select-none ${danger ? "tc-btn-danger" : ""}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const n = (e.shiftKey ? 10 : 1) * (e.ctrlKey ? 100 : 1);
        onFire(n);
        let ticks = 0;
        stop();
        timer.current = setInterval(() => (ticks < 15 ? ticks++ : onFire(n)), 30);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFire(1);
        }
      }}
    >
      {label}
    </button>
  );
}

export default function WheelOfDestiny() {
  const engine = useRef<any>(null);
  const planner = useRef<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [st, setSt] = useState<State | null>(null);
  const [level, setLevel] = useState(896);
  const [extra, setExtra] = useState(0);
  const [pick, setPick] = useState<Pick>(null);
  const [hoverPick, setHoverPick] = useState<Pick>(null);
  const [importCode, setImportCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [onlyFit, setOnlyFit] = useState(true);

  const read = useCallback(() => {
    const M = engine.current;
    const P = planner.current;
    if (!M || !P) return;
    const tileName: Record<number, string> = {};
    for (const k of Object.keys(M.EGridTile)) if (M.EGridTile[k]?.value !== undefined) tileName[M.EGridTile[k].value] = k;
    const vocName: Record<number, WodVoc> = {};
    for (const v of VOC_NAMES) vocName[M.EActiveVocation[v].value] = v;
    const slices: Record<string, Slice> = {};
    for (const s of plain(P.getSkillParameters()) as Slice[]) slices[tileName[s.id as unknown as number]] = s;
    setSt({
      voc: vocName[plain(P.getVocation())],
      code: P.getCode(),
      spent: P.getSpentSkillPoints(),
      gridBonus: P.getGridDamageAndHealingBonus(),
      vesselBonus: P.getVesselsDamageAndHealingBonus(),
      momentum: P.getVesselsMomentumBonus(),
      slices,
      corners: plain(P.getCornerParameters()),
      small: plain(P.getSmallPerksSummary()),
      medium: plain(P.getMediumPerksSummary()),
      gemBasic: plain(P.getGemsBasicModEffectSummary()),
      gemSupreme: plain(P.getGemsSupremeModSummary()),
      basic1: plain(P.getAvailableBasicModsPos1()),
      basic2: plain(P.getAvailableBasicModsPos2()),
      supremeAvail: plain(P.getAvailableSupremeMods()),
    });
  }, []);

  // carrega o motor e o estado inicial da URL (?code=, ?level=, ?voc=)
  useEffect(() => {
    let alive = true;
    loadWodEngine()
      .then((M) => {
        if (!alive) return;
        engine.current = M;
        const u = new URLSearchParams(window.location.search);
        const code = u.get("code");
        const lv = Number(u.get("level"));
        // ?voc= aceita "knight" ou "Knight"; sem código nem vocação no link, usa a vocação ativa (barra do topo)
        const cap = (x: string) => (x ? x[0].toUpperCase() + x.slice(1).toLowerCase() : "") as WodVoc;
        const vocParam = cap(u.get("voc") ?? "");
        const active = getActive();
        const fromActive = active.voc ? cap(active.voc) : null;
        const explicit = (code && CODE_PREFIX[code[0]]) || (VOC_NAMES.includes(vocParam) ? vocParam : null);
        const voc: WodVoc = explicit || fromActive || "Sorcerer";
        if (explicit) setActiveVoc(explicit.toLowerCase() as ActiveVoc);
        if (lv > 0) setLevel(lv);
        else if (active.char && cap(active.char.vocation) === voc) setLevel(active.char.level);
        planner.current = new M.SkillwheelPlanner(M.EActiveVocation[voc]);
        if (code && !planner.current.updateByCode(code)) setMsg("O código da URL não é válido.");
        read();
      })
      .catch((e) => setErr(e.message));
    return () => {
      alive = false;
      try {
        planner.current?.delete?.();
      } catch {
        // já liberado
      }
    };
  }, [read]);

  // vocação trocada na barra do topo: a roda troca junto
  const activeVoc = useActive().voc;
  useEffect(() => {
    if (!st || !activeVoc || st.voc.toLowerCase() === activeVoc || !planner.current) return;
    const v = (activeVoc[0].toUpperCase() + activeVoc.slice(1)) as WodVoc;
    try {
      planner.current.setVocation(engine.current.EActiveVocation[v]);
    } catch {
      // motor ainda carregando
    }
    read();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVoc]);

  // mantém a URL com o código atual, para compartilhar
  useEffect(() => {
    if (!st) return;
    const u = new URL(window.location.href);
    u.searchParams.set("code", st.code);
    u.searchParams.set("level", String(level));
    u.searchParams.delete("voc");
    window.history.replaceState(null, "", u.toString());
  }, [st, level]);

  const available = Math.max(0, level - 50) + extra;

  const act = (fn: (P: any, M: any) => void) => {
    if (!planner.current) return;
    try {
      fn(planner.current, engine.current);
      setMsg(null);
    } catch (e: any) {
      setMsg(e?.message ?? "Operação não permitida.");
    }
    read();
  };
  const tile = (id: string) => engine.current.EGridTile[id];
  // lê a fatia direto do motor (os botões repetem mais rápido do que o React redesenha)
  const live = (id: string): Slice | null => {
    const M = engine.current;
    const P = planner.current;
    if (!M || !P) return null;
    const v = M.EGridTile[id]?.value;
    return (plain(P.getSkillParameters()) as Slice[]).find((s) => (s.id as unknown as number) === v) ?? null;
  };
  const room = () => available - (planner.current?.getSpentSkillPoints() ?? 0);

  // mesmas regras dos botões do planner oficial
  const plus = (id: string, n: number) =>
    act((P) => {
      const s = live(id);
      if (!s || s.fillPercent === 1) return;
      if (!s.unlocked) return setMsg("Esta fatia ainda está bloqueada: encha uma fatia vizinha mais perto do centro.");
      const k = Math.min(n, room());
      if (k <= 0) return setMsg("Sem pontos disponíveis para o seu level.");
      P.addToSkill(tile(id), k);
    });
  const minus = (id: string, n: number) =>
    act((P) => {
      const s = live(id);
      if (s && s.fillPercent !== 0 && s.editable) P.removeFromSkill(tile(id), n);
    });
  const plusMax = (id: string) =>
    act((P) => {
      const s = live(id);
      if (!s || s.fillPercent === 1 || !s.unlocked) return;
      const k = Math.min(s.maxSkillPoints - s.currentSkillPoints, room());
      if (k <= 0) return setMsg("Sem pontos disponíveis para o seu level.");
      P.addToSkill(tile(id), k);
    });
  const minusMax = (id: string) =>
    act((P) => {
      const s = live(id);
      if (s && s.fillPercent !== 0 && s.editable) P.clearSkill(tile(id));
    });
  const rightClick = (id: string, n: number) =>
    act((P) => {
      const s = live(id);
      if (!s) return;
      const r = room();
      const k = r <= 0 ? -1 : n > 0 ? Math.min(n, r) : Math.min(s.maxSkillPoints - s.currentSkillPoints, r);
      P.onGridTileRightClicked(tile(id), k);
    });

  const setVoc = (v: WodVoc) => {
    setActiveVoc(v.toLowerCase() as ActiveVoc);
    act((P, M) => {
      P.setVocation(M.EActiveVocation[v]);
    });
  };
  const loadCode = (code: string) =>
    act((P, M) => {
      const c = code.trim().replace(/^.*code=/, "").split("&")[0];
      const voc = CODE_PREFIX[c[0]];
      if (voc) {
        P.setVocation(M.EActiveVocation[voc]);
        setActiveVoc(voc.toLowerCase() as ActiveVoc);
      }
      if (!P.updateByCode(c)) throw new Error("Código inválido.");
    });
  const resetAll = () => {
    const M = engine.current;
    if (!M) return;
    try {
      planner.current?.delete?.();
    } catch {
      // já liberado
    }
    planner.current = new M.SkillwheelPlanner(M.EActiveVocation[st?.voc ?? "Sorcerer"]);
    setMsg(null);
    read();
  };
  const modChange = (pos: number, value: number, q: string) => act((P, M) => P.onModChange(pos, value, M.EQuarter[q]));

  const presets = st ? WOD_PRESETS[st.voc.toLowerCase()] : null;

  // envia para o simulador de dano do sorcerer
  const simLink = useMemo(() => {
    if (!st || st.voc !== "Sorcerer") return null;
    const pts: Record<string, number> = {};
    for (const c of st.corners) pts[QUARTERS[c.id]] = c.currentSkillPoints;
    const lvl = (id: number) => (st.medium.find((m) => m.id === id)?.value ?? 0) as 0 | 1 | 2;
    const SUP_MAP: Record<number, string> = { 5: "rm-tl", 57: "rm-tr", 58: "rm-bl", 56: "rm-br", 54: "base-great-energy-beam", 44: "base-great-death-beam", 48: "base-energy-wave", 50: "base-great-fire-wave", 46: "base-hells-core", 52: "base-rage-of-the-skies", 55: "crit-great-energy-beam", 45: "crit-great-death-beam", 49: "crit-energy-wave", 51: "crit-great-fire-wave", 47: "crit-hells-core", 53: "crit-rage-of-the-skies", 43: "cd-energy-wave", 42: "cd-avatar", 1: "general-crit" };
    const w: WheelConfig = {
      level,
      extraPoints: extra,
      points: { tl: pts.TL ?? 0, tr: pts.TR ?? 0, bl: pts.BL ?? 0, br: pts.BR ?? 0 },
      augments: { greatFireWave: lvl(24), energyWave: lvl(25), deathEcho: lvl(36), specialSpells: lvl(26), focusSpells: lvl(27) },
      focusMastery: st.medium.some((m) => m.id === 23),
      gems: st.corners.filter((c) => c.keySupremeMod >= 0 && SUP_MAP[c.keySupremeMod]).map((c) => ({ supreme: SUP_MAP[c.keySupremeMod], grade: 1 as const })),
    };
    return `/simulador?level=${level}&wheel=${encodeWheel(w)}`;
  }, [st, level, extra]);

  if (err) return <p className="bad">{err} Tente recarregar a página.</p>;
  if (!st) return <p>Carregando o motor oficial da Wheel...</p>;

  const left = available - st.spent;
  const officialUrl = `https://www.tibia.com/community/?subtopic=wheelofdestinyplanner&code=${st.code}`;
  const cornerOf = (q: Q) => st.corners.find((c) => QUARTERS[c.id] === q);

  const gemEditor = (c: any) => (
    <GemEditor
      key={`${st.voc}-${c.id}`}
      c={c}
      voc={st.voc.toLowerCase() as WodVocId}
      basic1={st.basic1}
      basic2={st.basic2}
      supremeAvail={st.supremeAvail}
      modChange={(pos, value) => modChange(pos, value, QUARTERS[c.id])}
    />
  );

  /** Conteúdo das caixas Seleção e Informação, como no planner oficial. */
  const detail = (p: Pick, full: boolean) => {
    if (!p) return null;
    if (p.kind === "slice") {
      const s = st.slices[p.id];
      if (!s) return null;
      const small = WOD_SMALL[s.smallPerkId];
      const med = WOD_MEDIUM[s.mediumPerkId];
      const pct = s.maxSkillPoints ? s.currentSkillPoints / s.maxSkillPoints : 0;
      return (
        <div className="space-y-2">
          <div className="relative h-[18px] border border-[#5f4d41] bg-[#3b2d23] rounded-[2px] overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-b from-[#c8a24a] to-[#8a6420] transition-[width] duration-200" style={{ width: `${pct * 100}%` }} />
            <div className="absolute inset-0 grid place-items-center text-white text-[11px] font-bold [text-shadow:0_1px_1px_#000]">
              {s.currentSkillPoints}/{s.maxSkillPoints}
            </div>
          </div>
          {!s.unlocked && <div className="bad text-[11px]">Bloqueada: encha uma fatia vizinha mais perto do centro.</div>}
          <div className={s.currentSkillPoints === 0 ? "opacity-60" : ""}>
            <div className="font-bold">Dedication Perk</div>
            <div>
              {formatPerk(small?.[1] ?? "", s.smallPerkPrimaryEffectValue)} {small?.[0]}
              {s.smallPerkHasSecondaryEffect ? ` · ${formatPerk("PlusInteger", s.smallPerkSecondaryEffectValue)} Mana` : ""}
            </div>
            {full && (
              <div className="muted text-[11px]">
                Por ponto: {formatPerk(small?.[1] ?? "", s.smallPerkPrimaryEffectIncrease)} {small?.[0]}
                {s.smallPerkHasSecondaryEffect ? ` e ${formatPerk("PlusInteger", s.smallPerkSecondaryEffectIncrease)} Mana` : ""}
              </div>
            )}
          </div>
          {med && (
            <div className={s.fillPercent < 1 ? "opacity-60" : ""}>
              <div className="font-bold">Conviction Perk {s.fillPercent < 1 && <span className="font-normal muted">(fatia cheia)</span>}</div>
              <div>
                {med[1] === "RomanNumerals" ? "" : `${formatPerk(med[1], s.mediumPerkValue)} `}
                {med[0]}
              </div>
              {med[2] && (
                <div className="text-[11px]">
                  I: {med[2]} · II: {med[3]}
                </div>
              )}
              {med[4] && <div className="text-[11px] muted">{med[4]}</div>}
            </div>
          )}
          {full && (
            <div className="flex flex-wrap gap-1 pt-1">
              <HoldButton label="« Máx" title="Esvaziar a fatia" danger onFire={() => minusMax(p.id)} />
              <HoldButton label="− 1" title="Tirar 1 ponto (Shift: 10, Ctrl: 100); segure para repetir" danger onFire={(n) => minus(p.id, n)} />
              <HoldButton label="+ 1" title="Pôr 1 ponto (Shift: 10, Ctrl: 100); segure para repetir" onFire={(n) => plus(p.id, n)} />
              <HoldButton label="Máx »" title="Encher a fatia" onFire={() => plusMax(p.id)} />
            </div>
          )}
        </div>
      );
    }
    const c = cornerOf(p.q);
    if (!c) return null;
    if (p.kind === "vessel") {
      const lp = WOD_LARGE[c.largePerkId];
      return (
        <div className="space-y-1">
          <div className="font-bold">Revelation Perk</div>
          <div className={c.level === 0 ? "opacity-60" : ""}>
            <b>{lp?.[0]}</b> ({STAGE[c.level]})
            <div>{lp?.[1]}</div>
            {full && <div className="text-[11px] muted mt-1">{lp?.[2]}</div>}
          </div>
          <div className="text-[11px]">
            {c.currentSkillPoints} pontos no domínio {Q_PT[p.q].toLowerCase()}.
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <div className="font-bold">Gema do vessel · Vessel Resonance {c.vesselLevel ? ROMAN[c.vesselLevel] : "nenhum"}</div>
        {full ? gemEditor(c) : <div className="muted">{c.hasGem ? "Gema encaixada. Clique no encaixe para trocar." : "Clique no encaixe para escolher a gema."}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        {VOC_NAMES.map((v) => (
          <button key={v} type="button" className={`tc-btn ${st.voc === v ? "" : "opacity-60"}`} onClick={() => setVoc(v)}>
            {VOC_PT[v]}
          </button>
        ))}
        <label className="text-[12px] ml-2">
          <span className="font-bold block">Level</span>
          <input type="number" className="w-24" value={level} min={51} onChange={(e) => setLevel(Number(e.target.value) || 0)} />
        </label>
        <label className="text-[12px]">
          <span className="font-bold block">Pontos extras</span>
          <input type="number" className="w-20" value={extra} min={0} onChange={(e) => setExtra(Number(e.target.value) || 0)} title="gemas com grau IV, quests e outros" />
        </label>
        <div className="text-[12px] border border-[#b98a5a] rounded px-3 py-1 bg-white/40">
          Pontos: <b className={left < 0 ? "bad" : ""}>{st.spent}</b> de {available} · sobram <b>{left}</b>
        </div>
        <div className="text-[12px] border border-[#b98a5a] rounded px-3 py-1 bg-white/40">
          Dano e cura: <b>+{st.gridBonus + st.vesselBonus}</b>
          {st.momentum ? ` · momentum +${st.momentum}%` : ""}
        </div>
      </div>
      {msg && <p className="warn text-[12px]">{msg}</p>}

      <div className="rounded-[4px] border-2 border-[#5f4d41] bg-[#d4c0a1] p-1 sm:p-3 -mx-2 sm:mx-0">
        <div className="grid gap-3 lg:grid-cols-[230px_minmax(0,522px)] 2xl:grid-cols-[230px_522px_minmax(0,1fr)] items-start justify-center">
          <div className="space-y-3 order-2 lg:order-1">
            <WodBox title="Seleção" className="lg:min-h-[170px]" id="wod-selecao">
              {detail(pick, true) ?? <span className="muted">Selecione uma fatia...</span>}
            </WodBox>
            <WodBox title="Informação" className="hidden lg:block min-h-[170px]">
              {detail(hoverPick, false) ?? <span className="muted">Passe o mouse sobre uma fatia...</span>}
              <div className="muted text-[11px] mt-2">Encha ou esvazie uma fatia com o botão direito (no celular, toque longo).</div>
            </WodBox>
          </div>
          <div className="order-1 lg:order-2">
            <WodCanvas
              voc={st.voc}
              slices={st.slices}
              corners={st.corners}
              selected={pick}
              onSelect={setPick}
              onHover={setHoverPick}
              onRightClick={rightClick}
            />
            <p className="lg:hidden muted text-[11px] text-center mt-1">Toque numa fatia para ver e ajustar os pontos. Toque longo enche ou esvazia a fatia.</p>
          </div>
          <div className="order-3 lg:col-span-2 2xl:col-span-1 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
            <WodBox title="Revelation Perks">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td>Dano e cura</td>
                    <td className="text-right font-bold">+{st.gridBonus + st.vesselBonus}</td>
                  </tr>
                  {st.corners.map((c) => {
                    const lp = WOD_LARGE[c.largePerkId];
                    return (
                      <tr key={c.id} className="cursor-pointer" onClick={() => setPick({ kind: "vessel", q: QUARTERS[c.id] as Q })}>
                        <td>
                          <b style={{ color: QUARTER_COLOR[QUARTERS[c.id]] }}>●</b> {lp?.[0]}
                        </td>
                        <td className="text-right">{c.level > 0 ? STAGE[c.level] : "bloqueada"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </WodBox>
            <WodBox title="Dedication e Conviction">
              <div>
                {st.small.map((s) => (
                  <div key={s.id} className="flex justify-between gap-2">
                    <span>{WOD_SMALL[s.id]?.[0]}</span>
                    <b>{formatPerk(WOD_SMALL[s.id]?.[1] ?? "", s.value)}</b>
                  </div>
                ))}
              </div>
              {[3, 1, 2, 5, 0, 4].map((cat) => {
                const items = st.medium.filter((m) => m.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat} className="mt-2">
                    <div className="muted text-[11px]">{CAT_PT[cat]}</div>
                    {items.map((m) => {
                      const info = WOD_MEDIUM[m.id];
                      return (
                        <div key={m.id} className="flex justify-between gap-2" title={info?.[2] ? `I: ${info[2]} · II: ${info[3]}` : info?.[4]}>
                          <span>{shortName(info?.[0] ?? String(m.id))}</span>
                          <b>{formatPerk(info?.[1] ?? "", m.value)}</b>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {(st.gemBasic.length > 0 || st.gemSupreme.length > 0) && (
                <div className="mt-2">
                  <div className="muted text-[11px]">Gemas</div>
                  {st.gemBasic.map((g) => (
                    <div key={`b${g.id}`} className="flex justify-between gap-2">
                      <span>{WOD_BASIC[g.id]?.[0]}</span>
                      <b>{formatGem(WOD_BASIC[g.id]?.[1] ?? "", g.value)}</b>
                    </div>
                  ))}
                  {st.gemSupreme.map((g) => (
                    <div key={`s${g.id}`} className="flex justify-between gap-2">
                      <span>{shortName(supremeName(g.id))}</span>
                      <b>{supremeEffect(g.id)}</b>
                    </div>
                  ))}
                </div>
              )}
            </WodBox>
          </div>
        </div>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <div className="font-bold text-[#3a1a00] mb-2">Gemas nos vessels</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {st.corners.map((c) => {
            const q = QUARTERS[c.id];
            const n = (c.keyBasicMod1 >= 0 ? 1 : 0) + (c.keyBasicMod2 >= 0 ? 1 : 0) + (c.keySupremeMod >= 0 ? 1 : 0);
            const gemName = n ? `${["Lesser ", "", "Greater "][n - 1]}${GEM_ITEM[st.voc.toLowerCase() as WodVocId]} Gem` : null;
            return (
              <div key={q} className="text-[12px] border rounded p-2 bg-white/50" style={{ borderColor: QUARTER_COLOR[q] }}>
                <div className="font-bold" style={{ color: QUARTER_COLOR[q] }}>
                  {Q_PT[q]}
                </div>
                <div className="muted text-[11px]">Vessel Resonance {c.vesselLevel ? ROMAN[c.vesselLevel] : "nenhum"}</div>
                <div className="flex items-center gap-1 my-1 min-h-[34px]">
                  {gemName ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={wikiImage(gemName)} alt={gemName} title={gemName} width={32} height={32} style={{ imageRendering: "pixelated" }} />
                  ) : (
                    <span className="muted text-[11px]">sem gema</span>
                  )}
                  {c.keyBasicMod1 >= 0 && <WodIcon sheet="basic" index={c.keyBasicMod1} size={26} />}
                  {c.keyBasicMod2 >= 0 && <WodIcon sheet="basic" index={c.keyBasicMod2} size={26} />}
                  {c.keySupremeMod >= 0 && <WodIcon sheet="supreme" index={c.keySupremeMod} size={26} title={supremeName(c.keySupremeMod)} />}
                </div>
                <button
                  type="button"
                  className="tc-btn !py-0.5"
                  onClick={() => {
                    setPick({ kind: "socket", q: q as Q });
                    document.getElementById("wod-selecao")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  {gemName ? "trocar a gema" : "encaixar gema"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/40 text-[12px] space-y-2">
        <div className="font-bold text-[#3a1a00]">Código</div>
        <div className="flex flex-wrap gap-2 items-center">
          <code className="bg-white/70 px-2 py-0.5 rounded break-all">{st.code}</code>
          <button type="button" className="tc-btn !py-0.5" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => setMsg("Link copiado."))}>
            copiar link
          </button>
          <a className="tc-btn !py-0.5" href={officialUrl} target="_blank" rel="noreferrer">
            abrir no tibia.com
          </a>
          {simLink && (
            <a className="tc-btn !py-0.5" href={simLink}>
              usar no simulador de dano
            </a>
          )}
          <button type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={resetAll}>
            zerar
          </button>
        </div>
        <SaveToChar voc={st.voc.toLowerCase() as ActiveVoc} field="wheel_code" value={st.code} what="a roda" />
        <div className="flex flex-wrap gap-2">
          <input value={importCode} onChange={(e) => setImportCode(e.target.value)} placeholder="cole um código ou link do planner do tibia.com" className="flex-1 min-w-[240px]" />
          <button type="button" className="tc-btn" onClick={() => importCode && loadCode(importCode)}>
            importar
          </button>
        </div>
        <p className="muted text-[11px]">O código é o mesmo do planner oficial: abre igual no tibia.com e aqui.</p>
      </div>

      {presets && (
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="flex flex-wrap justify-between gap-2 items-center mb-2">
            <div className="font-bold text-[#3a1a00]">Builds prontas de {VOC_PT[st.voc]}</div>
            <label className="text-[12px] flex items-center gap-1">
              <input type="checkbox" checked={onlyFit} onChange={(e) => setOnlyFit(e.target.checked)} /> só as que cabem nos meus pontos ({available})
            </label>
          </div>
          <div className="text-[11px] mb-2">
            <b>Gemas pequenas:</b> {presets.gems.filter((g) => LESSER_GEMS.includes(g)).join(", ")} · <b>Greater gems:</b> {presets.gems.filter((g) => !LESSER_GEMS.includes(g)).join(", ")}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {presets.builds
              .filter((b) => !onlyFit || b.points <= available)
              .slice()
              .sort((a, b) => b.points - a.points)
              .map((b) => (
                <button key={b.code} type="button" onClick={() => loadCode(b.code)} className={`text-left border rounded p-2 text-[12px] ${st.code === b.code ? "border-[#3a1a00] bg-[#f3e2bd]" : "border-[#b98a5a] bg-white/60 hover:bg-white/90"}`}>
                  <b>{b.points} pontos</b>
                  {b.notes && <span className="tag tag-energy ml-2">{b.notes}</span>}
                  <div>{b.desc}</div>
                </button>
              ))}
          </div>
          <p className="muted text-[10px] mt-2">Builds do TibiaPal (tibiapal.com/wheels), consulta em 26/09/2026. &quot;1x Gem&quot; nas descrições indica onde encaixar gema; confira as gemas nos vessels.</p>
        </div>
      )}

      <p className="muted text-[10px]">
        Os números da roda vêm do motor oficial da CipSoft, o mesmo do planner do tibia.com, carregado direto de static.tibia.com. Textos dos perks
        como no planner oficial.
      </p>
    </div>
  );
}
