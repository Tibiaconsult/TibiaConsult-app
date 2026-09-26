import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Box from "@/components/Box";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { SLOTS } from "@/data/equipment";
import { SetChoice, SlotId, emptySet, encodeSet } from "@/lib/set";
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
      <label>
        {label}
        <select name={name} defaultValue={value ?? ""} className="mt-1 w-full">
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
        <label>
          Tier
          <input name={`${name}_tier`} type="number" min={0} max={10} defaultValue={tier ?? 0} className="mt-1 w-20" />
        </label>
      )}
    </div>
  );
}

const SLOT_WORDS: Record<string, SlotId> = { wand: "wand", elmo: "helmet", helmet: "helmet", armadura: "armor", armor: "armor", spellbook: "spellbook", botas: "boots", boots: "boots" };
const IMB_WORDS: Record<string, string> = {
  epiphany: "epiphany",
  void: "void",
  vampirism: "vampirism",
  "dragon hide": "dragonhide",
  "snake skin": "snakeskin",
  "quara scale": "quarascale",
  "cloud fabric": "cloudfabric",
  "lich shroud": "lichshroud",
  swiftness: "swiftness",
};

/** Monta o set do char para o montador e o simulador (imbuements lidos do texto "Slot: Powerful X + Powerful Y"). */
function charToSet(c: Record<string, unknown>): SetChoice {
  const s = emptySet();
  const pick = (slot: SlotId, name: unknown, tier: unknown) => {
    if (typeof name === "string" && name) s[slot] = { item: name, tier: Number(tier) || 0, imbues: [] };
  };
  pick("wand", c.wand, c.wand_tier);
  pick("helmet", c.helmet, c.helmet_tier);
  pick("armor", c.armor, c.armor_tier);
  pick("legs", c.legs, c.legs_tier);
  pick("boots", c.boots, c.boots_tier);
  pick("spellbook", c.spellbook, 0);
  pick("ring", c.ring, 0);
  pick("amulet", c.amulet, 0);
  for (const line of String(c.imbuements ?? "").split(/\n/)) {
    const [head, rest] = line.split(":");
    if (!rest) continue;
    const slot = SLOT_WORDS[head.trim().toLowerCase()];
    if (!slot) continue;
    for (const part of rest.split("+")) {
      const p = part.trim().toLowerCase();
      const kind = Object.entries(IMB_WORDS).find(([w]) => p.includes(w))?.[1];
      if (!kind) continue;
      const level = p.includes("basic") ? 1 : p.includes("intricate") ? 2 : 3;
      s[slot].imbues.push({ kind, level: level as 1 | 2 | 3 });
    }
  }
  return s;
}

export default async function CharPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; erro?: string }> }) {
  if (!hasSupabaseEnv()) redirect("/entrar");
  const { id } = await params;
  const { salvo, erro } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/entrar?next=/meus-chars/${id}`);

  const { data: c } = await supabase.from("chars").select("*").eq("id", id).single();
  if (!c) notFound();

  return (
    <div>
      <Link href="/meus-chars" className="on-dark text-[12px]">
        ← Meus chars
      </Link>
      <h1 className="mt-2">{c.name}</h1>
      {salvo && <p className="on-dark good mb-3">Salvo.</p>}
      {erro && <p className="on-dark bad mb-3">Não foi possível salvar: {erro}</p>}
      <div className="flex flex-wrap gap-3 mb-4">
        {c.vocation === "sorcerer" ? (
          <>
            <a className="tc-btn" href={`/simulador?level=${c.level}&ml=${c.magic_level}&set=${encodeSet(charToSet(c))}`}>
              Usar este char no simulador de dano
            </a>
            <a className="tc-btn" href={`/simulador/set?voc=sorcerer&level=${c.level}&ml=${c.magic_level}&a=${encodeSet(charToSet(c))}`}>
              Abrir o set no montador
            </a>
          </>
        ) : c.vocation !== "monk" ? (
          <a className="tc-btn" href={`/vocacoes/${c.vocation}?level=${c.level}&ml=${c.magic_level}&skill=${c.skill ?? 0}&atk=${c.weapon_attack ?? 0}`}>
            Usar este char no simulador de dano
          </a>
        ) : null}
        <a className="tc-btn" href={`/planejador/wheel?level=${c.level}&voc=${c.vocation.charAt(0).toUpperCase() + c.vocation.slice(1)}${c.wheel_code && /^[KPSDM][A-Za-z0-9_-]{8,}$/.test(c.wheel_code) ? `&code=${c.wheel_code}` : ""}`}>
          Planejar a Wheel
        </a>
      </div>

      {/* Verificação de dono do char (código no comentário do tibia.com): pronta em startVerify/checkVerify, desligada por decisão de 26/09/2026. */}
      <form action={updateChar} className="max-w-4xl">
        <input type="hidden" name="id" value={c.id} />

        <Box title="Básico">
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              Nome
              <input name="name" required defaultValue={c.name} className="mt-1 w-full" />
            </label>
            <label>
              Vocação
              <select name="vocation" defaultValue={c.vocation} className="mt-1 w-full">
                {Object.entries(VOCATIONS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Level
              <input name="level" type="number" min={1} max={5000} defaultValue={c.level} className="mt-1 w-full" />
            </label>
            <label>
              Magic level
              <input name="magic_level" type="number" min={0} max={300} defaultValue={c.magic_level} className="mt-1 w-full" />
            </label>
            <label>
              Skill principal <span className="muted text-[11px]">(melee do knight, distance do paladin)</span>
              <input name="skill" type="number" min={0} max={300} defaultValue={c.skill ?? 0} className="mt-1 w-full" />
            </label>
            <label>
              Ataque da arma <span className="muted text-[11px]">(knight: físico + elemental; paladin: munição + atk mod)</span>
              <input name="weapon_attack" type="number" min={0} max={300} defaultValue={c.weapon_attack ?? 0} className="mt-1 w-full" />
            </label>
            <label>
              Mundo
              <input name="world" defaultValue={c.world ?? ""} className="mt-1 w-full" />
            </label>
            <label className="flex items-start gap-2 sm:col-span-2 text-[12px]">
              <input type="checkbox" name="public_profile" defaultChecked={Boolean(c.public_profile)} className="mt-0.5" />
              <span>
                Mostrar no mural &quot;Caixão e Vela Preta&quot; e no ranking de XP. Ficam visíveis para todos: nome, mundo, vocação, level, XP
                ganha e mortes.
              </span>
            </label>
          </div>
        </Box>

        <Box title="Set">
          <div className="grid gap-3 sm:grid-cols-2">
            <ItemSelect name="wand" label="Wand" value={c.wand} slot="wand" withTier tier={c.wand_tier} />
            <ItemSelect name="helmet" label="Elmo" value={c.helmet} slot="helmet" withTier tier={c.helmet_tier} />
            <ItemSelect name="armor" label="Armadura" value={c.armor} slot="armor" withTier tier={c.armor_tier} />
            <ItemSelect name="legs" label="Pernas" value={c.legs} slot="legs" withTier tier={c.legs_tier} />
            <ItemSelect name="boots" label="Botas" value={c.boots} slot="boots" withTier tier={c.boots_tier} />
            <ItemSelect name="spellbook" label="Spellbook" value={c.spellbook} slot="spellbook" />
            <ItemSelect name="ring" label="Anel" value={c.ring} slot="ring" />
            <ItemSelect name="amulet" label="Amuleto" value={c.amulet} slot="amulet" />
            <label className="sm:col-span-2">
              Imbuements (um por linha: slot e imbuement)
              <textarea name="imbuements" rows={3} defaultValue={c.imbuements ?? ""} className="mt-1 w-full" placeholder={"Elmo: Powerful Epiphany + Powerful Void\nWand: Powerful Void + Powerful Vampirism"} />
            </label>
          </div>
        </Box>

        <Box title="Wheel of Destiny">
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              Código do planner (tibia.com)
              <input name="wheel_code" defaultValue={c.wheel_code ?? ""} className="mt-1 w-full" placeholder="S0Y2..." />
            </label>
            <label>
              Resumo
              <input name="wheel_summary" defaultValue={c.wheel_summary ?? ""} className="mt-1 w-full" placeholder="Beam Mastery T2 + Energy Wave T1 + Death Echo T1" />
            </label>
            <label className="sm:col-span-2">
              Gemas (uma por linha: domínio, mods, grade)
              <textarea name="gems" rows={4} defaultValue={c.gems ?? ""} className="mt-1 w-full" placeholder={"Sup. direito: Greater Sage, Mana +600 | Energy +2% | RM Beam Mastery (grade I), VR III"} />
            </label>
          </div>
        </Box>

        <Box title="Hunts e notas">
          <div className="grid gap-3">
            <label>
              Hunts que faz e exp/h (uma por linha)
              <textarea name="hunts" rows={4} defaultValue={c.hunts ?? ""} className="mt-1 w-full" placeholder={"Asura Citadel solo: 6,5kk/h\nNorcferatu East (team): 9kk/h"} />
            </label>
            <label>
              Outras notas
              <textarea name="notes" rows={3} defaultValue={c.notes ?? ""} className="mt-1 w-full" />
            </label>
          </div>
        </Box>

        <button className="tc-btn">Salvar</button>
      </form>

      <form action={deleteChar} className="mt-6">
        <input type="hidden" name="id" value={c.id} />
        <button className="tc-btn tc-btn-danger">remover este char</button>
      </form>
    </div>
  );
}
