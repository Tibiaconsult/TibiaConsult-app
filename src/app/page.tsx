import Link from "next/link";
import Box from "@/components/Box";
import { NEWS, TICKER, formatDate } from "@/data/news";
import { TIBIA, itemIcon, spellIcon } from "@/lib/icons";

const FEATURES = [
  { href: "/simulador", title: "Dano e DPS por hunt", text: "Min, média e máximo de cada feitiço, ranking de elemento e DPS das rotações no lure da hunt.", icon: spellIcon("energy-wave") },
  { href: "/simulador/set", title: "Montador de set", text: "Equipe item por slot, com tier e imbuement, e compare dois sets lado a lado.", icon: itemIcon("Soulmantle") },
  { href: "/planejador/wheel", title: "Wheel of Destiny", text: "Revelations, augments e gemas; o efeito vai direto para o simulador.", icon: spellIcon("Avatar of Storm") },
  { href: "/simulador/forja", title: "Forja", text: "Custo esperado para chegar a cada tier, fusão normal ou convergência.", icon: itemIcon("Sanguine Coil") },
  { href: "/rotacoes", title: "Rotações", text: "Combos por elemento e um montador que acusa conflito de cooldown.", icon: spellIcon("hells-core") },
  { href: "/hunts", title: "Fichas de hunt", text: "Resistência de cada bicho, set, rotação e charms recomendados.", icon: itemIcon("Soulshanks") },
];

export default function Home() {
  return (
    <div>
      <Box title="Novidades rápidas">
        <ul className="tc-ticker">
          {TICKER.map((t, i) => (
            <li key={i}>
              <span className="font-bold whitespace-nowrap">{formatDate(t.date)}</span>
              <span>
                {t.text}{" "}
                {t.href && (
                  <Link href={t.href} className="font-bold">
                    abrir
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Box>

      <Box title="Notícias">
        {NEWS.map((n, i) => (
          <article key={i} className="tc-news-item">
            <div className="tc-news-headline">
              <small>{formatDate(n.date)}</small> · {n.title}
            </div>
            <div className="pt-3 px-1">
              {n.body.map((p, j) =>
                j === 0 ? (
                  <p key={j} className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={TIBIA.letter(p[0])} alt={p[0]} className="tc-dropcap" height={34} />
                    {p.slice(1)}
                  </p>
                ) : (
                  <p key={j} className="mb-2">
                    {p}
                  </p>
                ),
              )}
              {n.href && (
                <Link href={n.href} className="tc-btn mt-1">
                  Abrir
                </Link>
              )}
              <div className="clear-both" />
            </div>
          </article>
        ))}
      </Box>

      <Box title="Ferramentas">
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="flex gap-3 items-start border border-[#b98a5a] rounded p-3 bg-white/40 hover:bg-white/70 no-underline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {f.icon && <img src={f.icon} alt="" width={38} height={38} className="sprite shrink-0" />}
              <span>
                <span className="block font-bold text-[#3a1a00] text-[14px]">{f.title}</span>
                <span className="block text-[12px] mt-1">{f.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </Box>
    </div>
  );
}
