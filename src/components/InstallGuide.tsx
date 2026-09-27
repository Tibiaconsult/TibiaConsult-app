"use client";

// Guia animado para instalar o site como app: Windows (Chrome/Edge, com fixar na barra de tarefas), Android e iPhone.
// Onde o navegador permite, o botão "Instalar agora" abre direto a janela de instalação.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

type Platform = "windows" | "android" | "iphone";
const TABS: { id: Platform; label: string }[] = [
  { id: "windows", label: "PC" },
  { id: "android", label: "Android" },
  { id: "iphone", label: "iPhone" },
];

interface Step {
  caption: string;
  /** posição do dedo/cursor dentro da cena (0 a 100 %) */
  at: [number, number];
  scene: React.ReactNode;
}

const ICON = "/icon-192-tc.png";
const GOLD = "#f3d27a";

/* ---------- peças das cenas ---------- */

function Browser({ children, addressIcon }: { children?: React.ReactNode; addressIcon?: boolean }) {
  return (
    <div className="absolute inset-[6%_4%_20%_4%] rounded bg-[#f3f3f3] overflow-hidden" style={{ boxShadow: "0 2px 6px rgba(0,0,0,.5)" }}>
      <div className="flex items-center gap-1 px-1 h-[18px] bg-[#dcdcdc]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e0443e]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#dea123]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#1aab29]" />
        <div className="flex-1 min-w-0 h-[11px] rounded-full bg-white text-[7px] leading-[11px] px-1.5 text-[#555] flex justify-between gap-1 whitespace-nowrap">
          <span className="truncate">tibia-consult-app.vercel.app</span>
          {addressIcon && <span className="text-[9px] leading-[11px] text-[#1a3f8f]">⊕</span>}
        </div>
        <span className="text-[9px] text-[#555]">⋮</span>
      </div>
      <div className="p-1.5 text-[7px] text-[#333]">
        <div className="h-1.5 w-2/3 bg-[#1a3f8f]/50 rounded mb-1" />
        <div className="h-1 w-full bg-[#bbb] rounded mb-0.5" />
        <div className="h-1 w-5/6 bg-[#bbb] rounded mb-0.5" />
        <div className="h-1 w-3/4 bg-[#bbb] rounded" />
      </div>
      {children}
    </div>
  );
}

function Taskbar({ pinned, menu }: { pinned?: boolean; menu?: boolean }) {
  return (
    <>
      <div className="absolute left-0 right-0 bottom-0 h-[16%] bg-[#202020] flex items-center justify-center gap-1.5">
        <span className="w-3 h-3 grid grid-cols-2 gap-[1px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="bg-[#4aa3f0]" />
          ))}
        </span>
        <span className="w-3 h-3 rounded-full bg-[#dea123]" />
        <span className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON} alt="" className="w-3.5 h-3.5 rounded-sm" />
          <span className={`absolute -bottom-0.5 left-0.5 right-0.5 h-[2px] rounded ${pinned ? "bg-[#4aa3f0]" : "bg-[#888]"}`} />
        </span>
      </div>
      {menu && (
        <div className="absolute left-[46%] bottom-[18%] w-[52%] rounded bg-[#2b2b2b] text-[7.5px] text-white py-0.5" style={{ boxShadow: "0 2px 8px #000" }}>
          <div className="px-1.5 py-0.5 opacity-70">TibiaConsult</div>
          <div className="px-1.5 py-0.5 bg-[#3d3d3d] font-bold">📌 Fixar na barra de tarefas</div>
          <div className="px-1.5 py-0.5 opacity-70">✕ Fechar janela</div>
        </div>
      )}
    </>
  );
}

function Dialog({ title, button }: { title: string; button: string }) {
  return (
    <div
      className="absolute left-[18%] right-[18%] top-[22%] rounded bg-white p-1.5 text-[7.5px] text-[#222]"
      style={{ boxShadow: "0 3px 10px rgba(0,0,0,.6)" }}
    >
      <div className="font-bold mb-1">{title}</div>
      <div className="flex items-center gap-1 mb-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ICON} alt="" className="w-3.5 h-3.5 rounded-sm" />
        TibiaConsult
      </div>
      <div className="flex justify-end gap-1">
        <span className="px-1.5 py-[1px] rounded border border-[#bbb]">Cancelar</span>
        <span className="px-1.5 py-[1px] rounded bg-[#1a73e8] text-white font-bold">{button}</span>
      </div>
    </div>
  );
}

function Phone({ children, bottomBar }: { children?: React.ReactNode; bottomBar?: boolean }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[3%] bottom-[3%] w-[46%] rounded-[10px] border-[3px] border-[#111] bg-[#f3f3f3] overflow-hidden">
      {!bottomBar && (
        <div className="flex items-center gap-1 px-1 h-[14px] bg-[#dcdcdc]">
          <div className="flex-1 h-[8px] rounded-full bg-white" />
          <span className="text-[9px] text-[#555] leading-none">⋮</span>
        </div>
      )}
      <div className="p-1">
        <div className="h-1.5 w-2/3 bg-[#1a3f8f]/50 rounded mb-1" />
        <div className="h-1 w-full bg-[#bbb] rounded mb-0.5" />
        <div className="h-1 w-5/6 bg-[#bbb] rounded" />
      </div>
      {bottomBar && (
        <div className="absolute bottom-0 left-0 right-0 h-[16px] bg-[#dcdcdc] flex items-center justify-around text-[9px] text-[#1a73e8]">
          <span>‹</span>
          <span>⬆</span>
          <span>▢</span>
        </div>
      )}
      {children}
    </div>
  );
}

function Sheet({ items, hi }: { items: string[]; hi: number }) {
  return (
    <div className="absolute left-0 right-0 bottom-0 rounded-t-md bg-white text-[6.5px] text-[#222] py-0.5" style={{ boxShadow: "0 -2px 6px rgba(0,0,0,.3)" }}>
      {items.map((t, i) => (
        <div key={t} className={`px-1 py-[2px] ${i === hi ? "bg-[#dbe8ff] font-bold" : ""}`}>
          {t}
        </div>
      ))}
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="absolute inset-0 p-1.5 grid grid-cols-3 gap-1 content-start" style={{ background: "linear-gradient(#1a3f8f,#0d3b1c)" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="aspect-square rounded bg-white/25" />
      ))}
      <span className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ICON} alt="" className="w-full aspect-square rounded tc-pop" />
        <span className="text-[5px] text-white leading-tight">TibiaConsult</span>
      </span>
    </div>
  );
}

/* ---------- roteiros ---------- */

const STEPS: Record<Platform, Step[]> = {
  windows: [
    { caption: "No Chrome ou Edge, clique no ícone de instalar ⊕ no fim da barra de endereço.", at: [80, 12], scene: <Browser addressIcon /> },
    {
      caption: 'Confirme em "Instalar". O TibiaConsult abre na própria janela, como um programa.',
      at: [72, 49],
      scene: (
        <Browser addressIcon>
          <Dialog title="Instalar app?" button="Instalar" />
        </Browser>
      ),
    },
    {
      caption: 'Na barra de tarefas, clique com o botão direito no ícone e escolha "Fixar na barra de tarefas".',
      at: [66, 62],
      scene: (
        <>
          <Browser />
          <Taskbar menu />
        </>
      ),
    },
    {
      caption: "Pronto: o ícone fica fixo embaixo. Um clique e o site abre direto.",
      at: [56, 92],
      scene: (
        <>
          <Taskbar pinned />
          <div className="absolute inset-x-0 top-[30%] text-center text-[12px] font-bold" style={{ color: GOLD }}>
            ✔ Fixado!
          </div>
        </>
      ),
    },
  ],
  android: [
    { caption: "No Chrome, toque no menu ⋮ no canto de cima.", at: [70, 10], scene: <Phone /> },
    {
      caption: 'Toque em "Instalar app" (ou "Adicionar à tela inicial").',
      at: [50, 80],
      scene: (
        <Phone>
          <Sheet items={["Nova guia", "Favoritos", "Histórico", "📲 Instalar app", "Configurações"]} hi={3} />
        </Phone>
      ),
    },
    {
      caption: 'Confirme em "Instalar".',
      at: [62, 44],
      scene: (
        <Phone>
          <div className="absolute inset-x-[6%] top-[30%] rounded bg-white p-1 text-[6.5px] text-[#222]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,.5)" }}>
            <div className="font-bold">Instalar app?</div>
            <div className="text-right mt-1">
              <span className="px-1 rounded bg-[#1a73e8] text-white font-bold">Instalar</span>
            </div>
          </div>
        </Phone>
      ),
    },
    {
      caption: "O ícone aparece na tela inicial. Abre em tela cheia, sem a barra do navegador.",
      at: [58, 40],
      scene: (
        <Phone>
          <HomeScreen />
        </Phone>
      ),
    },
  ],
  iphone: [
    { caption: "No Safari, toque no botão Compartilhar ⬆ na barra de baixo.", at: [50, 90], scene: <Phone bottomBar /> },
    {
      caption: 'Role e toque em "Adicionar à Tela de Início".',
      at: [50, 82],
      scene: (
        <Phone bottomBar>
          <Sheet items={["Copiar", "Adicionar aos Favoritos", "Buscar na Página", "➕ Adicionar à Tela de Início"]} hi={3} />
        </Phone>
      ),
    },
    {
      caption: 'Toque em "Adicionar", no canto de cima.',
      at: [66, 10],
      scene: (
        <Phone bottomBar>
          <div className="absolute inset-x-0 top-0 h-[16px] bg-white flex items-center justify-between px-1 text-[6.5px]">
            <span className="text-[#1a73e8]">Cancelar</span>
            <span className="text-[#1a73e8] font-bold">Adicionar</span>
          </div>
        </Phone>
      ),
    },
    {
      caption: "Pronto: o TibiaConsult fica na tela de início como um app.",
      at: [58, 40],
      scene: (
        <Phone>
          <HomeScreen />
        </Phone>
      ),
    },
  ],
};

/* ---------- plataforma, modo app e instalação direta ---------- */

const noop = () => () => {};
function detect(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  return "windows";
}
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches;

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallGuide({ compact }: { compact?: boolean }) {
  const detected = useSyncExternalStore(noop, detect, () => "windows" as Platform);
  const standalone = useSyncExternalStore(noop, isStandalone, () => false);
  const [picked, setPicked] = useState<Platform | null>(null);
  const platform = picked ?? detected;
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const onGuidePage = usePathname() === "/instalar";
  const steps = STEPS[platform];
  const cur = steps[step % steps.length];

  useEffect(() => {
    if (paused || (compact && onGuidePage)) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 3200);
    return () => clearInterval(t);
  }, [paused, compact, onGuidePage]);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (compact && onGuidePage) return <p>Siga o passo a passo ao lado. 👈</p>;
  if (standalone || installed)
    return (
      <p>
        ✔ Você já está usando o TibiaConsult como app.
        {platform === "windows" && " Se ainda não fixou: botão direito no ícone da barra de tarefas → Fixar na barra de tarefas."}
      </p>
    );

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex gap-1 mb-1.5 justify-center">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setPicked(t.id);
              setStep(0);
            }}
            className="px-2 py-[1px] rounded text-[10px] border"
            style={{
              borderColor: platform === t.id ? GOLD : "#555",
              color: platform === t.id ? GOLD : "#bbb",
              background: platform === t.id ? "#3a2a10" : "transparent",
              fontWeight: platform === t.id ? "bold" : "normal",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className={`relative w-full overflow-hidden rounded border border-[#444] ${compact ? "" : "max-w-[380px] mx-auto"}`}
        style={{ aspectRatio: compact ? "16 / 11" : "16 / 9", background: "radial-gradient(circle at 30% 20%, #2c4a7a, #0b1a33)" }}
        aria-hidden
      >
        <div key={platform + step} className="absolute inset-0 tc-fade">
          {cur.scene}
        </div>
        {/* cursor / dedo que vai até o ponto e clica */}
        <div
          className="absolute pointer-events-none"
          style={{ left: `${cur.at[0]}%`, top: `${cur.at[1]}%`, transition: "left .9s ease, top .9s ease", transform: "translate(-30%, -10%)" }}
        >
          <span key={platform + step} className="absolute -left-2 -top-2 w-4 h-4 rounded-full border-2 tc-tap" style={{ borderColor: GOLD }} />
          <span className="relative text-[14px] drop-shadow">{platform === "windows" ? "🖱️" : "👆"}</span>
        </div>
      </div>

      <div className="flex justify-center gap-1 my-1.5">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Passo ${i + 1}`}
            onClick={() => setStep(i)}
            className="w-2 h-2 rounded-full"
            style={{ background: i === step % steps.length ? GOLD : "#555" }}
          />
        ))}
      </div>
      <p className="min-h-[44px]">
        <b style={{ color: GOLD }}>{(step % steps.length) + 1}.</b> {cur.caption}
      </p>

      {prompt && (
        <button
          type="button"
          className="tc-btn w-full mt-1.5"
          onClick={async () => {
            await prompt.prompt();
            if ((await prompt.userChoice).outcome === "accepted") setInstalled(true);
            setPrompt(null);
          }}
        >
          Instalar agora
        </button>
      )}
      {compact && (
        <p className="mt-1 text-center">
          <Link href="/instalar" style={{ color: GOLD }}>
            ver guia completo
          </Link>
        </p>
      )}
    </div>
  );
}
