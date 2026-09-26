"use client";

import Link from "next/link";
import { useState } from "react";
import { VOC_SHORT, Voc, useActive } from "@/lib/active";
import { createClient } from "@/lib/supabase/client";

/**
 * Salva a roda, o set ou o combo no char ativo (barra do topo). Só o dono consegue gravar (RLS da tabela chars).
 * `value` para set e combo é a query da página (ex.: "voc=knight&a=..."), para abrir de novo com um clique na Minha área.
 */
export default function SaveToChar({ voc, field, value, what }: { voc: Voc; field: "wheel_code" | "set_code" | "combo_code"; value: string; what: string }) {
  const { char } = useActive();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!char)
    return (
      <span className="muted text-[11px]">
        Para salvar {what} no seu char, <Link href="/entrar">entre</Link> e escolha o char na barra do topo.
      </span>
    );
  if (char.vocation !== voc)
    return (
      <span className="muted text-[11px]">
        O char ativo ({char.name}) é {VOC_SHORT[char.vocation]}: troque o char na barra do topo para salvar {what}.
      </span>
    );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        className="tc-btn !py-0.5"
        disabled={busy || !value}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          const { error } = await createClient()
            .from("chars")
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq("id", char.id);
          setBusy(false);
          setMsg(error ? `Não salvou: ${error.message}` : `Salvo em ${char.name}.`);
        }}
      >
        {busy ? "salvando..." : `Salvar ${what} em ${char.name}`}
      </button>
      {msg && <span className={`text-[11px] ${msg.startsWith("Salvo") ? "good" : "bad"}`}>{msg}</span>}
    </span>
  );
}
