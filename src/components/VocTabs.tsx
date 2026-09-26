"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { setActiveVoc, useActive } from "@/lib/active";
import { ALL_VOCS, type AnyVoc } from "./voc-list";

/**
 * Abas de vocação das páginas de consulta. Seguem a vocação ativa (barra do topo): trocar aqui troca lá, e vice-versa.
 * Link com ?voc= explícito vale mais que a vocação guardada.
 */
export default function VocTabs({ base, current }: { base: string; current: AnyVoc }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const { voc } = useActive();
  const urlVoc = params.get("voc");

  const hrefFor = (v: AnyVoc) => {
    const p = new URLSearchParams(params.toString());
    p.delete("add");
    p.delete("combo");
    if (v === "sorcerer") p.delete("voc");
    else p.set("voc", v);
    const qs = p.toString();
    return `${path ?? base}${qs ? `?${qs}` : ""}`;
  };

  // 1ª vez: link com ?voc= explícito vira a vocação ativa; sem ele, a página vai para a vocação ativa.
  // Depois: quando a vocação ativa muda (aqui ou na barra do topo), a página acompanha.
  const prev = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const before = prev.current;
    prev.current = voc;
    if (before === undefined) {
      if (urlVoc && ALL_VOCS.some(([id]) => id === urlVoc)) {
        if (urlVoc !== voc) setActiveVoc(urlVoc as AnyVoc);
        return;
      }
      if (voc && voc !== current) router.replace(hrefFor(voc), { scroll: false });
      return;
    }
    if (voc && voc !== before && voc !== current) router.replace(hrefFor(voc), { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voc]);

  return (
    <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Vocação">
      {ALL_VOCS.map(([id, label, emblem]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={current === id}
          onClick={() => {
            setActiveVoc(id);
            if (id !== current) router.replace(hrefFor(id), { scroll: false });
          }}
          className={`tc-btn flex items-center gap-1 !pl-1 ${current === id ? "" : "opacity-60"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://static.tibia.com/images/library/${emblem}.png`} alt="" width={22} height={22} />
          {label}
        </button>
      ))}
    </div>
  );
}
