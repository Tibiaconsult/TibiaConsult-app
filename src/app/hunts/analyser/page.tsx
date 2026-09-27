import { HUNTS } from "@/data/hunts";
import HuntAnalyser from "./HuntAnalyser";

export const metadata = {
  title: "Hunt Analyser da guild",
  description: "XP/h e lucro/h reais de cada hunt, com as sessões coladas pela própria turma, por vocação e faixa de level.",
};

export default function HuntAnalyserPage() {
  const hunts = HUNTS.map((h) => ({ id: h.id, name: h.name, creatures: h.creatures.map((c) => ({ name: c.name })) }));
  return (
    <div>
      <h1>Hunt Analyser da guild</h1>
      <p className="on-dark mb-4">
        O ranking de hunts com números de verdade: cada um cola o Hunt Analyser do cliente depois de caçar e o site junta XP/h e lucro/h por hunt,
        vocação e level. Nada de estimativa de fórum: é a média do que a turma fez.
      </p>
      <HuntAnalyser hunts={hunts} />
    </div>
  );
}
