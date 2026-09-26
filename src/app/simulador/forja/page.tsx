import Box from "@/components/Box";
import ForgeSimulator from "./ForgeSimulator";

export const metadata = { title: "Simulador de forja" };

export default function ForjaPage() {
  return (
    <div>
      <h1>Simulador de forja</h1>
      <Box title="Custo para chegar ao tier">
        <ForgeSimulator />
      </Box>
    </div>
  );
}
