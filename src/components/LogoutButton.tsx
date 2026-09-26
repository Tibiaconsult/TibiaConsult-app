"use client";

import { setActiveChar } from "@/lib/active";

/** Sai da conta: o servidor apaga a sessão (POST /auth/sair) e o navegador esquece o char ativo. */
export default function LogoutButton({ className = "", label = "Sair" }: { className?: string; label?: string }) {
  return (
    <form action="/auth/sair" method="post" onSubmit={() => setActiveChar(null)} className="inline">
      <button type="submit" className={className} title="Sair da conta">
        {label}
      </button>
    </form>
  );
}
