import Link from "next/link";
import Box from "@/components/Box";
import { MECHANICS } from "@/data/spells";

const CARDS = [
  { href: "/cooldowns", title: "Cooldowns", text: "Todos os feitiços e runas ofensivas com mana, base, cooldown individual e grupo secundário." },
  { href: "/rotacoes", title: "Rotações", text: "Combos prontos por elemento e um montador que acusa conflito de cooldown na hora." },
  { href: "/gemas", title: "Gemas", text: "Mods básicos e supremos da Sage Gem, regras de slot, mapa dos domínios e combinações." },
  { href: "/equipamento", title: "Equipamento", text: "Melhores itens por slot, perk da forja, imbuements e sets por elemento." },
  { href: "/hunts", title: "Hunts", text: "Fichas de spawn: o que os bichos tomam e causam, set e rotação." },
  { href: "/meus-chars", title: "Meus chars", text: "Cadastre seus chars com set, Wheel, gemas e hunts. Só você vê os seus." },
];

export default function Home() {
  return (
    <div>
      <h1>Master Sorcerer, level 800+</h1>
      <Box title="Bem-vindo">
        <p>
          Referência do sorcerer depois do Vocation Adjustments de junho de 2026 e do Summer Update de julho de 2026. Cada número
          aqui foi lido na TibiaWiki ou no tibia.com na data indicada no rodapé.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="block border border-[#b98a5a] rounded p-3 bg-white/40 hover:bg-white/70 no-underline">
              <div className="font-bold text-[#3a1a00] text-[14px]">{c.title}</div>
              <p className="text-[12px] mt-1">{c.text}</p>
            </Link>
          ))}
        </div>
      </Box>
      <Box title="Regras que mandam no combo">
        <ul className="list-disc pl-5 space-y-1">
          {MECHANICS.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </Box>
    </div>
  );
}
