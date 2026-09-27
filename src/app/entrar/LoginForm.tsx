"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "senha" | "link" | "criar";

/** Versão do texto de /termos aceita no cadastro (fica gravada nos metadados da conta). */
const TERMS_VERSION = "2026-09-26";

export default function LoginForm({ next = "/minha-area" }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("senha");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  // "esqueci a senha": o link do e-mail volta direto para a caixa de senha da Minha área
  const [forgot, setForgot] = useState(false);

  async function resend() {
    setStatus("sending");
    const { error } = await createClient().auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo() } });
    if (error) return (setStatus("error"), setMsg(error.message));
    setStatus("sent");
    setMsg("Enviamos um novo link de confirmação. Abra o e-mail neste mesmo navegador (olhe também o lixo eletrônico) e depois entre com a senha.");
  }

  const redirectTo = () => `${window.location.origin}/auth/confirm?next=${encodeURIComponent(forgot ? "/minha-area#senha" : next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMsg(null);
    const supabase = createClient();
    if (mode === "link") {
      // o link só entra em conta que já existe: conta nova passa pela aba "Criar conta", com o aceite dos termos
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo(), shouldCreateUser: false } });
      if (error)
        return (
          setStatus("error"),
          setMsg(/signup|not allowed|not found/i.test(error.message) ? "Não há conta com esse e-mail. Crie a conta na aba \"Criar conta\"." : error.message)
        );
      setStatus("sent");
      setMsg(
        forgot
          ? "Link enviado. Abra o e-mail neste mesmo navegador (olhe também o lixo eletrônico): ele entra na conta e abre a Minha área, onde você cria a senha nova."
          : "Link enviado. Abra o e-mail neste mesmo navegador (olhe também o lixo eletrônico).",
      );
      return;
    }
    if (mode === "criar") {
      if (password.length < 8) return (setStatus("error"), setMsg("A senha precisa de pelo menos 8 caracteres."));
      if (!accepted) return (setStatus("error"), setMsg("Para criar a conta, leia e aceite os termos de uso."));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo(), data: { terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() } },
      });
      if (error) return (setStatus("error"), setMsg(error.message));
      if (data.session) return router.push(next);
      setStatus("sent");
      setMsg("Conta criada. Confirme pelo link que enviamos ao seu e-mail (olhe também o lixo eletrônico) e depois entre com a senha.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error && /not confirmed/i.test(error.message)) {
      setUnconfirmed(true);
      return (setStatus("error"), setMsg("Seu e-mail ainda não foi confirmado. Clique abaixo para receber o link de confirmação."));
    }
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
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? "is-active" : ""} onClick={() => (setMode(m), setStatus("idle"), setMsg(null), setUnconfirmed(false), setForgot(false))}>
            {label}
          </button>
        ))}
      </div>
      {status === "sent" ? (
        <p className="good">{msg}</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          {mode === "criar" && (
            <div className="border-2 border-[#a33] rounded p-3 bg-[#f6d8d0] text-[12px]">
              <b>Importante: não use o e-mail nem a senha da sua conta do Tibia.</b> Crie uma senha só para este site. O TibiaConsult nunca pede
              login, senha ou token do Tibia, e ninguém da equipe vai pedir.
            </div>
          )}
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
          {mode === "criar" && (
            <label className="flex items-start gap-2 text-[12px]">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" required />
              <span>
                Li e aceito os{" "}
                <Link href="/termos" target="_blank">
                  termos de uso
                </Link>
                . Entendo que o TibiaConsult é uma plataforma beta, em desenvolvimento, gratuita e sem garantia, e que os cálculos são estimativas.
              </span>
            </label>
          )}
          <button type="submit" disabled={status === "sending" || (mode === "criar" && !accepted)} className="tc-btn disabled:opacity-50">
            {status === "sending" ? "Aguarde..." : mode === "senha" ? "Entrar" : mode === "criar" ? "Criar conta" : "Receber link de acesso"}
          </button>
          {msg && <p className={status === "error" ? "bad" : "good"}>{msg}</p>}
          {unconfirmed && mode === "senha" && (
            <button type="button" className="tc-btn" onClick={resend} disabled={status === "sending"}>
              Reenviar e-mail de confirmação
            </button>
          )}
          {mode === "senha" && (
            <p className="text-[12px]">
              <button type="button" className="underline font-bold" onClick={() => (setMode("link"), setForgot(true), setStatus("idle"), setMsg(null), setUnconfirmed(false))}>
                Esqueci a senha
              </button>{" "}
              <span className="muted text-[11px]">ou só entrou pelo link até hoje: receba o link por e-mail e crie a senha na Minha área.</span>
            </p>
          )}
          {mode === "link" && forgot && (
            <p className="muted text-[11px]">Depois de entrar pelo link, a Minha área abre na caixa &quot;Senha da conta&quot; para você criar a senha nova.</p>
          )}
        </form>
      )}
    </div>
  );
}
