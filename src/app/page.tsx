import Link from "next/link";
import { MECHANICS } from "@/data/spells";

const CARDS = [
  { href: "/cooldowns", title: "Cooldowns", text: "Todos os feitiços e runas ofensivas com mana, base, cooldown individual e grupo secundário." },
  { href: "/rotacoes", title: "Rotações", text: "Combos prontos por elemento e um montador que acusa conflito de cooldown na hora." },
  { href: "/gemas", title: "Gemas", text: "Mods básicos e supremos da Sage Gem, regras de slot, mapa dos domínios e combinações." },
  { href: "/equipamento", title: "Equipamento", text: "Melhores itens por slot, perk da forja, imbuements e sets por elemento." },
  { href: "/hunts", title: "Hunts", text: "Fichas de spawn: o que os bichos tomam e causam, set e rotação." },
];

export default function Home() {
  return (
    <div>
      <h1>Master Sorcerer, level 800+</h1>
      <p className="text-zinc-300 max-w-3xl">
        Referência viva do sorcerer depois do Vocation Adjustments de junho de 2026 e do Summer Update de julho de 2026.
        Cada número aqui foi lido na TibiaWiki ou no tibia.com na data indicada no rodapé.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="card hover:border-amber-400/60 transition">
            <div className="font-semibold text-amber-100">{c.title}</div>
            <p className="text-sm text-zinc-400 mt-1">{c.text}</p>
          </Link>
        ))}
      </div>
      <h2>Regras que mandam no combo</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
        {MECHANICS.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
