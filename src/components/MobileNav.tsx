"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VOC_OUTFIT_FILE, VOC_SHORT, useActive } from "@/lib/active";
import { TIBIA } from "@/lib/icons";
import { wikiImage } from "@/lib/md5";

/** Barra fixa no rodapé do celular com as seções mais usadas. */
export default function MobileNav() {
  const path = usePathname() ?? "/";
  const { voc } = useActive();
  const v = voc ?? "sorcerer";
  const items: [string, string, string, boolean][] = [
    ["/", "Início", TIBIA.menuIcon("news"), false],
    [`/vocacoes/${v}`, VOC_SHORT[v], wikiImage(VOC_OUTFIT_FILE[v]), true],
    ["/simulador/set", "Montar", TIBIA.menuIcon("abouttibia"), false],
    ["/hunts", "Hunts", TIBIA.menuIcon("charactertrade"), false],
    ["/minha-area", "Meu char", TIBIA.menuIcon("account"), false],
  ];
  return (
    <nav className="tc-mobilenav" aria-label="Atalhos">
      {items.map(([href, label, icon, outfit]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={label} href={href} className={active ? "is-active" : ""}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={icon}
              alt=""
              width={outfit ? 30 : 24}
              height={outfit ? 30 : 24}
              style={outfit ? { imageRendering: "pixelated", margin: "-3px 0" } : undefined}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
