import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tibia Consult",
  description: "Referência do Master Sorcerer: cooldowns, rotações, gemas, equipamento e hunts.",
};

const NAV = [
  { href: "/", label: "Início" },
  { href: "/cooldowns", label: "Cooldowns" },
  { href: "/rotacoes", label: "Rotações" },
  { href: "/gemas", label: "Gemas" },
  { href: "/equipamento", label: "Equipamento" },
  { href: "/hunts", label: "Hunts" },
  { href: "/meus-chars", label: "Meus chars" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="font-semibold tracking-wide text-amber-300">
              Tibia Consult
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-300">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-amber-200">
                  {n.label}
                </Link>
              ))}
            </nav>
            <span className="ml-auto text-xs text-zinc-500">Master Sorcerer · dados de 26/09/2026</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 flex-1">{children}</main>
        <footer className="border-t border-zinc-800 text-xs text-zinc-500 px-4 py-4 text-center">
          Tibia e todo o seu conteúdo são de propriedade da CipSoft GmbH. Dados conferidos na TibiaWiki e no tibia.com.
        </footer>
      </body>
    </html>
  );
}
