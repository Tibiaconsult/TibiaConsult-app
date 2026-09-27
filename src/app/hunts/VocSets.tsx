"use client";

import NumberInput from "@/components/NumberInput";
import { useState } from "react";
import { setActiveVoc, useActive } from "@/lib/active";
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
  // a aba segue a vocação ativa (barra do topo); o level parte do char ativo, se for dessa vocação
  const { voc, char } = useActive();
  const tab: Tab = voc ?? "sorcerer";
  const setTab = (t: Tab) => setActiveVoc(t);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const rec = HUNT_RECS[h.id];
  const level = levels[tab] ?? (char?.vocation === tab ? char.level : Math.max(rec?.solo[tab] ?? 800, 800));
  const auto = suggestSet(h, tab, level);

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map(([t, l]) => (
          <button
            key={t}
            type="button"
            className={`tc-btn !py-0.5 ${tab === t ? "" : "opacity-60"}`}
            onClick={() => setTab(t)}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "sorcerer" && (
        <div className="mb-3">
          <div className="font-bold text-[12px] mb-1">
            Set recomendado nesta ficha
          </div>
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
          <div className="font-bold text-[12px] mt-3">
            Sugestão automática pelo level
          </div>
        </div>
      )}
      {auto && (
        <div>
          <div className="flex flex-wrap gap-3 items-end text-[12px] mb-2">
            <label>
              <span className="font-bold block">Itens até o level</span>
              <NumberInput className="w-24" min={250} max={5000} value={level} onValue={(v) => setLevels({ ...levels, [tab]: v })} />
            </label>
            <span>
              <b>Ataque:</b>{" "}
              {auto.offense
                .slice(0, 3)
                .map((o) => `${EL_PT[o.el]} ${Math.round(o.pct)}%`)
                .join(" · ")}
            </span>
            <span>
              <b>Creatures batem com:</b>{" "}
              {auto.incoming
                .slice(0, 4)
                .map(([el]) => EL_PT[el])
                .join(", ") || "não informado"}
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
                        {p.item.name}{" "}
                        <span className="muted font-normal text-[10px]">
                          lv {p.item.level}
                        </span>
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
            Sugestão automática: o elemento de ataque sai das resistências dos
            creatures; cada peça é a de maior proteção contra os elementos que
            aparecem nos ataques deles, entre os itens de level 250+ da vocação
            até o level escolhido. Não é um set testado em jogo.
          </p>
        </div>
      )}
    </div>
  );
}
