import Link from "next/link";
import Box from "@/components/Box";
import VocTabs from "@/components/VocTabs";
import { pageVoc } from "@/lib/active-server";
import { VOCATIONS } from "@/data/vocations";
import DamageSimulator from "./DamageSimulator";
import VocSimulator from "./VocSimulator";

export const metadata = { title: "Dano e DPS" };

const INTRO: Record<string, string> = {
  sorcerer:
    "Informe o char, a stance e o alvo. O simulador calcula min, média e máximo de cada feitiço, aplica crit, resistência e mitigação da creature, e dá o dano por ciclo e por minuto de cada rotação. Set, Wheel e proficiência entram direto.",
  druid: "Level, magic level, stance e Wheel. O simulador calcula cada magia contra a hunt escolhida e monta a rotação que mais causa dano.",
  knight: "Skill, ataque da arma, stance e Wheel. As magias seguem o elemento da arma, divididas na proporção do ataque físico e elemental.",
  paladin: "Distance, munição, magic level e stance. As magias de distance seguem o elemento da munição; as holy usam o magic level.",
  monk: "",
};

export default async function SimuladorPage({ searchParams }: { searchParams: Promise<{ voc?: string }> }) {
  const voc = await pageVoc(await searchParams);

  return (
    <div>
      <h1>Simulador de dano e DPS</h1>
      <VocTabs base="/simulador" current={voc} />
      {INTRO[voc] && <p className="on-dark mb-4">{INTRO[voc]}</p>}

      {voc === "sorcerer" ? (
        <Box title="Simulador · Master Sorcerer">
          <DamageSimulator />
        </Box>
      ) : voc === "monk" ? (
        <Box title="Simulador · Exalted Monk">
          <p>
            O simulador do monk ainda não está disponível. O dano das magias de monk depende de um fator próprio de cada magia, somado ao ataque da arma, ao
            fist fighting e à Harmony, e esse fator não é público. Em vez de chutar, o site mostra os números conferidos:
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link className="tc-btn" href="/vocacoes/monk">
              Magias, Harmony e Wheel do monk
            </Link>
            <Link className="tc-btn" href="/rotacoes?voc=monk#montador">
              Montador de combos
            </Link>
            <Link className="tc-btn" href="/cooldowns?voc=monk">
              Cooldowns
            </Link>
          </div>
        </Box>
      ) : (
        <Box title={`Simulador · ${VOCATIONS[voc].promoted}`}>
          <VocSimulator key={voc} voc={voc} />
        </Box>
      )}

      {voc !== "monk" && (
        <Box title="Sobre a fórmula">
          <ul className="list-disc pl-5 space-y-1">
            <li>Bônus de level: fórmula oficial da TibiaWiki (Base Damage and Healing, em vigor desde 18/10/2022).</li>
            <li>
              Magias por magic level: média = bônus de level + ML × raiz de 0,4 × base power + base power/6; min 88% e máx 112% da média.
              {voc !== "sorcerer" && " Magias por skill: bônus de level + (base/1000) × skill × ataque + base/6."} São reconstruções da comunidade a partir de
              dados reais; a CipSoft não publica a fórmula.
            </li>
            <li>
              Por isso existe a calibração: lance uma magia no jogo sem bônus temporário, anote o hit mais alto e informe. O simulador ajusta o multiplicador
              para o seu char.
            </li>
            <li>Crit: 5% de chance e 10% extra intrínsecos desde o Summer Update 2025, somados ao que você informar.</li>
            {voc === "sorcerer" && <li>Elemental pierce segue a regra oficial: acima de 100% de sensibilidade o acréscimo cai pela metade; 0% nunca sobe.</li>}
          </ul>
        </Box>
      )}
    </div>
  );
}
