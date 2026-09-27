import Link from "next/link";
import Box from "@/components/Box";
import LootSplit from "./LootSplit";

export const metadata = { title: "LootSplit" };

export default function LootPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lootsplit/gold-pouch.gif" alt="" width={48} height={48} style={{ imageRendering: "pixelated" }} />
        <h1 className="!m-0 flex-1">LootSplit</h1>
        <Link href="/lootsplit" className="tc-btn" title="Abre o LootSplit sozinho, pronto para instalar como app no PC ou no celular">
          💻 Usar como app
        </Link>
      </div>
      <p className="on-dark mb-4">
        <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold mr-2" style={{ background: "#d9a441", color: "#2a1a08" }}>
          ⭐ FERRAMENTA MAIS ACESSADA
        </span>
        Cole o Party Hunt Analyser e receba quem paga quem, com os comandos de transfer prontos para copiar no jogo.
      </p>
      <Box title="Party Hunt Analyser">
        <LootSplit />
      </Box>
    </div>
  );
}
