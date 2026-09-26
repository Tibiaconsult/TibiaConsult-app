import { hasSupabaseEnv } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  if (!hasSupabaseEnv()) {
    return (
      <div className="card max-w-md">
        <h1>Entrar</h1>
        <p className="text-sm text-zinc-400">O login ainda não foi configurado neste ambiente.</p>
      </div>
    );
  }
  return (
    <div className="max-w-md">
      <h1>Entrar</h1>
      <p className="text-sm text-zinc-400 mb-4">Informe seu e-mail. Você recebe um link de acesso, sem senha.</p>
      {erro === "link" && (
        <p className="text-sm text-red-300 mb-4">O link não pôde ser validado (expirado ou já usado). Peça um novo.</p>
      )}
      <LoginForm />
    </div>
  );
}
