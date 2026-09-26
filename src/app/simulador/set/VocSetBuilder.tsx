"use client";

import SaveToChar from "@/components/SaveToChar";
import { Build, SlotPick, decodeBuild, encodeBuild } from "@/lib/vocbuild";
import { useEffect, useMemo, useState } from "react";
import { HUNTS } from "@/data/hunts";
import { IMBUEMENTS, IMBUE_TIER } from "@/data/imbuements";
import { EquipRow, VOC_EQUIPMENT } from "@/data/voc-equipment";
import { AMMO, ExtraRow, JEWELRY } from "@/data/voc-extras";
import { itemIcon } from "@/lib/icons";
import { wikiImage } from "@/lib/md5";
import { EL_PT, suggestSet } from "@/lib/huntset";
import { getActive } from "@/lib/active";
import { AMPLIFICATION, MOMENTUM, ONSLAUGHT, RUSE, TRANSCENDENCE } from "@/lib/set";

export type Voc = "druid" | "knight" | "paladin" | "monk";

const OFFHAND: Record<Voc, string | null> = { druid: "Spellbook", knight: "Escudo", paladin: "Aljava", monk: null };
// grade do inventário do Tibia (3 × 4): colar, elmo, mochila / arma, armadura, mão esquerda / anel, pernas, munição / botas
const GRID = (v: Voc): (string | null)[] => ["Amuleto", "Elmo", null, "Arma", "Armadura", OFFHAND[v], "Anel", "Pernas", v === "paladin" ? "Munição" : null, null, "Botas", null];
const TIER_SLOTS = ["Arma", "Elmo", "Armadura", "Pernas", "Botas"];
const FORGE: Record<string, [string, number[]]> = {
  Arma: ["Onslaught", ONSLAUGHT],
  Elmo: ["Momentum", MOMENTUM],
  Armadura: ["Ruse", RUSE],
  Pernas: ["Transcendence", TRANSCENDENCE],
  Botas: ["Amplification", AMPLIFICATION],
};
const FORGE_PT: Record<string, string> = {
  Onslaught: "chance de 60% de dano extra",
  Momentum: "chance de reduzir cooldowns",
  Ruse: "chance de esquivar do golpe",
  Transcendence: "chance de ativar o avatar",
  Amplification: "aumenta os outros efeitos",
};

const ELEMS = ["physical", "fire", "earth", "energy", "ice", "death", "holy"] as const;
const PROT_IMB: Record<string, string> = { "lich-shroud": "death", "snake-skin": "earth", "dragon-hide": "fire", "quara-scale": "ice", "cloud-fabric": "energy", "demon-presence": "holy" };
const SKILL_IMB: Record<string, string> = { slash: "sword fighting", chop: "axe fighting", bash: "club fighting", precision: "distance fighting", punch: "fist fighting", epiphany: "magic level", blockade: "shielding" };
const DMG_IMB: Record<string, string> = { scorch: "fogo", venom: "terra", frost: "gelo", electrify: "energia", reap: "death" };

/** Imbuements que cabem em cada slot, por vocação e tipo de arma (página Imbuing da TibiaWiki). */
function imbueOptions(voc: Voc, slot: string, item: EquipRow | null): string[] {
  const prot = Object.keys(PROT_IMB);
  if (slot === "Arma") {
    if (voc === "druid") return ["epiphany", "vampirism", "void"];
    const base = ["vampirism", "void", "strike", ...Object.keys(DMG_IMB)];
    if (voc === "paladin") return [...base, "precision"];
    if (voc === "monk") return [...base, "punch"];
    const k = item?.kind ?? "";
    return [...base, k.startsWith("Espada") ? "slash" : k.startsWith("Machado") ? "chop" : k.startsWith("Clava") ? "bash" : "slash"];
  }
  if (slot === "Elmo") {
    const s = ["void", "blockade"];
    if (voc === "druid") s.push("epiphany");
    if (voc === "paladin") s.push("precision");
    if (voc === "monk") s.push("punch");
    if (voc === "knight") s.push("slash", "chop", "bash");
    return s;
  }
  if (slot === "Armadura") return ["vampirism", ...prot];
  if (slot === "Escudo" || slot === "Spellbook") return [...prot, "blockade"];
  if (slot === "Botas") return ["swiftness", "vibrancy"];
  return [];
}

const powerValue = (id: string, tier: number) => {
  const t = IMBUEMENTS.find((i) => i.id === id)?.tiers[tier] ?? "";
  const m = t.match(/[+]?(\d+(?:[.,]\d+)?)/g);
  if (!m) return 0;
  return Number(m[m.length - 1].replace("+", "").replace(",", "."));
};
const imbueIcon = (id: string, tier: number) => {
  const d = IMBUEMENTS.find((i) => i.id === id);
  return d ? wikiImage(`${IMBUE_TIER[tier]} ${d.name}`, "png") : "";
};

const EMPTY: SlotPick = { item: null, tier: 0, imbues: [] };
type Row = EquipRow & { dur?: string };

/** Itens da vocação: lista 250+ do TibiaPal, mais anéis, amuletos e munição da TibiaWiki. */
function rowsFor(voc: Voc): Row[] {
  const base = VOC_EQUIPMENT[voc] ?? [];
  const names = new Set(base.map((r) => r.name));
  const extra = ([...JEWELRY, ...AMMO] as ExtraRow[]).filter((r) => (r.vocs.length === 0 || r.vocs.includes(voc)) && !names.has(r.name));
  return [...base, ...extra];
}

interface Totals {
  res: Record<string, number>;
  sk: Record<string, number>;
  arm: number;
  extras: string[];
  forge: Record<string, number>;
}

function compute(voc: Voc, build: Build, rows: Row[]): Totals {
  const find = (n: string | null) => rows.find((r) => r.name === n) ?? null;
  const weapon = find(build["Arma"]?.item ?? null);
  const offBlocked = voc === "knight" && weapon?.hands === "Duas";
  const res: Record<string, number> = {};
  const sk: Record<string, number> = {};
  let arm = 0;
  const extras: string[] = [];
  for (const [s, p] of Object.entries(build)) {
    if (s === OFFHAND[voc] && offBlocked) continue;
    const it = find(p.item);
    if (!it) continue;
    arm += it.arm;
    for (const [e, v] of Object.entries(it.res)) res[e] = (res[e] ?? 0) + v;
    for (const [k, v] of Object.entries(it.sk)) sk[k] = (sk[k] ?? 0) + v;
    for (const im of p.imbues.slice(0, it.imb)) {
      if (!im.id) continue;
      const v = powerValue(im.id, im.tier);
      const d = IMBUEMENTS.find((x) => x.id === im.id);
      if (PROT_IMB[im.id]) res[PROT_IMB[im.id]] = (res[PROT_IMB[im.id]] ?? 0) + v;
      else if (SKILL_IMB[im.id]) sk[SKILL_IMB[im.id]] = (sk[SKILL_IMB[im.id]] ?? 0) + v;
      else if (DMG_IMB[im.id]) extras.push(`${v}% do dano físico vira ${DMG_IMB[im.id]} (${s})`);
      else extras.push(`${d?.pt}: ${d?.tiers[im.tier]} (${s})`);
    }
  }
  const amp = build["Botas"]?.item ? AMPLIFICATION[build["Botas"].tier ?? 0] : 0;
  const forge: Record<string, number> = {};
  for (const s of ["Arma", "Elmo", "Armadura", "Pernas"]) {
    const p = build[s];
    const [name, table] = FORGE[s];
    forge[name] = p?.item ? table[p.tier ?? 0] * (1 + amp / 100) : 0;
  }
  forge.Amplification = amp;
  return { res, sk, arm, extras, forge };
}

const encode = encodeBuild;
const decode = decodeBuild;

/** Casa do inventário com o sprite animado do item (GIF da TibiaWiki), tier e imbuements. */
function InvSlot({ label, pick, selected, dim, onClick }: { label: string; pick: SlotPick | undefined; selected: boolean; dim: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={pick?.item ?? label}
      className="tc-inv-slot relative w-[62px] h-[62px] flex items-center justify-center rounded border-2"
      style={{ borderColor: selected ? "#ffd700" : "#000", opacity: dim ? 0.35 : 1 }}
    >
      {pick?.item ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={pick.item} src={itemIcon(pick.item)} alt={pick.item} width={44} height={44} className="tc-equip-pop" style={{ imageRendering: "pixelated" }} />
      ) : (
        <span className="text-[10px] text-[#9a917c]">{label}</span>
      )}
      {pick?.item && pick.tier > 0 && <span className="absolute top-0 left-1 text-[10px] font-bold text-[#ffd700] [text-shadow:0_1px_1px_#000]">T{pick.tier}</span>}
      {pick?.item && pick.imbues.some((i) => i.id) && (
        <span className="absolute bottom-0.5 right-0.5 flex gap-px">
          {pick.imbues
            .filter((i) => i.id)
            .map((i, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} src={imbueIcon(i.id, i.tier)} alt="" width={14} height={14} className="rounded-sm border border-black/60" />
            ))}
        </span>
      )}
    </button>
  );
}

export default function VocSetBuilder({ voc }: { voc: Voc }) {
  const rows = useMemo(() => rowsFor(voc), [voc]);
  const [level, setLevel] = useState(800);
  const [slot, setSlot] = useState("Arma");
  const [a, setA] = useState<Build>({});
  const [b, setB] = useState<Build>({});
  const [compare, setCompare] = useState(false);
  const [editing, setEditing] = useState<"A" | "B">("A");
  const [huntId, setHuntId] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [hands, setHands] = useState("");
  const [copied, setCopied] = useState(false);

  // estado compartilhável na URL (?v=knight&a=...&b=...); o antigo ?s= vale como set A
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const ch = getActive().char;
    if (ch && ch.vocation === voc) setLevel(ch.level);
    if ((u.get("voc") ?? u.get("v")) !== voc) return;
    const sa = decode(u.get("a") ?? u.get("s"));
    const sb = decode(u.get("b"));
    if (sa) setA(sa);
    if (sb) {
      setB(sb);
      setCompare(true);
    }
    if (Number(u.get("level")) > 0) setLevel(Number(u.get("level")));
    const h = u.get("hunt");
    if (h && HUNTS.some((x) => x.id === h)) setHuntId(h);
  }, [voc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cur = editing === "A" ? a : b;
  const syncUrl = (na: Build, nb: Build, cmp: boolean) => {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("voc", voc);
      u.searchParams.delete("v");
      u.searchParams.delete("s");
      u.searchParams.set("level", String(level));
      u.searchParams.set("a", encode(na));
      if (cmp) u.searchParams.set("b", encode(nb));
      else u.searchParams.delete("b");
      window.history.replaceState(null, "", u.toString());
    } catch {
      // sem URL: segue só na tela
    }
  };
  const setCur = (next: Build) => {
    if (editing === "A") setA(next);
    else setB(next);
    syncUrl(editing === "A" ? next : a, editing === "B" ? next : b, compare);
  };
  const setPick = (s: string, p: SlotPick) => setCur({ ...cur, [s]: p });

  const find = (name: string | null) => rows.find((r) => r.name === name) ?? null;
  const weapon = find(cur["Arma"]?.item ?? null);
  const offBlocked = voc === "knight" && weapon?.hands === "Duas";
  const ta = useMemo(() => compute(voc, a, rows), [voc, a, rows]);
  const tb = useMemo(() => (compare ? compute(voc, b, rows) : null), [voc, b, rows, compare]);

  const fillFromHunt = () => {
    const h = HUNTS.find((x) => x.id === huntId);
    if (!h) return;
    const s = suggestSet(h, voc, level);
    const next: Build = { ...cur };
    for (const p of s.picks) if (p.item) next[p.slot] = { item: p.item.name, tier: cur[p.slot]?.tier ?? 0, imbues: cur[p.slot]?.imbues ?? [] };
    setCur(next);
  };

  const baseKind = (k: string) => k.split(" · ")[0];
  const kinds = [...new Set(rows.filter((r) => r.slot === slot && r.kind).map((r) => baseKind(r.kind)))];
  const ammoKind = weapon?.kind.startsWith("Bow") ? "Arrow" : weapon?.kind.startsWith("Crossbow") ? "Bolt" : "";
  const q = query.trim().toLowerCase();
  const slotItems = rows
    .filter((r) => r.slot === slot && r.level <= level)
    .filter((r) => !q || r.name.toLowerCase().includes(q))
    .filter((r) => !kind || baseKind(r.kind) === kind)
    .filter((r) => !(slot === "Arma" && voc === "knight" && hands) || (hands === "2" ? r.hands === "Duas" : r.hands !== "Duas"))
    .filter((r) => slot !== "Munição" || !ammoKind || r.kind === ammoKind)
    .sort((x, y) => y.level - x.level || Number(y.name.startsWith("Charged")) - Number(x.name.startsWith("Charged")) || x.name.localeCompare(y.name));
  const p = cur[slot] ?? EMPTY;
  const it = find(p.item);
  const opts = imbueOptions(voc, slot, it);

  const shareUrl = () => {
    const u = new URL(window.location.href);
    u.search = `?voc=${voc}&level=${level}&a=${encode(a)}${compare ? `&b=${encode(b)}` : ""}`;
    return u.toString();
  };

  const tableRows: { label: string; va: number; vb?: number; unit?: string }[] = [
    ...ELEMS.map((e) => ({ label: `Proteção ${EL_PT[e]}`, va: ta.res[e] ?? 0, vb: tb ? (tb.res[e] ?? 0) : undefined, unit: "%" })),
    ...[...new Set([...Object.keys(ta.sk), ...Object.keys(tb?.sk ?? {})])].map((k) => ({ label: k, va: ta.sk[k] ?? 0, vb: tb ? (tb.sk[k] ?? 0) : undefined })),
    { label: "Armadura total", va: ta.arm, vb: tb?.arm },
    ...Object.keys(ta.forge).map((k) => ({ label: `${k} (forja)`, va: ta.forge[k], vb: tb?.forge[k], unit: "%" })),
  ];
  const fmt = (v: number, u?: string) => `${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}${u ?? ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end text-[12px]">
        <label>
          <span className="font-bold block">Itens até o level</span>
          <input type="number" className="w-24" value={level} min={1} onChange={(e) => setLevel(Number(e.target.value) || 1)} />
        </label>
        <label>
          <span className="font-bold block">Preencher pela hunt</span>
          <select value={huntId} onChange={(e) => setHuntId(e.target.value)}>
            <option value="">escolha</option>
            {HUNTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="tc-btn" onClick={fillFromHunt} disabled={!huntId}>
          sugerir set
        </button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => {
              setCompare(e.target.checked);
              if (!e.target.checked) setEditing("A");
              syncUrl(a, b, e.target.checked);
            }}
          />
          Comparar com um segundo set
        </label>
        {compare && (
          <button
            type="button"
            className="tc-btn"
            onClick={() => {
              const copy = JSON.parse(JSON.stringify(a)) as Build;
              setB(copy);
              syncUrl(a, copy, true);
            }}
          >
            Copiar A para B
          </button>
        )}
        <button type="button" className="tc-btn tc-btn-danger" onClick={() => setCur({})}>
          limpar
        </button>
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
          <div className="tc-inv inline-grid grid-cols-3 gap-2 p-3 rounded">
            {GRID(voc).map((s, i) =>
              s ? (
                <InvSlot
                  key={s}
                  label={s}
                  pick={cur[s]}
                  selected={slot === s}
                  dim={s === OFFHAND[voc] && offBlocked}
                  onClick={() => {
                    setSlot(s);
                    setKind("");
                    setQuery("");
                  }}
                />
              ) : (
                <div key={`e${i}`} className="w-[62px] h-[62px]" />
              ),
            )}
          </div>
          <div className="text-[11px] muted max-w-[230px]">
            Clique numa casa para trocar o item. Os sprites animados são os da TibiaWiki.
            {voc === "paladin" && " A aljava vai na mão esquerda e a munição na casa de munição."}
            {voc === "monk" && " Monk usa arma de duas mãos: não há escudo."}
          </div>
        </div>

        <div className="border border-[#b98a5a] rounded p-3 bg-white/40 text-[12px] space-y-3">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <h2 className="!mt-0 !mb-0">{slot}</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="buscar item" className="w-48" />
          </div>
          {slot === OFFHAND[voc] && offBlocked && <p className="warn">A arma escolhida é de duas mãos: o escudo não conta.</p>}
          {slot === "Munição" && ammoKind && <p className="muted">Mostrando só {ammoKind === "Arrow" ? "flechas (a arma é um bow)" : "bolts (a arma é uma crossbow)"}.</p>}
          {((kinds.length > 1 && !(slot === "Munição" && ammoKind)) || (slot === "Arma" && voc === "knight")) && (
            <div className="flex flex-wrap gap-1 items-center">
              {kinds.length > 1 &&
                !(slot === "Munição" && ammoKind) &&
                ["", ...kinds].map((k) => (
                  <button key={k || "todos"} type="button" className={`tc-btn !py-0.5 ${kind === k ? "" : "opacity-60"}`} onClick={() => setKind(k)}>
                    {k || "todos"}
                  </button>
                ))}
              {slot === "Arma" && voc === "knight" && (
                <>
                  <span className="w-3" />
                  {[
                    ["", "1 e 2 mãos"],
                    ["1", "uma mão"],
                    ["2", "duas mãos"],
                  ].map(([k, l]) => (
                    <button key={l} type="button" className={`tc-btn !py-0.5 ${hands === k ? "" : "opacity-60"}`} onClick={() => setHands(k)}>
                      {l}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2 max-h-[420px] overflow-y-auto pr-1">
            <button type="button" onClick={() => setPick(slot, EMPTY)} className="border border-[#b98a5a] rounded p-1 bg-white/40 text-[11px]" style={p.item === null ? { outline: "2px solid #1a6b2d" } : undefined}>
              vazio
            </button>
            {slotItems.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => setPick(slot, { item: r.name, tier: p.tier, imbues: p.item === r.name ? p.imbues : [] })}
                className="tc-item-card border border-[#b98a5a] rounded p-1 bg-white/40 hover:bg-white/80 flex flex-col items-center gap-1 text-[10px] leading-tight"
                style={p.item === r.name ? { outline: "2px solid #1a6b2d", background: "#f3e2bd" } : undefined}
                title={[r.name, `lv ${r.level}`, r.stats, r.bonus, r.resist].filter(Boolean).join(" · ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemIcon(r.name)} alt="" width={32} height={32} loading="lazy" style={{ imageRendering: "pixelated" }} />
                <span className="text-center">{r.name}</span>
                <span className="muted">lv {r.level}</span>
              </button>
            ))}
          </div>
          {slotItems.length === 0 && <p className="muted">Nenhum item com esses filtros até o level escolhido.</p>}

          {it && (
            <div className="border-t border-[#d9c39a] pt-2 space-y-2">
              <div className="flex gap-3 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemIcon(it.name)} alt="" width={48} height={48} style={{ imageRendering: "pixelated" }} />
                <div>
                  <div className="font-bold text-[13px]">{it.name}</div>
                  <div className="muted">
                    level {it.level}
                    {it.kind ? ` · ${it.kind}` : ""}
                    {it.hands === "Duas" ? " · duas mãos" : ""}
                    {it.dur ? ` · ${it.dur}` : ""}
                  </div>
                  <div>
                    {it.stats && <span className="mr-3">{it.stats}</span>}
                    {it.bonus && <span className="mr-3">{it.bonus}</span>}
                    {it.resist && <span>{it.resist}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-start">
                {TIER_SLOTS.includes(slot) && (
                  <label>
                    <span className="font-bold block">Tier (forja)</span>
                    <input type="number" min={0} max={10} className="w-20" value={p.tier} onChange={(e) => setPick(slot, { ...p, tier: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })} />
                    <span className="muted block text-[10px]">
                      {FORGE[slot][0]} {fmt(FORGE[slot][1][p.tier])}%: {FORGE_PT[FORGE[slot][0]]}
                    </span>
                  </label>
                )}
                {it.imb > 0 && opts.length > 0
                  ? Array.from({ length: it.imb }).map((_, k) => {
                      const im = p.imbues[k] ?? { id: "", tier: 2 };
                      const upd = (patch: Partial<{ id: string; tier: number }>) => {
                        const imbues = [...p.imbues];
                        imbues[k] = { ...im, ...patch };
                        setPick(slot, { ...p, imbues });
                      };
                      return (
                        <label key={k}>
                          <span className="font-bold block">Imbuement {k + 1}</span>
                          <span className="flex gap-1 items-center">
                            {im.id && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imbueIcon(im.id, im.tier)} alt="" width={24} height={24} />
                            )}
                            <select value={im.id} onChange={(e) => upd({ id: e.target.value })}>
                              <option value="">nenhum</option>
                              {opts.map((o) => {
                                const d = IMBUEMENTS.find((x) => x.id === o);
                                return (
                                  <option key={o} value={o}>
                                    {d?.name} ({d?.pt})
                                  </option>
                                );
                              })}
                            </select>
                            <select value={im.tier} onChange={(e) => upd({ tier: Number(e.target.value) })} disabled={!im.id}>
                              {IMBUE_TIER.map((t, i) => (
                                <option key={t} value={i}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </span>
                          {im.id && <span className="muted block text-[10px]">{IMBUEMENTS.find((x) => x.id === im.id)?.tiers[im.tier]}</span>}
                        </label>
                      );
                    })
                  : !["Anel", "Amuleto", "Munição", "Aljava"].includes(slot) && <p className="muted">Este item não tem espaço de imbuement.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      <h2>Totais</h2>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Atributo</th>
                <th>Set A</th>
                {tb && <th>Set B</th>}
                {tb && <th>B − A</th>}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => {
                const d = r.vb !== undefined ? r.vb - r.va : 0;
                return (
                  <tr key={r.label}>
                    <td className="font-bold">{r.label}</td>
                    <td className={r.va < 0 ? "bad" : ""}>{fmt(r.va, r.unit)}</td>
                    {tb && <td className={(r.vb ?? 0) < 0 ? "bad" : ""}>{fmt(r.vb ?? 0, r.unit)}</td>}
                    {tb && <td className={d > 0 ? "good" : d < 0 ? "bad" : ""}>{d === 0 ? "=" : (d > 0 ? "+" : "") + fmt(d, r.unit)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 text-[12px]">
          <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
            <div className="font-bold text-[#3a1a00] mb-1">Outros efeitos dos imbuements (set A)</div>
            {ta.extras.length === 0 ? <p className="muted">nenhum</p> : ta.extras.map((x) => <div key={x}>{x}</div>)}
          </div>
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
          <div>
            <SaveToChar voc={voc} field="set_code" value={`voc=${voc}&level=${level}&a=${encode(a)}`} what="o set A" />
          </div>
        </div>
      </div>
      <p className="muted text-[10px]">
        Itens de level 250+ da vocação pela lista do TibiaPal, com atributos da TibiaWiki. Anéis, amuletos e munição vêm da TibiaWiki. Imbuements pela
        página Imbuing da TibiaWiki. Proteções: soma simples das porcentagens, para comparar sets. Forja: tabelas da TibiaWiki, já multiplicadas pelo
        Amplification das botas. Consulta em 26/09/2026.
      </p>
    </div>
  );
}
