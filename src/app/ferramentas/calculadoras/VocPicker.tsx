"use client";

import { wikiImage } from "@/lib/md5";
import type { StatVoc } from "@/lib/calcs";

export const VOC_OUTFIT: Record<StatVoc, [string, string]> = {
  sorcerer: ["Sorcerer", "Outfit Mage Male Addon 3"],
  druid: ["Druid", "Outfit Druid Male Addon 3"],
  knight: ["Knight", "Outfit Knight Male Addon 3"],
  paladin: ["Paladin", "Outfit Hunter Male Addon 3"],
  monk: ["Monk", "Outfit Monk Male Addon 3"],
};

/** Seleção de vocação com o outfit de cada uma (imagens da TibiaWiki). */
export default function VocPicker({ value, onChange }: { value: StatVoc; onChange: (v: StatVoc) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(VOC_OUTFIT) as StatVoc[]).map((v) => (
        <button key={v} type="button" className={`tc-btn flex items-center gap-1 !pl-1 ${value === v ? "" : "opacity-60"}`} onClick={() => onChange(v)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wikiImage(VOC_OUTFIT[v][1])} alt="" width={32} height={32} className="-my-2" style={{ imageRendering: "pixelated" }} />
          {VOC_OUTFIT[v][0]}
        </button>
      ))}
    </div>
  );
}
