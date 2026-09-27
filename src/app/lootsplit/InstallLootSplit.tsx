"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * Botão "Instalar como app". No endereço do site, quando o endereço próprio do LootSplit já existe, leva para lá (lá ele
 * instala separado do app do TibiaConsult). No endereço próprio, usa o "instalar" do navegador (Chrome e Edge) e, nos
 * outros, mostra o caminho pelo menu.
 */
export default function InstallLootSplit({ appUrl }: { appUrl: string | null }) {
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
  if (appUrl)
    return (
      <div className="text-right">
        <a className="tc-btn" href={appUrl}>
          💻 Instalar como app
        </a>
        <div className="on-dark text-[11px] mt-1 max-w-[260px]">Abre o LootSplit no endereço dele; lá, clique em Instalar de novo.</div>
      </div>
    );
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
        <div className="on-dark text-[11px] mt-1 max-w-[300px] text-left space-y-1">
          <p>
            <b>Chrome ou Edge no PC:</b> ícone de instalar na barra de endereço, ou menu ⋮ → Transmitir, salvar e compartilhar → Instalar página como app.
          </p>
          <p>
            <b>Aparece &quot;Abrir no TibiaConsult&quot;?</b> É porque o app do site já está instalado. Use menu ⋮ → Transmitir, salvar e compartilhar →{" "}
            <b>Criar atalho</b> e marque <b>Abrir como janela</b>.
          </p>
          <p>
            <b>iPhone:</b> Compartilhar → Adicionar à Tela de Início. <b>Android:</b> menu ⋮ → Instalar app.
          </p>
        </div>
      )}
    </div>
  );
}
