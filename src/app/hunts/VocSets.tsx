"use client";

import { useState } from "react";
import { ItemSprite } from "@/components/Icons";
import type { Hunt } from "@/data/hunts";
import { HUNT_RECS } from "@/data/hunt-recs";
import { EL_PT, SetVoc, suggestSet } from "@/lib/huntset";

type Tab = "sorcerer" | SetVoc;
const TABS: [Tab, string][] = [
  ["sorcerer", "Sorcerer"],
  ["druid", "Druid"],
  ["knight", "Knight"],
  ["paladin", "Paladin"],
  ["monk", "Monk"],
];

export default function VocSets({ h }: { h: Hunt }) {
  const [tab, setTab] = useState<Tab>("sorcerer");
  const [levels, setLevels] = useState<Record<string, number>>({});
  const rec = HUNT_RECS[h.id];
  const level = tab === "sorcerer" ? 0 : (levels[tab] ?? Math.max(rec?.solo[tab] ?? 800, 800));
  const auto = tab === "sorcerer" ? null : suggestSet(h, tab, level);

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map(([t, l]) => (
          <button key={t} type="button" className={`tc-btn !py-0.5 ${tab === t ? "" : "opacity-60"}`} onClick={() => setTab(t)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "sorcerer" ? (
        <table>
          <tbody>
            {h.set.map((s) => (
              <tr key={s.slot}>
                <td className="muted whitespace-nowrap">{s.slot}</td>
                <td className="font-bold">
                  <ItemSprite name={s.item} size={28} />
                  {s.item}
                </td>
                <td>{s.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        auto && (
          <div>
            <div className="flex flex-wrap gap-3 items-end text-[12px] mb-2">
              <label>
                <span className="font-bold block">Itens até o level</span>
                <input type="number" className="w-24" min={250} value={level} onChange={(e) => setLevels({ ...levels, [tab]: Number(e.target.value) || 250 })} />
              </label>
              <span>
                <b>Ataque:</b>{" "}
                {auto.offense
                  .slice(0, 3)
                  .map((o) => `${EL_PT[o.el]} ${Math.round(o.pct)}%`)
                  .join(" · ")}
              </span>
              <span>
                <b>Bichos batem com:</b> {auto.incoming.slice(0, 4).map(([el]) => EL_PT[el]).join(", ") || "não informado"}
              </span>
            </div>
            <table>
              <tbody>
                {auto.picks.map((p) => (
                  <tr key={p.slot}>
                    <td className="muted whitespace-nowrap">{p.slot}</td>
                    <td className="font-bold">
                      {p.item ? (
                        <>
                          <ItemSprite name={p.item.name} size={28} />
                          {p.item.name} <span className="muted font-normal text-[10px]">lv {p.item.level}</span>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-[11px]">{p.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted text-[10px] mt-1">
              Sugestão automática: o elemento de ataque sai das resistências dos bichos; cada peça é a de maior proteção contra os elementos que
              aparecem nos ataques deles, entre os itens de level 250+ da vocação até o level escolhido. Não é um set testado em jogo.
            </p>
          </div>
        )
      )}
    </div>
  );
}
