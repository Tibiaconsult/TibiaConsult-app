import Link from "next/link";
import Box from "@/components/Box";
import VocTabs from "@/components/VocTabs";
import { HUNTS } from "@/data/hunts";
import { pageVoc } from "@/lib/active-server";
import HuntPrep from "./HuntPrep";

export const metadata = { title: "Preparar para a hunt" };

export default async function PrepararPage({ searchParams }: { searchParams: Promise<{ h?: string; voc?: string }> }) {
  const sp = await searchParams;
  const voc = await pageVoc(sp);
  const hunt = HUNTS.find((x) => x.id === sp.h) ?? null;

  return (
    <div>
      <h1>{hunt ? `Preparar: ${hunt.name}` : "Preparar para uma hunt"}</h1>
      <VocTabs base="/hunts/preparar" current={voc} />
      {hunt ? (
        <>
          <p className="on-dark mb-4">
            Set, imbuements, combo e charm montados a partir das resistências e dos ataques das creatures desta hunt. Cada parte abre na ferramenta própria para
            ajustar e, com login, dá para salvar no seu char.
          </p>
          <HuntPrep key={`${hunt.id}-${voc}`} h={hunt} voc={voc} />
        </>
      ) : (
        <Box title="Escolha a hunt">
          <p className="mb-3 text-[12px]">Escolha a hunt e o site monta set, imbuements, combo e charm para a vocação ativa.</p>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-[12px]">
            {HUNTS.map((h) => (
              <li key={h.id}>
                <Link href={`/hunts/preparar?h=${h.id}&voc=${voc}`} className="font-bold">
                  {h.name}
                </Link>{" "}
                <span className="muted">{h.city}</span>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </div>
  );
}
