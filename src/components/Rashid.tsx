"use client";

import { useEffect, useState } from "react";

// Rashid muda de cidade a cada server save (10h no horário de Berlim). Fonte: TibiaWiki, Rashid (consulta em 26/09/2026).
const PLACES: Record<number, { city: string; where: string }> = {
  1: { city: "Svargrond", where: "taverna do Dankwart, ao sul do templo" },
  2: { city: "Liberty Bay", where: "taverna do Lyonel, a oeste do depot" },
  3: { city: "Port Hope", where: "taverna do Clyde, a oeste do depot" },
  4: { city: "Ankrahmun", where: "taverna do Arito, acima do correio" },
  5: { city: "Darashia", where: "taverna da Miraia, ao sul das guildhalls" },
  6: { city: "Edron", where: "taverna da Mirabell, acima do depot" },
  0: { city: "Carlin", where: "depot, um andar acima" },
};

function tibiaWeekday(now: Date): number {
  // horário de Berlim menos 10 horas = "dia do Tibia"
  const berlin = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  berlin.setHours(berlin.getHours() - 10);
  return berlin.getDay();
}

export default function Rashid() {
  const [day, setDay] = useState<number | null>(null);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDay(tibiaWeekday(new Date()));
    const t = setInterval(() => setDay(tibiaWeekday(new Date())), 60_000);
    return () => clearInterval(t);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  if (day === null) return null;
  const p = PLACES[day];
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rashid.webp" alt="" width={32} height={32} className="sprite" />
      <div className="text-[12px] leading-tight">
        <div className="muted text-[10px]">Rashid hoje</div>
        <div className="font-bold">{p.city}</div>
        <div className="text-[10px]">{p.where}</div>
      </div>
    </div>
  );
}
