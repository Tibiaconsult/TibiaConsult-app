import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { addChar, deleteChar } from "./actions";

const VOCATIONS: Record<string, string> = {
  sorcerer: "Master Sorcerer",
  druid: "Elder Druid",
  knight: "Elite Knight",
  paladin: "Royal Paladin",
  monk: "Exalted Monk",
};

export default async function MeusCharsPage() {
  if (!hasSupabaseEnv()) redirect("/entrar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/meus-chars");

  const { data: chars } = await supabase
    .from("chars")
    .select("id, name, vocation, level, magic_level, world, wand, notes")
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
        {(chars ?? []).map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-amber-100">{c.name}</div>
                <div className="text-sm text-zinc-400">
                  {VOCATIONS[c.vocation] ?? c.vocation} · level {c.level} · ML {c.magic_level}
                  {c.world ? ` · ${c.world}` : ""}
                </div>
                {c.wand && <div className="text-sm text-zinc-300 mt-1">Wand: {c.wand}</div>}
                {c.notes && <p className="text-sm text-zinc-400 mt-1 whitespace-pre-line">{c.notes}</p>}
              </div>
              <form action={deleteChar}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-zinc-500 hover:text-red-300">remover</button>
              </form>
            </div>
          </div>
        ))}
        {(chars ?? []).length === 0 && <p className="text-sm text-zinc-500">Nenhum char cadastrado ainda.</p>}
      </div>

      <h2>Cadastrar char</h2>
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
        <label className="text-sm text-zinc-300">
          Mundo
          <input name="world" className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" placeholder="Belobra" />
        </label>
        <label className="text-sm text-zinc-300">
          Wand
          <input name="wand" className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" placeholder="Sanguine Coil T0" />
        </label>
        <label className="text-sm text-zinc-300 sm:col-span-2">
          Notas (set, wheel, hunts)
          <textarea name="notes" rows={3} className="mt-1 w-full rounded bg-zinc-800 px-3 py-2" />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded bg-amber-500/20 text-amber-200 px-4 py-2 hover:bg-amber-500/30">Salvar</button>
        </div>
      </form>
    </div>
  );
}
