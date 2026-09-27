"use client";

// Hunt Analyser da guild: colar a sessão (Hunt Analyser do cliente), conferir e publicar; ranking das hunts com a média da turma.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Box from "@/components/Box";
import { ReleaseChar, friendlyError, useMe } from "@/components/Social";
import { detectHunt, fmtK, parseHuntAnalyser } from "@/lib/huntanalyser";
import { createClient } from "@/lib/supabase/client";

type HuntRef = { id: string; name: string; creatures: { name: string }[] };

interface SessionRow {
  id: string;
  char_name: string;
  vocation: string | null;
  level: number;
  hunt_id: string;
  minutes: number;
  xp_h: number;
  profit_h: number;
  created_at: string;
}

const VOCS: [string, string][] = [
  ["", "Todas as vocações"],
  ["sorcerer", "Sorcerer"],
  ["druid", "Druid"],
  ["knight", "Knight"],
  ["paladin", "Paladin"],
  ["monk", "Monk"],
];
const BANDS: [string, number, number][] = [
  ["Todos os levels", 0, 9999],
  ["até 300", 0, 299],
  ["300 a 499", 300, 499],
  ["500 a 799", 500, 799],
  ["800 a 1199", 800, 1199],
  ["1200+", 1200, 9999],
];
const vocKey = (v: string | null) => {
  const s = (v ?? "").toLowerCase();
  return VOCS.find(([k]) => k && s.includes(k))?.[0] ?? "";
};
const EXAMPLE = `Session data: From 2026-09-26, 19:00:00 to 2026-09-26, 20:12:00
Session: 01:12h
Raw XP Gain: 3,195,340
XP Gain: 4,793,010
Loot: 1,011,366
Supplies: 571,238
Balance: 440,128
Killed Monsters:
  252x sabretooth
  180x gore horn
  95x emerald tortoise`;

export default function HuntAnalyser({ hunts }: { hunts: HuntRef[] }) {
  const me = useMe();
  const byId = useMemo(() => new Map(hunts.map((h) => [h.id, h])), [hunts]);
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [voc, setVoc] = useState("");
  const [band, setBand] = useState(0);
  const [sort, setSort] = useState<"xp" | "profit">("xp");

  const load = () =>
    createClient()
      .from("hunt_sessions")
      .select("id, char_name, vocation, level, hunt_id, minutes, xp_h, profit_h, created_at")
      .gte("created_at", new Date(Date.now() - 180 * 86_400_000).toISOString())
      .order("created_at", { ascending: false })
      .limit(2000)
      .then(({ data }) => setRows((data ?? []) as SessionRow[]));
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) load();
  }, []);

  const ranking = useMemo(() => {
    const [, lo, hi] = BANDS[band];
    const m = new Map<string, { n: number; xp: number; profit: number; best: SessionRow }>();
    for (const r of rows ?? []) {
      if ((voc && vocKey(r.vocation) !== voc) || r.level < lo || r.level > hi) continue;
      const a = m.get(r.hunt_id) ?? { n: 0, xp: 0, profit: 0, best: r };
      a.n++;
      a.xp += Number(r.xp_h);
      a.profit += Number(r.profit_h);
      if (Number(r.xp_h) > Number(a.best.xp_h)) a.best = r;
      m.set(r.hunt_id, a);
    }
    return [...m]
      .map(([id, a]) => ({ id, n: a.n, xp: a.xp / a.n, profit: a.profit / a.n, best: a.best }))
      .sort((a, b) => (sort === "xp" ? b.xp - a.xp : b.profit - a.profit));
  }, [rows, voc, band, sort]);

  return (
    <>
      <Box title="📋 Colar uma sessão">
        {!me.loaded ? (
          <p className="muted text-[12px]">Carregando...</p>
        ) : !me.userId ? (
          <p className="text-[12px]">
            <Link href="/entrar?next=/hunts/analyser">Entre</Link> para publicar suas sessões. O ranking abaixo é aberto para todos.
          </p>
        ) : !me.chars.length ? (
          <ReleaseChar me={me} />
        ) : (
          <SessionForm hunts={hunts} byId={byId} me={me} onSaved={load} />
        )}
      </Box>

      <Box title="🏆 Ranking de hunts da guild">
        <div className="flex flex-wrap gap-2 mb-3 text-[12px]">
          <select value={voc} onChange={(e) => setVoc(e.target.value)} aria-label="Vocação">
            {VOCS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <select value={band} onChange={(e) => setBand(Number(e.target.value))} aria-label="Faixa de level">
            {BANDS.map(([l], i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as "xp" | "profit")} aria-label="Ordenar">
            <option value="xp">Mais XP/h</option>
            <option value="profit">Mais lucro/h</option>
          </select>
        </div>
        {rows === null ? (
          <p className="muted text-[12px]">Carregando...</p>
        ) : ranking.length === 0 ? (
          <p className="text-[12px]">
            Nenhuma sessão {voc || band ? "com esses filtros" : "ainda"}. Seja o primeiro: cole o Hunt Analyser da sua próxima hunt aqui em cima.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left">
                  <th>Hunt</th>
                  <th>Sessões</th>
                  <th>XP/h média</th>
                  <th>Lucro/h médio</th>
                  <th>Melhor XP/h</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.id} className="border-t border-[#b98a5a]/40">
                    <td className="font-bold">
                      {i + 1}. <Link href={`/hunts?h=${r.id}`}>{byId.get(r.id)?.name ?? r.id}</Link>
                    </td>
                    <td>{r.n}</td>
                    <td>{fmtK(Math.round(r.xp))}</td>
                    <td className={r.profit < 0 ? "bad" : ""}>{fmtK(Math.round(r.profit))}</td>
                    <td className="text-[11px]">
                      {fmtK(Number(r.best.xp_h))} ·{" "}
                      <Link href={`/char/${encodeURIComponent(r.best.char_name)}`}>{r.best.char_name}</Link> ({r.best.level})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted text-[10px] mt-2">
          Média das sessões dos últimos 180 dias. XP/h usa o &quot;XP Gain&quot; do analyser (com bônus de stamina, prey, boosted etc.); lucro/h é o
          Balance.
        </p>
      </Box>

      {rows && rows.length > 0 && (
        <Box title="🕒 Últimas sessões">
          <ul className="text-[12px] space-y-0.5">
            {rows.slice(0, 20).map((r) => {
              const mine = me.chars.some((c) => c.name === r.char_name);
              return (
                <li key={r.id}>
                  <Link href={`/char/${encodeURIComponent(r.char_name)}`}>{r.char_name}</Link> ({r.level}) em{" "}
                  <b>{byId.get(r.hunt_id)?.name ?? r.hunt_id}</b>: {fmtK(Number(r.xp_h))} XP/h · {fmtK(Number(r.profit_h))}/h em {r.minutes} min
                  {mine && (
                    <button
                      type="button"
                      className="underline text-[10px] ml-2 opacity-70"
                      onClick={async () => {
                        await createClient().from("hunt_sessions").delete().eq("id", r.id);
                        load();
                      }}
                    >
                      apagar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Box>
      )}
    </>
  );
}

function SessionForm({
  hunts,
  byId,
  me,
  onSaved,
}: {
  hunts: HuntRef[];
  byId: Map<string, HuntRef>;
  me: ReturnType<typeof useMe>;
  onSaved: () => void;
}) {
  const [text, setText] = useState("");
  const [charId, setCharId] = useState(me.chars[0]?.id ?? "");
  const [level, setLevel] = useState("");
  const [hunt, setHunt] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const s = useMemo(() => (text.trim() ? parseHuntAnalyser(text) : null), [text]);
  const guess = useMemo(() => (s ? detectHunt(s.kills, hunts) : null), [s, hunts]);
  const huntId = hunt || guess?.id || "";
  const ok = s && s.minutes && s.minutes >= 5 && s.xp !== null && huntId && Number(level) > 0;

  return (
    <div className="space-y-2 text-[12px]">
      <p>
        No cliente: Hunt Analyser → <b>Copy to Clipboard</b>. Cole aqui. O site acha a hunt pelas creatures mortas; confira o level e publique.{" "}
        <button type="button" className="underline" onClick={() => setText(EXAMPLE)}>
          ver exemplo
        </button>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full text-[12px]"
        placeholder="Session data: From ... Session: 01:12h ... XP Gain: ... Balance: ... Killed Monsters: ..."
      />
      {s && (
        <div className="grid gap-2 sm:grid-cols-4">
          {[
            ["Duração", s.minutes ? `${Math.floor(s.minutes / 60)}h${String(s.minutes % 60).padStart(2, "0")}` : "?"],
            ["XP/h", s.minutes && s.xp !== null ? fmtK(Math.round((s.xp * 60) / s.minutes)) : "?"],
            ["Lucro/h", s.minutes ? fmtK(Math.round((s.balance * 60) / s.minutes)) : "?"],
            ["Kills", String(Object.values(s.kills).reduce((a, b) => a + b, 0))],
          ].map(([l, v]) => (
            <div key={l} className="border border-[#b98a5a] rounded p-2 bg-white/40">
              <div className="muted text-[10px]">{l}</div>
              <b className="text-[15px]">{v}</b>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-end">
        <label>
          <span className="block font-bold">Char</span>
          <select value={charId} onChange={(e) => setCharId(e.target.value)}>
            {me.chars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block font-bold">Level na hunt</span>
          <input value={level} onChange={(e) => setLevel(e.target.value.replace(/\D/g, ""))} className="w-20" inputMode="numeric" />
        </label>
        <label className="flex-1 min-w-[200px]">
          <span className="block font-bold">
            Hunt {guess && !hunt && <span className="muted font-normal">(detectada: {Math.round(guess.share * 100)}% dos kills)</span>}
          </span>
          <select value={huntId} onChange={(e) => setHunt(e.target.value)} className="w-full">
            <option value="">escolha a hunt</option>
            {hunts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="tc-btn"
          disabled={!ok || busy}
          onClick={async () => {
            if (!s || !ok) return;
            setBusy(true);
            setMsg(null);
            const { error } = await createClient().rpc("add_hunt_session", {
              p_char: charId,
              p_hunt: huntId,
              p_level: Number(level),
              p_minutes: s.minutes,
              p_xp: s.xp,
              p_raw_xp: s.rawXp,
              p_loot: s.loot,
              p_supplies: s.supplies,
              p_balance: s.balance,
              p_kills: s.kills,
            });
            setBusy(false);
            if (error) return setMsg(friendlyError(error.message));
            setMsg(`✅ Sessão em ${byId.get(huntId)?.name} publicada no ranking.`);
            setText("");
            onSaved();
          }}
        >
          {busy ? "Publicando..." : "Publicar sessão"}
        </button>
      </div>
      {s && s.xp === null && <p className="bad">Não achei o &quot;XP Gain&quot; no texto: copie o Hunt Analyser (não o Party Hunt Analyser).</p>}
      {msg && <p>{msg}</p>}
      <p className="muted text-[10px]">
        Aparecem no ranking o nome do char, o level, a hunt, XP/h e lucro/h. Dá para apagar as suas sessões na lista abaixo.
      </p>
    </div>
  );
}
