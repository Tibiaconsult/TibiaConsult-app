import Box from "@/components/Box";
import ImbuementList from "./ImbuementList";

export const metadata = { title: "Imbuements" };

export default function ImbuementsPage() {
  return (
    <div>
      <h1>Imbuements</h1>
      <p className="on-dark mb-4">
        Todos os imbuements com efeito por nível e os materiais de cada um. Marque os que você vai fazer e o site soma a lista de compras.
      </p>
      <Box title="Lista de imbuements">
        <ImbuementList />
      </Box>
    </div>
  );
}
