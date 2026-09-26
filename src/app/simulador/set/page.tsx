import Box from "@/components/Box";
import SetCalculator from "./SetCalculator";

export const metadata = { title: "Montador de set" };

export default function SetPage() {
  return (
    <div>
      <h1>Montador de set</h1>
      <Box title="Seu inventário">
        <SetCalculator />
      </Box>
    </div>
  );
}
