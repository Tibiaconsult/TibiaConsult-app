"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
          <Link href="/meus-chars" className="tc-big-button">
            Meus chars
          </Link>
          <div className="tc-login-muted" title={email}>
            {email}
          </div>
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
