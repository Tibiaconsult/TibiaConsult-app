"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "senha" | "link" | "criar";

export default function LoginForm({ next = "/meus-chars" }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("senha");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const redirectTo = () => `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMsg(null);
    const supabase = createClient();
    if (mode === "link") {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
      if (error) return (setStatus("error"), setMsg(error.message));
      setStatus("sent");
      setMsg("Link enviado. Abra o e-mail neste mesmo navegador (olhe também o lixo eletrônico).");
      return;
    }
    if (mode === "criar") {
      if (password.length < 8) return (setStatus("error"), setMsg("A senha precisa de pelo menos 8 caracteres."));
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo() } });
      if (error) return (setStatus("error"), setMsg(error.message));
      if (data.session) return router.push(next);
      setStatus("sent");
      setMsg("Conta criada. Confirme pelo link que enviamos ao seu e-mail (olhe também o lixo eletrônico) e depois entre com a senha.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return (setStatus("error"), setMsg(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message));
    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <div className="tc-login-tabs" role="tablist">
        {(
          [
            ["senha", "Entrar com senha"],
            ["criar", "Criar conta"],
            ["link", "Link por e-mail"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? "is-active" : ""} onClick={() => (setMode(m), setStatus("idle"), setMsg(null))}>
            {label}
          </button>
        ))}
      </div>
      {status === "sent" ? (
        <p className="good">{msg}</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full" autoComplete="email" />
          </label>
          {mode !== "link" && (
            <label className="block">
              Senha
              <input type="password" required minLength={mode === "criar" ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full" autoComplete={mode === "criar" ? "new-password" : "current-password"} />
            </label>
          )}
          <button type="submit" disabled={status === "sending"} className="tc-btn disabled:opacity-50">
            {status === "sending" ? "Aguarde..." : mode === "senha" ? "Entrar" : mode === "criar" ? "Criar conta" : "Receber link de acesso"}
          </button>
          {msg && <p className={status === "error" ? "bad" : "good"}>{msg}</p>}
          {mode === "senha" && <p className="muted text-[11px]">Entrou antes só pelo link? Use a aba &quot;Link por e-mail&quot; ou crie uma senha na aba &quot;Criar conta&quot; com o mesmo e-mail.</p>}
        </form>
      )}
    </div>
  );
}
