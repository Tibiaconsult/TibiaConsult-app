"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@/components/Box";
import { PushToggle } from "@/components/Notifications";
import { timeAgo } from "@/lib/social";
import { Notification, clearAll, loadNotifications, markAllRead } from "@/lib/notify-client";
import { createClient } from "@/lib/supabase/client";
import { notifySocial } from "@/lib/timeline";

export default function NotificationList() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const [list, setList] = useState<Notification[] | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    createClient()
      .auth.getSession()
      .then(async ({ data }) => {
        setLogged(Boolean(data.session));
        if (!data.session) return;
        const l = await loadNotifications();
        setList(l);
        // abriu a lista: tudo lido (o destaque dos novos continua até sair da página)
        if (l.some((n) => !n.read_at)) await markAllRead().then(() => notifySocial());
      });
  }, []);

  if (logged === null) return <p className="on-dark muted">Carregando...</p>;
  if (!logged)
    return (
      <Box title="🔔 Avisos">
        <p className="text-[13px]">
          <Link href="/entrar?next=/notificacoes">Entre</Link> para ver os seus avisos. Não tem conta?{" "}
          <Link href="/entrar?modo=criar&next=/meus-chars">Crie grátis</Link>: seu char provavelmente já está na Taverna.
        </p>
      </Box>
    );

  return (
    <>
      <Box title="📱 Notificações no celular e no PC">
        <PushToggle />
      </Box>
      <Box title="🔔 Últimos avisos">
        {list === null ? (
          <p className="muted text-[12px]">Carregando...</p>
        ) : list.length === 0 ? (
          <p className="text-[13px]">
            Nenhum aviso ainda. Eles chegam quando alguém comenta as mortes ou os level ups dos seus chars liberados, quando tem fofoca nova pro Rashid e quando
            seu char morre ou sobe de level. Libere seu char em <Link href="/meus-chars">Meus chars</Link>.
          </p>
        ) : (
          <>
            <ul className="space-y-1.5">
              {list.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.url ?? "/comunidade/taverna"}
                    className="block rounded border border-[#b98a5a] p-2 !no-underline text-[#3a1a00]"
                    style={{ background: n.read_at ? "rgba(255,255,255,.35)" : "#f3d9a8" }}
                  >
                    <div className="flex gap-2 items-baseline">
                      <b className="text-[13px]">{n.title}</b>
                      {!n.read_at && <span className="tag tag-fire">novo</span>}
                      <span className="muted text-[11px] ml-auto whitespace-nowrap">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && <div className="text-[12px] mt-0.5">{n.body}</div>}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="text-[11px] underline mt-2 opacity-70"
              onClick={async () => {
                await clearAll();
                setList([]);
              }}
            >
              limpar todos
            </button>
          </>
        )}
      </Box>
    </>
  );
}
