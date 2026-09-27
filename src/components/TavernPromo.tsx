"use client";

// Banner da lateral: o Rashid, garoto-propaganda da Taverna, com falas que se revezam e a mesma morte que está no topo da Taverna.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import JoinInvite from "@/components/JoinInvite";
import { timeAgo } from "@/lib/social";
import { BOZO_SAYS } from "@/lib/bozo";
import { YASIR_SAYS } from "@/lib/yasir";
import { levelLine } from "@/lib/levelup";
import { gossipLines, rashidRumor } from "@/lib/rashid";
import { hasDb } from "@/lib/social-client";
import { TimelineItem, fetchTimeline, onSocialChange } from "@/lib/timeline";

const LINES = [
  "Psiu! Morreu pra rat? Aqui ninguém julga. Muito.",
  "Morreu? Relaxa. Eu conto pra todo mundo.",
  "Na minha taverna a bless é opcional. A fofoca, não.",
  "Toda semana eu mudo de cidade. A Taverna fica.",
  "O Henricus já está separando as bless da semana.",
  "Deixou o utamo em casa? Vem comentar no balcão.",
  "Viu uma morte patética? Me conta. Não conto pra ninguém. (Conto sim.)",
];

// Rashid, Bozo e, de vez em quando, o Yasir se revezam no balcão
const SPEAKERS = LINES.flatMap((text, i) => [
  { who: "Rashid", img: "/rashid.webp", text },
  ...(i < BOZO_SAYS.length ? [{ who: "Bozo", img: "/bozo.webp", text: BOZO_SAYS[i] }] : []),
  ...(i % 3 === 2 && YASIR_SAYS[(i - 2) / 3] ? [{ who: "Yasir", img: "/yasir.webp", text: YASIR_SAYS[(i - 2) / 3] }] : []),
]);

export default function TavernPromo() {
  const onTavern = usePathname() === "/comunidade/taverna";
  const [line, setLine] = useState(0);
  const [top, setTop] = useState<TimelineItem | null | undefined>(undefined);

  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % SPEAKERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  // o mesmo item que está no topo da Taverna
  useEffect(() => {
    if (!hasDb()) return;
    const load = () => fetchTimeline(null, 1).then((l) => setTop(l[0] ?? null));
    load();
    return onSocialChange(load);
  }, []);

  return (
    <div className="tc-themebox overflow-hidden">
      <div className="tc-themebox-title">🍺 Taverna</div>
      <div className="relative px-2 pt-2 pb-2.5" style={{ background: "linear-gradient(#4a2c16, #2a170b)", color: "#f3e3c3" }}>
        {/* tábuas do balcão */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{ background: "repeating-linear-gradient(90deg,#5b3a1e 0 22px,#4b2f18 22px 24px)" }}
        />
        <div className="relative flex items-end gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={SPEAKERS[line].who}
            src={SPEAKERS[line].img}
            alt={SPEAKERS[line].who}
            width={64}
            height={64}
            className="tc-rashid tc-fade shrink-0"
            style={{ imageRendering: "pixelated" }}
          />
          <div
            key={line}
            className="tc-fade relative mb-7 rounded-lg px-2 py-1.5 text-[11px] leading-snug font-bold"
            style={{ background: "#fff8e6", color: "#3a1a00", boxShadow: "0 2px 4px rgba(0,0,0,.5)" }}
          >
            {SPEAKERS[line].text}
            <span
              aria-hidden
              className="absolute -left-1.5 bottom-2 w-0 h-0"
              style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #fff8e6" }}
            />
          </div>
        </div>
        <div className="relative text-[10px] opacity-80 -mt-1 mb-1.5">
          {SPEAKERS[line].who === "Bozo"
            ? "Bozo, bobo da corte de Thais"
            : SPEAKERS[line].who === "Yasir"
              ? "Yasir, mercador oriental (o Rashid traduz)"
              : "Rashid, garoto-propaganda (e freguês) da Taverna"}
        </div>

        <div className="relative rounded px-2 py-1.5 text-[11px] mb-2" style={{ background: "rgba(0,0,0,.35)", border: "1px solid #7a5230" }}>
          {top === undefined ? (
            <div className="opacity-70">Espiando a Taverna...</div>
          ) : top === null ? (
            <div>
              Ninguém morreu ainda. <b style={{ color: "#f3d27a" }}>Por enquanto.</b>
            </div>
          ) : top.level ? (
            <>
              <div className="text-[10px] opacity-75">
                🎉 Level up · {top.level.name} chegou no {top.level.milestone ?? top.level.level} {timeAgo(top.level.at)}
              </div>
              <div className="line-clamp-3">{levelLine({ ...top.level, level: top.level.milestone ?? top.level.level })}</div>
            </>
          ) : top.gossips.length ? (
            <>
              <div className="text-[10px] opacity-75">🤫 Fofoca fresquinha · {timeAgo(top.gossips[top.gossips.length - 1].created_at)}</div>
              <div className="line-clamp-3">{gossipLines(top.gossips[top.gossips.length - 1]).text}</div>
            </>
          ) : (
            <>
              <div className="text-[10px] opacity-75">
                🗣️ Boato do Rashid · {top.death.name} morreu {timeAgo(top.death.died_at)}
              </div>
              <div className="line-clamp-3">{rashidRumor(top.death).text}</div>
            </>
          )}
        </div>

        {onTavern ? (
          <div className="relative text-center text-[11px] font-bold" style={{ color: "#f3d27a" }}>
            Você já está na Taverna. Puxa uma cadeira! 🍺
          </div>
        ) : (
          <Link href="/comunidade/taverna" className="tc-btn relative block text-center !no-underline">
            Entrar na Taverna →
          </Link>
        )}
        <div className="relative mt-2">
          <JoinInvite compact />
        </div>
      </div>
    </div>
  );
}
