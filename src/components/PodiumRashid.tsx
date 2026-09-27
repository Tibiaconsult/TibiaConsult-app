"use client";

import { useEffect, useState } from "react";
import { RASHID_PLACES, tibiaWeekday } from "@/lib/rashid";
import PodiumStep from "./PodiumStep";

// Rashid no pódio: a cidade muda a cada server save, então é calculada no navegador (e confere de minuto em minuto).
export default function PodiumRashid() {
  const [day, setDay] = useState<number | null>(null);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDay(tibiaWeekday(new Date()));
    const t = setInterval(() => setDay(tibiaWeekday(new Date())), 60_000);
    return () => clearInterval(t);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  if (day === null) return <div className="tc-podium-step" style={{ visibility: "hidden" }} />;
  const p = RASHID_PLACES[day];
  return <PodiumStep place="3" label="Rashid hoje" name={p.city} sub={p.where} img="/rashid.webp" height={34} />;
}
