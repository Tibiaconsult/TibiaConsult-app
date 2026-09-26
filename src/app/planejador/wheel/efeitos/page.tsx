import Box from "@/components/Box";
import WheelPlanner from "./WheelPlanner";

export const metadata = { title: "Wheel: efeitos no dano do sorcerer" };

export default function WheelEffectsPage() {
  return (
    <div>
      <h1>Wheel: efeitos no dano do sorcerer</h1>
      <Box title="Planejador simplificado (pontos por domínio)">
        <WheelPlanner />
      </Box>
    </div>
  );
}
