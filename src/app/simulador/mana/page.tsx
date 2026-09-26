import Box from "@/components/Box";
import ManaSimulator from "./ManaSimulator";

export const metadata = { title: "Magic Shield e mana" };

export default function ManaPage() {
  return (
    <div>
      <h1>Magic Shield e mana</h1>
      <Box title="Sobrevivência e sustain">
        <ManaSimulator />
      </Box>
    </div>
  );
}
