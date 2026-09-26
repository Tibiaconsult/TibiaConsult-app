// Menu principal, organizado pelo que o jogador quer fazer. Também alimenta a busca rápida do topo.

export interface MenuItem {
  href: string;
  label: string;
  /** palavras extras para a busca */
  keywords?: string;
}
export interface MenuGroup {
  id: string;
  label: string;
  icon: string;
  items: MenuItem[];
}

export const MENU: MenuGroup[] = [
  {
    id: "inicio",
    label: "Início",
    icon: "news",
    items: [
      { href: "/", label: "Bem-vindo", keywords: "home inicio boosted rashid" },
      { href: "/novidades", label: "Novidades", keywords: "noticias atualizacoes" },
      { href: "/feedback", label: "Reportar ou sugerir", keywords: "bug erro sugestao feedback" },
    ],
  },
  {
    id: "meuchar",
    label: "Meu char",
    icon: "account",
    items: [
      { href: "/minha-area", label: "Minha área", keywords: "perfil painel meu char" },
      { href: "/meus-chars", label: "Meus chars", keywords: "cadastrar personagem" },
      { href: "/entrar", label: "Entrar", keywords: "login conta cadastro" },
    ],
  },
  {
    id: "vocacoes",
    label: "Vocações",
    icon: "community",
    items: [
      { href: "/vocacoes", label: "Todas" },
      { href: "/vocacoes/sorcerer", label: "Master Sorcerer", keywords: "sorc ms mage" },
      { href: "/vocacoes/druid", label: "Elder Druid", keywords: "ed druid" },
      { href: "/vocacoes/knight", label: "Elite Knight", keywords: "ek knight" },
      { href: "/vocacoes/paladin", label: "Royal Paladin", keywords: "rp paladin pala" },
      { href: "/vocacoes/monk", label: "Exalted Monk", keywords: "monk em" },
    ],
  },
  {
    id: "montar",
    label: "Montar",
    icon: "abouttibia",
    items: [
      { href: "/simulador/set", label: "Set", keywords: "montador equipamento inventario itens" },
      { href: "/planejador/wheel", label: "Wheel of Destiny", keywords: "roda de habilidade wheel wod pontos" },
      { href: "/rotacoes", label: "Rotações e combos", keywords: "combo rotacao sequencia magias" },
      { href: "/planejador/proficiencia", label: "Proficiência e catalisadores", keywords: "proficiency perks catalyst catalisador dust po evolucao arma" },
    ],
  },
  {
    id: "cacar",
    label: "Caçar",
    icon: "charactertrade",
    items: [
      { href: "/hunts", label: "Hunts", keywords: "fichas de hunt respawn cacar party" },
      { href: "/ferramentas/bestiario", label: "Bestiary Tracker", keywords: "bestiario charm criaturas" },
      { href: "/ferramentas/imbuements", label: "Imbuements", keywords: "imbuir materiais lista de compras" },
      { href: "/ferramentas/loot", label: "Divisão de loot", keywords: "party hunt analyser split transferencia" },
    ],
  },
  {
    id: "calcular",
    label: "Calcular",
    icon: "gameguides",
    items: [
      { href: "/simulador", label: "Dano e DPS (sorcerer)", keywords: "simulador dano dps" },
      { href: "/simulador/forja", label: "Forja", keywords: "tier fusao convergencia exaltation" },
      { href: "/simulador/gemas", label: "Gemas: custo", keywords: "sage gem grade fragmentos" },
      { href: "/simulador/mana", label: "Magic Shield e mana", keywords: "utamo sustain potion" },
      { href: "/ferramentas/calculadoras", label: "Exp, exercise, stamina e bless", keywords: "calculadora experiencia exercise weapons stamina blessing treino" },
    ],
  },
  {
    id: "consultar",
    label: "Consultar",
    icon: "library",
    items: [
      { href: "/cooldowns", label: "Cooldowns", keywords: "magias spells tempo grupo" },
      { href: "/gemas", label: "Gemas", keywords: "mods supremos basicos sage gem" },
      { href: "/equipamento", label: "Equipamento", keywords: "itens por slot armas" },
    ],
  },
  {
    id: "comunidade",
    label: "Comunidade",
    icon: "forum",
    items: [
      { href: "/comunidade/mural", label: "Caixão e Vela Preta", keywords: "mortes mural deaths" },
      { href: "/comunidade/ranking", label: "Ranking de XP", keywords: "experiencia ranking xp" },
    ],
  },
];
