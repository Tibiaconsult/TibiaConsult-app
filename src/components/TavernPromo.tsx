"use client";

// Banner da lateral: o Rashid, garoto-propaganda da Taverna, com falas que se revezam e o último causo publicado.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { kindOf, timeAgo } from "@/lib/social";
import { RumorDeath, gossipLines, rashidRumor } from "@/lib/rashid";
import { recentDeaths } from "@/components/GossipBoard";
import { Gossip, hasDb, recentGossips } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

const LINES = [
  "Psiu! Morreu pra rat? Aqui ninguém julga. Muito.",
  "Compro causos. Pago em risadas.",
  "Na minha taverna a bless é opcional. A história, não.",
  "Toda semana eu mudo de cidade. A Taverna fica.",
  "Drop raro? Vacilo épico? Conta aí, eu compro.",
  "Deixou o utamo em casa? Senta que lá vem história.",
  "Viu uma morte patética? Me conta. Não conto pra ninguém. (Conto sim.)",
];

interface Last {
  char_name: string;
  kind: string;
  body: string;
  created_at: string;
}

export default function TavernPromo() {
  const onTavern = usePathname() === "/comunidade/taverna";
  const [line, setLine] = useState(0);
  const [last, setLast] = useState<Last | null>(null);
  const [gossip, setGossip] = useState<Gossip | null>(null);
  const [death, setDeath] = useState<RumorDeath | null>(null);

  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % LINES.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!hasDb()) return;
    createClient()
      .from("posts")
      .select("char_name, kind, body, created_at")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => setLast((data?.[0] as Last) ?? null));
    recentGossips(1).then((g) => setGossip(g[0] ?? null));
    recentDeaths(1).then((d) => setDeath(d[0] ?? null));
  }, []);

  return (
    <div className="tc-themebox overflow-hidden">
      <div className="tc-themebox-title">🍺 Causos da Taverna</div>
      <div className="relative px-2 pt-2 pb-2.5" style={{ background: "linear-gradient(#4a2c16, #2a170b)", color: "#f3e3c3" }}>
        {/* tábuas do balcão */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{ background: "repeating-linear-gradient(90deg,#5b3a1e 0 22px,#4b2f18 22px 24px)" }}
        />
        <div className="relative flex items-end gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rashid.webp" alt="Rashid" width={64} height={64} className="tc-rashid shrink-0" style={{ imageRendering: "pixelated" }} />
          <div
            key={line}
            className="tc-fade relative mb-7 rounded-lg px-2 py-1.5 text-[11px] leading-snug font-bold"
            style={{ background: "#fff8e6", color: "#3a1a00", boxShadow: "0 2px 4px rgba(0,0,0,.5)" }}
          >
            {LINES[line]}
            <span
              aria-hidden
              className="absolute -left-1.5 bottom-2 w-0 h-0"
              style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #fff8e6" }}
            />
          </div>
        </div>
        <div className="relative text-[10px] opacity-80 -mt-1 mb-1.5">Rashid, garoto-propaganda (e freguês) da Taverna</div>

        <div className="relative rounded px-2 py-1.5 text-[11px] mb-2" style={{ background: "rgba(0,0,0,.35)", border: "1px solid #7a5230" }}>
          {gossip && (!last || gossip.created_at > last.created_at) ? (
            <>
              <div className="text-[10px] opacity-75">🤫 Fofoca fresquinha · {timeAgo(gossip.created_at)}</div>
              <div className="line-clamp-3">{gossipLines(gossip).text}</div>
            </>
          ) : death && (!last || death.died_at > last.created_at) ? (
            <>
              <div className="text-[10px] opacity-75">🗣️ Boato do Rashid · {timeAgo(death.died_at)}</div>
              <div className="line-clamp-3">{rashidRumor(death).text}</div>
            </>
          ) : last ? (
            <>
              <div className="text-[10px] opacity-75">
                Último causo · {timeAgo(last.created_at)} · {kindOf(last.kind).emoji} {kindOf(last.kind).label}
              </div>
              <div className="line-clamp-2">
                <b style={{ color: "#f3d27a" }}>{last.char_name}:</b> {last.body}
              </div>
            </>
          ) : (
            <div>
              A Taverna está esperando o primeiro causo. <b style={{ color: "#f3d27a" }}>Pode ser o seu.</b>
            </div>
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
      </div>
    </div>
  );
}
