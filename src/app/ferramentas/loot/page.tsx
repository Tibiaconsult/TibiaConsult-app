import Box from "@/components/Box";
import LootSplit from "./LootSplit";

export const metadata = { title: "LootSplit" };

export default function LootPage() {
  return (
    <div>
      <h1>LootSplit</h1>
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
