import Link from "next/link";

export type AnyVoc = "sorcerer" | "druid" | "knight" | "paladin" | "monk";
export const ALL_VOCS: [AnyVoc, string, string][] = [
  ["sorcerer", "Master Sorcerer", "energywave"],
  ["druid", "Elder Druid", "eternalwinter"],
  ["knight", "Elite Knight", "fierceberserk"],
  ["paladin", "Royal Paladin", "divinecaldera"],
  ["monk", "Exalted Monk", "spiritualoutburst"],
];

export function parseVoc(v: string | string[] | undefined): AnyVoc {
  const s = Array.isArray(v) ? v[0] : v;
  return ALL_VOCS.some(([id]) => id === s) ? (s as AnyVoc) : "sorcerer";
}

/** Abas de vocação por link (?voc=), com o ícone de uma magia marcante de cada uma. */
export default function VocTabs({ base, current }: { base: string; current: AnyVoc }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {ALL_VOCS.map(([id, label, emblem]) => (
        <Link key={id} href={id === "sorcerer" ? base : `${base}?voc=${id}`} className={`tc-btn flex items-center gap-1 !pl-1 ${current === id ? "" : "opacity-60"}`} scroll={false}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://static.tibia.com/images/library/${emblem}.png`} alt="" width={22} height={22} />
          {label}
        </Link>
      ))}
    </div>
  );
}
