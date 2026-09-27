import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Box from "@/components/Box";
import LootSplit from "../ferramentas/loot/LootSplit";
import InstallLootSplit from "./InstallLootSplit";

// LootSplit sozinho, sem o menu do site: é a página que vira app no PC (e no celular) pelo "Instalar" do navegador,
// com nome, ícone (Gold Pouch) e janela próprios. Manifesto em /public/lootsplit/manifest.webmanifest.

export const metadata: Metadata = {
  title: { absolute: "LootSplit · TibiaConsult" },
  description: "Cole o Party Hunt Analyser do Tibia e receba a divisão do loot pronta: quem paga quem, com os comandos de transfer para copiar no jogo.",
  manifest: "/lootsplit/manifest.webmanifest",
  icons: { icon: "/lootsplit/icon-192.png", apple: "/lootsplit/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "LootSplit", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#2a1a08" };

export default function LootSplitApp() {
  return (
    <div className="tc-standalone">
      <header className="flex flex-wrap items-center gap-3 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lootsplit/gold-pouch.gif" alt="" width={48} height={48} className="sprite" style={{ imageRendering: "pixelated" }} />
        <div className="flex-1 min-w-[200px]">
          <h1 className="!m-0">LootSplit</h1>
          <p className="on-dark text-[12px]">Cole o Party Hunt Analyser e receba quem paga quem, com os comandos de transfer prontos para copiar no jogo.</p>
        </div>
        <InstallLootSplit />
      </header>
      <Box title="Party Hunt Analyser">
        <LootSplit />
      </Box>
      <p className="on-dark muted text-[11px] text-center mt-2">
        Do <Link href="/">TibiaConsult</Link>: fichas de hunt, mapa, simuladores e mais para a sua vocação. Tibia é da CipSoft GmbH; ferramenta de fãs, sem
        vínculo com a CipSoft.
      </p>
    </div>
  );
}
