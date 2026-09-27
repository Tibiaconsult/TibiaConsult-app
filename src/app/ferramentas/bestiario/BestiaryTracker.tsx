"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BESTIARY, CHARMS, CHARMS_VERY_RARE, CLASSES, DIFFICULTIES, KILLS, KILLS_VERY_RARE } from "@/data/bestiary";
import { creatureIcon } from "@/lib/icons";
import { getActive } from "@/lib/active";
import { createClient } from "@/lib/supabase/client";

const DIFF_PT = ["Inofensiva", "Trivial", "Fácil", "Média", "Difícil", "Desafiadora"];
const LOCAL_KEY = "tc-bestiary-local";
const TRACK_KEY = "tc-bestiary-track";
const PAGE = 120;
const fmt = (v: number) => v.toLocaleString("pt-BR");

const charmOf = (d: number, rare: number) => (rare ? CHARMS_VERY_RARE[d] : CHARMS[d]);
const killsOf = (d: number, rare: number) => (rare ? KILLS_VERY_RARE : KILLS[d])[2];
const TOTAL_CHARMS = BESTIARY.reduce((a, r) => a + charmOf(r[1], r[3]), 0);

function readLocal(key = LOCAL_KEY): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set();
  }
}
function writeLocal(s: Set<string>, key = LOCAL_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify([...s]));
  } catch {
    // navegador sem armazenamento: segue só na memória
  }
}

// ordem da lista: o que rende mais charm points por kill que falta primeiro, por exemplo
const SORTS = {
  nome: "ordem alfabética",
  rende: "rende mais (charm por kill)",
  charms: "mais charm points",
  kills: "menos kills para completar",
} as const;
const ratio = (r: (typeof BESTIARY)[number]) => charmOf(r[1], r[3]) / killsOf(r[1], r[3]);

/** Nome na ficha de creatures (a do bestiário pode vir com "(Creature)"). */
const sheetName = (n: string) => n.replace(/ \(Creature\)$/, "");

export default function BestiaryTracker({
  chars,
  logged,
  sheets,
  boosted,
}: {
  chars: { id: string; name: string }[];
  logged: boolean;
  /** creatures com ficha no site (/criaturas) */
  sheets: string[];
  /** boosted do dia (vem do banco, depois do server save) */
  boosted: string | null;
}) {
  const [charId, setCharId] = useState(chars[0]?.id ?? "");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [tracked, setTracked] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<keyof typeof SORTS>("nome");
  const hasSheet = useMemo(() => new Set(sheets), [sheets]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState(-1);
  const [diff, setDiff] = useState(-1);
  const [status, setStatus] = useState<"todas" | "feitas" | "faltam" | "acompanhando">("todas");
  const [limit, setLimit] = useState(PAGE);
  const online = logged && Boolean(charId);

  // ?q= vem da busca do topo; o char ativo (barra do topo) abre selecionado
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get("q");
    if (u) setQ(u);
    const active = getActive().char;
    if (active && chars.some((c) => c.id === active.id)) setCharId(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!online) {
      setDone(readLocal());
      setTracked(readLocal(TRACK_KEY));
      return;
    }
    let alive = true;
    setLoading(true);
    const sb = createClient();
    Promise.all([
      sb.from("bestiary_progress").select("creature").eq("char_id", charId),
      sb.from("bestiary_tracking").select("creature").eq("char_id", charId),
    ]).then(([a, b]) => {
      if (!alive) return;
      setLoading(false);
      if (a.error || b.error) setError((a.error ?? b.error)!.message);
      else {
        setDone(new Set((a.data ?? []).map((r) => r.creature as string)));
        setTracked(new Set((b.data ?? []).map((r) => r.creature as string)));
      }
    });
    return () => {
      alive = false;
    };
  }, [online, charId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = async (name: string) => {
    const prev = done;
    const next = new Set(done);
    const has = next.has(name);
    if (has) next.delete(name);
    else next.add(name);
    setDone(next);
    setError(null);
    if (!online) return writeLocal(next);
    const sb = createClient();
    const { error: e } = has
      ? await sb.from("bestiary_progress").delete().eq("char_id", charId).eq("creature", name)
      : await sb.from("bestiary_progress").insert({ char_id: charId, creature: name });
    if (e) {
      setError(e.message);
      setDone(prev);
    }
  };

  const toggleTrack = async (name: string) => {
    const prev = tracked;
    const next = new Set(tracked);
    const has = next.has(name);
    if (has) next.delete(name);
    else next.add(name);
    setTracked(next);
    setError(null);
    if (!online) return writeLocal(next, TRACK_KEY);
    const sb = createClient();
    const { error: e } = has
      ? await sb.from("bestiary_tracking").delete().eq("char_id", charId).eq("creature", name)
      : await sb.from("bestiary_tracking").insert({ char_id: charId, creature: name });
    if (e) {
      setError(e.message);
      setTracked(prev);
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = BESTIARY.filter(
      (r) =>
        (!term || r[0].toLowerCase().includes(term)) &&
        (cls < 0 || r[2] === cls) &&
        (diff < 0 || r[1] === diff) &&
        (status === "todas" ||
          (status === "acompanhando" ? tracked.has(r[0]) : (status === "feitas") === done.has(r[0]))),
    );
    // muito raras rendem muito por kill, mas não dá para caçar quando quiser: vão para o fim
    if (sort === "rende") list.sort((a, b) => a[3] - b[3] || ratio(b) - ratio(a) || a[0].localeCompare(b[0]));
    if (sort === "charms") list.sort((a, b) => charmOf(b[1], b[3]) - charmOf(a[1], a[3]) || a[0].localeCompare(b[0]));
    if (sort === "kills") list.sort((a, b) => killsOf(a[1], a[3]) - killsOf(b[1], b[3]) || a[0].localeCompare(b[0]));
    return list;
  }, [q, cls, diff, status, done, tracked, sort]);

  const earned = BESTIARY.reduce((a, r) => a + (done.has(r[0]) ? charmOf(r[1], r[3]) : 0), 0);
  const byClass = CLASSES.map((c, i) => {
    const all = BESTIARY.filter((r) => r[2] === i);
    return { c, total: all.length, done: all.filter((r) => done.has(r[0])).length };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {logged && chars.length > 0 ? (
          <label className="text-[12px]">
            <span className="font-bold block">Char</span>
            <select value={charId} onChange={(e) => setCharId(e.target.value)}>
              {chars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : logged ? (
          <p className="text-[12px]">
            Cadastre um char em <Link href="/meus-chars">Meus chars</Link> para salvar o progresso na conta. Por enquanto, fica neste navegador.
          </p>
        ) : (
          <p className="text-[12px]">
            <Link href="/entrar?next=/ferramentas/bestiario">Entre</Link> para salvar por char e acessar de qualquer aparelho. Sem conta, o
            progresso fica neste navegador.
          </p>
        )}
        {loading && <span className="muted text-[12px]">carregando...</span>}
        {error && <span className="bad text-[12px]">Erro ao salvar: {error}</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Creatures completas", `${fmt(done.size)} de ${fmt(BESTIARY.length)}`],
          ["Charm points", `${fmt(earned)} de ${fmt(TOTAL_CHARMS)}`],
          ["Progresso", `${((done.size / BESTIARY.length) * 100).toFixed(1)}%`],
          ["Faltam", fmt(BESTIARY.length - done.size)],
        ].map(([l, v]) => (
          <div key={l} className="border border-[#b98a5a] rounded p-3 bg-white/40">
            <div className="muted text-[11px]">{l}</div>
            <div className="font-bold text-[16px] text-[#3a1a00]">{v}</div>
          </div>
        ))}
      </div>

      {boosted && (
        <div className="border border-[#b36b00] rounded p-2 bg-[#fbe6c2] text-[12px] flex flex-wrap items-center gap-2">
          🐾 <b>Boosted de hoje: {boosted}</b> (kills contam em dobro).
          <button type="button" className="underline" onClick={() => (setQ(boosted), setStatus("todas"), setLimit(PAGE))}>
            ver na lista
          </button>
          <span className="muted">
            Marque 📌 nas creatures que você está fazendo: quando uma delas for o boosted do dia, chega aviso no celular.
          </span>
        </div>
      )}

      <details className="border border-[#b98a5a] rounded p-3 bg-white/40">
        <summary className="font-bold cursor-pointer">Progresso por classe</summary>
        <div className="grid gap-2 sm:grid-cols-3 mt-2">
          {byClass.map((b, i) => (
            <button key={b.c} type="button" className="text-left text-[11px]" onClick={() => (setCls(i), setLimit(PAGE))}>
              <div className="flex justify-between">
                <span className="font-bold">{b.c}</span>
                <span>
                  {b.done}/{b.total}
                </span>
              </div>
              <div className="h-2 bg-[#e8d6b0] rounded">
                <div className="h-2 rounded bg-[#5a7d2a]" style={{ width: `${(b.done / b.total) * 100}%` }} />
              </div>
            </button>
          ))}
        </div>
      </details>

      <div className="flex flex-wrap gap-2 items-end">
        <input value={q} onChange={(e) => (setQ(e.target.value), setLimit(PAGE))} placeholder="buscar creature" className="w-48" />
        <select value={cls} onChange={(e) => (setCls(Number(e.target.value)), setLimit(PAGE))}>
          <option value={-1}>todas as classes</option>
          {CLASSES.map((c, i) => (
            <option key={c} value={i}>
              {c}
            </option>
          ))}
        </select>
        <select value={diff} onChange={(e) => (setDiff(Number(e.target.value)), setLimit(PAGE))}>
          <option value={-1}>todas as dificuldades</option>
          {DIFFICULTIES.map((d, i) => (
            <option key={d} value={i}>
              {DIFF_PT[i]}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => (setStatus(e.target.value as typeof status), setLimit(PAGE))}>
          <option value="todas">todas</option>
          <option value="faltam">só as que faltam</option>
          <option value="feitas">só as completas</option>
          <option value="acompanhando">📌 acompanhando ({tracked.size})</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} aria-label="Ordenar">
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <span className="muted text-[11px]">{fmt(filtered.length)} creatures</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, limit).map((r) => {
          const ok = done.has(r[0]);
          const pin = tracked.has(r[0]);
          const boost = boosted && sheetName(r[0]).toLowerCase() === boosted.toLowerCase();
          const sheet = hasSheet.has(sheetName(r[0])) ? sheetName(r[0]) : null;
          return (
            <div
              key={r[0]}
              className={`flex items-center gap-2 border rounded p-2 ${ok ? "border-[#5a7d2a] bg-[#dfe9c8]" : pin ? "border-[#b36b00] bg-[#fbe6c2]" : "border-[#b98a5a] bg-white/40"}`}
            >
              <input type="checkbox" checked={ok} onChange={() => toggle(r[0])} aria-label={`${r[0]} completa`} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creatureIcon(sheetName(r[0]))} alt="" width={32} height={32} loading="lazy" className="sprite" />
              <span className="flex-1 min-w-0">
                <span className="font-bold block truncate">
                  {r[0]} {boost && <span className="tag tag-fire">boosted hoje</span>}
                </span>
                <span className="muted text-[10px]">
                  {CLASSES[r[2]]} · {DIFF_PT[r[1]]}
                  {r[3] ? " · muito rara" : ""} · {fmt(killsOf(r[1], r[3]))} kills · {charmOf(r[1], r[3])} charm
                  {sheet && (
                    <>
                      {" · "}
                      <Link href={`/criaturas/${encodeURIComponent(sheet)}`}>onde caçar e loot</Link>
                    </>
                  )}
                </span>
              </span>
              <button
                type="button"
                onClick={() => toggleTrack(r[0])}
                title={pin ? "Parar de acompanhar" : "Acompanhar (avisa quando for o boosted do dia)"}
                aria-pressed={pin}
                className="text-[16px] shrink-0"
                style={{ opacity: pin ? 1 : 0.35, filter: pin ? "none" : "grayscale(1)" }}
              >
                📌
              </button>
            </div>
          );
        })}
      </div>
      {filtered.length > limit && (
        <button type="button" className="tc-btn" onClick={() => setLimit(limit + PAGE)}>
          mostrar mais ({fmt(filtered.length - limit)} restantes)
        </button>
      )}
    </div>
  );
}
