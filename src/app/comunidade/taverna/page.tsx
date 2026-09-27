import TavernFeed from "./TavernFeed";

export const metadata = { title: "Causos da Taverna" };

export default function TavernaPage() {
  return (
    <div>
      <h1>Causos da Taverna</h1>
      <p className="on-dark mb-4">
        Morreu de um jeito ridículo? Caiu o drop da vida? Esqueceu a bless? Conta aqui. Libere seu char com um clique e bota a história na mesa.
      </p>
      <TavernFeed />
    </div>
  );
}
