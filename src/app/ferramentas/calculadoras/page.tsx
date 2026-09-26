import Calculators from "./Calculators";

export const metadata = { title: "Calculadoras" };

export default function CalculadorasPage() {
  return (
    <div>
      <h1>Calculadoras</h1>
      <p className="on-dark mb-4">Experiência até um level, stamina offline e custo de blessings, com as fórmulas da TibiaWiki.</p>
      <Calculators />
    </div>
  );
}
