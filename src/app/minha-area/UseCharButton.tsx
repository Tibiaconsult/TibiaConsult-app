"use client";

import { ActiveChar, setActiveChar, useActive } from "@/lib/active";

/** Torna este char o ativo: o site todo passa a usar a vocação, o level e o ML dele. */
export default function UseCharButton({ char }: { char: ActiveChar }) {
  const { char: active } = useActive();
  if (active?.id === char.id) return <span className="good text-[12px] font-bold">Char ativo no site</span>;
  return (
    <button type="button" className="tc-btn" onClick={() => setActiveChar(char)}>
      Usar este char no site
    </button>
  );
}
