"use client";

// Números reais da guild nesta hunt (Hunt Analyser colado pela turma): sessões, level médio e XP/h e lucro/h médios de todas
// as vocações, ponderados pelo tempo de cada sessão.

import Link from "next/link";
import { useEffect, useState } from "react";
import { fmtK } from "@/lib/huntanalyser";
import { createClient } from "@/lib/supabase/client";

type Row = { vocation: string | null; level: number; minutes: number; xp: number; balance: number };

export default function GuildHuntStats({ huntId }: { huntId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    createClient()
      .from("hunt_sessions")
      .select("vocation, level, minutes, xp, balance")
      .eq("hunt_id", huntId)
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [huntId]);
  if (rows === null) return null;
  const sum = (k: "minutes" | "xp" | "balance" | "level") => rows.reduce((a, r) => a + Number(r[k]), 0);
  const perHour = (k: "xp" | "balance") => (sum(k) * 60) / (sum("minutes") || 1);
  return (
    <div className="border border-[#3a5a8a] rounded p-3 bg-[#dde6f3] mt-3 text-[12px]">
      <div className="font-bold mb-1">📊 Dados da guild nesta hunt</div>
      {rows.length === 0 ? (
        <p>
          Ninguém publicou sessão aqui ainda. Caçou? Cole o Hunt Analyser no <Link href="/hunts/analyser">Hunt Analyser da guild</Link>.
        </p>
      ) : (
        <p>
          {rows.length} {rows.length === 1 ? "sessão" : "sessões"} · level médio {Math.round(sum("level") / rows.length)} · <b>{fmtK(Math.round(perHour("xp")))} XP/h</b> ·{" "}
          <b>{fmtK(Math.round(perHour("balance")))}/h de lucro</b> · <Link href="/hunts/analyser">ver ranking</Link>
        </p>
      )}
    </div>
  );
}
