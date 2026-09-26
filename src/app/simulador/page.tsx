import Box from "@/components/Box";
import DamageSimulator from "./DamageSimulator";

export default function SimuladorPage() {
  return (
    <div>
      <h1>Simulador de dano e DPS</h1>
      <p className="on-dark mb-4">
        Informe o char, a stance e o alvo. O simulador calcula min, média e máximo de cada feitiço, aplica crit, resistência e mitigação do
        bicho, e dá o dano por ciclo e por minuto de cada rotação.
      </p>
      <Box title="Simulador">
        <DamageSimulator />
      </Box>
      <Box title="Sobre a fórmula">
        <ul className="list-disc pl-5 space-y-1">
          <li>Bônus de level: fórmula oficial da TibiaWiki (Base Damage and Healing, em vigor desde 18/10/2022).</li>
          <li>
            Termo de magic level e faixa min/max: reconstrução da comunidade a partir de dados reais (média = bônus de level + ML × raiz de
            0,4 × base power + base power/6; min 88% e máx 112% da média). A CipSoft não publica a fórmula.
          </li>
          <li>
            Por isso existe a calibração: lance um feitiço no jogo sem bônus temporário, anote o hit mais alto e informe. O simulador ajusta o
            multiplicador para o seu char.
          </li>
          <li>Crit: 5% de chance e 10% extra intrínsecos desde o Summer Update 2025, somados ao que você informar.</li>
          <li>Elemental pierce segue a regra oficial: acima de 100% de sensibilidade o acréscimo cai pela metade; 0% nunca sobe.</li>
        </ul>
      </Box>
    </div>
  );
}
