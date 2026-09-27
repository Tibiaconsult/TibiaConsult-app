import Link from "next/link";
import { redirect } from "next/navigation";
import Box from "@/components/Box";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { addChar } from "./actions";
import { VOCATIONS } from "./vocations";

export default async function MeusCharsPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  if (!hasSupabaseEnv()) redirect("/entrar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/meus-chars");

  const { data: chars } = await supabase
    .from("chars")
    .select("id, name, vocation, level, magic_level, world, wand, wand_tier, helmet, armor, legs, boots, wheel_summary")
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Meus chars</h1>
        <form action="/auth/sair" method="post">
          <button className="tc-btn">sair ({user.email})</button>
        </form>
      </div>

      {erro && <p className="on-dark bad mb-3">Não foi possível salvar: {erro}</p>}
      <Box title="Seus chars">
        <div className="grid gap-3 md:grid-cols-2">
          {(chars ?? []).map((c) => {
            const setResumo = [c.wand && `${c.wand}${c.wand_tier ? ` T${c.wand_tier}` : ""}`, c.helmet, c.armor, c.legs, c.boots].filter(Boolean).join(" · ");
            return (
              <Link key={c.id} href={`/meus-chars/${c.id}`} className="block border border-[#b98a5a] rounded p-3 bg-white/40 hover:bg-white/70 no-underline">
                <div className="font-bold text-[#3a1a00] text-[14px]">{c.name}</div>
                <div>
                  {VOCATIONS[c.vocation] ?? c.vocation} · level {c.level} · ML {c.magic_level}
                  {c.world ? ` · ${c.world}` : ""}
                </div>
                <div className="muted text-[11px] mt-2">{setResumo || "Set ainda não preenchido"}</div>
                {c.wheel_summary && <div className="muted text-[11px]">Wheel: {c.wheel_summary}</div>}
                <div className="text-[#0b3d91] text-[11px] mt-2 font-bold">abrir e preencher →</div>
              </Link>
            );
          })}
          {(chars ?? []).length === 0 && <p className="muted">Nenhum char cadastrado ainda.</p>}
        </div>
      </Box>

      <Box title="Cadastrar char">
        <p className="mb-3">Só o básico agora. Set, Wheel, gemas e hunts você preenche depois, na tela do char.</p>
        <form action={addChar} className="grid gap-3 sm:grid-cols-2 max-w-3xl">
          <label>
            Nome
            <input name="name" required className="mt-1 w-full" />
          </label>
          <label>
            Vocação
            <select name="vocation" defaultValue="sorcerer" className="mt-1 w-full">
              {Object.entries(VOCATIONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Level
            <input name="level" type="number" min={1} max={5000} defaultValue={800} className="mt-1 w-full" />
          </label>
          <label>
            Magic level
            <input name="magic_level" type="number" min={0} max={300} defaultValue={100} className="mt-1 w-full" />
          </label>
          <label className="sm:col-span-2">
            Mundo
            <input name="world" className="mt-1 w-full" placeholder="Belobra" />
          </label>
          <div className="sm:col-span-2">
            <button className="tc-btn">Cadastrar e abrir o char</button>
          </div>
        </form>
      </Box>
    </div>
  );
}
