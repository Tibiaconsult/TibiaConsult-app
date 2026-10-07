"use client";

// Adicionar e tirar chars da Minha PT (lista privada da conta).
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AddChar() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient().rpc("add_party_char", { p_name: name.trim() });
    setBusy(false);
    if (error) return setMsg(error.message.replace(/^.*?:\s*/, ""));
    setName("");
    setMsg(`${data} entrou na PT. A coleta de online e mortes começa agora; o XP aparece a partir do próximo dia.`);
    router.refresh();
  }
  return (
    <form onSubmit={add} className="flex flex-wrap items-center gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do char" maxLength={30} className="w-56" />
      <button type="submit" className="tc-btn" disabled={busy || !name.trim()}>
        {busy ? "Buscando no tibia.com..." : "Adicionar à PT"}
      </button>
      {msg && <span className="text-[12px]">{msg}</span>}
    </form>
  );
}

export function RemoveChar({ name }: { name: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="underline text-[11px]"
      onClick={async () => {
        if (!confirm(`Tirar ${name} da PT?`)) return;
        await createClient().rpc("set_party_char", { p_name: name, p_active: false });
        router.refresh();
      }}
    >
      tirar da PT
    </button>
  );
}

export function NotifyToggle({ name, on }: { name: string; on: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(on);
  return (
    <label className="inline-flex items-center gap-1 text-[11px] cursor-pointer">
      <input
        type="checkbox"
        checked={v}
        onChange={async (e) => {
          const next = e.target.checked;
          setV(next);
          await createClient().rpc("set_party_notify", { p_name: name, p_notify: next });
          router.refresh();
        }}
      />
      🔔 avisar no celular se morrer
    </label>
  );
}
