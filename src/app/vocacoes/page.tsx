import Link from "next/link";
import Box from "@/components/Box";
import { VOCATIONS, VOC_IDS } from "@/data/vocations";

export const metadata = { title: "Vocações" };

const EMBLEM: Record<string, string> = { sorcerer: "energywave", druid: "eternalwinter", knight: "fierceberserk", paladin: "divinecaldera", monk: "spiritualoutburst" };

export default function VocacoesPage() {
  return (
    <div>
      <h1>Vocações</h1>
      <p className="on-dark mb-4">Escolha a vocação para ver magias, cooldowns, Wheel, gemas, armas e o simulador de dano com rotação automática.</p>
      <Box title="Escolha a vocação">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/simulador" className="border border-[#b98a5a] rounded p-3 bg-white/40 block hover:bg-white/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://static.tibia.com/images/library/${EMBLEM.sorcerer}.png`} alt="" width={32} height={32} className="inline-block align-middle mr-2" />
            <b>Master Sorcerer</b>
            <p className="text-[12px] mt-1">A vocação mais completa do site: simulador com set, Wheel e proficiência, rotações por elemento, gemas, forja e Magic Shield.</p>
          </Link>
          {VOC_IDS.map((id) => {
            const v = VOCATIONS[id];
            return (
              <Link key={id} href={`/vocacoes/${id}`} className="border border-[#b98a5a] rounded p-3 bg-white/40 block hover:bg-white/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://static.tibia.com/images/library/${EMBLEM[id]}.png`} alt="" width={32} height={32} className="inline-block align-middle mr-2" />
                <b>{v.promoted}</b>
                <p className="text-[12px] mt-1">{v.intro}</p>
              </Link>
            );
          })}
        </div>
      </Box>
    </div>
  );
}
