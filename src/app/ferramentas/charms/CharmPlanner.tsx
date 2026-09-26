"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BESTIARY, CHARMS, CHARMS_VERY_RARE } from "@/data/bestiary";
import { CHARM_LIST, Charm, CharmKind, ECHOES_PER_MAJOR_LEVEL, ECHOES_PROMOTION } from "@/data/charms";
import { HUNTS } from "@/data/hunts";
import { ELEMENT_LABEL } from "@/data/spells";
import { useActive } from "@/lib/active";
import { charmRanking } from "@/lib/huntprep";
import { wikiImage } from "@/lib/md5";
import { createClient } from "@/lib/supabase/client";

// Planejador de charms: nível atual e desejado de cada charm, custo em charm points (major) e em Minor Charm Echoes (minor),
// com os pontos do Bestiary Tracker e o charm de dano de cada hunt.

type Plan = Record<string, { have: number; want: number }>;
const KEY = "tc-charm-plan";
const KIND_LABEL: Record<CharmKind, string> = { dano: "Dano", defesa: "Defesa", utilidade: "Utilidade" };
const fmt = (v: number) => v.toLocaleString("pt-BR");
const sumRange = (arr: number[], from: number, to: number) => arr.slice(from, to).reduce((a, b) => a + b, 0);
const charmPointsOf = (row: (typeof BESTIARY)[number]) => (row[3] ? CHARMS_VERY_RARE[row[1]] : CHARMS[row[1]]);

function readPlan(): Plan {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function LevelSelect({ value, onChange, min = 0, label }: { value: number; onChange: (v: number) => void; min?: number; label: string }) {
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label}>
      {[0, 1, 2, 3].map((n) =>
        n < min ? null : (
          <option key={n} value={n}>
            {n === 0 ? "nenhum" : `nível ${n}`}
          </option>
        ),
      )}
    </select>
  );
}

export default function CharmPlanner() {
  const { char } = useActive();
  const [plan, setPlan] = useState<Plan>({});
  const [points, setPoints] = useState(0);
  const [promoted, setPromoted] = useState(true);
  const [bestiary, setBestiary] = useState<{ points: number; from: string } | null>(null);
  const [huntId, setHuntId] = useState(HUNTS[0]?.id ?? "");

  // plano guardado neste navegador
  useEffect(() => {
    const p = readPlan();
    setPlan(p);
  }, []);
  const save = (next: Plan) => {
    setPlan(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  };

  // charm points já feitos no Bestiary Tracker: do char ativo (conta) ou deste navegador
  useEffect(() => {
    let alive = true;
    const fromNames = (names: string[]) => {
      const set = new Set(names);
      return BESTIARY.reduce((a, r) => a + (set.has(r[0]) ? charmPointsOf(r) : 0), 0);
    };
    if (char && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      createClient()
        .from("bestiary_progress")
        .select("creature")
        .eq("char_id", char.id)
        .then(({ data }) => alive && setBestiary({ points: fromNames((data ?? []).map((r) => r.creature as string)), from: char.name }));
    } else {
      try {
        const local = JSON.parse(localStorage.getItem("tc-bestiary-local") ?? "[]") as string[];
        if (local.length) setBestiary({ points: fromNames(local), from: "este navegador" });
      } catch {
        // sem armazenamento
      }
    }
    return () => {
      alive = false;
    };
  }, [char]);

  const lv = (c: Charm) => plan[c.name] ?? { have: 0, want: 0 };
  const setLv = (c: Charm, patch: Partial<{ have: number; want: number }>) => {
    const cur = { ...lv(c), ...patch };
    if (cur.want < cur.have) cur.want = cur.have;
    save({ ...plan, [c.name]: cur });
  };

  const totals = useMemo(() => {
    let majorCost = 0;
    let echoesEarned = promoted ? ECHOES_PROMOTION : 0;
    let minorCost = 0;
    for (const c of CHARM_LIST) {
      const { have, want } = plan[c.name] ?? { have: 0, want: 0 };
      if (c.type === "major") {
        majorCost += sumRange(c.cost, have, want);
        echoesEarned += sumRange(ECHOES_PER_MAJOR_LEVEL, 0, want);
      } else minorCost += sumRange(c.cost, 0, want);
    }
    return { majorCost, echoesEarned, minorCost };
  }, [plan, promoted]);

  const hunt = HUNTS.find((h) => h.id === huntId);
  const ranking = hunt ? charmRanking(hunt) : [];
  const left = points - totals.majorCost;
  const echoesLeft = totals.echoesEarned - totals.minorCost;

  const table = (type: "major" | "minor") => (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Charm</th>
            <th>Tipo</th>
            <th>Efeito (TibiaWiki)</th>
            <th>{type === "major" ? "Charm points por nível" : "Echoes por nível"}</th>
            <th>Tenho</th>
            <th>Quero</th>
            <th>Custo</th>
          </tr>
        </thead>
        <tbody>
          {CHARM_LIST.filter((c) => c.type === type).map((c) => {
            const { have, want } = lv(c);
            const cost = sumRange(c.cost, have, want);
            return (
              <tr key={c.name}>
                <td className="font-bold whitespace-nowrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wikiImage(c.name === "Curse" ? "Curse (Charm)" : c.name, "png")}
                    alt=""
                    width={24}
                    height={24}
                    className="inline-block align-middle mr-1"
                    loading="lazy"
                  />
                  {c.name}
                </td>
                <td>
                  <span className="tag">{KIND_LABEL[c.kind]}</span>
                </td>
                <td className="text-[11px] min-w-[240px]">
                  {c.effect}
                  {c.notes && <div className="muted text-[10px] mt-0.5">{c.notes.length > 180 ? c.notes.slice(0, 180) + "…" : c.notes}</div>}
                </td>
                <td className="whitespace-nowrap">{c.cost.map(fmt).join(" / ")}</td>
                <td>
                  <LevelSelect label={`${c.name}: nível atual`} value={have} onChange={(v) => setLv(c, { have: v })} />
                </td>
                <td>
                  <LevelSelect label={`${c.name}: nível desejado`} value={want} min={have} onChange={(v) => setLv(c, { want: v })} />
                </td>
                <td className={cost ? "font-bold" : "muted"}>{cost ? fmt(cost) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5 text-[12px]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <span className="font-bold block">Charm points disponíveis</span>
          <input type="number" min={0} className="mt-1 w-32" value={points} onChange={(e) => setPoints(Math.max(0, Number(e.target.value) || 0))} />
          {bestiary && (
            <button type="button" className="tc-btn !py-0.5 mt-2" onClick={() => setPoints(bestiary.points)}>
              usar {fmt(bestiary.points)} do Bestiary ({bestiary.from})
            </button>
          )}
          <span className="muted block text-[10px] mt-1">Os que ainda não gastou. O Bestiary Tracker soma os pontos de todas as criaturas completas.</span>
        </label>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="muted text-[11px]">Custo do plano (major)</div>
          <div className="font-bold text-[18px] text-[#3a1a00]">{fmt(totals.majorCost)}</div>
          <div className={left >= 0 ? "good" : "bad"}>{left >= 0 ? `sobram ${fmt(left)}` : `faltam ${fmt(-left)}`}</div>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <div className="muted text-[11px]">Minor Charm Echoes no fim do plano</div>
          <div className="font-bold text-[18px] text-[#3a1a00]">
            {fmt(totals.echoesEarned)} ganhos · {fmt(totals.minorCost)} gastos
          </div>
          <div className={echoesLeft >= 0 ? "good" : "bad"}>{echoesLeft >= 0 ? `sobram ${fmt(echoesLeft)}` : `faltam ${fmt(-echoesLeft)}`}</div>
        </div>
        <label className="border border-[#b98a5a] rounded p-3 bg-white/40 flex items-start gap-2">
          <input type="checkbox" checked={promoted} onChange={(e) => setPromoted(e.target.checked)} className="mt-1" />
          <span>
            <span className="font-bold block">Char promovido</span>
            <span className="muted text-[10px]">
              +{ECHOES_PROMOTION} echoes. Cada nível de charm major rende {ECHOES_PER_MAJOR_LEVEL.join(", ")} echoes.
            </span>
          </span>
        </label>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <div className="font-bold mb-1">Qual charm de dano em cada hunt</div>
        <div className="flex flex-wrap gap-3 items-center">
          <select value={huntId} onChange={(e) => setHuntId(e.target.value)} aria-label="Hunt">
            {HUNTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          {ranking.slice(0, 3).map((r, i) => (
            <span key={r.el} className={i === 0 ? "font-bold" : ""}>
              {r.charm} <span className={`tag tag-${r.el}`}>{ELEMENT_LABEL[r.el]}</span> média {Math.round(r.avg)}%
            </span>
          ))}
          {hunt && (
            <Link href={`/hunts/preparar?h=${hunt.id}`} className="text-[11px]">
              preparar esta hunt
            </Link>
          )}
        </div>
        <p className="muted text-[10px] mt-1">
          O charm de dano tira 5% da vida máxima do bicho, limitado a 2 vezes o seu level, e depois aplica a resistência: vale o elemento que mais entra no
          lure.
        </p>
      </div>

      <div>
        <h2 className="mt-0">Charms major</h2>
        <p className="muted text-[11px] mb-1">Pagos em charm points. Só entram em criatura com o bestiário completo.</p>
        {table("major")}
      </div>
      <div>
        <h2>Charms minor</h2>
        <p className="muted text-[11px] mb-1">Pagos em Minor Charm Echoes. Entram em criatura com o estágio 2 do bestiário.</p>
        {table("minor")}
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" className="tc-btn tc-btn-danger" onClick={() => save({})}>
          limpar o plano
        </button>
        <span className="muted text-[11px]">O plano fica salvo neste navegador.</span>
      </div>
      <p className="muted text-[10px]">
        Custos, efeitos e regras de echoes: TibiaWiki (página de cada charm, Major Charms e Minor Charms), consulta em 26/09/2026. A separação em dano, defesa e
        utilidade é do site.
      </p>
    </div>
  );
}
