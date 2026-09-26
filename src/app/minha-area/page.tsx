import Link from "next/link";
import { redirect } from "next/navigation";
import Box from "@/components/Box";
import { huntsFor } from "@/lib/hunt-level";
import { comboHref, setHref, simHref, wheelHref } from "@/lib/char-links";
import { BESTIARY } from "@/data/bestiary";
import { WHEEL_MILESTONES } from "@/data/wheel-milestones";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { VOCATIONS } from "../meus-chars/vocations";
import UseCharButton from "./UseCharButton";
import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "Minha área" };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = { bug: "Bug", inconsistencia: "Dado errado", hunt: "Hunt", funcionalidade: "Funcionalidade", outro: "Outro" };
const STATUS_LABEL: Record<string, string> = { novo: "recebida", lido: "lida", feito: "feita", descartado: "não será feita" };

export default async function MinhaAreaPage() {
  if (!hasSupabaseEnv()) redirect("/entrar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/minha-area");

  const { data: chars } = await supabase.from("chars").select("*").order("created_at", { ascending: true });
  const { data: progress } = await supabase.from("bestiary_progress").select("char_id");
  const { data: feedback } = await supabase.from("feedback").select("id, kind, message, status, created_at").order("created_at", { ascending: false }).limit(20);

  const doneBy = new Map<string, number>();
  for (const p of progress ?? []) doneBy.set(p.char_id, (doneBy.get(p.char_id) ?? 0) + 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Minha área</h1>
        <LogoutButton className="tc-btn" label={`sair (${user.email})`} />
      </div>
      <p className="on-dark mb-4">
        Tudo aqui é só seu: nenhuma outra conta vê seus chars, seu bestiário ou suas sugestões. O resto do site continua aberto para explorar
        qualquer vocação.
      </p>

      {(chars ?? []).length === 0 && (
        <Box title="Comece por aqui">
          <p>
            Cadastre seu primeiro char em <Link href="/meus-chars">Meus chars</Link>. Com vocação e level, esta página passa a sugerir hunts,
            abre o simulador já preenchido e acompanha o seu bestiário.
          </p>
        </Box>
      )}

      {(chars ?? []).map((c) => {
        const { ok, next } = huntsFor(c.vocation, c.level);
        const milestone = WHEEL_MILESTONES.find((m) => m.level > c.level);
        const sim = simHref(c);
        const done = doneBy.get(c.id) ?? 0;
        return (
          <Box key={c.id} title={`${c.name} · ${VOCATIONS[c.vocation] ?? c.vocation} · level ${c.level}`}>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h2 className="mt-0">Hunts para você</h2>
                {ok.length === 0 ? (
                  <p className="text-[12px]">Nenhuma hunt do site com recomendação solo para essa vocação neste level.</p>
                ) : (
                  <ul className="space-y-1 text-[12px]">
                    {ok.map(({ h, min }) => (
                      <li key={h.id}>
                        <Link href={`/hunts?h=${h.id}`} className="font-bold">
                          {h.name}
                        </Link>{" "}
                        <span className="muted">({min}+)</span>{" "}
                        <Link href={`/hunts/preparar?h=${h.id}&voc=${c.vocation}`} className="text-[11px]">
                          preparar
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {next && (
                  <p className="text-[11px] mt-2">
                    Próxima: <Link href={`/hunts?h=${next.h.id}`}>{next.h.name}</Link> a partir do level {next.min}.
                  </p>
                )}
                <p className="muted text-[10px] mt-1">Recomendação solo do TibiaPal para a vocação.</p>
              </div>
              <div>
                <h2 className="mt-0">Evolução</h2>
                <ul className="space-y-1 text-[12px]">
                  <li>
                    ML {c.magic_level}
                    {c.skill ? ` · skill ${c.skill}` : ""}
                    {c.weapon_attack ? ` · ataque ${c.weapon_attack}` : ""}
                  </li>
                  {milestone && (
                    <li>
                      <b>Wheel no level {milestone.level}:</b> {milestone.text}
                    </li>
                  )}
                  <li>
                    <b>Bestiário:</b> {done} de {BESTIARY.length} criaturas.{" "}
                    <Link href="/ferramentas/bestiario">Abrir</Link>
                  </li>
                </ul>
                <p className="muted text-[10px] mt-1">Marcos da Wheel: TibiaWiki.</p>
              </div>
              <div>
                <h2 className="mt-0">Atalhos</h2>
                <div className="flex flex-col gap-2 items-start">
                  <UseCharButton
                    char={{ id: c.id, name: c.name, vocation: c.vocation, level: c.level, magic_level: c.magic_level, skill: c.skill ?? null, world: c.world ?? null }}
                  />
                  <Link className="tc-btn" href={wheelHref(c)}>
                    {c.wheel_code ? "Abrir a roda salva" : "Montar a roda"}
                  </Link>
                  <Link className="tc-btn" href={setHref(c)}>
                    {c.set_code ? "Abrir o set salvo" : "Montar o set"}
                  </Link>
                  <Link className="tc-btn" href={comboHref(c)}>
                    {c.combo_code ? "Abrir o combo salvo" : "Montar um combo"}
                  </Link>
                  {sim && (
                    <Link className="tc-btn" href={sim}>
                      Simular o dano deste char
                    </Link>
                  )}
                  <Link className="tc-btn" href={`/meus-chars/${c.id}`}>
                    Editar char, set e Wheel
                  </Link>
                  <Link className="tc-btn" href={`/vocacoes/${c.vocation}`}>
                    Página da vocação
                  </Link>
                </div>
                {(!c.skill || !c.weapon_attack) && (c.vocation === "knight" || c.vocation === "paladin") && (
                  <p className="text-[11px] mt-2 warn">Preencha skill e ataque da arma no char para o simulador acertar o dano.</p>
                )}
              </div>
            </div>
          </Box>
        );
      })}

      <Box title="Suas sugestões e relatos">
        {(feedback ?? []).length === 0 ? (
          <p className="text-[12px]">
            Você ainda não enviou nada. Use o botão &quot;Reportar ou sugerir&quot; no canto da tela quando achar um erro ou tiver uma ideia.
          </p>
        ) : (
          <ul className="space-y-2 text-[12px]">
            {(feedback ?? []).map((f) => (
              <li key={f.id} className="border border-[#b98a5a] rounded p-2 bg-white/40">
                <span className="tag tag-fire mr-2">{KIND_LABEL[f.kind] ?? f.kind}</span>
                <span className="muted">
                  {new Date(f.created_at).toLocaleDateString("pt-BR")} · {STATUS_LABEL[f.status] ?? f.status}
                </span>
                <p className="mt-1 whitespace-pre-line">{f.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </div>
  );
}
