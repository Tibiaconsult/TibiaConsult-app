"use client";

// Números reais da guild nesta hunt (Hunt Analyser colado pela turma): sessões, XP/h e lucro/h médios, por vocação.

import Link from "next/link";
import { useEffect, useState } from "react";
import { fmtK } from "@/lib/huntanalyser";
import { createClient } from "@/lib/supabase/client";

type Row = { vocation: string | null; level: number; xp_h: number; profit_h: number };

export default function GuildHuntStats({ huntId }: { huntId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    createClient()
      .from("hunt_sessions")
      .select("vocation, level, xp_h, profit_h")
      .eq("hunt_id", huntId)
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [huntId]);
  if (rows === null) return null;
  const avg = (k: "xp_h" | "profit_h" | "level") => rows.reduce((a, r) => a + Number(r[k]), 0) / rows.length;
  return (
    <div className="border border-[#3a5a8a] rounded p-3 bg-[#dde6f3] mt-3 text-[12px]">
      <div className="font-bold mb-1">📊 Dados da guild nesta hunt</div>
      {rows.length === 0 ? (
        <p>
          Ninguém publicou sessão aqui ainda. Caçou? Cole o Hunt Analyser no <Link href="/hunts/analyser">Hunt Analyser da guild</Link>.
        </p>
      ) : (
        <p>
          {rows.length} {rows.length === 1 ? "sessão" : "sessões"} · level médio {Math.round(avg("level"))} · <b>{fmtK(Math.round(avg("xp_h")))} XP/h</b> ·{" "}
          <b>{fmtK(Math.round(avg("profit_h")))}/h de lucro</b> · <Link href="/hunts/analyser">ver ranking</Link>
        </p>
      )}
    </div>
  );
}
