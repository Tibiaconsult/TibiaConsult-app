"use client";

// Convite para quem ainda não tem conta: o char da pessoa provavelmente já está na Taverna (guildas acompanhadas).
// Busca pelo nome leva ao perfil, com o que o Rashid anda falando; o botão leva direto para "Criar conta".
// Só aparece para quem não está logado.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = { color: "#f3d27a" };

export default function JoinInvite({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [logged, setLogged] = useState<boolean | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    createClient()
      .auth.getSession()
      .then(({ data }) => setLogged(Boolean(data.session)));
  }, []);

  if (logged !== false) return null;

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim().replace(/\s+/g, " ");
    if (n.length >= 2) router.push(`/char/${encodeURIComponent(n)}`);
  };

  return (
    <div
      className={`rounded ${compact ? "p-2 text-[11px]" : "p-3 mb-3 text-[13px]"}`}
      style={{ background: "linear-gradient(#3a2410, #1e140c)", color: "#f3e3c3", border: "1px solid #8a6a2a" }}
    >
      <div className="flex items-start gap-2">
        {!compact && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/rashid.webp" alt="Rashid" width={52} height={52} className="shrink-0 tc-rashid" style={{ imageRendering: "pixelated" }} />
        )}
        <div>
          <b style={GOLD} className={compact ? "" : "text-[15px]"}>
            Seu char já está aqui. 👀
          </b>
          <p className="mt-0.5">
            Se você é das guildas acompanhadas, o Rashid já anda falando das suas mortes. Veja o que ele contou{compact ? "." : ", e responda à altura."}
          </p>
        </div>
      </div>
      <form onSubmit={go} className="flex gap-1 mt-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="Nome do seu char"
          aria-label="Nome do seu char"
          className="flex-1 min-w-0 !py-0.5 text-[12px]"
          style={{ background: "#241a14", color: "#e8dcc8", border: "1px solid #5a4632" }}
        />
        <button type="submit" className="tc-btn !py-0.5 !px-2 whitespace-nowrap" disabled={name.trim().length < 2}>
          {compact ? "Ver" : "O que falam de mim?"}
        </button>
      </form>
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${compact ? "mt-1.5" : "mt-2"}`}>
        <Link href="/entrar?modo=criar&next=/comunidade/taverna" className="font-bold" style={GOLD}>
          Criar conta grátis →
        </Link>
        {!compact && (
          <span className="opacity-80 text-[12px]">
            Um clique libera o char: você comenta, conta fofoca pro Rashid e recebe aviso no celular quando zoarem a sua morte.
          </span>
        )}
      </div>
    </div>
  );
}
