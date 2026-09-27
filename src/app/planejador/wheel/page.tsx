import Link from "next/link";
import Box from "@/components/Box";
import WheelOfDestiny from "./WheelOfDestiny";

export const metadata = { title: "Wheel of Destiny" };

export default function WheelPage() {
  return (
    <div>
      <h1>Wheel of Destiny</h1>
      <p className="on-dark mb-4">
        Builds prontas das cinco vocações para carregar com um clique e ajustar, e o que o planner do tibia.com não faz: levar a build direto para o
        simulador de dano (sorcerer) e salvar no seu char. Mesmo motor do planner oficial.
      </p>
      <p className="on-dark text-[12px] mb-3 flex flex-wrap gap-2">
        <Link className="tc-btn !py-0.5" href="/gemas">
          💎 Gemas: mods básicos e supremos
        </Link>
        <Link className="tc-btn !py-0.5" href="/simulador/gemas">
          Custo para revelar e subir gema
        </Link>
      </p>
      <Box title="Planejador">
        <WheelOfDestiny />
      </Box>
      <p className="on-dark text-[11px]">
        Prefere ajustar só os efeitos no dano do sorcerer, sem montar a roda? Isso fica no próprio <Link href="/simulador?voc=sorcerer">simulador de dano</Link>, em &quot;ajustar aqui&quot;.
      </p>
    </div>
  );
}
