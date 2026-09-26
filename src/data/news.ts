export interface NewsEntry {
  date: string; // AAAA-MM-DD
  title: string;
  body: string[];
  href?: string;
}

export const TICKER: { date: string; text: string; href?: string }[] = [
  { date: "2026-09-26", text: "Novo layout no estilo do tibia.com, com menu lateral e ícones de itens e feitiços.", href: "/" },
  { date: "2026-09-26", text: "Simuladores novos: set com comparador, forja, custo de gemas e Magic Shield com mana.", href: "/simulador/set" },
  { date: "2026-09-26", text: "Planejadores de Wheel of Destiny e de proficiência da wand ligados ao simulador de dano.", href: "/planejador/wheel" },
  { date: "2026-09-26", text: "Confirmado no jogo: Rage of the Skies e Hell's Core são convertidos pela stance elemental.", href: "/rotacoes" },
  { date: "2026-09-26", text: "Simulador de dano por hunt inteira, com ranking de elemento e DPS das rotações.", href: "/simulador" },
];

export const NEWS: NewsEntry[] = [
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
