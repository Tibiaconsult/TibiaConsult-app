import Box from "@/components/Box";
import WheelPlanner from "./WheelPlanner";

export const metadata = { title: "Wheel of Destiny" };

export default function WheelPage() {
  return (
    <div>
      <h1>Wheel of Destiny</h1>
      <Box title="Planejador de efeitos do sorcerer">
        <WheelPlanner />
      </Box>
    </div>
  );
}
