"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CODE_PREFIX, QUARTER_COLOR, QUARTERS, VOC_NAMES, WOD_SLICES, WodVoc, loadWodEngine, plain } from "@/lib/wod-engine";
import { WOD_BASIC, WOD_LARGE, WOD_MEDIUM, WOD_SMALL, formatGem, formatPerk, shortName, supremeEffect, supremeName } from "@/data/wod-strings";
import { WOD_PRESETS } from "@/data/wod-presets";
import { WheelConfig, encodeWheel } from "@/lib/wheel";

const VOC_PT: Record<WodVoc, string> = { Knight: "Knight", Paladin: "Paladin", Sorcerer: "Sorcerer", Druid: "Druid", Monk: "Monk" };
const Q_PT: Record<string, string> = { TL: "Superior esquerdo", TR: "Superior direito", BL: "Inferior esquerdo", BR: "Inferior direito" };
const STAGE = ["bloqueada", "estágio 1", "estágio 2", "estágio 3"];
const CAT_PT: Record<number, string> = { 0: "Únicos", 1: "Skill", 2: "Leech", 3: "Augments", 4: "Vessel Resonance", 5: "Resistências" };
const LESSER_GEMS = ["Hit Points", "Mitigation", "Any Elemental Resistance", "Mana"];

const C = 261;
const R0 = 50;
const RW = 42;

function arc(r0: number, r1: number, a0: number, a1: number): string {
  const rad = (a: number) => (a * Math.PI) / 180;
  const p = (r: number, a: number) => `${(C + r * Math.cos(rad(a))).toFixed(2)} ${(C + r * Math.sin(rad(a))).toFixed(2)}`;
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
}

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

export default function WheelOfDestiny() {
  const engine = useRef<any>(null);
  const planner = useRef<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [st, setSt] = useState<State | null>(null);
  const [level, setLevel] = useState(896);
  const [extra, setExtra] = useState(0);
  const [selected, setSelected] = useState<string>("QTR0");
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
        if (lv > 0) setLevel(lv);
        const vocParam = (u.get("voc") ?? "") as WodVoc;
        const voc: WodVoc = (code && CODE_PREFIX[code[0]]) || (VOC_NAMES.includes(vocParam) ? vocParam : "Sorcerer");
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
  const left = st ? available - st.spent : 0;

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

  const add = (n: number) =>
    act((P) => {
      const s = st?.slices[selected];
      if (!s || !s.unlocked) return setMsg("Esta fatia ainda está bloqueada: encha uma fatia vizinha mais perto do centro.");
      const k = Math.min(n, left, s.maxSkillPoints - s.currentSkillPoints);
      if (k <= 0) return setMsg(left <= 0 ? "Sem pontos disponíveis para o seu level." : "Fatia cheia.");
      P.addToSkill(tile(selected), k);
    });
  const remove = (n: number) => act((P) => P.removeFromSkill(tile(selected), n));
  const fill = () => add(10000);
  const clear = () => act((P) => P.clearSkill(tile(selected)));

  const setVoc = (v: WodVoc) =>
    act((P, M) => {
      P.setVocation(M.EActiveVocation[v]);
    });
  const loadCode = (code: string) =>
    act((P, M) => {
      const c = code.trim().replace(/^.*code=/, "").split("&")[0];
      const voc = CODE_PREFIX[c[0]];
      if (voc) P.setVocation(M.EActiveVocation[voc]);
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

  const sel = st?.slices[selected];
  const medInfo = sel ? WOD_MEDIUM[sel.mediumPerkId] : null;
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

  const officialUrl = `https://www.tibia.com/community/?subtopic=wheelofdestinyplanner&code=${st.code}`;

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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,560px)_1fr]">
        <div>
          <svg viewBox="0 0 522 522" className="w-full max-w-[560px] select-none" onContextMenu={(e) => e.preventDefault()}>
            <circle cx={C} cy={C} r={R0 + 5 * RW + 2} fill="#1b140f" />
            {WOD_SLICES.map((g) => {
              const s = st.slices[g.id];
              if (!s) return null;
              const r0 = R0 + g.ring * RW;
              const r1 = r0 + RW;
              const color = QUARTER_COLOR[g.q];
              const full = s.fillPercent >= 1;
              const isSel = selected === g.id;
              const mid = ((g.a0 + g.a1) / 2) * (Math.PI / 180);
              const rm = (r0 + r1) / 2;
              const med = WOD_MEDIUM[s.mediumPerkId];
              return (
                <g
                  key={g.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(g.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelected(g.id);
                    act((P) => (s.fillPercent > 0 ? P.clearSkill(tile(g.id)) : s.unlocked && P.addToSkill(tile(g.id), Math.min(left, s.maxSkillPoints))));
                  }}
                >
                  <title>{`${med ? shortName(med[0]) : "?"} · ${s.currentSkillPoints}/${s.maxSkillPoints}${s.unlocked ? "" : " (bloqueada)"}`}</title>
                  <path d={arc(r0, r1, g.a0, g.a1)} fill={s.unlocked ? `${color}55` : "#3a342e"} stroke={isSel ? "#f3d27a" : "#0d0906"} strokeWidth={isSel ? 3 : 1.5} />
                  {s.fillPercent > 0 && <path d={arc(r0, r0 + (r1 - r0) * s.fillPercent, g.a0, g.a1)} fill={full ? color : `${color}cc`} pointerEvents="none" />}
                  <text x={C + rm * Math.cos(mid)} y={C + rm * Math.sin(mid) + 3} textAnchor="middle" fontSize={g.ring === 4 ? 11 : 9} fill={s.unlocked ? "#fff" : "#9a9088"} pointerEvents="none">
                    {s.currentSkillPoints}/{s.maxSkillPoints}
                  </text>
                </g>
              );
            })}
            {st.corners.map((c) => {
              const q = QUARTERS[c.id];
              const ang = { TL: 225, TR: 315, BL: 135, BR: 45 }[q] * (Math.PI / 180);
              const x = C + 305 * Math.cos(ang);
              const y = C + 305 * Math.sin(ang);
              const lp = WOD_LARGE[c.largePerkId];
              return (
                <g key={q}>
                  <circle cx={x} cy={y} r={24} fill={c.level > 0 ? QUARTER_COLOR[q] : "#3a342e"} stroke="#f3d27a" strokeWidth={c.level > 0 ? 2 : 0.5} />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#fff">
                    {c.level > 0 ? c.level : "-"}
                  </text>
                  <title>{`${lp?.[0] ?? ""}: ${STAGE[c.level]} (${c.currentSkillPoints} pontos no domínio)`}</title>
                </g>
              );
            })}
            <circle cx={C} cy={C} r={R0 - 4} fill="#2a1d14" stroke="#b98a5a" />
            <text x={C} y={C - 4} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#f3d27a">
              +{st.gridBonus + st.vesselBonus}
            </text>
            <text x={C} y={C + 14} textAnchor="middle" fontSize={9} fill="#e8dcc8">
              dano e cura
            </text>
          </svg>
          <p className="muted text-[11px]">Clique numa fatia para selecionar. Botão direito enche ou esvazia a fatia. O número no canto é o estágio da revelation do domínio.</p>
        </div>

        <div className="space-y-3">
          {sel && (
            <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
              <div className="font-bold text-[#3a1a00]">
                Fatia selecionada · {Q_PT[WOD_SLICES.find((g) => g.id === selected)?.q ?? "TL"]}
              </div>
              <div className="text-[12px] mt-1">
                Pontos: <b>{sel.currentSkillPoints}</b> de {sel.maxSkillPoints} {sel.unlocked ? "" : <span className="bad">(bloqueada)</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {[1, 10, 50].map((n) => (
                  <button key={n} type="button" className="tc-btn !py-0.5" onClick={() => add(n)}>
                    +{n}
                  </button>
                ))}
                <button type="button" className="tc-btn !py-0.5" onClick={fill}>
                  encher
                </button>
                {[1, 10].map((n) => (
                  <button key={n} type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={() => remove(n)}>
                    −{n}
                  </button>
                ))}
                <button type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={clear}>
                  esvaziar
                </button>
              </div>
              <div className="text-[12px] mt-2">
                <b>Dedication:</b> {WOD_SMALL[sel.smallPerkId]?.[0]} {formatPerk(WOD_SMALL[sel.smallPerkId]?.[1] ?? "", sel.smallPerkPrimaryEffectIncrease)} por ponto
                {sel.smallPerkHasSecondaryEffect ? ` e Mana ${formatPerk("PlusInteger", sel.smallPerkSecondaryEffectIncrease)} por ponto` : ""}
              </div>
              {medInfo && (
                <div className="text-[12px] mt-1">
                  <b>Conviction (fatia cheia):</b> {medInfo[0]} {medInfo[1] === "RomanNumerals" ? "" : formatPerk(medInfo[1], sel.mediumPerkValue)}
                  {medInfo[2] && (
                    <div className="text-[11px]">
                      I: {medInfo[2]} · II: {medInfo[3]}
                    </div>
                  )}
                  {medInfo[4] && <div className="text-[11px] muted">{medInfo[4]}</div>}
                </div>
              )}
            </div>
          )}

          <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
            <div className="font-bold text-[#3a1a00] mb-1">Revelations</div>
            {st.corners.map((c) => {
              const lp = WOD_LARGE[c.largePerkId];
              return (
                <div key={c.id} className="text-[12px] mb-1">
                  <b style={{ color: QUARTER_COLOR[QUARTERS[c.id]] }}>●</b> <b>{lp?.[0]}</b>: {STAGE[c.level]} · {c.currentSkillPoints} pontos
                  {c.level > 0 && <div className="text-[11px] muted">{lp?.[2]}</div>}
                </div>
              );
            })}
          </div>

          <div className="border border-[#b98a5a] rounded p-3 bg-white/40 text-[12px]">
            <div className="font-bold text-[#3a1a00] mb-1">Resumo</div>
            <div>
              {st.small.map((s) => (
                <span key={s.id} className="mr-3">
                  {WOD_SMALL[s.id]?.[0]} <b>{formatPerk(WOD_SMALL[s.id]?.[1] ?? "", s.value)}</b>
                </span>
              ))}
            </div>
            {[3, 1, 2, 5, 0, 4].map((cat) => {
              const items = st.medium.filter((m) => m.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="mt-1">
                  <span className="muted">{CAT_PT[cat]}: </span>
                  {items.map((m) => {
                    const info = WOD_MEDIUM[m.id];
                    return (
                      <span key={m.id} className="mr-3" title={info?.[2] ? `I: ${info[2]} · II: ${info[3]}` : info?.[4]}>
                        {shortName(info?.[0] ?? String(m.id))} <b>{formatPerk(info?.[1] ?? "", m.value)}</b>
                      </span>
                    );
                  })}
                </div>
              );
            })}
            {(st.gemBasic.length > 0 || st.gemSupreme.length > 0) && (
              <div className="mt-1">
                <span className="muted">Gemas: </span>
                {st.gemBasic.map((g) => (
                  <span key={`b${g.id}`} className="mr-3">
                    {WOD_BASIC[g.id]?.[0]} <b>{formatGem(WOD_BASIC[g.id]?.[1] ?? "", g.value)}</b>
                  </span>
                ))}
                {st.gemSupreme.map((g) => (
                  <span key={`s${g.id}`} className="mr-3">
                    {shortName(supremeName(g.id))} <b>{supremeEffect(g.id)}</b>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <div className="font-bold text-[#3a1a00] mb-2">Gemas nos vessels</div>
        <div className="grid gap-3 md:grid-cols-2">
          {st.corners.map((c) => {
            const q = QUARTERS[c.id];
            const vl = c.vesselLevel;
            return (
              <div key={q} className="text-[12px]">
                <div className="font-bold" style={{ color: QUARTER_COLOR[q] }}>
                  {Q_PT[q]} · Vessel Resonance {["0", "I", "II", "III"][vl] ?? vl}
                </div>
                {vl === 0 ? (
                  <p className="muted">Sem Vessel Resonance: encha as fatias de VR deste domínio para liberar gema.</p>
                ) : (
                  <div className="space-y-1 mt-1">
                    <select className="w-full" value={c.keyBasicMod1} onChange={(e) => modChange(1, Number(e.target.value), q)}>
                      <option value={-1}>mod básico 1: nenhum</option>
                      {st.basic1.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.effects.map((e: any) => `${WOD_BASIC[e.id]?.[0]} ${formatGem(WOD_BASIC[e.id]?.[1] ?? "", e.value)}`).join(" / ")}
                        </option>
                      ))}
                    </select>
                    {vl >= 2 && c.keyBasicMod1 >= 0 && (
                      <select className="w-full" value={c.keyBasicMod2} onChange={(e) => modChange(2, Number(e.target.value), q)}>
                        <option value={-1}>mod básico 2: nenhum</option>
                        {st.basic2.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.effects.map((e: any) => `${WOD_BASIC[e.id]?.[0]} ${formatGem(WOD_BASIC[e.id]?.[1] ?? "", e.value)}`).join(" / ")}
                          </option>
                        ))}
                      </select>
                    )}
                    {vl >= 3 && c.keyBasicMod2 >= 0 && (
                      <select className="w-full" value={c.keySupremeMod} onChange={(e) => modChange(3, Number(e.target.value), q)}>
                        <option value={-1}>mod supremo: nenhum</option>
                        {st.supremeAvail.map((id) => (
                          <option key={id} value={id}>
                            {shortName(supremeName(id))}: {supremeEffect(id)}
                          </option>
                        ))}
                      </select>
                    )}
                    {c.hasGem && <p className="muted text-[11px]">Bônus do vessel: +{c.vesselDamageHealingBonus} de dano e cura.</p>}
                  </div>
                )}
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
