import Box from "@/components/Box";
import LootSplit from "./LootSplit";

export const metadata = { title: "Divisão de loot" };

export default function LootPage() {
  return (
    <div>
      <h1>Divisão de loot</h1>
      <Box title="Party Hunt Analyser">
        <LootSplit />
      </Box>
    </div>
  );
}
