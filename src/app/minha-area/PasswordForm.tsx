"use client";

import { passwordProblem } from "@/lib/password";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Criar ou trocar a senha da conta, já logado (inclusive quem entrou só pelo link do e-mail).
// A senha fica no Supabase Auth; o site nunca a vê depois de enviada.

export default function PasswordForm() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const problem = passwordProblem(pw);
    if (problem) return setMsg({ ok: false, text: problem });
    if (pw !== pw2) return setMsg({ ok: false, text: "As duas senhas não são iguais." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      const text = /same/i.test(error.message)
        ? "Essa já é a sua senha atual."
        : /reauth|recent/i.test(error.message)
          ? "Por segurança, entre de novo pelo link do e-mail e defina a senha logo em seguida."
          : `Não foi possível salvar: ${error.message}`;
      return setMsg({ ok: false, text });
    }
    setPw("");
    setPw2("");
    setMsg({ ok: true, text: 'Senha salva. Da próxima vez, entre com o e-mail e esta senha na aba "Entrar com senha".' });
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md text-[12px]">
      <p>
        Entrou pelo link do e-mail ou esqueceu a senha? Crie uma nova aqui: pelo menos 8 caracteres, com letras e números. <b>Não use a senha da sua conta do Tibia.</b>
      </p>
      <label className="block">
        Nova senha
        <input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full" autoComplete="new-password" />
      </label>
      <label className="block">
        Repita a nova senha
        <input
          type="password"
          required
          minLength={8}
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          className="mt-1 w-full"
          autoComplete="new-password"
        />
      </label>
      <button type="submit" className="tc-btn disabled:opacity-50" disabled={busy}>
        {busy ? "Salvando..." : "Salvar senha"}
      </button>
      {msg && <p className={msg.ok ? "good" : "bad"}>{msg.text}</p>}
    </form>
  );
}
