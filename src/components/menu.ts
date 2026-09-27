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
      { href: "/tibia/calendario", label: "Calendário do Tibia", keywords: "eventos double xp rapid respawn halloween natal evento calendario" },
      { href: "/tibia/noticias", label: "Notícias do Tibia", keywords: "news noticias tibia.com anuncio atualizacao" },
      { href: "/novidades", label: "Novidades do site", keywords: "atualizacoes changelog site" },
      { href: "/instalar", label: "Instalar o app", keywords: "app instalar celular pc windows barra de tarefas fixar tela inicial iphone android" },
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
    label: "Hunt",
    icon: "charactertrade",
    items: [
      { href: "/hunts", label: "Fichas de hunt", keywords: "hunts fichas de hunt respawn cacar cacada party" },
      { href: "/hunts/preparar", label: "Preparar para a hunt", keywords: "preparar set imbuements combo charm sair para cacar" },
      { href: "/hunts/analyser", label: "Hunt Analyser da guild", keywords: "xp/h lucro por hora profit ranking hunts analyser sessao" },
      { href: "/mapa", label: "Mapa do Tibia", keywords: "mapa minimap map andar coordenada rota caminho tibiamaps" },
      { href: "/criaturas", label: "Creatures", keywords: "criatura creature bicho monstro loot drop resistencia fraqueza bestiario" },
      { href: "/ferramentas/bestiario", label: "Bestiary Tracker", keywords: "bestiario charm criaturas creatures" },
      { href: "/ferramentas/charms", label: "Charms", keywords: "charm planner pontos echoes zap enflame low blow dodge" },
      { href: "/ferramentas/bosstiary", label: "Bosstiary Tracker", keywords: "boss bosses bosstiary boss points loot slot prowess mastery" },
      { href: "/ferramentas/imbuements", label: "Imbuements", keywords: "imbuir materiais lista de compras" },
    ],
  },
  {
    id: "calcular",
    label: "Calculadoras",
    icon: "gameguides",
    items: [
      { href: "/simulador", label: "Dano e DPS", keywords: "simulador dano dps rotacao calibrar druid knight paladin sorcerer" },
      { href: "/simulador/forja", label: "Forja", keywords: "tier fusao convergencia exaltation" },
      { href: "/simulador/gemas", label: "Gemas: custo", keywords: "sage gem grade fragmentos" },
      { href: "/simulador/mana", label: "Magic Shield e mana", keywords: "utamo sustain potion" },
      {
        href: "/ferramentas/calculadoras",
        label: "Exp, exercise, stamina e bless",
        keywords: "calculadora experiencia exercise weapons stamina blessing treino",
      },
      { href: "/ferramentas/loot", label: "LootSplit ⭐", keywords: "divisao de loot party hunt analyser split transferencia" },
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
      { href: "/comunidade/taverna", label: "Taverna", keywords: "caixao e vela preta mortes mural deaths f level up rede social mortes fofoca rashid henricus comentarios humor" },
      { href: "/comunidade/ranking", label: "Ranking de XP", keywords: "experiencia ranking xp" },
      { href: "/comunidade/funcionario-do-mes", label: "Funcionário do Mês", keywords: "tempo online horas guildstats ranking online viciado" },
    ],
  },
];
