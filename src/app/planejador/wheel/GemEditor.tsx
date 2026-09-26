"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Editor de gema de um vessel, como no Gem Atelier: tamanho (pequena, média, grande) e mods escolhidos pelos ícones oficiais.
// No motor oficial o tamanho sai da quantidade de mods: 1 = lesser, 2 = regular, 3 (com supremo) = greater.
// A gema pode ir em qualquer vessel; cada mod só vale quando o Vessel Resonance do domínio chega ao nível dele.

import { useState } from "react";
import { WodIcon } from "@/components/WodIcons";
import { GEM_ITEM, GEM_RECS } from "@/data/gem-data";
import { WOD_BASIC, formatGem, shortName, supremeEffect, supremeName } from "@/data/wod-strings";
import type { WodVocId } from "@/data/wod-vocs";
import { wikiImage } from "@/lib/md5";

const SIZES = [
  { n: 1, label: "Pequena", prefix: "Lesser " },
  { n: 2, label: "Média", prefix: "" },
  { n: 3, label: "Grande", prefix: "Greater " },
];
const ROMAN = ["", "I", "II", "III"];

const basicLabel = (m: any) => m.effects.map((e: any) => `${formatGem(WOD_BASIC[e.id]?.[1] ?? "", e.value)} ${WOD_BASIC[e.id]?.[0] ?? ""}`).join(" / ");

function Picker({
  items,
  value,
  onPick,
  sheet,
  label,
  rec,
  disabled,
}: {
  items: { id: number; title: string }[];
  value: number;
  onPick: (id: number) => void;
  sheet: "basic" | "supreme";
  label: string;
  rec: (id: number) => boolean;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <div className="font-bold text-[11px] mb-0.5">{label}</div>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          title="nenhum"
          onClick={() => onPick(-1)}
          className={`w-[34px] h-[34px] rounded border text-[10px] ${value < 0 ? "border-[#ffd700] bg-[#4a3a22] text-[#ffd700]" : "border-[#5f4d41] bg-[#1b140f] text-[#9a917c]"}`}
        >
          —
        </button>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            title={it.title + (rec(it.id) ? " · sugerido" : "")}
            onClick={() => onPick(it.id)}
            className={`relative w-[34px] h-[34px] grid place-items-center rounded border ${value === it.id ? "border-[#ffd700] bg-[#4a3a22]" : "border-[#5f4d41] bg-[#1b140f] hover:border-[#b98a5a]"}`}
          >
            <WodIcon sheet={sheet} index={it.id} size={28} />
            {rec(it.id) && <span className="absolute -top-1.5 -right-1 text-[#ffd700] text-[11px] [text-shadow:0_1px_1px_#000]">★</span>}
          </button>
        ))}
      </div>
      {value >= 0 && <div className="text-[11px] mt-0.5">{items.find((i) => i.id === value)?.title}</div>}
    </div>
  );
}

export default function GemEditor({
  c,
  voc,
  basic1,
  basic2,
  supremeAvail,
  modChange,
}: {
  c: any;
  voc: WodVocId;
  basic1: any[];
  basic2: any[];
  supremeAvail: number[];
  modChange: (pos: number, value: number) => void;
}) {
  const count = (c.keyBasicMod1 >= 0 ? 1 : 0) + (c.keyBasicMod2 >= 0 ? 1 : 0) + (c.keySupremeMod >= 0 ? 1 : 0);
  const [chosen, setChosen] = useState(0);
  const size = Math.max(count, chosen);
  const vl = c.vesselLevel as number;
  const gem = GEM_ITEM[voc];
  const recs = GEM_RECS[voc];
  const recBasic = (id: number) => recs.basic.some((r) => r.basic?.includes(id));
  const recSup = (id: number) => recs.supreme.some((r) => r.supreme?.(supremeName(id), supremeEffect(id, 0)));

  const setSize = (n: number) => {
    setChosen(n);
    // diminuir o tamanho tira os mods de cima para baixo
    if (n < 3 && c.keySupremeMod >= 0) modChange(3, -1);
    if (n < 2 && c.keyBasicMod2 >= 0) modChange(2, -1);
    if (n < 1 && c.keyBasicMod1 >= 0) modChange(1, -1);
  };
  const suggest = () => {
    const n = size || (vl >= 3 ? 3 : Math.max(vl, 1));
    setChosen(n);
    const m1 = [37, 31, 30].find((id) => recBasic(id) && basic1.some((m) => m.id === id)) ?? basic1[0]?.id;
    if (m1 !== undefined) modChange(1, m1);
    if (n >= 2) {
      const m2 = basic2.find((m) => m.id === 3)?.id ?? basic2[0]?.id;
      if (m2 !== undefined) modChange(2, m2);
    }
    if (n >= 3) {
      const s = supremeAvail.find((id) => recSup(id));
      if (s !== undefined) modChange(3, s);
    }
  };

  const active = (pos: number) => vl >= pos;
  const status = (pos: number) =>
    active(pos) ? <span className="good text-[10px]">ativo</span> : <span className="warn text-[10px]">inativo: precisa de Vessel Resonance {ROMAN[pos]}</span>;

  return (
    <div className="space-y-2 mt-1">
      <div className="flex flex-wrap gap-2 items-center">
        {SIZES.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => setSize(s.n === size ? 0 : s.n)}
            title={`${s.prefix}${gem} Gem`}
            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] ${size === s.n ? "border-[#ffd700] bg-[#4a3a22] text-[#ffd700]" : "border-[#5f4d41] bg-[#1b140f] text-[#d9cbb0]"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wikiImage(`${s.prefix}${gem} Gem`)} alt="" width={28} height={28} style={{ imageRendering: "pixelated" }} />
            {s.label}
          </button>
        ))}
        <button type="button" className="tc-btn !py-0.5" onClick={suggest}>
          ★ Sugestão
        </button>
      </div>
      <div className="text-[11px] muted">
        Vessel Resonance deste domínio: <b>{ROMAN[vl] || "nenhum"}</b>. {size === 0 ? "Escolha o tamanho da gema." : `${SIZES[size - 1].prefix}${gem} Gem.`}
        {c.hasGem ? ` Bônus do vessel: +${c.vesselDamageHealingBonus} de dano e cura.` : ""}
      </div>
      {size >= 1 && (
        <div>
          <Picker
            label="Mod básico 1"
            sheet="basic"
            items={basic1.map((m) => ({ id: m.id, title: basicLabel(m) }))}
            value={c.keyBasicMod1}
            onPick={(id) => modChange(1, id)}
            rec={recBasic}
          />
          {status(1)}
        </div>
      )}
      {size >= 2 && (
        <div>
          <Picker
            label="Mod básico 2 (só resistências)"
            sheet="basic"
            items={basic2.map((m) => ({ id: m.id, title: basicLabel(m) }))}
            value={c.keyBasicMod2}
            onPick={(id) => modChange(2, id)}
            rec={recBasic}
            disabled={c.keyBasicMod1 < 0}
          />
          {status(2)}
        </div>
      )}
      {size >= 3 && (
        <div>
          <Picker
            label="Mod supremo"
            sheet="supreme"
            items={supremeAvail.map((id) => ({ id, title: `${shortName(supremeName(id))}: ${supremeEffect(id)}` }))}
            value={c.keySupremeMod}
            onPick={(id) => modChange(3, id)}
            rec={recSup}
            disabled={c.keyBasicMod2 < 0}
          />
          {status(3)}
        </div>
      )}
      <p className="muted text-[10px]">
        ★ mods que o TibiaPal recomenda para a vocação. Mods básicos com o valor do grau IV e supremos com o do grau I, como no planner oficial. A gema certa para cada vessel: pequena no Vessel Resonance I, média no II e grande no III (quando casam, o vessel dá +1, +1 e +2 de
        dano e cura).
      </p>
    </div>
  );
}
