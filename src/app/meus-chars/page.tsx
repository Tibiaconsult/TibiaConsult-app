import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { addChar } from "./actions";
import { VOCATIONS } from "./vocations";

export default async function MeusCharsPage() {
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
        <h1 className="mb-0">Meus chars</h1>
        <form action="/auth/sair" method="post">
          <button className="text-xs text-zinc-400 hover:text-amber-200">sair ({user.email})</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        {(chars ?? []).map((c) => {
          const setResumo = [c.wand && `${c.wand}${c.wand_tier ? ` T${c.wand_tier}` : ""}`, c.helmet, c.armor, c.legs, c.boots]
            .filter(Boolean)
            .join(" · ");
          return (
            <Link key={c.id} href={`/meus-chars/${c.id}`} className="card hover:border-amber-400/60 transition block">
              <div className="font-semibold text-amber-100">{c.name}</div>
              <div className="text-sm text-zinc-400">
                {VOCATIONS[c.vocation] ?? c.vocation} · level {c.level} · ML {c.magic_level}
                {c.world ? ` · ${c.world}` : ""}
              </div>
              <div className="text-xs text-zinc-500 mt-2">{setResumo || "Set ainda não preenchido"}</div>
              {c.wheel_summary && <div className="text-xs text-zinc-500">Wheel: {c.wheel_summary}</div>}
              <div className="text-xs text-amber-300 mt-2">abrir e preencher →</div>
            </Link>
          );
        })}
        {(chars ?? []).length === 0 && <p className="text-sm text-zinc-500">Nenhum char cadastrado ainda.</p>}
      </div>

      <h2>Cadastrar char</h2>
      <p className="text-sm text-zinc-400 mb-3">Só o básico agora. Set, Wheel, gemas e hunts você preenche depois, na tela do char.</p>
      <form action={addChar} className="card grid gap-3 sm:grid-cols-2 max-w-3xl">
        <label className="text-sm text-zinc-300">
          Nome
          <input name="name" required className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" />
        </label>
        <label className="text-sm text-zinc-300">
          Vocação
          <select name="vocation" defaultValue="sorcerer" className="mt-1 w-full rounded bg-zinc-800 px-3 py-2">
            {Object.entries(VOCATIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          Level
          <input name="level" type="number" min={1} max={5000} defaultValue={800} className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" />
        </label>
        <label className="text-sm text-zinc-300">
          Magic level
          <input name="magic_level" type="number" min={0} max={300} defaultValue={100} className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" />
        </label>
        <label className="text-sm text-zinc-300 sm:col-span-2">
          Mundo
          <input name="world" className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" placeholder="Belobra" />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded bg-amber-500/20 text-amber-200 px-4 py-2 hover:bg-amber-500/30">Cadastrar e abrir o char</button>
        </div>
      </form>
    </div>
  );
}
