"use client";

import SaveToChar from "@/components/SaveToChar";
import { useEffect, useMemo, useState } from "react";
import { SLOTS } from "@/data/equipment";
import { itemIcon } from "@/lib/icons";
import {
  AMPLIFICATION,
  IMBUE_SLOTS,
  IMBUEMENTS,
  ImbueChoice,
  PROT_ELEMS,
  SetChoice,
  SetTotals,
  SlotId,
  computeSet,
  decodeSet,
  emptySet,
  encodeSet,
  findItem,
  recommendedSet,
} from "@/lib/set";

const LABEL: Record<SlotId, string> = {
  amulet: "Amuleto",
  helmet: "Elmo",
  wand: "Wand",
  armor: "Armadura",
  spellbook: "Spellbook",
  ring: "Anel",
  legs: "Pernas",
  boots: "Botas",
};

// Grade do inventário do Tibia (3 × 4); null = casa vazia
const GRID: (SlotId | null)[] = ["amulet", "helmet", null, "wand", "armor", "spellbook", "ring", "legs", null, null, "boots", null];

const PROT_LABEL: Record<string, string> = { physical: "Físico", fire: "Fogo", earth: "Terra", energy: "Energia", ice: "Gelo", death: "Death", holy: "Holy" };

function Slot({ id, set, selected, onSelect }: { id: SlotId; set: SetChoice; selected: boolean; onSelect: () => void }) {
  const c = set[id];
  return (
    <button
      type="button"
      onClick={onSelect}
      title={c.item ?? LABEL[id]}
      className="relative w-[62px] h-[62px] flex items-center justify-center rounded border-2"
      style={{ background: "linear-gradient(#3a3a3a,#1e1e1e)", borderColor: selected ? "#ffd700" : "#000", boxShadow: "inset 0 0 0 1px #666" }}
    >
      {c.item ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={c.item} src={itemIcon(c.item)} alt={c.item} className="tc-equip-pop" width={32} height={32} style={{ imageRendering: "pixelated", width: 44, height: 44 }} />
      ) : (
        <span className="text-[10px] text-[#9a917c]">{LABEL[id]}</span>
      )}
      {c.tier > 0 && <span className="absolute bottom-0 right-1 text-[10px] font-bold text-[#ffd700]">T{c.tier}</span>}
    </button>
  );
}

function Inventory({ set, selected, onSelect }: { set: SetChoice; selected: SlotId; onSelect: (s: SlotId) => void }) {
  return (
    <div className="inline-grid grid-cols-3 gap-2 p-3 rounded" style={{ background: "#141414", border: "2px solid #5b5b5b", outline: "1px solid #000" }}>
      {GRID.map((s, i) => (s ? <Slot key={s} id={s} set={set} selected={selected === s} onSelect={() => onSelect(s)} /> : <div key={`e${i}`} className="w-[62px] h-[62px]" />))}
    </div>
  );
}

function SlotEditor({ slot, set, onChange }: { slot: SlotId; set: SetChoice; onChange: (s: SetChoice) => void }) {
  const items = SLOTS.find((s) => s.id === slot)?.items ?? [];
  const c = set[slot];
  const nImb = IMBUE_SLOTS[slot];
  const imbOptions = Object.entries(IMBUEMENTS).filter(([, d]) => d.slots.includes(slot));
  const setSlot = (patch: Partial<SetChoice[SlotId]>) => onChange({ ...set, [slot]: { ...c, ...patch } });
  const setImb = (i: number, v: ImbueChoice) => {
    const arr = [...c.imbues];
    arr[i] = v;
    setSlot({ imbues: arr });
  };

  return (
    <div className="space-y-3">
      <h2 className="mt-0">{LABEL[slot]}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        <button type="button" onClick={() => setSlot({ item: null, tier: 0 })} className="border border-[#b98a5a] rounded p-1 bg-white/40 text-[11px]" style={c.item === null ? { outline: "2px solid #1a6b2d" } : undefined}>
          vazio
        </button>
        {items.map((it) => (
          <button
            key={it.name}
            type="button"
            onClick={() => setSlot({ item: it.name })}
            className="border border-[#b98a5a] rounded p-1 bg-white/40 hover:bg-white/70 flex flex-col items-center gap-1 text-[10px] leading-tight"
            style={c.item === it.name ? { outline: "2px solid #1a6b2d" } : undefined}
            title={`${it.name} · lv ${it.level} · ML ${it.ml}${it.protection ? " · " + it.protection : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={itemIcon(it.name)} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
            <span className="text-center">{it.name.split("/")[0].trim()}</span>
          </button>
        ))}
      </div>
      {c.item && (
        <div className="text-[11px] muted">
          {(() => {
            const it = findItem(slot, c.item);
            return it ? `Lv ${it.level} · ML ${it.ml}${it.extras ? " · " + it.extras : ""}${it.protection ? " · " + it.protection : ""}` : "";
          })()}
        </div>
      )}
      <div className="flex flex-wrap gap-4 items-end">
        {["wand", "helmet", "armor", "legs", "boots"].includes(slot) && (
          <label>
            Tier (forja)
            <input type="number" min={0} max={10} className="mt-1 w-20" value={c.tier} onChange={(e) => setSlot({ tier: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })} />
          </label>
        )}
        {Array.from({ length: nImb }).map((_, i) => {
          const cur = c.imbues[i] ?? { kind: "", level: 0 };
          return (
            <label key={i}>
              Imbuement {i + 1}
              <div className="flex gap-1 mt-1">
                <select value={cur.kind} onChange={(e) => setImb(i, { kind: e.target.value, level: cur.level || 3 })}>
                  <option value="">nenhum</option>
                  {imbOptions.map(([k, d]) => (
                    <option key={k} value={k}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select value={cur.level} onChange={(e) => setImb(i, { kind: cur.kind, level: Number(e.target.value) as 0 | 1 | 2 | 3 })} disabled={!cur.kind}>
                  <option value={1}>Basic</option>
                  <option value={2}>Intricate</option>
                  <option value={3}>Powerful</option>
                </select>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Totals({ a, b, baseML }: { a: SetTotals; b: SetTotals | null; baseML: number }) {
  const rows: { label: string; va: number; vb?: number; unit?: string; better?: "up" | "down" }[] = [
    { label: "Magic level total", va: baseML + a.ml, vb: b ? baseML + b.ml : undefined, better: "up" },
    { label: "Bônus de ML do set", va: a.ml, vb: b?.ml, better: "up" },
    { label: "Fire ML extra", va: a.eml.fire ?? 0, vb: b ? (b.eml.fire ?? 0) : undefined, better: "up" },
    { label: "Energy ML extra", va: a.eml.energy ?? 0, vb: b ? (b.eml.energy ?? 0) : undefined, better: "up" },
    { label: "Death ML extra", va: a.eml.death ?? 0, vb: b ? (b.eml.death ?? 0) : undefined, better: "up" },
    ...PROT_ELEMS.map((e) => ({ label: `Proteção ${PROT_LABEL[e]}`, va: a.prot[e] ?? 0, vb: b ? (b.prot[e] ?? 0) : undefined, unit: "%", better: "up" as const })),
    { label: "Life leech", va: a.lifeLeech, vb: b?.lifeLeech, unit: "%", better: "up" },
    { label: "Mana leech", va: a.manaLeech, vb: b?.manaLeech, unit: "%", better: "up" },
    { label: "Crit extra", va: a.critExtra, vb: b?.critExtra, unit: "%", better: "up" },
    { label: "Velocidade", va: a.speed, vb: b?.speed, better: "up" },
    { label: "Armor", va: a.arm, vb: b?.arm, better: "up" },
    { label: "Onslaught (chance)", va: a.onslaught, vb: b?.onslaught, unit: "%", better: "up" },
    { label: "Momentum (chance)", va: a.momentum, vb: b?.momentum, unit: "%", better: "up" },
    { label: "Ruse (chance)", va: a.ruse, vb: b?.ruse, unit: "%", better: "up" },
    { label: "Transcendence (chance)", va: a.transcendence, vb: b?.transcendence, unit: "%", better: "up" },
  ];
  const fmt = (v: number, u?: string) => `${Number.isInteger(v) ? v : v.toFixed(2)}${u ?? ""}`;
  return (
    <table>
      <thead>
        <tr>
          <th>Atributo</th>
          <th>Set A</th>
          {b && <th>Set B</th>}
          {b && <th>B − A</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const d = r.vb !== undefined ? r.vb - r.va : 0;
          return (
            <tr key={r.label}>
              <td className="font-bold">{r.label}</td>
              <td>{fmt(r.va, r.unit)}</td>
              {b && <td>{fmt(r.vb ?? 0, r.unit)}</td>}
              {b && <td className={d > 0 ? "good" : d < 0 ? "bad" : ""}>{d === 0 ? "=" : (d > 0 ? "+" : "") + fmt(d, r.unit)}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function SetCalculator() {
  const [setA, setSetA] = useState<SetChoice>(recommendedSet);
  const [setB, setSetB] = useState<SetChoice>(emptySet);
  const [compare, setCompare] = useState(false);
  const [editing, setEditing] = useState<"A" | "B">("A");
  const [slot, setSlot] = useState<SlotId>("wand");
  const [baseML, setBaseML] = useState(114);
  const [level, setLevel] = useState(896);
  const [copied, setCopied] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Lê o set compartilhado pela URL uma vez, depois da hidratação.
    const p = new URLSearchParams(window.location.search);
    const a = decodeSet(p.get("a"));
    const b = decodeSet(p.get("b"));
    if (a) setSetA(a);
    if (b) {
      setSetB(b);
      setCompare(true);
    }
    if (p.get("ml")) setBaseML(Number(p.get("ml")) || 0);
    if (p.get("level")) setLevel(Number(p.get("level")) || 1);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const ta = useMemo(() => computeSet(setA), [setA]);
  const tb = useMemo(() => (compare ? computeSet(setB) : null), [compare, setB]);
  const current = editing === "A" ? setA : setB;
  const setCurrent = editing === "A" ? setSetA : setSetB;

  const shareUrl = () => {
    const u = new URL(window.location.href);
    u.search = `?level=${level}&ml=${baseML}&a=${encodeSet(setA)}${compare ? `&b=${encodeSet(setB)}` : ""}`;
    return u.toString();
  };
  const simUrl = (s: SetChoice) => `/simulador?level=${level}&ml=${baseML}&set=${encodeSet(s)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <label>
          Level
          <input type="number" className="mt-1 w-24" value={level} onChange={(e) => setLevel(Number(e.target.value) || 1)} />
        </label>
        <label>
          Magic level base (sem o set)
          <input type="number" className="mt-1 w-24" value={baseML} onChange={(e) => setBaseML(Number(e.target.value) || 0)} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} /> Comparar com um segundo set
        </label>
        <button type="button" className="tc-btn" onClick={() => setSetA(recommendedSet())}>
          Set A = recomendado
        </button>
        {compare && (
          <button type="button" className="tc-btn" onClick={() => setSetB(JSON.parse(JSON.stringify(setA)))}>
            Copiar A para B
          </button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <div className="space-y-3">
          {compare && (
            <div className="flex gap-2">
              {(["A", "B"] as const).map((k) => (
                <button key={k} type="button" className={`tc-btn ${editing === k ? "" : "opacity-60"}`} onClick={() => setEditing(k)}>
                  Editando set {k}
                </button>
              ))}
            </div>
          )}
          <Inventory set={current} selected={slot} onSelect={setSlot} />
          <div className="text-[11px] muted max-w-[230px]">
            Clique numa casa para trocar o item. Botas com tier aumentam os outros efeitos da forja (Amplification {AMPLIFICATION[current.boots.tier]}%).
          </div>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <SlotEditor slot={slot} set={current} onChange={setCurrent} />
        </div>
      </div>

      <h2>Totais</h2>
      <Totals a={ta} b={tb} baseML={baseML} />
      <p className="muted text-[11px]">
        Proteções: soma simples dos percentuais dos itens e imbuements; o jogo pode combinar de outra forma, então use como comparação entre sets.
        Chances da forja: tabelas da TibiaWiki, já multiplicadas pelo Amplification das botas.
      </p>

      <div className="flex flex-wrap gap-3">
        <a className="tc-btn" href={simUrl(setA)}>
          Usar o set A no simulador de dano
        </a>
        {compare && (
          <a className="tc-btn" href={simUrl(setB)}>
            Usar o set B no simulador de dano
          </a>
        )}
        <button
          type="button"
          className="tc-btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shareUrl());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copie o link:", shareUrl());
            }
          }}
        >
          {copied ? "Link copiado" : "Copiar link para compartilhar"}
        </button>
        <SaveToChar voc="sorcerer" field="set_code" value={`voc=sorcerer&level=${level}&ml=${baseML}&a=${encodeSet(setA)}`} what="o set A" />
      </div>

      {ta.augments.length > 0 && (
        <>
          <h2>Augments do set A</h2>
          <ul className="list-disc pl-5">
            {ta.augments.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
