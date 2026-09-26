import Link from "next/link";
import Box from "@/components/Box";
import { TICKER, formatDate } from "@/data/news";

export const metadata = { title: "Novidades" };

export default function NovidadesPage() {
  return (
    <div>
      <h1>Novidades</h1>
      <Box title="Histórico de mudanças">
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
    </div>
  );
}
