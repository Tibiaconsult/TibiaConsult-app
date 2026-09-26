"use client";

import { useState } from "react";
import { ItemSprite } from "@/components/Icons";
import { SLOT_ORDER, VOC_EQUIPMENT } from "@/data/voc-equipment";
import { AMMO, JEWELRY } from "@/data/voc-extras";

export default function EquipmentBySlot({ voc }: { voc: string }) {
  const base = VOC_EQUIPMENT[voc] ?? [];
  const names = new Set(base.map((r) => r.name));
  // anéis, amuletos e munição da TibiaWiki entram junto com a lista 250+ do TibiaPal
  const rows = [...base, ...[...JEWELRY, ...AMMO].filter((r) => (r.vocs.length === 0 || r.vocs.includes(voc)) && !names.has(r.name))];
  const slots = [...SLOT_ORDER, "Munição"].filter((s) => rows.some((r) => r.slot === s));
  const [slot, setSlot] = useState(slots[0] ?? "");
  const [level, setLevel] = useState(0);
  const shown = rows.filter((r) => r.slot === slot && (!level || r.level <= level)).sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        {slots.map((s) => (
          <button key={s} type="button" className={`tc-btn ${slot === s ? "" : "opacity-60"}`} onClick={() => setSlot(s)}>
            {s} ({rows.filter((r) => r.slot === s && (!level || r.level <= level)).length})
          </button>
        ))}
        <label className="text-[12px] ml-auto">
          <span className="font-bold block">Até o level</span>
          <input type="number" className="w-24" min={0} value={level || ""} placeholder="todos" onChange={(e) => setLevel(Number(e.target.value) || 0)} />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Lv</th>
              <th>Atributos</th>
              <th>Bônus</th>
              <th>Proteção</th>
              <th>Imbue</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.name}>
                <td className="font-bold whitespace-nowrap">
                  <ItemSprite name={r.name} />
                  {r.name}
                  {(r.kind || r.hands) && (
                    <div className="muted font-normal text-[10px]">
                      {r.kind}
                      {r.hands ? ` · duas mãos` : ""}
                    </div>
                  )}
                </td>
                <td>{r.level}</td>
                <td className="text-[11px]">{r.stats || "-"}</td>
                <td className="text-[11px]">{r.bonus || "-"}</td>
                <td className="text-[11px]">{r.resist || "-"}</td>
                <td>{r.imb || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p className="text-[12px]">Nenhum item desse slot até esse level.</p>}
      <p className="muted text-[10px]">
        Armas, escudos e armaduras de level 250 ou mais pela lista do TibiaPal (Vocation Equipment Reference); anéis, amuletos e munição pela
        TibiaWiki. Atributos e proteções: TibiaWiki. Consulta em 26/09/2026.
      </p>
    </div>
  );
}
