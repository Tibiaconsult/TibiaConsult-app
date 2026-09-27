import TavernFeed from "./TavernFeed";

export const metadata = { title: "Causos da Taverna" };

export default function TavernaPage() {
  return (
    <div>
      <h1>Causos da Taverna</h1>
      <p className="on-dark mb-4">
        Morreu de um jeito ridículo? Caiu o drop da vida? Esqueceu a bless? Conta aqui. Só chars verificados postam, então todo causo tem dono de verdade.
      </p>
      <TavernFeed />
    </div>
  );
}
