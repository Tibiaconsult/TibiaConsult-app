import type { Metadata } from "next";
import Link from "next/link";
import { MedievalSharp } from "next/font/google";
import "./globals.css";

const medieval = MedievalSharp({ weight: "400", subsets: ["latin"], variable: "--font-medieval" });

export const metadata: Metadata = {
  title: "TibiaConsult",
  description: "Referência do Master Sorcerer: cooldowns, rotações, gemas, equipamento e hunts.",
};

const NAV = [
  { href: "/", label: "Início" },
  { href: "/cooldowns", label: "Cooldowns" },
  { href: "/rotacoes", label: "Rotações" },
  { href: "/simulador", label: "Simulador" },
  { href: "/gemas", label: "Gemas" },
  { href: "/equipamento", label: "Equipamento" },
  { href: "/hunts", label: "Hunts" },
  { href: "/meus-chars", label: "Meus chars" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${medieval.variable} h-full antialiased`}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="tc-header sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="tc-logo">
              TibiaConsult
            </Link>
            <nav className="tc-menu flex flex-wrap gap-2">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <span className="ml-auto text-[11px] on-dark opacity-80">Master Sorcerer · dados de 26/09/2026</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 flex-1">{children}</main>
        <footer className="text-[11px] on-dark opacity-75 px-4 py-4 text-center">
          Tibia e todo o seu conteúdo são de propriedade da CipSoft GmbH. Este site é uma ferramenta de fãs, sem vínculo com a CipSoft.
          Dados conferidos na TibiaWiki e no tibia.com.
        </footer>
      </body>
    </html>
  );
}
