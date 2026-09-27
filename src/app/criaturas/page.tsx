import { ALL_CREATURES, bestiaryOf, huntsOf, weakness } from "@/lib/creatures";
import CreatureList, { Row } from "./CreatureList";

export const metadata = {
  title: "Creatures",
  description: "Creatures das hunts: sprite, HP, exp, fraquezas, bestiário, charm points e loot com a chance de cada item.",
};

export default function CriaturasPage() {
  const rows: Row[] = ALL_CREATURES.map((c) => {
    const b = bestiaryOf(c);
    const w = weakness(c);
    return {
      name: c.name,
      page: c.page,
      hp: c.hp ?? 0,
      exp: c.exp ?? 0,
      cls: c.cls,
      level: c.level,
      charms: b?.charms ?? null,
      kills: b?.kills[2] ?? null,
      weak: w && w.pct > 100 ? w : null,
      hunts: huntsOf(c.name).map((h) => ({ id: h.id, name: h.name })),
    };
  });
  return (
    <div>
      <h1>Creatures</h1>
      <p className="on-dark mb-4">
        As creatures das hunts do site, com sprite, vida, experiência, onde mais sofrem dano, quanto falta para o bestiário e o loot com a chance de cada item.
        Clique numa creature para ver a ficha completa.
      </p>
      <CreatureList rows={rows} />
    </div>
  );
}
