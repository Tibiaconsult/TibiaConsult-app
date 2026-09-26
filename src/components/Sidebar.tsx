"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TIBIA } from "@/lib/icons";
import LoginBox from "./LoginBox";

export interface MenuGroup {
  id: string;
  label: string;
  icon: string;
  items: { href: string; label: string }[];
}

export const MENU: MenuGroup[] = [
  {
    id: "noticias",
    label: "Notícias",
    icon: "news",
    items: [
      { href: "/", label: "Bem-vindo" },
      { href: "/novidades", label: "Novidades" },
      { href: "/feedback", label: "Reportar ou sugerir" },
    ],
  },
  {
    id: "vocacoes",
    label: "Vocações",
    icon: "community",
    items: [
      { href: "/vocacoes", label: "Todas" },
      { href: "/vocacoes/druid", label: "Elder Druid" },
      { href: "/vocacoes/knight", label: "Elite Knight" },
      { href: "/vocacoes/paladin", label: "Royal Paladin" },
    ],
  },
  {
    id: "biblioteca",
    label: "Biblioteca",
    icon: "library",
    items: [
      { href: "/cooldowns", label: "Cooldowns do sorc" },
      { href: "/gemas", label: "Gemas do sorc" },
      { href: "/equipamento", label: "Equipamento do sorc" },
      { href: "/hunts", label: "Hunts" },
    ],
  },
  {
    id: "simuladores",
    label: "Simuladores",
    icon: "gameguides",
    items: [
      { href: "/simulador", label: "Dano e DPS" },
      { href: "/simulador/set", label: "Set" },
      { href: "/simulador/forja", label: "Forja" },
      { href: "/simulador/gemas", label: "Gemas: custo" },
      { href: "/simulador/mana", label: "Magic Shield e mana" },
    ],
  },
  {
    id: "planejadores",
    label: "Planejadores",
    icon: "abouttibia",
    items: [
      { href: "/rotacoes", label: "Rotações" },
      { href: "/planejador/wheel", label: "Wheel of Destiny" },
      { href: "/planejador/proficiencia", label: "Proficiência" },
    ],
  },
  {
    id: "ferramentas",
    label: "Ferramentas",
    icon: "charactertrade",
    items: [
      { href: "/ferramentas/loot", label: "Divisão de loot" },
      { href: "/ferramentas/bestiario", label: "Bestiary Tracker" },
    ],
  },
  {
    id: "conta",
    label: "Conta",
    icon: "account",
    items: [
      { href: "/entrar", label: "Entrar" },
      { href: "/minha-area", label: "Minha área" },
      { href: "/meus-chars", label: "Meus chars" },
    ],
  },
];

function groupOf(path: string): string {
  let best = "noticias";
  let len = -1;
  for (const g of MENU)
    for (const i of g.items) {
      const match = i.href === "/" ? path === "/" : path === i.href || path.startsWith(i.href + "/");
      if (match && i.href.length > len) {
        best = g.id;
        len = i.href.length;
      }
    }
  return best;
}

export default function Sidebar() {
  const path = usePathname() ?? "/";
  // O estado manual vale só para a página em que foi escolhido; ao navegar, volta ao grupo da página.
  const [manual, setManual] = useState<{ path: string; open: string; mobile: boolean }>({ path: "", open: "", mobile: false });
  const open = manual.path === path ? manual.open : groupOf(path);
  const mobileOpen = manual.path === path ? manual.mobile : false;
  const setOpen = (g: string) => setManual({ path, open: g, mobile: mobileOpen });
  const setMobileOpen = (fn: (v: boolean) => boolean) => setManual({ path, open, mobile: fn(mobileOpen) });

  const isActive = (href: string) => (href === "/" ? path === "/" : path === href);

  return (
    <aside className="tc-sidebar">
      <Link href="/" className="tc-side-logo">
        <span>TibiaConsult</span>
        <small>Consultoria de Tibia</small>
      </Link>

      <LoginBox />

      <button className="tc-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen}>
        {mobileOpen ? "Fechar menu" : "Menu"}
      </button>

      <nav className={`tc-side-menu ${mobileOpen ? "is-open" : ""}`} aria-label="Menu principal">
        {MENU.map((g) => (
          <div key={g.id} className="tc-menu-group">
            <button
              className={`tc-menu-button ${open === g.id ? "is-open" : ""}`}
              style={{ backgroundImage: `url(${TIBIA.menuButton})` }}
              onClick={() => setOpen(open === g.id ? "" : g.id)}
              aria-expanded={open === g.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={TIBIA.menuIcon(g.icon)} alt="" width={32} height={32} />
              <span>{g.label}</span>
              <b>{open === g.id ? "−" : "+"}</b>
            </button>
            {open === g.id && (
              <ul className="tc-submenu">
                {g.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className={isActive(i.href) ? "is-active" : ""}>
                      {isActive(i.href) && <span className="tc-arrow">›</span>}
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
