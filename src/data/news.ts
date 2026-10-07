export interface NewsEntry {
  date: string; // AAAA-MM-DD
  title: string;
  body: string[];
  href?: string;
}

export const TICKER: { date: string; text: string; href?: string }[] = [
  { date: "2026-10-06", text: "Patch de 06/10: Echo Wardens voltam a nascer com 4 creatures normais, dão 20% de dano extra (era 50%) e dropam 50 dust (eram 15); echo raids voltaram na Mirrored Nightmare; Swift Foot com cooldown de 4 s; taxa do Market agora 2,5% (teto 2,5kk).", href: "/hunts?h=mirrored-nightmare" },
  { date: "2026-10-06", text: "Exercise weapons 25% mais caras no NPC desde a server save de 06/10: regular 434.028, durable 1.562.500, lasting 12.500.000. A calculadora já usa o preço novo; em Tibia Coins não mudou.", href: "/ferramentas/calculadoras" },
  { date: "2026-10-03", text: "Exaltation Overload até a server save de 05/10: Ruse 4% e Transcendence 1,5% para todos, fiendish em dobro e +50% de XP por stack de sinister embrace. Está no calendário.", href: "/tibia/calendario" },
  { date: "2026-10-03", text: "Annual Autumn Vintage de 01/10 a 08/10 e de 17/10 a 24/10: se o mundo completar, health e mana potions ficam 33% mais fortes por 7 dias.", href: "/tibia/calendario" },
  { date: "2026-09-30", text: "Hunts novas: Outer Crypt (700+), Ferumbras Way, Deep Desert (Skeletons Darashia), Raubritter Mines e Lost Souls de Port Hope. A busca acha as hunts pelo nome que a guild usa (Pumin Seal, Fire Library, Ingol -3...).", href: "/hunts" },
  { date: "2026-09-27", text: "Rotas dos jogadores: desenhe no mapa o caminho que você faz numa hunt e ajude outros jogadores a caçar melhor. As mais úteis recebem 👍.", href: "/hunts" },
  { date: "2026-09-27", text: "Mapa com o respawn: cada creature no lugar em que nasce, com a quantidade, e o total da área na ficha da hunt.", href: "/mapa" },
  { date: "2026-09-27", text: "Ficha da hunt com supplies por vocação e level, drops que pagam a hunt e link direto para a rota no TibiaRoute.", href: "/hunts" },
  { date: "2026-09-27", text: "Mapa do Tibia completo, andar por andar, com os marcadores da comunidade e o 📍 de cada hunt.", href: "/mapa" },
  { date: "2026-09-27", text: "Hunt Analyser da guild: cole o do jogo e veja o XP/h e o lucro/h reais da turma em cada hunt.", href: "/hunts/analyser" },
  { date: "2026-09-27", text: "Avisos no celular: boss liberado, stamina cheia, boosted que falta no seu bestiary e XP em dobro.", href: "/notificacoes" },
  { date: "2026-09-27", text: "Bestiary Tracker com 📌 sem limite, as creatures que mais rendem charm e aviso quando uma delas é a boosted.", href: "/ferramentas/bestiario" },
  { date: "2026-09-27", text: "Taverna nova: mortes e level ups da guild no mesmo lugar, com o Caixão e Vela Preta e o pódio do mês.", href: "/comunidade/taverna" },
  { date: "2026-09-27", text: "Lista de creatures com HP, fraquezas, loot e onde caçar cada uma.", href: "/criaturas" },
  { date: "2026-09-26", text: "Gemas nos vessels da roda: escolha pequena, média ou grande e os mods pelos ícones do jogo, com sugestão.", href: "/planejador/wheel" },
  { date: "2026-09-26", text: "Botão de sair da conta na barra lateral e na barra do topo.", href: "/minha-area" },
  { date: "2026-09-26", text: "Proficiência de arma das cinco vocações: árvore de cada arma com os ícones do jogo, perk sugerido, catalisadores e a evolução com Dust.", href: "/planejador/proficiencia" },
  { date: "2026-09-26", text: "Gemas por vocação: as gemas de cada uma, mods com ícones oficiais, graus I a IV, custos de fragmento e sugestão do TibiaPal.", href: "/gemas" },
  { date: "2026-09-26", text: "Mais 16 hunts: Warzones 7 a 9 (Too Hot to Handle), os sete Grounds de Ferumbras, Cobra Bastion, Issavi e Upper Roshamuul.", href: "/hunts" },
  { date: "2026-09-26", text: "19 hunts de level alto: as 5 áreas do Soul War, Gnomprona, Rotten Blood, Radiant Ascendancy e Skyhold, Forsaken e Unhallowed Crypt, Bloodfire Gorge, Bulltaurs e as alas da Secret Library.", href: "/hunts" },
  { date: "2026-09-26", text: "Barra no topo: escolha a vocação (e o seu char) uma vez e o site todo abre nela. Busca rápida por hunt, magia, item e creature.", href: "/minha-area" },
  { date: "2026-09-26", text: "Salvar no char: roda, set e combo ficam guardados e abrem com um clique na Minha área.", href: "/minha-area" },
  { date: "2026-09-26", text: "Cooldowns, gemas, equipamento e combos para as cinco vocações.", href: "/cooldowns" },
  { date: "2026-09-26", text: "Montador de set para todas as vocações, com sprites animados, forja e imbuements.", href: "/simulador/set" },
  { date: "2026-09-26", text: "Wheel of Destiny desenhada como no tibia.com.", href: "/planejador/wheel" },
  { date: "2026-09-26", text: "Imbuements com os materiais de cada nível e lista de compras somada.", href: "/ferramentas/imbuements" },
  { date: "2026-09-26", text: "Hoje no Tibia: creature e boss boostados e a cidade do Rashid.", href: "/" },
  { date: "2026-09-26", text: "Fichas de hunt com set sugerido para druid, knight, paladin e monk.", href: "/hunts" },
  { date: "2026-09-26", text: "Exalted Monk e equipamento por slot para as quatro vocações.", href: "/vocacoes/monk" },
  { date: "2026-09-26", text: "Minha área: sugestões de hunt, marcos da Wheel e bestiário de cada char seu.", href: "/minha-area" },
  { date: "2026-09-26", text: "Calculadoras de experiência, stamina offline e blessings.", href: "/ferramentas/calculadoras" },
  { date: "2026-09-26", text: "Bestiary Tracker: as 833 creatures, com charm points e progresso salvo por char.", href: "/ferramentas/bestiario" },
  { date: "2026-09-26", text: "Elder Druid, Elite Knight e Royal Paladin: magias, Wheel, gemas, armas e simulador com rotação automática.", href: "/vocacoes" },
  { date: "2026-09-26", text: "Hunts novas: Ingol (surface e subsolo), Norcferatu e Falcon Bastion.", href: "/hunts" },
  { date: "2026-09-26", text: "LootSplit a partir do Party Hunt Analyser, com os comandos de transferência prontos.", href: "/ferramentas/loot" },
  { date: "2026-09-26", text: "Novo layout no estilo do tibia.com, com menu lateral e ícones de itens e feitiços.", href: "/" },
  { date: "2026-09-26", text: "Simuladores novos: set com comparador, forja, custo de gemas e Magic Shield com mana.", href: "/simulador/set" },
  { date: "2026-09-26", text: "Planejadores de Wheel of Destiny e de proficiência da wand ligados ao simulador de dano.", href: "/planejador/wheel" },
  { date: "2026-09-26", text: "Confirmado no jogo: Rage of the Skies e Hell's Core são convertidos pela stance elemental.", href: "/rotacoes" },
  { date: "2026-09-26", text: "Simulador de dano por hunt inteira, com ranking de elemento e DPS das rotações.", href: "/simulador" },
];

export const NEWS: NewsEntry[] = [
  {
    date: "2026-09-27",
    title: "Mapa, respawn e rotas dos jogadores",
    body: [
      "O site ganhou o mapa completo do Tibia, andar por andar, e cada ficha de hunt abre direto nele: com o respawn desenhado (cada creature no lugar em que nasce e quantas são), o total da área e os links para a rota no TibiaRoute quando existe.",
      "E agora você pode ajudar outros jogadores: conhece bem uma hunt? No mapa da ficha, clique em Desenhar a minha rota, marque o caminho que você faz (trocando de andar com as setas), escreva as dicas e publique. Quem vier depois vê a sua rota, e as que mais ajudam recebem 👍 e sobem para o topo.",
      "A ficha também mostra os supplies para a sua vocação e level e os drops que pagam a hunt, calculados pelo loot e pelo respawn de cada creature.",
    ],
    href: "/hunts",
  },
  {
    date: "2026-09-27",
    title: "O site agora lembra você do que importa",
    body: [
      "Ligue os avisos no celular e o TibiaConsult avisa quando o boss que você matou libera de novo, quando a stamina enche, quando a boosted do dia é uma creature que falta no seu bestiary e quando começa XP em dobro.",
      "Depois da hunt, cole o Hunt Analyser do jogo no Hunt Analyser da guild: o site guarda o XP/h e o lucro/h por hunt e monta o ranking com os números reais da turma.",
      "Na Taverna, mortes e level ups da guild ficam no mesmo lugar, com o Caixão e Vela Preta e o pódio do mês.",
    ],
    href: "/notificacoes",
  },
  {
    date: "2026-09-26",
    title: "Chegaram Druid, Knight e Paladin",
    body: [
      "Agora o site cobre quatro vocações. Cada uma tem página própria com as stances de junho de 2026, todas as magias de ataque com base, cooldown e grupo, a Wheel of Destiny, os mods supremos de gema e as armas de ponta.",
      "O simulador dessas vocações monta a rotação sozinho: a cada 2 segundos ele usa a magia pronta que dá mais dano, contra a hunt e o número de creatures que você escolher. Knight e paladin usam skill e ataque da arma; calibre com um hit real para acertar o seu char.",
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
