"use client";

// Feed da Taverna: as mortes comentadas pelos NPCs (boato do Rashid, Henricus, Bozo, Yasir, fofocas contadas pro Rashid) e pelas
// pessoas, e os marcos de level. Aqui também fica o Caixão e Vela Preta (a aba só de mortes, na ordem em que aconteceram).
// É a mesma linha do tempo do banner do Rashid; recarrega sozinha.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@/components/Box";
import DeathCard from "@/components/DeathCard";
import HenricusBoard from "@/components/HenricusBoard";
import JoinInvite from "@/components/JoinInvite";
import LevelCard from "@/components/LevelCard";
import { PushToggle } from "@/components/Notifications";
import { ReleaseChar, useMe, usePostingChar } from "@/components/Social";
import { ReactionMap } from "@/lib/social-client";
import { TimelineItem, fetchExtras, fetchTimeline, notifySocial, onSocialChange } from "@/lib/timeline";

const EMPTY: ReactionMap = { counts: {}, mine: {} };
const PAGE = 60;
const DAY = 86_400_000;

export type View = "tudo" | "mortes" | "levels";
export type Order = "recentes" | "alta";

const VIEWS: [View, string][] = [
  ["tudo", "🍺 Tudo"],
  ["mortes", "⚰️ Caixão e Vela Preta"],
  ["levels", "🎉 Level ups"],
];

const chip = (on: boolean) => `tc-btn !py-0.5 !px-3 ${on ? "" : "opacity-60"}`;

export default function TavernFeed({ guilds, initial }: { guilds: string[]; initial: { view: View; guild: string | null; order: Order } }) {
  const me = useMe();
  const [charId] = usePostingChar(me);
  const [view, setView] = useState<View>(initial.view);
  const [guild, setGuild] = useState<string | null>(initial.guild);
  const [order, setOrder] = useState<Order>(initial.order);
  const [mine, setMine] = useState(false);
  const [deaths, setDeaths] = useState(100);
  const [show, setShow] = useState(PAGE);
  const [items, setItems] = useState<TimelineItem[] | null>(null);
  const [now, setNow] = useState(0);
  const [reactions, setReactions] = useState<ReactionMap>(EMPTY);
  const [comments, setComments] = useState<Record<string, number>>({});

  const load = useCallback(
    (alive: () => boolean = () => true) =>
      fetchTimeline(guild, 1000, deaths).then(async (list) => {
        const x = await fetchExtras(list, me.userId);
        if (!alive()) return;
        setItems(list);
        setNow(Date.now());
        setReactions(x.reactions);
        setComments(x.comments);
      }),
    [guild, deaths, me.userId],
  );

  useEffect(() => {
    if (!me.loaded) return;
    let alive = true;
    load(() => alive);
    const off = onSocialChange(() => load(() => alive));
    return () => {
      alive = false;
      off();
    };
  }, [load, me.loaded]);

  // filtros no endereço, para compartilhar o link (ex.: /comunidade/taverna?ver=mortes)
  useEffect(() => {
    const q = new URLSearchParams();
    if (view !== "tudo") q.set("ver", view);
    if (guild) q.set("g", guild);
    if (order !== "recentes") q.set("ordem", order);
    const qs = q.toString();
    const url = `/comunidade/taverna${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [view, guild, order]);

  // veio de um aviso (/comunidade/taverna#chave): rola até o item quando a lista chegar
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (scrolled || !items?.length || !window.location.hash) return;
    const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.style.outline = "2px solid #f3d27a";
    requestAnimationFrame(() => setScrolled(true));
  }, [items, scrolled]);

  const score = useCallback(
    (it: TimelineItem) => {
      const sum = (k: string) => Object.values(reactions.counts[k] ?? {}).reduce((a, b) => a + (b ?? 0), 0);
      return sum(it.id) + it.gossips.reduce((a, g) => a + sum(g.id), 0) + 2 * (comments[it.id] ?? 0) + 3 * it.gossips.length;
    },
    [reactions, comments],
  );

  const myNames = useMemo(() => new Set([...me.chars, ...me.locked].map((c) => c.name.toLowerCase())), [me.chars, me.locked]);

  const list = useMemo(() => {
    if (!items) return null;
    let l = items;
    if (view === "mortes") l = l.filter((i) => i.death).sort((a, b) => b.death!.died_at.localeCompare(a.death!.died_at));
    if (view === "levels") l = l.filter((i) => i.level);
    if (mine) l = l.filter((i) => myNames.has((i.death?.name ?? i.level?.name ?? "").toLowerCase()));
    if (order === "alta") {
      l = l
        .filter((i) => now - new Date(i.at).getTime() < 3 * DAY)
        .map((i) => ({ i, s: score(i) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.i);
    }
    return l;
  }, [items, view, mine, myNames, order, now, score]);

  // Vela Preta do mês: quem mais morreu, a morte mais palhaça e a mais comentada (últimos 30 dias)
  const podium = useMemo(() => {
    const month = (items ?? []).filter((i) => i.death && now - new Date(i.death.died_at).getTime() < 30 * DAY);
    const best = (f: (i: TimelineItem) => number) =>
      month.reduce<{ i: TimelineItem; v: number } | null>((b, i) => (f(i) > (b?.v ?? 0) ? { i, v: f(i) } : b), null);
    return {
      deaths: best((i) => i.death?.month_deaths ?? 0),
      clown: best((i) => reactions.counts[i.id]?.palhaco ?? 0),
      talked: best((i) => (comments[i.id] ?? 0) + i.gossips.length),
    };
  }, [items, now, reactions, comments]);

  const more = list ? list.length > show || (deaths < 500 && view !== "levels") : false;

  return (
    <>
      {me.loaded && !me.userId && <JoinInvite />}
      {me.loaded && me.userId && !charId && (
        <Box title="💬 Quer comentar?">
          <ReleaseChar me={me} />
        </Box>
      )}
      {me.chars.length > 0 && <PushToggle compact />}

      <div className="rounded p-2 mb-3 space-y-1.5" style={{ background: "#1b1410", border: "1px solid #5a4632" }}>
        <div className="flex flex-wrap gap-1">
          {VIEWS.map(([v, label]) => (
            <button key={v} type="button" className={chip(view === v)} onClick={() => (setView(v), setShow(PAGE))}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          {guilds.length > 0 &&
            [null, ...guilds].map((g) => (
              <button key={g ?? "todas"} type="button" className={chip(guild === g)} onClick={() => (setGuild(g), setShow(PAGE))}>
                {g ? `🛡️ ${g}` : "Todas as guildas"}
              </button>
            ))}
          {me.userId && (
            <button type="button" className={chip(mine)} onClick={() => setMine(!mine)} title="Só o que envolve os seus chars">
              👤 Meus chars
            </button>
          )}
          <span className="ml-auto flex gap-1">
            <button type="button" className={chip(order === "recentes")} onClick={() => setOrder("recentes")}>
              🕒 Mais recentes
            </button>
            <button
              type="button"
              className={chip(order === "alta")}
              onClick={() => setOrder("alta")}
              title="Mais reações, comentários e fofocas dos últimos 3 dias"
            >
              🔥 Em alta
            </button>
          </span>
        </div>
      </div>

      {view !== "levels" && (podium.deaths || podium.clown || podium.talked) && (
        <div className="grid gap-2 sm:grid-cols-3 mb-3">
          {[
            ["💀 Mais mortes no mês", podium.deaths, (v: number) => `${v} mortes em 30 dias`],
            ["🤡 Morte mais palhaça", podium.clown, (v: number) => `${v} ${v === 1 ? "palhaço" : "palhaços"}`],
            ["💬 Morte mais falada", podium.talked, (v: number) => `${v} ${v === 1 ? "comentário ou fofoca" : "comentários e fofocas"}`],
          ].map(([title, p, fmt]) => {
            const x = p as { i: TimelineItem; v: number } | null;
            return (
              <a
                key={title as string}
                href={x ? `#${x.i.id}` : undefined}
                className="block rounded p-2 !no-underline text-[12px]"
                style={{ background: "linear-gradient(#2a1a10, #140c08)", color: "#e8dcc8", border: "1px solid #7a5230" }}
              >
                <div className="text-[10px] opacity-75">🕯️ Vela Preta do mês · {title as string}</div>
                {x ? (
                  <>
                    <div className="font-bold text-[14px]" style={{ color: "#f3d27a" }}>
                      {x.i.death!.name}
                    </div>
                    <div className="opacity-80">{(fmt as (v: number) => string)(x.v)}</div>
                  </>
                ) : (
                  <div className="opacity-70">Ninguém ainda. Por enquanto.</div>
                )}
              </a>
            );
          })}
        </div>
      )}

      <Box title={view === "mortes" ? "⚰️ Caixão e Vela Preta" : view === "levels" ? "🎉 Level ups da turma" : "🍺 Na mesa da Taverna"}>
        {view === "mortes" && (
          <p className="text-[12px] mb-2">
            O memorial da turma, na ordem em que morreram: deixe seu F, ria (com respeito) e comente. As mortes vêm do tibia.com, que mostra as dos últimos 30
            dias; daqui para a frente a Taverna guarda todas.
          </p>
        )}
        {list === null ? (
          <p className="muted">Abrindo a taverna...</p>
        ) : list.length === 0 ? (
          <p className="text-[13px]">
            {order === "alta"
              ? "Nada pegando fogo nos últimos 3 dias. Vai lá dar o primeiro F."
              : mine
                ? "Nada dos seus chars por aqui. Por enquanto. 👀"
                : view === "levels"
                  ? "Ninguém cruzou um marco de 50 levels nos últimos dias."
                  : "Ninguém morreu ainda. Os NPCs estão entediados."}
          </p>
        ) : (
          <ul className="space-y-3">
            {list.slice(0, show).map((it) => (
              <li key={it.id}>
                {it.level ? (
                  <LevelCard u={it.level} me={me} charId={charId} reactions={reactions} comments={comments[it.id] ?? 0} />
                ) : (
                  <DeathCard
                    d={it.death}
                    gossips={it.gossips}
                    me={me}
                    charId={charId}
                    reactions={reactions}
                    comments={comments[it.id] ?? 0}
                    onGossip={() => notifySocial()}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {more && order === "recentes" && (
          <div className="text-center mt-3">
            <button
              type="button"
              className="tc-btn"
              onClick={() => {
                if (list && list.length <= show + PAGE && deaths < 500) setDeaths((d) => Math.min(d + 100, 500));
                setShow((s) => s + PAGE);
              }}
            >
              Carregar mais
            </button>
          </div>
        )}
      </Box>
      <HenricusBoard />
      <p className="on-dark muted text-[11px]">
        As mortes vêm do tibia.com (membros das guildas e chars liberados). Os comentários dos NPCs são zoeira, boato não confirmado. Zoeira sim, ofensa não:
        três denúncias escondem o conteúdo até a moderação olhar. Veja os <Link href="/termos#comunidade">termos</Link>.
      </p>
    </>
  );
}
