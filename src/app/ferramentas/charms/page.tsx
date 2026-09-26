import Box from "@/components/Box";
import CharmPlanner from "./CharmPlanner";

export const metadata = { title: "Charms" };

export default function CharmsPage() {
  return (
    <div>
      <h1>Planejador de charms</h1>
      <p className="on-dark mb-4">
        Marque o nível que você já tem de cada charm e o nível que quer chegar. O site soma o custo em charm points e em Minor Charm Echoes e mostra quanto
        sobra ou falta.
      </p>
      <Box title="Charms">
        <CharmPlanner />
      </Box>
    </div>
  );
}
