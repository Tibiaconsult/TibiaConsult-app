"use client";

// Sino do topo (avisos não lidos) e o botão de ligar o push no celular/PC.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PushState, disablePush, enablePush, pushState, refreshPush, unreadCount } from "@/lib/notify-client";
import { onSocialChange } from "@/lib/timeline";

/** 🔔 com o número de avisos não lidos. Só para quem está logado (a barra do topo decide). */
export function NotificationBell() {
  const path = usePathname();
  const [n, setN] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => unreadCount().then((c) => alive && setN(c));
    load();
    refreshPush().catch(() => {});
    const off = onSocialChange(load, 60_000);
    return () => {
      alive = false;
      off();
    };
  }, [path]);

  return (
    <Link
      href="/notificacoes"
      className="relative inline-flex items-center text-[18px] !no-underline"
      title={n ? `${n} aviso(s) novo(s)` : "Avisos"}
      aria-label={n ? `${n} avisos novos` : "Avisos"}
    >
      🔔
      {n > 0 && (
        <span
          className="absolute -top-1.5 -right-2 rounded-full px-1 text-[10px] font-bold leading-[15px] min-w-[15px] text-center"
          style={{ background: "#c0392b", color: "#fff" }}
        >
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}

const TEXT: Record<PushState, string> = {
  unsupported: "Este navegador não recebe notificações. No celular, use o Chrome (Android) ou instale o app no iPhone.",
  "ios-install": "No iPhone, as notificações só funcionam com o site instalado como app: toque em Compartilhar → Adicionar à Tela de Início e abra por lá.",
  denied: "As notificações do site estão bloqueadas no navegador. Libere nas configurações do site (cadeado ao lado do endereço) e volte aqui.",
  off: "Receba aviso no celular ou no PC quando comentarem a sua morte, tiver fofoca nova ou seu char subir de level.",
  on: "Notificações ligadas neste aparelho. ✅",
};

/** Liga/desliga o push neste aparelho. */
export function PushToggle({ compact }: { compact?: boolean }) {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    pushState()
      .then(setState)
      .catch(() => setState("unsupported"));
  }, []);

  if (!state || (compact && state !== "off")) return null;

  return (
    <div
      className={compact ? "rounded p-2 mb-3 text-[12px] flex flex-wrap items-center gap-x-3 gap-y-1" : "text-[13px] space-y-2"}
      style={compact ? { background: "#241a14", color: "#e8dcc8", border: "1px solid #5a4632" } : undefined}
    >
      <p className={compact ? "flex-1 min-w-[200px]" : ""}>
        {compact ? "🔔 Quer saber na hora quando zoarem a sua morte? Ligue o aviso no celular." : TEXT[state]}
      </p>
      {state === "ios-install" && (
        <p>
          <Link href="/instalar">Veja o passo a passo de instalação</Link>.
        </p>
      )}
      {(state === "off" || state === "on") && (
        <button
          type="button"
          className={`tc-btn ${compact ? "!py-0.5" : ""}`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMsg(null);
            if (state === "on") {
              await disablePush().catch(() => {});
              setState("off");
            } else {
              const err = await enablePush();
              if (err) setMsg(err);
              setState(await pushState().catch(() => "unsupported" as const));
            }
            setBusy(false);
          }}
        >
          {busy ? "Um momento..." : state === "on" ? "Desligar neste aparelho" : "🔔 Ligar notificações"}
        </button>
      )}
      {msg && <p className="bad">{msg}</p>}
    </div>
  );
}
