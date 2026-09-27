"use client";

import { useEffect, useState } from "react";
import { RASHID_PLACES as PLACES, tibiaWeekday } from "@/lib/rashid";

// Rashid muda de cidade a cada server save (10h no horário de Berlim).
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
