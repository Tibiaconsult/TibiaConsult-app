import Link from "next/link";
import { cookies } from "next/headers";
import Box from "@/components/Box";
import Boosted from "@/components/Boosted";
import Rashid from "@/components/Rashid";
import { NEWS, TICKER, formatDate } from "@/data/news";
import { TIBIA } from "@/lib/icons";
import type { Voc } from "@/lib/active";
import { ALL_VOCS } from "@/components/voc-list";
import HomePanel from "./HomePanel";

export default async function Home() {
  // vocação guardada no cookie: o painel já abre nela, sem piscar a escolha de vocação
  const saved = (await cookies()).get("tc-voc")?.value;
  const initialVoc = ALL_VOCS.some(([id]) => id === saved) ? (saved as Voc) : null;
  return (
    <div>
      <HomePanel initialVoc={initialVoc} />
      <Box title="Hoje no Tibia">
        <div className="flex flex-wrap gap-6 items-center">
          <Boosted />
          <Rashid />
        </div>
      </Box>
      <Box title="Novidades rápidas">
        <ul className="tc-ticker">
          {TICKER.slice(0, 8).map((t, i) => (
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
        {NEWS.slice(0, 3).map((n, i) => (
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
        <Link href="/novidades" className="tc-btn">
          Todas as novidades
        </Link>
      </Box>

    </div>
  );
}
