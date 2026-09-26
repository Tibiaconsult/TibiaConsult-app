import { hasSupabaseEnv } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default function EntrarPage() {
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
      <LoginForm />
    </div>
  );
}
