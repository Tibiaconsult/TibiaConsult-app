import Box from "@/components/Box";
import LootSplit from "./LootSplit";

export const metadata = { title: "LootSplit" };

export default function LootPage() {
  return (
    <div>
      <h1>LootSplit</h1>
      <Box title="Party Hunt Analyser">
        <LootSplit />
      </Box>
    </div>
  );
}
