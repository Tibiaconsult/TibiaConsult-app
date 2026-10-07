import TcConverter from "./TcConverter";

export const metadata = { title: "Conversor de Tibia Coins", description: "Quanto X Tibia Coins valem em gold (kk) e em reais, com o preço do seu mundo." };

export default function ConversorTcPage() {
  return (
    <div>
      <h1>Conversor de Tibia Coins</h1>
      <p className="on-dark mb-4">Quantos kk e quantos reais valem as suas TC. Você informa o preço da TC no seu mundo e quanto cobra; o resto é automático.</p>
      <TcConverter />
    </div>
  );
}
