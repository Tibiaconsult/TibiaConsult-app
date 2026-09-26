import Box from "@/components/Box";
import GemCost from "./GemCost";

export const metadata = { title: "Custo de gemas" };

export default function GemasCustoPage() {
  return (
    <div>
      <h1>Custo de gemas</h1>
      <Box title="Revelar e subir grade">
        <GemCost />
      </Box>
    </div>
  );
}
