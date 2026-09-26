import HuntExplorer from "./HuntExplorer";

export const metadata = { title: "Hunts" };

export default function HuntsPage() {
  return (
    <div>
      <h1>Hunts</h1>
      <p className="on-dark mb-4">
        Busque a hunt pelo nome, cidade ou bicho. Filtre por solo, com a sua vocação e level, ou por time, com o level de cada membro. Clique
        numa hunt para abrir a ficha com resistências, ataques, set e dicas.
      </p>
      <HuntExplorer />
    </div>
  );
}
