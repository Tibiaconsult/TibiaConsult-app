"use client";

// Supplies para a hunt na vocação e level do char ativo (ou escolhidos aqui): potions, runas e o dano que mais bate.

import Link from "next/link";
import { useState } from "react";
import type { Hunt } from "@/data/hunts";
import { VOCS, VOC_SHORT, Voc, useActive } from "@/lib/active";
import { itemIcon } from "@/lib/icons";
import { SUPPLY_PRICE, suggestSupplies } from "@/lib/supplies";

export default function HuntSupplies({ h, recLevel, teamLevel }: { h: Hunt; recLevel: Partial<Record<Voc, number>>; teamLevel: number | null }) {
  const { voc: activeVoc, char } = useActive();
  const [pick, setPick] = useState<Voc | null>(null);
  const [lvl, setLvl] = useState<number | null>(null);
  const voc = pick ?? char?.vocation ?? activeVoc ?? "knight";
  const level = lvl ?? (char && char.vocation === voc ? char.level : (recLevel[voc] ?? teamLevel ?? 300));
  const { list, incoming } = suggestSupplies(h, voc, level);
  return (
    <div className="border border-[#b98a5a] rounded p-3 bg-white/40 mt-3">
      <div className="font-bold mb-1">🧪 Supplies</div>
      <div className="flex flex-wrap items-center gap-2 text-[12px] mb-2">
        <select value={voc} onChange={(e) => (setPick(e.target.value as Voc), setLvl(null))}>
          {VOCS.map((v) => (
            <option key={v} value={v}>
              {VOC_SHORT[v]}
            </option>
          ))}
        </select>
        <label>
          level{" "}
          <input
            type="number"
            min={8}
            max={3000}
            value={level}
            onChange={(e) => setLvl(Math.max(8, Math.min(3000, Number(e.target.value) || 8)))}
            className="w-20"
          />
        </label>
      </div>
      <ul className="space-y-1 text-[12px]">
        {list.map((s) => (
          <li key={s.item}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={itemIcon(s.item)} alt="" width={24} height={24} loading="lazy" className="sprite inline-block align-middle mr-1" />
            <b>{s.item}</b>: {s.why}
            {SUPPLY_PRICE[s.item] && <span className="muted"> · 100 un. = {((SUPPLY_PRICE[s.item] * 100) / 1000).toLocaleString("pt-BR")}k</span>}
          </li>
        ))}
      </ul>
      {incoming.length > 0 && (
        <p className="text-[12px] mt-2">
          <b>O que mais bate em você:</b>{" "}
          {incoming.map((r, i) => (
            <span key={r.label}>
              {i > 0 && "; "}
              {r.label} ({r.share}% do dano, até {r.maxHit.toLocaleString("pt-BR")} no {r.attack} de {r.creature})
            </span>
          ))}
          . Proteção desse elemento em anel, amuleto ou imbuement vale mais que potion extra.
        </p>
      )}
      <p className="muted text-[10px] mt-2">
        Sugestão calculada pelas fraquezas e ataques das creatures (TibiaWiki). Set, imbuements e charm completos em{" "}
        <Link href={`/hunts/preparar?h=${h.id}`}>Preparar para esta hunt</Link>.
      </p>
    </div>
  );
}
