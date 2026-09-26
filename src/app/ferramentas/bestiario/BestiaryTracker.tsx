"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BESTIARY, CHARMS, CHARMS_VERY_RARE, CLASSES, DIFFICULTIES, KILLS, KILLS_VERY_RARE } from "@/data/bestiary";
import { creatureIcon } from "@/lib/icons";
import { getActive } from "@/lib/active";
import { createClient } from "@/lib/supabase/client";

const DIFF_PT = ["Inofensiva", "Trivial", "Fácil", "Média", "Difícil", "Desafiadora"];
const LOCAL_KEY = "tc-bestiary-local";
const PAGE = 120;
const fmt = (v: number) => v.toLocaleString("pt-BR");

const charmOf = (d: number, rare: number) => (rare ? CHARMS_VERY_RARE[d] : CHARMS[d]);
const killsOf = (d: number, rare: number) => (rare ? KILLS_VERY_RARE : KILLS[d])[2];
const TOTAL_CHARMS = BESTIARY.reduce((a, r) => a + charmOf(r[1], r[3]), 0);

function readLocal(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function writeLocal(s: Set<string>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...s]));
  } catch {
    // navegador sem armazenamento: segue só na memória
  }
}

export default function BestiaryTracker({ chars, logged }: { chars: { id: string; name: string }[]; logged: boolean }) {
  const [charId, setCharId] = useState(chars[0]?.id ?? "");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState(-1);
  const [diff, setDiff] = useState(-1);
  const [status, setStatus] = useState<"todas" | "feitas" | "faltam">("todas");
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
      return;
    }
    let alive = true;
    setLoading(true);
    createClient()
      .from("bestiary_progress")
      .select("creature")
      .eq("char_id", charId)
      .then(({ data, error: e }) => {
        if (!alive) return;
        setLoading(false);
        if (e) setError(e.message);
        else setDone(new Set((data ?? []).map((r) => r.creature as string)));
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

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return BESTIARY.filter(
      (r) =>
        (!term || r[0].toLowerCase().includes(term)) &&
        (cls < 0 || r[2] === cls) &&
        (diff < 0 || r[1] === diff) &&
        (status === "todas" || (status === "feitas") === done.has(r[0])),
    );
  }, [q, cls, diff, status, done]);

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
          ["Criaturas completas", `${fmt(done.size)} de ${fmt(BESTIARY.length)}`],
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
        <input value={q} onChange={(e) => (setQ(e.target.value), setLimit(PAGE))} placeholder="buscar criatura" className="w-48" />
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
        </select>
        <span className="muted text-[11px]">{fmt(filtered.length)} criaturas</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, limit).map((r) => {
          const ok = done.has(r[0]);
          return (
            <label key={r[0]} className={`flex items-center gap-2 border rounded p-2 cursor-pointer ${ok ? "border-[#5a7d2a] bg-[#dfe9c8]" : "border-[#b98a5a] bg-white/40"}`}>
              <input type="checkbox" checked={ok} onChange={() => toggle(r[0])} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creatureIcon(r[0])} alt="" width={32} height={32} loading="lazy" className="sprite" />
              <span className="flex-1 min-w-0">
                <span className="font-bold block truncate">{r[0]}</span>
                <span className="muted text-[10px]">
                  {CLASSES[r[2]]} · {DIFF_PT[r[1]]}
                  {r[3] ? " · muito rara" : ""} · {fmt(killsOf(r[1], r[3]))} kills · {charmOf(r[1], r[3])} charm
                </span>
              </span>
            </label>
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
