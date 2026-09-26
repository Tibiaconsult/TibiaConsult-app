"use client";

import SaveToChar from "@/components/SaveToChar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ELEMENT_LABEL } from "@/data/spells";
import { VOCATIONS, VocId } from "@/data/vocations";
import { ComboOptions, ComboStep, autoTime, comboCooldown, decodeCombo, encodeCombo, validateCombo } from "@/lib/combo";

const icon = (i: string) => `https://static.tibia.com/images/library/${i}.png`;

/** Montador de combos de druid, knight, paladin e monk, com validação de cooldown e linha do tempo. */
export default function ComboBuilder({ voc }: { voc: VocId }) {
  const v = VOCATIONS[voc];
  const spells = v.spells;
  const [steps, setSteps] = useState<ComboStep[]>([]);
  const [opts, setOpts] = useState<ComboOptions>({ stage: 3, augments: {} });
  const [copied, setCopied] = useState(false);

  // ?combo= (link compartilhado) e ?add= (vindo da tabela de cooldowns)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const base = decodeCombo(u.get("combo")) ?? [];
    const add = u.get("add");
    if (add && spells.some((s) => s.id === add)) {
      const last = base.reduce((m, s) => Math.max(m, s.t), -2);
      base.push({ t: last + 2, spellId: add });
    }
    if (base.length) setSteps(base);
  }, [spells]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const conflicts = useMemo(() => validateCombo(steps, spells, v.augments, opts), [steps, spells, v.augments, opts]);
  const ordered = useMemo(() => steps.map((s, i) => ({ ...s, i })).sort((a, b) => a.t - b.t), [steps]);
  const byId = (id: string) => spells.find((s) => s.id === id);
  const end = ordered.reduce((m, s) => Math.max(m, s.t + (byId(s.spellId)?.lock ?? 2)), 0);
  const mana = steps.reduce((a, s) => a + (byId(s.spellId)?.mana ?? 0), 0);
  const cdAugs = v.augments.filter((a) => a.fx.t1.cd || a.fx.t2.cd);
  const staged = spells.some((s) => s.stageCooldown);

  const update = (i: number, patch: Partial<ComboStep>) => setSteps((p) => p.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const add = (id = spells.find((s) => !s.rune)?.id ?? spells[0].id) => {
    const last = steps.reduce((m, s) => Math.max(m, s.t), -2);
    setSteps((p) => [...p, { t: last + 2, spellId: id }]);
  };
  const share = () => {
    const u = new URL(window.location.href);
    u.search = `?voc=${voc}&combo=${encodeCombo(steps)}`;
    return u.toString();
  };

  return (
    <div className="space-y-4 text-[12px]">
      <div className="flex flex-wrap gap-4 items-end">
        {staged && (
          <label>
            <span className="font-bold block">Estágio das revelations</span>
            <select value={opts.stage} onChange={(e) => setOpts({ ...opts, stage: Number(e.target.value) as 1 | 2 | 3 })}>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  estágio {n}
                </option>
              ))}
            </select>
          </label>
        )}
        {cdAugs.map((a) => (
          <label key={a.spell}>
            <span className="font-bold block">Augment {a.label}</span>
            <select value={opts.augments[a.spell] ?? 0} onChange={(e) => setOpts({ ...opts, augments: { ...opts.augments, [a.spell]: Number(e.target.value) } })}>
              <option value={0}>nenhum</option>
              <option value={1}>I: {a.t1}</option>
              <option value={2}>II: {a.t2}</option>
            </select>
          </label>
        ))}
      </div>

      {/* paleta: clique para pôr a magia no fim do combo */}
      <div>
        <div className="font-bold mb-1">Clique numa magia para pôr no combo</div>
        <div className="flex flex-wrap gap-1">
          {spells.map((s) => (
            <button key={s.id} type="button" onClick={() => add(s.id)} className="tc-item-card border border-[#b98a5a] rounded bg-white/50 hover:bg-white/90 px-1 py-0.5 flex items-center gap-1" title={`${s.words} · CD ${comboCooldown(s, v.augments, opts)} s${s.group ? ` · ${s.group.label}` : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon(s.icon)} alt="" width={22} height={22} />
              <span className="text-[11px]">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {ordered.length > 0 && (
        <div className="overflow-x-auto">
          {/* linha do tempo: cada magia no segundo em que sai */}
          <div className="relative h-[52px] rounded border border-[#5f4d41] bg-[#2b221b] min-w-[480px]" style={{ width: "100%" }}>
            {Array.from({ length: Math.ceil(end) + 1 }).map((_, s) => (
              <div key={s} className="absolute top-0 bottom-0 border-l border-white/10 text-[9px] text-white/50 pl-0.5" style={{ left: `${(s / Math.max(end, 1)) * 96 + 1}%` }}>
                {s % 2 === 0 ? s : ""}
              </div>
            ))}
            {ordered.map((s) => {
              const sp = byId(s.spellId);
              const bad = conflicts.some((c) => c.index === s.i);
              return sp ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s.i}
                  src={icon(sp.icon)}
                  alt={sp.name}
                  title={`${s.t} s: ${sp.name}`}
                  width={28}
                  height={28}
                  className="absolute top-[16px] rounded-sm"
                  style={{ left: `calc(${(s.t / Math.max(end, 1)) * 96 + 1}% - 2px)`, outline: bad ? "2px solid #e33" : "1px solid #000" }}
                />
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="w-20">Segundo</th>
              <th>Magia</th>
              <th>Elemento</th>
              <th>CD efetivo</th>
              <th>Grupo</th>
              <th>Mana</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((s) => {
              const sp = byId(s.spellId);
              const bad = conflicts.some((c) => c.index === s.i);
              return (
                <tr key={s.i} style={bad ? { outline: "2px solid #a01a1a" } : undefined}>
                  <td>
                    <input type="number" step={1} min={0} className="w-16" value={s.t} onChange={(e) => update(s.i, { t: Number(e.target.value) })} />
                  </td>
                  <td className="whitespace-nowrap">
                    {sp && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={icon(sp.icon)} alt="" width={22} height={22} className="inline-block align-middle mr-1" />
                    )}
                    <select value={s.spellId} onChange={(e) => update(s.i, { spellId: e.target.value })}>
                      {spells.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{sp ? sp.element === "weapon" ? <span className="tag tag-physical">Da arma</span> : <span className={`tag tag-${sp.element}`}>{ELEMENT_LABEL[sp.element]}</span> : "-"}</td>
                  <td>{sp ? `${comboCooldown(sp, v.augments, opts)} s` : "-"}</td>
                  <td className="whitespace-nowrap">{sp?.group ? `${sp.group.label} (${sp.group.cooldown} s)` : "-"}</td>
                  <td>{sp?.mana || "-"}</td>
                  <td>
                    <button type="button" className="tc-btn tc-btn-danger !py-0.5 !px-2" onClick={() => setSteps((p) => p.filter((_, k) => k !== s.i))}>
                      remover
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {steps.length === 0 && <p className="muted mt-2">Combo vazio. Clique nas magias acima ou use o botão &quot;+ combo&quot; na página de Cooldowns.</p>}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" className="tc-btn" onClick={() => setSteps(autoTime(steps, spells, v.augments, opts))} disabled={!steps.length}>
          Encaixar nos cooldowns
        </button>
        <button type="button" className="tc-btn tc-btn-danger" onClick={() => setSteps([])}>
          limpar
        </button>
        <button
          type="button"
          className="tc-btn"
          disabled={!steps.length}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(share());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copie o link:", share());
            }
          }}
        >
          {copied ? "Link copiado" : "Copiar link do combo"}
        </button>
        {steps.length > 0 && <SaveToChar voc={voc} field="combo_code" value={`voc=${voc}&combo=${encodeCombo(steps)}`} what="o combo" />}
        <Link className="tc-btn" href={`/cooldowns?voc=${voc}`}>
          Ver cooldowns de {v.promoted}
        </Link>
        {voc !== "monk" && (
          <Link className="tc-btn" href={`/simulador?voc=${voc}`}>
            Simular o dano de {v.promoted}
          </Link>
        )}
        <span className="muted">
          Duração: {end} s · mana: {mana}
          {end > 0 ? ` (${Math.round((mana / end) * 60)} por minuto)` : ""}
        </span>
      </div>

      {steps.length > 0 &&
        (conflicts.length === 0 ? (
          <div className="good">Sem conflito de cooldown.</div>
        ) : (
          <ul className="bad list-disc pl-5 space-y-1">
            {conflicts.map((c, i) => (
              <li key={i}>{c.message}</li>
            ))}
          </ul>
        ))}
      <p className="muted text-[10px]">
        Regras: trava do grupo de ataque de cada magia (2 s na maioria), cooldown próprio de cada magia e grupo secundário. &quot;Encaixar nos
        cooldowns&quot; mantém a ordem e põe cada magia no primeiro segundo livre. Cooldowns e grupos: TibiaWiki, consulta em 26/09/2026.
      </p>
    </div>
  );
}
