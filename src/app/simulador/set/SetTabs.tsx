"use client";

import { useEffect, useState } from "react";
import Box from "@/components/Box";
import { wikiImage } from "@/lib/md5";
import { getActive, setActiveVoc, useActive } from "@/lib/active";
import SetCalculator from "./SetCalculator";
import VocSetBuilder, { Voc } from "./VocSetBuilder";

type Tab = "sorcerer" | Voc;
const TABS: [Tab, string, string][] = [
  ["sorcerer", "Master Sorcerer", "Outfit Mage Male Addon 3"],
  ["druid", "Elder Druid", "Outfit Druid Male Addon 3"],
  ["knight", "Elite Knight", "Outfit Knight Male Addon 3"],
  ["paladin", "Royal Paladin", "Outfit Hunter Male Addon 3"],
  ["monk", "Exalted Monk", "Outfit Monk Male Addon 3"],
];

/** Uma aba por vocação. Sorcerer usa o montador completo (forja, comparação e simulador de dano). */
export default function SetTabs() {
  const [tab, setTab] = useState<Tab>("sorcerer");
  const { voc } = useActive();
  // link com ?voc= (ou o antigo ?v=) vale mais; sem ele, abre na vocação ativa
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const v = (u.get("voc") ?? u.get("v")) as Tab | null;
    if (v && TABS.some(([t]) => t === v)) {
      setTab(v);
      setActiveVoc(v);
    } else if (getActive().voc) setTab(getActive().voc as Tab);
  }, []);
  // vocação trocada na barra do topo
  useEffect(() => {
    if (voc && voc !== tab) {
      setTab(voc);
      window.history.replaceState(null, "", window.location.pathname + (voc === "sorcerer" ? "" : `?voc=${voc}`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const choose = (t: Tab) => {
    setTab(t);
    setActiveVoc(t);
    // troca de vocação começa limpa; o link compartilhado só vale para a vocação dele
    window.history.replaceState(null, "", window.location.pathname + (t === "sorcerer" ? "" : `?voc=${t}`));
  };
  const label = TABS.find(([t]) => t === tab)?.[1] ?? "";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {TABS.map(([t, l, outfit]) => (
          <button key={t} type="button" className={`tc-btn tc-voc-tab flex items-center gap-1 !pl-1 ${tab === t ? "is-active" : "opacity-60"}`} onClick={() => choose(t)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wikiImage(outfit)} alt="" width={32} height={32} className="-my-2" style={{ imageRendering: "pixelated" }} />
            {l}
          </button>
        ))}
      </div>
      <Box title={`Inventário · ${label}`}>{tab === "sorcerer" ? <SetCalculator /> : <VocSetBuilder key={tab} voc={tab} />}</Box>
    </div>
  );
}
