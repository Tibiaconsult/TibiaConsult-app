import Link from "next/link";
import Box from "@/components/Box";
import ProficiencyPlanner from "../ProficiencyPlanner";

export const metadata = { title: "Proficiência da wand no simulador" };

export default function ProficienciaWandPage() {
  return (
    <div>
      <h1>Proficiência da wand: efeito no dano</h1>
      <p className="on-dark mb-4">
        Versão do sorcerer que leva os perks escolhidos para o simulador de dano. As árvores de todas as armas, das cinco vocações, estão em{" "}
        <Link href="/planejador/proficiencia">Proficiência</Link>.
      </p>
      <Box title="Escolha um perk por nível">
        <ProficiencyPlanner />
      </Box>
    </div>
  );
}
