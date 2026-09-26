import Link from "next/link";
import Box from "@/components/Box";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ erro?: string; next?: string }> }) {
  const { erro, next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/minha-area";
  return (
    <div className="max-w-3xl">
      <h1>Account Login</h1>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <Box title="Entrar no TibiaConsult">
          {!hasSupabaseEnv() ? (
            <p>O login ainda não foi configurado neste ambiente.</p>
          ) : (
            <>
              {erro === "link" && <p className="bad mb-3">O link não pôde ser validado. Peça um novo e abra o e-mail neste mesmo navegador.</p>}
              <LoginForm next={safeNext} />
            </>
          )}
        </Box>
        <Box title="Por que ter conta?">
          <ul className="list-disc pl-5 space-y-1 text-[12px]">
            <li>Salvar seus chars com set, Wheel, gemas e hunts.</li>
            <li>Mandar o char direto para o simulador de dano.</li>
            <li>Marcar o bestiário que você já completou.</li>
            <li>Em breve: perfil público do char, só se você quiser.</li>
          </ul>
          <p className="text-[11px] mt-3">
            O site funciona sem conta: <Link href="/">voltar ao início</Link>.
          </p>
          <p className="text-[11px] mt-2 bad">Nunca use aqui o e-mail e a senha da sua conta do Tibia.</p>
          <p className="text-[11px] mt-2">
            <Link href="/termos">Termos de uso e privacidade</Link>
          </p>
        </Box>
      </div>
    </div>
  );
}
