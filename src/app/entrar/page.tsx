import Box from "@/components/Box";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <div className="max-w-md">
      <h1>Entrar</h1>
      <Box title="Acesso">
        {!hasSupabaseEnv() ? (
          <p>O login ainda não foi configurado neste ambiente.</p>
        ) : (
          <>
            <p className="mb-3">Informe seu e-mail. Você recebe um link de acesso, sem senha. Abra o e-mail neste mesmo navegador.</p>
            {erro === "link" && <p className="bad mb-3">O link não pôde ser validado. Peça um novo aqui e abra o e-mail neste mesmo navegador.</p>}
            <LoginForm />
          </>
        )}
      </Box>
    </div>
  );
}
