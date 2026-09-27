"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TIBIA } from "@/lib/icons";
import { createClient } from "@/lib/supabase/client";
import LoginBox from "./LoginBox";
import { MENU, MenuGroup } from "./menu";

export { MENU } from "./menu";

// só aparece para contas de administrador (a página /admin confere de novo no servidor)
const ADMIN_GROUP: MenuGroup = {
  id: "admin",
  label: "Painel",
  icon: "support",
  items: [{ href: "/admin", label: "⚙️ Métricas e moderação" }],
};

function groupOf(path: string, menu: MenuGroup[]): string {
  let best = "inicio";
  let len = -1;
  for (const g of menu)
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
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const sb = createClient();
    const check = (logged: boolean) => (logged ? sb.rpc("is_admin").then(({ data }) => setIsAdmin(data === true)) : setIsAdmin(false));
    sb.auth.getSession().then(({ data }) => check(Boolean(data.session)));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => check(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);
  const menu = isAdmin ? [...MENU, ADMIN_GROUP] : MENU;
  // O estado manual vale só para a página em que foi escolhido; ao navegar, volta ao grupo da página.
  const [manual, setManual] = useState<{ path: string; open: string; mobile: boolean }>({ path: "", open: "", mobile: false });
  const open = manual.path === path ? manual.open : groupOf(path, menu);
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
        {menu.map((g) => (
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
