import Link from "next/link";
import { redirect } from "next/navigation";
import Box from "@/components/Box";
import VocTabs from "@/components/VocTabs";
import { ALL_VOCS } from "@/components/voc-list";
import { PROF_IMGS, PROF_IMG_BASE, PROF_TEXTS, PROF_TREES } from "@/data/prof-trees";
import { VOC_EQUIPMENT } from "@/data/voc-equipment";
import { pageVoc } from "@/lib/active-server";
import ProfTree, { ProfWeapon } from "./ProfTree";

export const metadata = { title: "Proficiência e catalisadores" };

const url = (i: number) => (i < 0 ? "" : PROF_IMG_BASE + PROF_IMGS[i]);

export default async function ProficienciaPage({ searchParams }: { searchParams: Promise<{ voc?: string; prof?: string }> }) {
  const sp = await searchParams;
  // link antigo do planejador da wand
  if (sp.prof) redirect(`/planejador/proficiencia/wand?prof=${encodeURIComponent(sp.prof)}`);
  const voc = await pageVoc(sp);
  const label = ALL_VOCS.find(([id]) => id === voc)?.[1] ?? "";
  // só a vocação escolhida vai para o navegador
  const rows = (VOC_EQUIPMENT[voc] ?? []).filter((r) => r.slot === "Arma");
  const withTree: ProfWeapon[] = rows
    .filter((r) => PROF_TREES[r.name])
    .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
    .map((r) => ({
      name: r.name,
      level: r.level,
      kind: r.kind.split(" · ")[0],
      hands: r.hands,
      levels: PROF_TREES[r.name].map((lv) => lv.map(([i, o, t]) => [url(i), url(o), PROF_TEXTS[t]] as [string, string, string])),
    }));
  const noTree = rows.filter((r) => !PROF_TREES[r.name]).map((r) => r.name);

  return (
    <div>
      <h1>Proficiência de arma</h1>
      <VocTabs base="/planejador/proficiencia" current={voc} />
      <Box title={`Armas de ${label}`}>
        <ProfTree key={voc} voc={voc} weapons={withTree} />
        {noTree.length > 0 && (
          <p className="muted text-[11px] mt-3">Ainda sem árvore publicada na TibiaWiki: {noTree.join(", ")}.</p>
        )}
        {voc === "sorcerer" && (
          <p className="text-[12px] mt-2">
            Para ver o efeito dos perks da wand no dano, use a{" "}
            <Link href="/planejador/proficiencia/wand">proficiência da wand com o simulador</Link> (inclui o Stellar Moonsilver Channeler).
          </p>
        )}
      </Box>
      <Box title="Como a proficiência funciona">
        <ul className="list-disc pl-5 space-y-1 text-[12px]">
          <li>Cada arma sobe de nível de proficiência matando bichos com ela equipada ou usando catalisadores. Cada nível libera uma escolha de perk.</li>
          <li>Só um perk por nível fica ativo. Escolher pela primeira vez pode ser em qualquer lugar; trocar ou tirar, só em área protegida.</li>
          <li>O progresso é do char e não passa para outro. Quem causou dano ganha progresso, como no bestiário; bicho sem entrada no bestiário não conta.</li>
          <li>Os perks vão até o nível 7. Os dois níveis seguintes dão só maestria (título e conquista).</li>
          <li>Arma de outra vocação também acumula progresso, mas os perks só funcionam para a vocação da arma.</li>
        </ul>
        <p className="muted text-[10px] mt-2">Fonte: TibiaWiki, Weapon Proficiency, consulta em 26/09/2026.</p>
      </Box>
    </div>
  );
}
