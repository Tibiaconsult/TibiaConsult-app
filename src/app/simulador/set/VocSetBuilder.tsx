"use client";

import { useEffect, useMemo, useState } from "react";
import { HUNTS } from "@/data/hunts";
import { IMBUEMENTS, IMBUE_TIER } from "@/data/imbuements";
import { EquipRow, VOC_EQUIPMENT } from "@/data/voc-equipment";
import { itemIcon } from "@/lib/icons";
import { EL_PT, SetVoc, suggestSet } from "@/lib/huntset";

type Voc = Exclude<SetVoc, "sorcerer">;
const VOCS: [Voc, string][] = [
  ["druid", "Elder Druid"],
  ["knight", "Elite Knight"],
  ["paladin", "Royal Paladin"],
  ["monk", "Exalted Monk"],
];

const OFFHAND: Record<Voc, string | null> = { druid: "Spellbook", knight: "Escudo", paladin: "Aljava", monk: null };
// grade do inventário do Tibia (3 × 4); null = casa vazia
const GRID = (v: Voc): (string | null)[] => ["Amuleto", "Elmo", null, "Arma", "Armadura", OFFHAND[v], "Anel", "Pernas", null, null, "Botas", null];

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

interface Pick {
  item: string | null;
  imbues: { id: string; tier: number }[];
}

export default function VocSetBuilder() {
  const [voc, setVoc] = useState<Voc>("knight");
  const [level, setLevel] = useState(800);
  const [slot, setSlot] = useState("Arma");
  const [picks, setPicks] = useState<Record<string, Record<string, Pick>>>({});
  const [huntId, setHuntId] = useState("");

  // estado compartilhável na URL (?v=knight&s=...)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const u = new URLSearchParams(window.location.search);
      const v = u.get("v") as Voc | null;
      const s = u.get("s");
      if (v && VOCS.some(([x]) => x === v)) setVoc(v);
      if (v && s) setPicks({ [v]: JSON.parse(decodeURIComponent(escape(atob(s)))) });
    } catch {
      // link antigo ou inválido
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cur = picks[voc] ?? {};
  const rows = VOC_EQUIPMENT[voc] ?? [];
  const find = (name: string | null) => rows.find((r) => r.name === name) ?? null;
  const setPick = (s: string, p: Pick) => {
    const next = { ...picks, [voc]: { ...cur, [s]: p } };
    setPicks(next);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("v", voc);
      u.searchParams.set("s", btoa(unescape(encodeURIComponent(JSON.stringify(next[voc])))));
      window.history.replaceState(null, "", u.toString());
    } catch {
      // sem URL: segue só na tela
    }
  };

  const weapon = find(cur["Arma"]?.item ?? null);
  const twoHanded = weapon?.hands === "Duas";
  const offBlocked = voc === "knight" && twoHanded;

  const totals = useMemo(() => {
    const res: Record<string, number> = {};
    const sk: Record<string, number> = {};
    let arm = 0;
    const extras: string[] = [];
    for (const [s, p] of Object.entries(cur)) {
      if (s === OFFHAND[voc] && offBlocked) continue;
      const it = find(p.item);
      if (!it) continue;
      arm += it.arm;
      for (const [e, v] of Object.entries(it.res)) res[e] = (res[e] ?? 0) + v;
      for (const [k, v] of Object.entries(it.sk)) sk[k] = (sk[k] ?? 0) + v;
      for (const im of p.imbues.slice(0, it.imb)) {
        if (!im.id) continue;
        const v = powerValue(im.id, im.tier);
        if (PROT_IMB[im.id]) res[PROT_IMB[im.id]] = (res[PROT_IMB[im.id]] ?? 0) + v;
        else if (SKILL_IMB[im.id]) sk[SKILL_IMB[im.id]] = (sk[SKILL_IMB[im.id]] ?? 0) + v;
        else if (DMG_IMB[im.id]) extras.push(`${v}% do dano físico vira ${DMG_IMB[im.id]} (${s})`);
        else extras.push(`${IMBUEMENTS.find((x) => x.id === im.id)?.pt}: ${IMBUEMENTS.find((x) => x.id === im.id)?.tiers[im.tier]} (${s})`);
      }
    }
    return { res, sk, arm, extras };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, voc, offBlocked]);

  const fillFromHunt = () => {
    const h = HUNTS.find((x) => x.id === huntId);
    if (!h) return;
    const s = suggestSet(h, voc, level);
    const next: Record<string, Pick> = {};
    for (const p of s.picks) if (p.item) next[p.slot] = { item: p.item.name, imbues: cur[p.slot]?.imbues ?? [] };
    setPicks({ ...picks, [voc]: next });
  };

  const slotItems = rows.filter((r) => r.slot === slot && r.level <= level).sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
  const p = cur[slot] ?? { item: null, imbues: [] };
  const it = find(p.item);
  const opts = imbueOptions(voc, slot, it);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        {VOCS.map(([v, l]) => (
          <button key={v} type="button" className={`tc-btn ${voc === v ? "" : "opacity-60"}`} onClick={() => (setVoc(v), setSlot("Arma"))}>
            {l}
          </button>
        ))}
        <label className="text-[12px] ml-2">
          <span className="font-bold block">Itens até o level</span>
          <input type="number" className="w-24" value={level} min={250} onChange={(e) => setLevel(Number(e.target.value) || 250)} />
        </label>
        <label className="text-[12px]">
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
        <button type="button" className="tc-btn tc-btn-danger" onClick={() => setPicks({ ...picks, [voc]: {} })}>
          limpar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="grid grid-cols-3 gap-1 w-fit p-2 rounded" style={{ background: "#1b140f" }}>
          {GRID(voc).map((s, i) =>
            s ? (
              <button
                key={i}
                type="button"
                onClick={() => setSlot(s)}
                title={cur[s]?.item ?? s}
                className="relative w-[62px] h-[62px] flex items-center justify-center rounded border-2"
                style={{ background: "linear-gradient(#3a3a3a,#1e1e1e)", borderColor: slot === s ? "#ffd700" : "#000", opacity: s === OFFHAND[voc] && offBlocked ? 0.35 : 1 }}
              >
                {cur[s]?.item ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={itemIcon(cur[s]!.item!)} alt="" width={44} height={44} style={{ imageRendering: "pixelated" }} />
                ) : (
                  <span className="text-[10px] text-[#9a917c]">{s}</span>
                )}
              </button>
            ) : (
              <div key={i} />
            ),
          )}
        </div>

        <div className="border border-[#b98a5a] rounded p-3 bg-white/40 text-[12px] space-y-2">
          <div className="font-bold text-[#3a1a00]">{slot}</div>
          {slot === OFFHAND[voc] && offBlocked && <p className="warn">A arma escolhida é de duas mãos: o escudo não conta.</p>}
          <select className="w-full" value={p.item ?? ""} onChange={(e) => setPick(slot, { item: e.target.value || null, imbues: [] })}>
            <option value="">vazio</option>
            {slotItems.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} (lv {r.level}) {r.bonus ? `· ${r.bonus}` : ""} {r.resist ? `· ${r.resist}` : ""}
              </option>
            ))}
          </select>
          {slotItems.length === 0 && <p className="muted">Sem item de level 250+ na lista para este slot até o level escolhido.</p>}
          {it && (
            <>
              <div>
                {it.stats && <span className="mr-3">{it.stats}</span>}
                {it.bonus && <span className="mr-3">{it.bonus}</span>}
                {it.resist && <span>{it.resist}</span>}
              </div>
              {it.imb > 0 && opts.length > 0 ? (
                <div className="space-y-1">
                  {Array.from({ length: it.imb }).map((_, k) => {
                    const im = p.imbues[k] ?? { id: "", tier: 2 };
                    return (
                      <div key={k} className="flex gap-2">
                        <select
                          className="flex-1"
                          value={im.id}
                          onChange={(e) => {
                            const imbues = [...p.imbues];
                            imbues[k] = { id: e.target.value, tier: im.tier };
                            setPick(slot, { ...p, imbues });
                          }}
                        >
                          <option value="">imbuement {k + 1}: nenhum</option>
                          {opts.map((o) => {
                            const d = IMBUEMENTS.find((x) => x.id === o);
                            return (
                              <option key={o} value={o}>
                                {d?.name} ({d?.pt})
                              </option>
                            );
                          })}
                        </select>
                        <select
                          value={im.tier}
                          onChange={(e) => {
                            const imbues = [...p.imbues];
                            imbues[k] = { id: im.id, tier: Number(e.target.value) };
                            setPick(slot, { ...p, imbues });
                          }}
                        >
                          {IMBUE_TIER.map((t, i) => (
                            <option key={t} value={i}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">Este item não tem espaço de imbuement.</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 text-[12px]">
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="font-bold text-[#3a1a00] mb-1">Proteções</div>
          {ELEMS.map((e) => (
            <div key={e} className="flex justify-between">
              <span>{EL_PT[e]}</span>
              <b className={(totals.res[e] ?? 0) > 0 ? "good" : (totals.res[e] ?? 0) < 0 ? "bad" : ""}>{totals.res[e] ?? 0}%</b>
            </div>
          ))}
          <p className="muted text-[10px] mt-1">Soma simples das porcentagens de itens e imbuements.</p>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="font-bold text-[#3a1a00] mb-1">Skills e magic level</div>
          {Object.keys(totals.sk).length === 0 ? (
            <p className="muted">nenhum</p>
          ) : (
            Object.entries(totals.sk).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <b>+{v}</b>
              </div>
            ))
          )}
          <div className="flex justify-between mt-1 border-t border-[#d9c39a] pt-1">
            <span>Armadura total</span>
            <b>{totals.arm}</b>
          </div>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="font-bold text-[#3a1a00] mb-1">Outros efeitos dos imbuements</div>
          {totals.extras.length === 0 ? <p className="muted">nenhum</p> : totals.extras.map((x) => <div key={x}>{x}</div>)}
        </div>
      </div>
      <p className="muted text-[10px]">
        Itens de level 250+ da vocação (lista do TibiaPal, atributos da TibiaWiki). Imbuements pela página Imbuing da TibiaWiki. Forja e augments
        das peças ficam fora desta conta. O link da página guarda o set montado.
      </p>
    </div>
  );
}
