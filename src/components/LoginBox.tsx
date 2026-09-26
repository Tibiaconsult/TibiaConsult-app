"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "./LogoutButton";

export default function LoginBox() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(() => !process.env.NEXT_PUBLIC_SUPABASE_URL);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="tc-login-box">
      {!ready ? (
        <div className="tc-login-muted">…</div>
      ) : email ? (
        <>
          <Link href="/minha-area" className="tc-big-button">
            Minha área
          </Link>
          <div className="tc-login-muted" title={email}>
            {email}
          </div>
          <LogoutButton className="tc-login-muted underline hover:text-[#ffd700] cursor-pointer" label="sair da conta" />
        </>
      ) : (
        <>
          <Link href="/entrar" className="tc-big-button">
            Entrar
          </Link>
          <div className="tc-login-muted">login sem senha, por e-mail</div>
        </>
      )}
    </div>
  );
}
