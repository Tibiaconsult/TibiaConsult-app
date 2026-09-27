"use client";

// Rotas dos jogadores na ficha da hunt: quem tem char liberado desenha no mapa o caminho que faz (clique a clique, trocando de
// andar com ▲▼), e os outros jogadores veem, votam 👍 e denunciam. O mapa é o da ficha; este hook devolve as linhas, o modo
// desenho e o painel com a lista e o formulário.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MapLine } from "@/components/MapViewer";
import { PostingAs, ReleaseChar, ReportButton, friendlyError, useMe, usePostingChar } from "@/components/Social";
import { VOCS, VOC_SHORT, useActive } from "@/lib/active";
import { hasDb } from "@/lib/social-client";
import { timeAgo } from "@/lib/social";
import { createClient } from "@/lib/supabase/client";

type RouteVoc = (typeof VOCS)[number] | "pt";
const VOC_OPTS: [RouteVoc, string][] = [...VOCS.map((v) => [v, VOC_SHORT[v]] as [RouteVoc, string]), ["pt", "PT"]];
const COLORS = ["#ffd400", "#00e5ff", "#ff4dd2", "#7CFC00", "#ff8c42", "#b58cff"];
const DRAFT_COLOR = "#ffffff";

interface Route {
  id: string;
  char_name: string;
  vocation: RouteVoc;
  level: number | null;
  note: string | null;
  points: [number, number, number][];
  votes: number;
  created_at: string;
  mine: boolean;
  voted: boolean;
}

export function usePlayerRoutes(huntId: string, huntName: string) {
  const me = useMe();
  const [charId, setCharId] = usePostingChar(me);
  const { voc: activeVoc, char } = useActive();
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [shown, setShown] = useState<Set<string> | null>(null);
  const [filter, setFilter] = useState<RouteVoc | "">("");
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState<[number, number, number][]>([]);
  const [voc, setVoc] = useState<RouteVoc | null>(null);
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hasDb()) return setRoutes([]);
    const { data } = await createClient().rpc("hunt_routes_for", { p_hunt: huntId });
    setRoutes((data ?? []) as Route[]);
  }, [huntId]);

  useEffect(() => {
    let alive = true;
    if (!me.loaded) return;
    (async () => {
      if (!hasDb()) return alive && setRoutes([]);
      const { data } = await createClient().rpc("hunt_routes_for", { p_hunt: huntId });
      if (alive) setRoutes((data ?? []) as Route[]);
    })();
    return () => {
      alive = false;
    };
  }, [huntId, me.loaded]);

  const list = useMemo(() => (routes ?? []).filter((r) => !filter || r.vocation === filter), [routes, filter]);
  // sem escolha: mostra a mais votada
  const visible = shown ?? new Set(list.slice(0, 1).map((r) => r.id));
  const color = (id: string) =>
    COLORS[
      Math.max(
        0,
        (routes ?? []).findIndex((r) => r.id === id),
      ) % COLORS.length
    ];

  const lines = useMemo<MapLine[]>(() => {
    const out: MapLine[] = (routes ?? []).filter((r) => visible.has(r.id)).map((r) => ({ pts: r.points, color: color(r.id), label: `Rota de ${r.char_name}` }));
    if (drawing && draft.length) out.push({ pts: draft, color: DRAFT_COLOR, dashed: true, label: "sua rota" });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes, visible, drawing, draft]);

  const onPick = useCallback((x: number, y: number, z: number) => {
    setDraft((d) => {
      const last = d[d.length - 1];
      if (last && last[0] === x && last[1] === y && last[2] === z) return d;
      return d.length >= 400 ? d : [...d, [x, y, z]];
    });
  }, []);

  const toggle = (id: string) =>
    setShown(() => {
      const n = new Set(visible);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  async function save() {
    if (!charId) return;
    setBusy(true);
    setMsg(null);
    const v = voc ?? (char?.vocation as RouteVoc | undefined) ?? activeVoc ?? "knight";
    const lv = Number(level) || null;
    const { data, error } = await createClient().rpc("add_hunt_route", {
      p_char: charId,
      p_hunt: huntId,
      p_voc: v,
      p_level: lv && lv >= 8 && lv <= 3000 ? lv : null,
      p_note: note.trim() || null,
      p_points: draft,
    });
    setBusy(false);
    if (error) return setMsg(friendlyError(error.message));
    setDrawing(false);
    setDraft([]);
    setNote("");
    setMsg("Rota publicada. Obrigado por ajudar quem vem caçar aqui depois!");
    await load();
    setShown(new Set([data as string]));
  }

  async function vote(r: Route) {
    const { data, error } = await createClient().rpc("toggle_route_vote", { p_route: r.id });
    if (error) return setMsg(friendlyError(error.message));
    setRoutes((rs) => (rs ?? []).map((x) => (x.id === r.id ? { ...x, votes: data as number, voted: !x.voted } : x)));
  }

  async function remove(r: Route) {
    if (!confirm("Apagar esta rota?")) return;
    const { error } = await createClient().from("hunt_routes").delete().eq("id", r.id);
    if (error) return setMsg(friendlyError(error.message));
    setRoutes((rs) => (rs ?? []).filter((x) => x.id !== r.id));
  }

  const floors = new Set(draft.map((p) => p[2])).size;
  const panel = (
    <div className="border-t border-[#c9b089] mt-3 pt-2 text-[12px]">
      <div className="flex flex-wrap items-center gap-2">
        <b>🧭 Rotas dos jogadores</b>
        {(routes?.length ?? 0) > 0 && (
          <select value={filter} onChange={(e) => (setFilter(e.target.value as RouteVoc | ""), setShown(null))} className="text-[12px]">
            <option value="">todas as vocações</option>
            {VOC_OPTS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        )}
        {!drawing && me.chars.length > 0 && (
          <button type="button" className="tc-btn !py-0.5 ml-auto" onClick={() => (setDrawing(true), setDraft([]), setMsg(null))}>
            ✏️ Desenhar a minha rota
          </button>
        )}
      </div>

      {drawing && (
        <div className="rounded p-2 mt-2" style={{ background: "#fff8e6", border: "1px dashed #b98a5a" }}>
          <p>
            <b>Clique no mapa</b> o caminho que você faz em {huntName}, na ordem. Mudou de andar no jogo? Use ▲▼ no mapa e continue clicando. A linha tracejada
            branca é a sua rota.
          </p>
          <p className="mt-1">
            {draft.length} ponto{draft.length === 1 ? "" : "s"}
            {floors > 1 ? ` em ${floors} andares` : ""}.{" "}
            <button type="button" className="underline" disabled={!draft.length} onClick={() => setDraft((d) => d.slice(0, -1))}>
              desfazer último
            </button>{" "}
            ·{" "}
            <button type="button" className="underline" disabled={!draft.length} onClick={() => setDraft([])}>
              limpar
            </button>
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <select value={voc ?? char?.vocation ?? activeVoc ?? "knight"} onChange={(e) => setVoc(e.target.value as RouteVoc)}>
              {VOC_OPTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={8}
              max={3000}
              placeholder={char?.level ? String(char.level) : "level"}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-20"
              title="Level recomendado para a rota"
            />
            <PostingAs me={me} charId={charId} setCharId={setCharId} />
          </div>
          <textarea
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Dicas para quem for fazer: onde puxar, onde parar, cuidado com... (opcional)"
            className="w-full mt-2 text-[12px]"
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <button type="button" className="tc-btn" disabled={busy || draft.length < 2} onClick={save}>
              {busy ? "Publicando..." : "Publicar rota"}
            </button>
            <button type="button" className="tc-btn opacity-70" onClick={() => (setDrawing(false), setDraft([]))}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {msg && <p className="mt-1">{msg}</p>}

      {routes === null ? (
        <p className="muted mt-1">Carregando rotas...</p>
      ) : list.length === 0 ? (
        <p className="mt-1">
          {filter ? "Nenhuma rota para essa vocação ainda." : "Ninguém desenhou uma rota aqui ainda."} Conhece bem esta hunt? Desenhe o caminho que você faz e
          ajude outros jogadores a caçar melhor.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-2">
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={visible.has(r.id)} onChange={() => toggle(r.id)} />
                <span className="inline-block w-3 h-3 rounded-sm border border-black" style={{ background: color(r.id) }} />
              </label>
              <div className="flex-1 min-w-[200px]">
                <b>{r.char_name}</b>{" "}
                <span className="muted">
                  · {r.vocation === "pt" ? "PT" : VOC_SHORT[r.vocation]}
                  {r.level ? ` ${r.level}+` : ""} · {r.points.length} pontos · {timeAgo(r.created_at)}
                </span>
                {r.note && <div className="whitespace-pre-line">{r.note}</div>}
              </div>
              <span className="inline-flex items-center gap-2">
                {r.mine ? (
                  <>
                    <span className="muted">👍 {r.votes}</span>
                    <button type="button" className="underline text-[11px]" onClick={() => remove(r)}>
                      apagar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`tc-btn !py-0 !px-2 ${r.voted ? "" : "opacity-70"}`}
                    disabled={!me.userId}
                    title={me.userId ? "Essa rota ajudou" : "Entre para votar"}
                    onClick={() => vote(r)}
                  >
                    👍 {r.votes}
                  </button>
                )}
                {!r.mine && <ReportButton type="route" id={r.id} me={me} />}
              </span>
            </li>
          ))}
        </ul>
      )}
      {me.loaded && !me.chars.length && (
        <div className="mt-2">
          {me.userId ? (
            <ReleaseChar me={me} />
          ) : (
            <p className="muted">
              <Link href="/entrar">Entre</Link> para desenhar a sua rota e ajudar outros jogadores.
            </p>
          )}
        </div>
      )}
    </div>
  );

  return { lines, onPick: drawing ? onPick : undefined, panel };
}
