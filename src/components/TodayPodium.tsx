import { getCreature } from "@/lib/creatures";
import { creatureHref } from "@/lib/creature-labels";
import { getBoosted } from "./Boosted";
import PodiumRashid from "./PodiumRashid";
import PodiumStep from "./PodiumStep";

// "Hoje no Tibia" no topo da página, em cima da arte do cabeçalho: pódio com o boss boostado no meio (1º), a creature
// boostada à esquerda e o Rashid à direita, com as animações do próprio tibia.com.

export default async function TodayPodium() {
  const { creature, boss } = await getBoosted();
  return (
    <section className="tc-podium" aria-label="Hoje no Tibia">
      <div className="tc-podium-title">Hoje no Tibia</div>
      <div className="tc-podium-row">
        {creature && (
          <PodiumStep
            place="2"
            label="Creature boostada"
            name={creature.name}
            img={creature.image_url}
            href={getCreature(creature.name) ? creatureHref(creature.name) : "/ferramentas/bestiario"}
            height={46}
          />
        )}
        {boss && <PodiumStep place="1" label="Boss boostado" name={boss.name} img={boss.image_url} href="/ferramentas/bosstiary" height={62} />}
        <PodiumRashid />
      </div>
    </section>
  );
}
