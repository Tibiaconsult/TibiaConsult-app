"use client";

// Lista de criaturas com busca, filtros (hunt, classe do bestiário) e ordenação.

import Link from "next/link";
import { useMemo, useState } from "react";
import Box from "@/components/Box";
import { ELEMENT_EMOJI, ELEMENT_PT, LEVEL_PT, creatureHref } from "@/lib/creature-labels";
import { creatureIcon } from "@/lib/icons";

export interface Row {
  name: string;
  page: string;
  hp: number;
  exp: number;
  cls: string | null;
  level: string | null;
  charms: number | null;
  kills: number | null;
  weak: { el: string; pct: number } | null;
  hunts: { id: string; name: string }[];
}

const SORTS = {
  name: { label: "Nome", fn: (a: Row, b: Row) => a.name.localeCompare(b.name) },
  exp: { label: "Mais exp", fn: (a: Row, b: Row) => b.exp - a.exp },
  ratio: { label: "Exp por HP", fn: (a: Row, b: Row) => b.exp / (b.hp || 1) - a.exp / (a.hp || 1) },
  hp: { label: "Mais vida", fn: (a: Row, b: Row) => b.hp - a.hp },
  charms: { label: "Charm points", fn: (a: Row, b: Row) => (b.charms ?? 0) - (a.charms ?? 0) },
};

const n = (v: number) => v.toLocaleString("pt-BR");

export default function CreatureList({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [hunt, setHunt] = useState("");
  const [cls, setCls] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("name");

  const hunts = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) for (const h of r.hunts) m.set(h.id, h.name);
    return [...m].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);
  const classes = useMemo(() => [...new Set(rows.map((r) => r.cls).filter(Boolean) as string[])].sort(), [rows]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows
      .filter((r) => (!t || r.name.toLowerCase().includes(t)) && (!hunt || r.hunts.some((h) => h.id === hunt)) && (!cls || r.cls === cls))
      .sort(SORTS[sort].fn);
  }, [rows, q, hunt, cls, sort]);

  return (
    <Box title={`🐾 ${list.length} de ${rows.length} criaturas`}>
      <div className="flex flex-wrap gap-2 mb-3 text-[12px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar criatura..."
          className="flex-1 min-w-[160px]"
          aria-label="Buscar criatura"
        />
        <select value={hunt} onChange={(e) => setHunt(e.target.value)} aria-label="Hunt" className="max-w-[220px]">
          <option value="">Todas as hunts</option>
          {hunts.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Classe do bestiário">
          <option value="">Todas as classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} aria-label="Ordenar">
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>
              Ordenar: {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <Link
            key={r.name}
            href={creatureHref(r.name)}
            className="flex gap-2 items-center border border-[#b98a5a] rounded p-2 bg-white/40 hover:bg-white/70 !no-underline text-[#3a1a00]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creatureIcon(r.name)} alt="" width={48} height={48} loading="lazy" className="sprite shrink-0" style={{ objectFit: "contain" }} />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[13px] truncate">{r.name}</div>
              <div className="text-[11px]">
                ❤️ {n(r.hp)} · ⭐ {n(r.exp)} exp
              </div>
              <div className="text-[11px] muted truncate">
                {r.cls ?? "?"}
                {r.level ? ` · ${LEVEL_PT[r.level] ?? r.level}` : ""}
                {r.charms !== null ? ` · ${r.charms} charm pts` : ""}
                {r.weak ? ` · fraco a ${ELEMENT_EMOJI[r.weak.el]} ${ELEMENT_PT[r.weak.el]} ${r.weak.pct}%` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="muted text-[12px]">Nenhuma criatura com esses filtros.</p>}
    </Box>
  );
}
