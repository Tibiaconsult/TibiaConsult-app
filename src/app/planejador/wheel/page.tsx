import Link from "next/link";
import Box from "@/components/Box";
import WheelOfDestiny from "./WheelOfDestiny";

export const metadata = { title: "Wheel of Destiny" };

export default function WheelPage() {
  return (
    <div>
      <h1>Wheel of Destiny</h1>
      <p className="on-dark mb-4">
        A roda completa das cinco vocações, fatia por fatia, com gemas, revelations e builds prontas. Usa o mesmo motor e o mesmo código do planner
        do tibia.com. Para o sorcerer, o botão &quot;usar no simulador de dano&quot; leva a build direto para o cálculo.
      </p>
      <Box title="Planejador">
        <WheelOfDestiny />
      </Box>
      <p className="on-dark text-[11px]">
        Prefere ajustar só os efeitos no dano do sorcerer, sem montar a roda? Use o <Link href="/planejador/wheel/efeitos">planejador simplificado</Link>.
      </p>
    </div>
  );
}
