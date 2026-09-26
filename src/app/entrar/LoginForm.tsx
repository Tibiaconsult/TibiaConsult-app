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
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/meus-chars` },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return <p className="good">Link enviado. Abra o e-mail (olhe também o lixo eletrônico) e clique para entrar.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        E-mail
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full" placeholder="voce@exemplo.com" />
      </label>
      <button type="submit" disabled={status === "sending"} className="tc-btn disabled:opacity-50">
        {status === "sending" ? "Enviando..." : "Receber link de acesso"}
      </button>
      {error && <p className="bad">{error}</p>}
    </form>
  );
}
