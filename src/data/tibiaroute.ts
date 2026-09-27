// Página de rota no TibiaRoute para cada hunt do site (só o endereço: a rota fica no site deles). Conferido pelo sitemap e pelas
// creatures de cada página em 27/09/2026. Hunts sem página equivalente lá abrem a lista geral.

export const TIBIAROUTE: Record<string, { slug: string; label: string }[]> = {
  "lost-souls": [
    { slug: "Flimsy-Lost-Souls-Venore", label: "Knight (Grim Reaper e Flimsy)" },
    { slug: "Flimsy-Mean-Lost-Souls-Port-Hope", label: "Knight (Flimsy, Mean e Freakish)" },
    { slug: "Netherworld-MSED", label: "Netherworld: magos e paladin" },
  ],
  nimmersatt: [{ slug: "Nimmersatts-Breeding-Ground-4VOC", label: "todas as vocações" }],
  "azzilon-castle": [{ slug: "Azzilon-Walls", label: "Knight" }],
  iksupan: [
    { slug: "Iksupan-Last-Stand", label: "magos, paladin e monk" },
    { slug: "Iskupan-Occupied-Sanctuary-EDMS", label: "magos" },
  ],
  "jaded-roots": [{ slug: "Jaded-Roots-4VOC", label: "todas as vocações" }],
  "sparkling-pools": [{ slug: "Gnomprona-West", label: "todas as vocações" }],
  "podzilla-quaras": [{ slug: "Podzilla-Quara-EDMSRP", label: "magos e paladin" }],
  ingol: [{ slug: "Deeper-Ingol-4VOC", label: "todas as vocações" }],
  norcferatu: [{ slug: "Norcferatu-East", label: "druid, paladin e todas" }],
  "falcon-bastion": [{ slug: "Falcon-EK-ED", label: "duo EK + ED" }],
  "secret-library-fire": [{ slug: "Fire-Library-4VOC", label: "todas as vocações" }],
  "secret-library-ice": [{ slug: "Ice-Library-4VOC", label: "todas as vocações" }],
  "antrum-of-the-fallen": [{ slug: "Antrum-of-the-Fallen-WZ7", label: "magos, knight e paladin" }],
  "grotto-of-the-lost": [{ slug: "Warzone-8-EK", label: "Knight" }],
  "grounds-of-undeath": [{ slug: "Grounds-of-Undeath", label: "Paladin" }],
  "cobra-bastion": [
    { slug: "Cobra-Bastion-4VOC", label: "todas as vocações" },
    { slug: "Cobra-Bastion-1", label: "Knight (andar -1)" },
  ],
  "issavi-catacombs": [{ slug: "Sphinx-Issavi-ED-EK", label: "duo EK + ED" }],
  "issavi-sewers": [
    { slug: "Issavi-Sewers", label: "Knight" },
    { slug: "Issavi-Puzzle-Chambers-EKED", label: "Puzzle Chambers: duo EK + ED" },
  ],
  "upper-roshamuul": [
    { slug: "Upper-Roshamuul-EK", label: "Knight" },
    { slug: "Upper-Roshamuul-RP", label: "Paladin" },
  ],
};

export const tibiaRouteUrl = (slug: string) => `https://tibiaroute.com/br/hunting-places/${slug}`;
