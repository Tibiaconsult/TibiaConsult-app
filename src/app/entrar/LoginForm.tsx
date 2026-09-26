"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/meus-chars` },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return <div className="card text-sm text-green-300">Link enviado. Abra o e-mail e clique para entrar.</div>;
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <label className="block text-sm text-zinc-300">
        E-mail
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded bg-zinc-800 px-3 py-2"
          placeholder="voce@exemplo.com"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-amber-500/20 text-amber-200 px-4 py-2 hover:bg-amber-500/30 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando..." : "Receber link de acesso"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>
  );
}
