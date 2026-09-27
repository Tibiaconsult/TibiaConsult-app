"use client";

// Conta as visitas para as métricas do /admin: um código aleatório por navegador (sem IP, sem cookie) e a página vista.

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLootSplitHost } from "@/lib/lootsplit-app";
import { createClient } from "@/lib/supabase/client";

function visitor(): string | null {
  try {
    let id = localStorage.getItem("tc-visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("tc-visitor", id);
    }
    return id;
  } catch {
    return null;
  }
}

export default function VisitTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !path) return;
    // o Painel não entra na conta (senão o próprio administrador infla as métricas)
    if (path.startsWith("/admin")) return;
    // no endereço próprio do LootSplit a raiz é o LootSplit, não a tela inicial do site
    const page = isLootSplitHost(window.location.host) && path === "/" ? "/lootsplit" : path;
    const id = visitor();
    if (!id) return;
    createClient()
      .rpc("track_visit", { p_visitor: id, p_path: page })
      .then(
        () => {},
        () => {},
      );
  }, [path]);
  return null;
}
