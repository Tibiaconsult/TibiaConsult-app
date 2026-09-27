import Link from "next/link";

// Destaque da tela inicial: o LootSplit, a ferramenta mais acessada do site.

export default function LootSplitSpotlight() {
  return (
    <section
      className="rounded-md p-4 mb-4 flex flex-wrap items-center gap-4"
      style={{ background: "linear-gradient(135deg, #3a2410, #1b1108)", border: "2px solid #d9a441", color: "#f5e6c8", boxShadow: "0 2px 10px #0006" }}
    >
      <div className="text-[40px] leading-none" aria-hidden>
        💰
      </div>
      <div className="flex-1 min-w-[240px]">
        <div
          className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold mb-1"
          style={{ background: "#d9a441", color: "#2a1a08", letterSpacing: 0.3 }}
        >
          ⭐ FERRAMENTA MAIS ACESSADA
        </div>
        <div className="text-[20px] font-bold" style={{ color: "#f3d27a" }}>
          LootSplit
        </div>
        <p className="text-[13px] mt-1">
          Acabou a hunt em PT? Cole o Party Hunt Analyser e receba a divisão pronta: quem paga quem e os comandos de <i>transfer</i> para copiar no jogo. Dá
          para tirar quem saiu e reembolsar gasto extra. Sem planilha, sem conta de cabeça.
        </p>
      </div>
      <Link href="/ferramentas/loot" className="tc-btn !text-[14px] !px-4 !py-2">
        Dividir o loot agora
      </Link>
    </section>
  );
}
