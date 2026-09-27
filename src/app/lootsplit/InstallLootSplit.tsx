"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Botão "Instalar como app" (Chrome e Edge no PC e no Android); nos outros navegadores, o caminho pelo menu. */
export default function InstallLootSplit() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [state, setState] = useState<"web" | "app" | "done">("web");
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const onInstalled = () => setState("done");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const t = standalone ? setTimeout(() => setState("app"), 0) : undefined;
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (state === "app") return null;
  if (state === "done") return <span className="on-dark text-[12px]">✔ Instalado. Procure o LootSplit no menu Iniciar ou na área de trabalho.</span>;
  return (
    <div className="text-right">
      <button
        type="button"
        className="tc-btn"
        onClick={async () => {
          if (!prompt) return setHelp((h) => !h);
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === "accepted") setState("done");
          setPrompt(null);
        }}
      >
        💻 Instalar como app
      </button>
      {help && (
        <div className="on-dark text-[11px] mt-1 max-w-[280px] text-left">
          <b>Chrome ou Edge no PC:</b> clique no ícone de instalar na barra de endereço (ou menu ⋮ → Transmitir, salvar e compartilhar → Instalar página como
          app). <b>iPhone:</b> Compartilhar → Adicionar à Tela de Início. <b>Android:</b> menu ⋮ → Instalar app.
        </div>
      )}
    </div>
  );
}
