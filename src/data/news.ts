export interface NewsEntry {
  date: string; // AAAA-MM-DD
  title: string;
  body: string[];
  href?: string;
}

export const TICKER: { date: string; text: string; href?: string }[] = [
  { date: "2026-09-26", text: "19 hunts de level alto: as 5 áreas do Soul War, Gnomprona, Rotten Blood, Radiant Ascendancy e Skyhold, Forsaken e Unhallowed Crypt, Bloodfire Gorge, Bulltaurs e as alas da Secret Library.", href: "/hunts" },
  { date: "2026-09-26", text: "Barra no topo: escolha a vocação (e o seu char) uma vez e o site todo abre nela. Busca rápida por hunt, magia, item e criatura.", href: "/minha-area" },
  { date: "2026-09-26", text: "Salvar no char: roda, set e combo ficam guardados e abrem com um clique na Minha área.", href: "/minha-area" },
  { date: "2026-09-26", text: "Cooldowns, gemas, equipamento e combos para as cinco vocações.", href: "/cooldowns" },
  { date: "2026-09-26", text: "Montador de set para todas as vocações, com sprites animados, forja e imbuements.", href: "/simulador/set" },
  { date: "2026-09-26", text: "Wheel of Destiny desenhada como no tibia.com.", href: "/planejador/wheel" },
  { date: "2026-09-26", text: "Imbuements com os materiais de cada nível e lista de compras somada.", href: "/ferramentas/imbuements" },
  { date: "2026-09-26", text: "Hoje no Tibia: criatura e boss boostados e a cidade do Rashid.", href: "/" },
  { date: "2026-09-26", text: "Fichas de hunt com set sugerido para druid, knight, paladin e monk.", href: "/hunts" },
  { date: "2026-09-26", text: "Exalted Monk e equipamento por slot para as quatro vocações.", href: "/vocacoes/monk" },
  { date: "2026-09-26", text: "Minha área: sugestões de hunt, marcos da Wheel e bestiário de cada char seu.", href: "/minha-area" },
  { date: "2026-09-26", text: "Calculadoras de experiência, stamina offline e blessings.", href: "/ferramentas/calculadoras" },
  { date: "2026-09-26", text: "Bestiary Tracker: as 833 criaturas, com charm points e progresso salvo por char.", href: "/ferramentas/bestiario" },
  { date: "2026-09-26", text: "Elder Druid, Elite Knight e Royal Paladin: magias, Wheel, gemas, armas e simulador com rotação automática.", href: "/vocacoes" },
  { date: "2026-09-26", text: "Hunts novas: Ingol (surface e subsolo), Norcferatu e Falcon Bastion.", href: "/hunts" },
  { date: "2026-09-26", text: "Divisão de loot a partir do Party Hunt Analyser, com os comandos de transferência prontos.", href: "/ferramentas/loot" },
  { date: "2026-09-26", text: "Novo layout no estilo do tibia.com, com menu lateral e ícones de itens e feitiços.", href: "/" },
  { date: "2026-09-26", text: "Simuladores novos: set com comparador, forja, custo de gemas e Magic Shield com mana.", href: "/simulador/set" },
  { date: "2026-09-26", text: "Planejadores de Wheel of Destiny e de proficiência da wand ligados ao simulador de dano.", href: "/planejador/wheel" },
  { date: "2026-09-26", text: "Confirmado no jogo: Rage of the Skies e Hell's Core são convertidos pela stance elemental.", href: "/rotacoes" },
  { date: "2026-09-26", text: "Simulador de dano por hunt inteira, com ranking de elemento e DPS das rotações.", href: "/simulador" },
];

export const NEWS: NewsEntry[] = [
  {
    date: "2026-09-26",
    title: "Chegaram Druid, Knight e Paladin",
    body: [
      "Agora o site cobre quatro vocações. Cada uma tem página própria com as stances de junho de 2026, todas as magias de ataque com base, cooldown e grupo, a Wheel of Destiny, os mods supremos de gema e as armas de ponta.",
      "O simulador dessas vocações monta a rotação sozinho: a cada 2 segundos ele usa a magia pronta que dá mais dano, contra a hunt e o número de bichos que você escolher. Knight e paladin usam skill e ataque da arma; calibre com um hit real para acertar o seu char.",
      "Os números já seguem o patch de 07/07/2026, que mexeu em Blood Rage, Sharpshooter, Divine Caldera, Divine Barrage, Strong Ice Wave e nos Forked Spells.",
    ],
    href: "/vocacoes",
  },
  {
    date: "2026-09-26",
    title: "Bem-vindo ao TibiaConsult",
    body: [
      "Bem-vindo! Este é um consultor para o Master Sorcerer de level alto, feito por jogadores para os amigos. Tudo aqui foi montado a partir da TibiaWiki e do tibia.com, com a data de conferência de cada dado, e já considera o Vocation Adjustments de junho de 2026 e o Summer Update de julho de 2026.",
      "No menu da esquerda você encontra a Biblioteca, com cooldowns, gemas, equipamento e fichas de hunt; os Simuladores, com dano e DPS por hunt, set, forja, custo de gemas e Magic Shield; e os Planejadores de rotação, Wheel of Destiny e proficiência.",
      "Crie sua conta em Conta, Entrar, e cadastre seus chars. Com o char salvo, o set e a Wheel dele vão direto para o simulador de dano, sem digitar tudo de novo.",
    ],
  },
  {
    date: "2026-09-26",
    title: "Stances elementais: o elemento é você quem escolhe",
    body: [
      "Desde o rebalanceamento de junho, o sorcerer escolhe o elemento da rotação com Master of Flames, Master of Thunder ou Master of Decay. Cada feitiço do elemento da stance converte o próximo feitiço de outro elemento, inclusive Rage of the Skies e Hell's Core.",
      "O simulador de dano mostra, para cada hunt, qual elemento rende mais e qual rotação tem o maior DPS. Lembre de calibrar a fórmula com um hit real seu: o campo fica no próprio simulador.",
    ],
    href: "/simulador",
  },
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d} ${months[Number(m) - 1]} ${y}`;
}
