import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { SLOTS } from "@/data/equipment";
import { deleteChar, updateChar } from "../actions";
import { VOCATIONS } from "../vocations";

function slotItems(id: string): string[] {
  return SLOTS.find((s) => s.id === id)?.items.map((i) => i.name) ?? [];
}

function ItemSelect({ name, label, value, slot, withTier, tier }: { name: string; label: string; value: string | null; slot: string; withTier?: boolean; tier?: number }) {
  const options = slotItems(slot);
  const custom = value && !options.includes(value);
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
      <label className="text-sm text-zinc-300">
        {label}
        <select name={name} defaultValue={value ?? ""} className="mt-1 w-full rounded bg-zinc-800 px-3 py-2">
          <option value="">(vazio)</option>
          {custom && <option value={value}>{value}</option>}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      {withTier && (
        <label className="text-sm text-zinc-300">
          Tier
          <input name={`${name}_tier`} type="number" min={0} max={10} defaultValue={tier ?? 0} className="mt-1 w-20 rounded bg-zinc-800 px-3 py-2" />
        </label>
      )}
    </div>
  );
}

export default async function CharPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  if (!hasSupabaseEnv()) redirect("/entrar");
  const { id } = await params;
  const { salvo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/entrar?next=/meus-chars/${id}`);

  const { data: c } = await supabase.from("chars").select("*").eq("id", id).single();
  if (!c) notFound();

  const field = "mt-1 w-full rounded bg-zinc-800 px-3 py-2";

  return (
    <div>
      <Link href="/meus-chars" className="text-xs text-zinc-400 hover:text-amber-200">
        ← Meus chars
      </Link>
      <h1 className="mt-2">{c.name}</h1>
      {salvo && <div className="text-sm text-green-300 mb-4">Salvo.</div>}

      <form action={updateChar} className="space-y-8 max-w-4xl">
        <input type="hidden" name="id" value={c.id} />

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="mt-0 sm:col-span-2">Básico</h2>
          <label className="text-sm text-zinc-300">
            Nome
            <input name="name" required defaultValue={c.name} className={field} />
          </label>
          <label className="text-sm text-zinc-300">
            Vocação
            <select name="vocation" defaultValue={c.vocation} className={field}>
              {Object.entries(VOCATIONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-zinc-300">
            Level
            <input name="level" type="number" min={1} max={5000} defaultValue={c.level} className={field} />
          </label>
          <label className="text-sm text-zinc-300">
            Magic level
            <input name="magic_level" type="number" min={0} max={300} defaultValue={c.magic_level} className={field} />
          </label>
          <label className="text-sm text-zinc-300">
            Mundo
            <input name="world" defaultValue={c.world ?? ""} className={field} />
          </label>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="mt-0 sm:col-span-2">Set</h2>
          <ItemSelect name="wand" label="Wand" value={c.wand} slot="wand" withTier tier={c.wand_tier} />
          <ItemSelect name="helmet" label="Elmo" value={c.helmet} slot="helmet" withTier tier={c.helmet_tier} />
          <ItemSelect name="armor" label="Armadura" value={c.armor} slot="armor" withTier tier={c.armor_tier} />
          <ItemSelect name="legs" label="Pernas" value={c.legs} slot="legs" withTier tier={c.legs_tier} />
          <ItemSelect name="boots" label="Botas" value={c.boots} slot="boots" withTier tier={c.boots_tier} />
          <ItemSelect name="spellbook" label="Spellbook" value={c.spellbook} slot="spellbook" />
          <ItemSelect name="ring" label="Anel" value={c.ring} slot="ring" />
          <ItemSelect name="amulet" label="Amuleto" value={c.amulet} slot="amulet" />
          <label className="text-sm text-zinc-300 sm:col-span-2">
            Imbuements (um por linha: slot e imbuement)
            <textarea name="imbuements" rows={3} defaultValue={c.imbuements ?? ""} className={field} placeholder={"Elmo: Powerful Epiphany + Powerful Void\nWand: Powerful Void + Powerful Vampirism"} />
          </label>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="mt-0 sm:col-span-2">Wheel of Destiny</h2>
          <label className="text-sm text-zinc-300">
            Código do planner (tibia.com)
            <input name="wheel_code" defaultValue={c.wheel_code ?? ""} className={field} placeholder="S0Y2..." />
          </label>
          <label className="text-sm text-zinc-300">
            Resumo
            <input name="wheel_summary" defaultValue={c.wheel_summary ?? ""} className={field} placeholder="Beam Mastery T2 + Energy Wave T1 + Death Echo T1" />
          </label>
          <label className="text-sm text-zinc-300 sm:col-span-2">
            Gemas (uma por linha: domínio, mods, grade)
            <textarea name="gems" rows={4} defaultValue={c.gems ?? ""} className={field} placeholder={"Sup. direito: Greater Sage, Mana +600 | Energy +2% | RM Beam Mastery (grade I), VR III"} />
          </label>
        </section>

        <section className="card grid gap-3">
          <h2 className="mt-0">Hunts</h2>
          <label className="text-sm text-zinc-300">
            Hunts que faz e exp/h (uma por linha)
            <textarea name="hunts" rows={4} defaultValue={c.hunts ?? ""} className={field} placeholder={"Asura Citadel solo: 6,5kk/h\nNorcferatu East (team): 9kk/h"} />
          </label>
          <label className="text-sm text-zinc-300">
            Outras notas
            <textarea name="notes" rows={3} defaultValue={c.notes ?? ""} className={field} />
          </label>
        </section>

        <div className="flex items-center gap-4">
          <button className="rounded bg-amber-500/20 text-amber-200 px-4 py-2 hover:bg-amber-500/30">Salvar</button>
        </div>
      </form>

      <form action={deleteChar} className="mt-8">
        <input type="hidden" name="id" value={c.id} />
        <button className="text-xs text-zinc-500 hover:text-red-300">remover este char</button>
      </form>
    </div>
  );
}
