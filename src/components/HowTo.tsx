import Link from "next/link";
import Box from "@/components/Box";

// Guia rápido da tela inicial: como tirar proveito do site, em passos e por aba do menu.

const STEPS: [string, React.ReactNode][] = [
  [
    "🧙",
    <>
      Escolha a <b>vocação</b> na barra do topo: o site inteiro passa a abrir nela.
    </>,
  ],
  [
    "👤",
    <>
      <Link href="/entrar?modo=criar&next=/meus-chars">Crie a conta</Link> e cadastre seu char em <Link href="/meus-chars">Meus chars</Link>: level, magic level
      e skill entram sozinhos em todas as contas. Um clique libera o char na comunidade.
    </>,
  ],
  [
    "🎒",
    <>
      <b>Antes de caçar:</b> abra a hunt em <Link href="/hunts">Fichas de hunt</Link> e clique em <b>Preparar para esta hunt</b>: set, imbuements, charm e combo
      já montados para aquelas creatures. No mapa da ficha você vê o respawn e as rotas de outros jogadores.
    </>,
  ],
  [
    "📋",
    <>
      <b>Depois de caçar:</b> cole o Hunt Analyser do jogo no <Link href="/hunts/analyser">Hunt Analyser da guild</Link> (ranking real de XP/h e lucro/h) e, em
      PT, o Party Hunt Analyser no <Link href="/ferramentas/loot">LootSplit</Link> (comandos de transferência prontos).
    </>,
  ],
  [
    "🔔",
    <>
      Ligue os <Link href="/notificacoes">avisos no celular</Link>: boss liberado, stamina verde, boosted que falta no seu bestiary, XP em dobro e quando zoarem
      a sua morte na Taverna.
    </>,
  ],
];

const TABS: [string, string, string][] = [
  ["Montar", "Set, Wheel, combos e proficiência: monte e teste antes de gastar gold no jogo.", "/simulador/set"],
  ["Hunt", "Fichas, mapa com respawn e rotas dos jogadores, preparar, creatures e loot, Bestiary sem limite de 📌, charms e bosstiary.", "/hunts"],
  ["Calculadoras", "Dano e DPS por rotação, forja, gemas, mana, exp, exercise, stamina, bless e LootSplit.", "/simulador"],
  ["Consultar", "Cooldowns, gemas e equipamento por vocação, para tirar dúvida rápida.", "/cooldowns"],
  ["Comunidade", "Taverna (as mortes da guild zoadas pelos NPCs), ranking de XP e Funcionário do Mês.", "/comunidade/taverna"],
];

export default function HowTo() {
  return (
    <Box title="🧭 Como tirar proveito do site em 5 minutos">
      <p className="text-[12px] mb-2">
        O TibiaConsult não repete o jogo: ele faz as contas, junta o que está espalhado e lembra você do que importa. O caminho mais curto:
      </p>
      <ol className="space-y-1.5 mb-3">
        {STEPS.map(([icon, text], i) => (
          <li key={i} className="flex gap-2 items-start text-[12px]">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#5a3a1a] text-[#f3d27a] font-bold text-center leading-6 text-[11px]">{i + 1}</span>
            <span>
              {icon} {text}
            </span>
          </li>
        ))}
      </ol>
      <div className="rounded p-2 mb-3 text-[12px]" style={{ background: "#fff3d1", border: "1px solid #d9a441" }}>
        🧭 <b>Novo: rotas dos jogadores.</b> Conhece bem uma hunt? Desenhe no mapa o caminho que você faz e ajude outros jogadores a caçar melhor. É só abrir a
        hunt em <Link href="/hunts">Fichas de hunt</Link> e, no mapa, clicar em <b>✏️ Desenhar a minha rota</b>. As rotas que mais ajudam recebem 👍 e sobem
        para o topo.
      </div>
      <div className="font-bold text-[12px] mb-1">O que cada aba do menu resolve</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TABS.map(([name, text, href]) => (
          <Link key={name} href={href} className="block border border-[#b98a5a] rounded p-2 bg-white/40 hover:bg-white/70 !no-underline text-[#3a1a00]">
            <b className="text-[13px]">{name}</b>
            <div className="text-[11px]">{text}</div>
          </Link>
        ))}
      </div>
    </Box>
  );
}
