import Link from "next/link";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const metadata = { title: "Caixão e Vela Preta" };
export const dynamic = "force-dynamic";

interface Death {
  name: string;
  world: string | null;
  vocation: string | null;
  died_at: string;
  level: number | null;
  reason: string | null;
  by_player: boolean;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
        O mural das mortes da nossa turma. Só aparecem chars cadastrados no site, verificados pelo dono e com a opção de aparecer no mural
        ligada. As mortes vêm do tibia.com, que mostra as dos últimos 30 dias; daqui para a frente o mural guarda todas.
      </p>
      <section className="tc-panel">
        <div className="tc-title">🕯️ Descansem em paz 🕯️</div>
        <div className="tc-box" style={{ background: "#1b1410", color: "#e8dcc8" }}>
          {deaths.length === 0 ? (
            <p className="text-[13px]">
              Nenhuma vela acesa por enquanto. Quer entrar no mural? Verifique seu char em <Link href="/meus-chars">Meus chars</Link> e ligue a
              opção de aparecer.
            </p>
          ) : (
            <ul className="space-y-2">
              {deaths.map((d) => (
                <li key={d.name + d.died_at} className="border border-[#5a4632] rounded p-2 flex flex-wrap gap-x-3 gap-y-1 items-baseline" style={{ background: "#241a14" }}>
                  <span className="text-[16px]">⚰️</span>
                  <b className="text-[14px]" style={{ color: "#f3d27a" }}>
                    {d.name}
                  </b>
                  <span className="text-[12px]">
                    level {d.level ?? "?"}
                    {d.vocation ? ` · ${d.vocation}` : ""}
                    {d.world ? ` · ${d.world}` : ""}
                  </span>
                  {d.by_player && <span className="tag tag-fire">PvP</span>}
                  <span className="text-[11px] opacity-80 ml-auto">{when(d.died_at)}</span>
                  <div className="w-full text-[12px] opacity-90">{d.reason}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <p className="on-dark muted text-[11px]">
        Dados do tibia.com pela API pública do TibiaData, atualizados a cada 3 horas. Horários de Brasília.
      </p>
    </div>
  );
}
