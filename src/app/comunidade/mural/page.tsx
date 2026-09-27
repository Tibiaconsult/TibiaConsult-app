import Link from "next/link";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import DeathList, { Death } from "./DeathList";

export const metadata = { title: "Caixão e Vela Preta" };
export const dynamic = "force-dynamic";

export default async function MuralPage() {
  let deaths: Death[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("death_wall", { p_limit: 200 });
    deaths = (data ?? []) as Death[];
  }
  return (
    <div>
      <h1>Caixão e Vela Preta</h1>
      <p className="on-dark mb-4">
        O mural das mortes da nossa turma: deixe seu F, ria (com respeito) e comente. Só aparecem chars cadastrados no site cujo dono ligou a opção de aparecer
        no mural. As mortes vêm do tibia.com, que mostra as dos últimos 30 dias; daqui para a frente o mural guarda todas.
      </p>
      <section className="tc-panel">
        <div className="tc-title">🕯️ Descansem em paz 🕯️</div>
        <div className="tc-box" style={{ background: "#1b1410", color: "#e8dcc8" }}>
          {deaths.length === 0 ? (
            <p className="text-[13px]">
              Nenhuma vela acesa por enquanto. Quer entrar no mural? Cadastre seu char em <Link href="/meus-chars">Meus chars</Link> e ligue a opção de aparecer
              (um clique, no quadro Comunidade do char).
            </p>
          ) : (
            <DeathList deaths={deaths} />
          )}
        </div>
      </section>
      <p className="on-dark muted text-[11px]">Dados do tibia.com pela API pública do TibiaData, atualizados a cada 3 horas. Horários de Brasília.</p>
    </div>
  );
}
