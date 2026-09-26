import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { MedievalSharp } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import RightColumn from "@/components/RightColumn";
import FeedbackButton from "@/components/FeedbackButton";
import ActiveBar from "@/components/ActiveBar";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const medieval = MedievalSharp({ weight: "400", subsets: ["latin"], variable: "--font-medieval" });

export const metadata: Metadata = {
  title: { default: "TibiaConsult", template: "%s · TibiaConsult" },
  description: "Referência e simuladores de Tibia para Sorcerer, Druid, Knight, Paladin e Monk: cooldowns, rotações, dano, set, forja, gemas, hunts e divisão de loot.",
  applicationName: "TibiaConsult",
  appleWebApp: { capable: true, title: "TibiaConsult", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0d3b1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${medieval.variable} h-full antialiased`}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="min-h-full">
        <div className="tc-page">
          <Sidebar />
          <main className="tc-content">
            <ActiveBar />
            {children}
          </main>
          <RightColumn />
        </div>
        <FeedbackButton />
        <MobileNav />
        <footer className="tc-footer on-dark">
          Tibia e todo o seu conteúdo são de propriedade da CipSoft GmbH. Este site é uma ferramenta de fãs, sem vínculo com a CipSoft. Dados
          conferidos na TibiaWiki e no tibia.com. Plataforma beta, em desenvolvimento. <Link href="/termos">Termos de uso e privacidade</Link>.
        </footer>
      </body>
    </html>
  );
}
