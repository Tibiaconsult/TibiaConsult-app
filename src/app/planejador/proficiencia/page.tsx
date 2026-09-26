import Box from "@/components/Box";
import ProficiencyPlanner from "./ProficiencyPlanner";

export const metadata = { title: "Proficiência da wand" };

export default function ProficienciaPage() {
  return (
    <div>
      <h1>Proficiência da wand</h1>
      <Box title="Escolha um perk por nível">
        <ProficiencyPlanner />
      </Box>
    </div>
  );
}
