"use client";

// Henricus na Taverna: os "clientes VIP" do mês (quem mais morreu), com a frase dele para cada um.

import Link from "next/link";
import { useEffect, useState } from "react";
import { GuildTag } from "@/components/GuildTag";
import { HENRICUS_SAYS, henricusLine } from "@/lib/henricus";
import { timeAgo } from "@/lib/social";
import { hasDb } from "@/lib/social-client";
import { createClient } from "@/lib/supabase/client";

interface Client {
  name: string;
  guild: string | null;
  deaths: number;
  last_died: string;
  level: number | null;
}

export default function HenricusBoard() {
  const [list, setList] = useState<Client[] | null>(null);
  const [say, setSay] = useState(0);

  useEffect(() => {
    if (!hasDb()) return;
    createClient()
      .rpc("bless_clients", { p_days: 30 })
      .then(({ data }) => setList((data ?? []) as Client[]));
  }, []);
  useEffect(() => {
    const t = setInterval(() => setSay((s) => (s + 1) % HENRICUS_SAYS.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="tc-panel">
      <div className="tc-title">⛪ Clientes VIP do Henricus</div>
      <div className="tc-box" style={{ background: "linear-gradient(#2a2233, #17121f)", color: "#e8dcf0" }}>
        <div className="flex items-end gap-2 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/henricus.webp" alt="Henricus" width={64} height={64} className="tc-rashid shrink-0" style={{ imageRendering: "pixelated" }} />
          <div className="flex-1">
            <div
              key={say}
              className="tc-fade relative rounded-lg px-2 py-1.5 text-[12px] font-bold leading-snug"
              style={{ background: "#f4ecff", color: "#2a1640" }}
            >
              {HENRICUS_SAYS[say]}
              <span
                aria-hidden
                className="absolute -left-1.5 bottom-2 w-0 h-0"
                style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "7px solid #f4ecff" }}
              />
            </div>
            <div className="text-[10px] opacity-75 mt-1">
              Henricus, Lord Inquisitor de Thais (desce a cadeia). Vende a Blessing of the Inquisition: as cinco bless de uma vez.
            </div>
          </div>
        </div>

        {list === null ? (
          <p className="text-[12px] opacity-75">Conferindo o caderninho de clientes...</p>
        ) : list.length === 0 ? (
          <p className="text-[12px]">Ninguém morreu duas vezes este mês. O Henricus está pensando em fazer promoção.</p>
        ) : (
          <ol className="space-y-1.5">
            {list.map((c, i) => {
              const l = henricusLine(c.name, c.deaths);
              return (
                <li
                  key={c.name}
                  className="rounded px-2 py-1.5 text-[12px]"
                  style={{ background: i === 0 ? "#3b2c4d" : "#231b2c", border: "1px solid #4a3a5c" }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <b className="text-[13px]">{i + 1}.</b>
                    <Link href={`/char/${encodeURIComponent(c.name)}`} className="font-bold" style={{ color: "#f3d27a" }}>
                      {c.name}
                    </Link>
                    <GuildTag guild={c.guild} />
                    <span className="tag tag-energy">{l.badge}</span>
                    <span className="ml-auto text-[11px] opacity-80">
                      💀 {c.deaths} mortes em 30 dias · última {timeAgo(c.last_died)}
                    </span>
                  </div>
                  <div className="italic opacity-90 mt-0.5">“{l.text}”</div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="text-[10px] opacity-60 mt-2">Mortes dos últimos 30 dias dos membros das guildas e dos chars liberados. É zoeira: bless é investimento.</p>
      </div>
    </section>
  );
}
