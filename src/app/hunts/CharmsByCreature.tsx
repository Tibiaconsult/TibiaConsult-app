"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NumberInput from "@/components/NumberInput";
import type { Hunt } from "@/data/hunts";
import { HUNT_RECS } from "@/data/hunt-recs";
import { ELEMENT_LABEL } from "@/data/spells";
import { VOCS, VOC_LABEL, setActiveVoc, useActive } from "@/lib/active";
import { CHARM_HUNTS, charmsByCreature } from "@/lib/charm-creatures";
import { creatureHref } from "@/lib/creature-labels";
import { creatureIcon } from "@/lib/icons";
import { wikiImage } from "@/lib/md5";
import { createClient } from "@/lib/supabase/client";

const fmt = (v: number) => v.toLocaleString("pt-BR");

function CharmIcon({ name }: { name: string }) {
  if (name === "-") return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={wikiImage(name === "Curse" ? "Curse (Charm)" : name, "png")}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      className="inline-block align-middle mr-1"
    />
  );
}

/** Charms por creature: major de dano e minor em cada uma, e em quem completar o bestiário primeiro. */
export default function CharmsByCreature({ h }: { h: Hunt }) {
  const { voc: activeVoc, char } = useActive();
  const voc = activeVoc ?? "sorcerer";
  const rec = HUNT_RECS[h.id]?.solo[voc];
  const [manualLevel, setManualLevel] = useState<number | null>(null);
  const level = manualLevel ?? (char?.vocation === voc ? char.level : Math.max(rec ?? 600, 600));

  // com char ativo e login: charms que ele já tem (Planejador de charms) e bestiários completos (Bestiary Tracker)
  const [owned, setOwned] = useState<Set<string> | null>(null);
  const [done, setDone] = useState<Set<string> | null>(null);
  const [onlyOwned, setOnlyOwned] = useState(true);
  useEffect(() => {
    if (!char || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let alive = true;
    const sb = createClient();
    Promise.all([
      sb.from("charm_plans").select("plan").eq("char_id", char.id).maybeSingle(),
      sb.from("bestiary_progress").select("creature").eq("char_id", char.id),
    ]).then(([p, b]) => {
      if (!alive) return;
      const plan = (p.data?.plan ?? {}) as Record<string, { have: number }>;
      const have = Object.entries(plan).filter(([, v]) => v.have > 0).map(([k]) => k);
      setOwned(have.length ? new Set(have) : null);
      setDone(new Set((b.data ?? []).map((r) => r.creature as string)));
    });
    return () => {
      alive = false;
    };
  }, [char]);

  const useOwned = Boolean(owned && onlyOwned && char?.vocation === voc);
  const plan = useMemo(() => charmsByCreature(h, voc, level, useOwned ? owned ?? undefined : undefined), [h, voc, level, useOwned, owned]);
  if (!CHARM_HUNTS.has(h.id)) return null;

  const source =
    plan.shareSource === "spawn"
      ? "respawn do mapa"
      : plan.shareSource === "loot"
        ? "proporção de kills nas estatísticas de loot da TibiaWiki (o mapa desta hunt ainda não saiu)"
        : "peso da ficha";

  return (
    <div className="border border-[#b98a5a] rounded p-3 bg-white/40 mt-4">
      <h2 className="mt-0 mb-1">Charms por creature</h2>
      <p className="text-[12px] mb-2">
        Cada creature leva 1 charm major e 1 minor, e cada charm só vai em uma creature. A lista começa pela creature onde você gasta mais dano no lure: é a
        que vale completar o bestiário primeiro.
      </p>

      <div className="flex flex-wrap items-center gap-1 mb-2">
        {VOCS.map((v) => (
          <button key={v} type="button" className={`tc-btn !py-0.5 ${voc === v ? "" : "opacity-60"}`} onClick={() => setActiveVoc(v)}>
            {VOC_LABEL[v]}
          </button>
        ))}
        <label className="text-[12px] ml-1">
          Level{" "}
          <NumberInput className="w-16" value={level} min={8} max={3000} onValue={(v) => setManualLevel(v)} aria-label="Level" />
        </label>
      </div>
      {owned && char?.vocation === voc && (
        <label className="text-[12px] block mb-2">
          <input type="checkbox" checked={onlyOwned} onChange={(e) => setOnlyOwned(e.target.checked)} /> Só os charms que {char.name} já tem (
          <Link href="/ferramentas/charms">Planejador de charms</Link>)
        </label>
      )}

      <ol className="space-y-2 list-none p-0 m-0">
        {plan.rows.map((r, i) => {
          const complete = done?.has(r.name);
          return (
            <li key={r.name} className="border border-[#c9b089] rounded p-2 bg-white/50 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold text-[12px] w-5">{i + 1}.</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creatureIcon(r.name)} alt="" width={32} height={32} loading="lazy" className="sprite" />
                <Link className="font-bold" href={creatureHref(r.name)}>
                  {r.name}
                </Link>
                <span className="muted text-[11px]">
                  {Math.round(r.share * 100)}% dos kills · {Math.round(r.weight * 100)}% do dano do lure · {fmt(r.hp)} de vida
                </span>
              </div>
              <div className="text-[12px] mt-1">
                <b>Major:</b> <CharmIcon name={r.major.charm} />
                <b>{r.major.charm}</b>
                {r.major.el && <span className={`tag tag-${r.major.el} ml-1`}>{ELEMENT_LABEL[r.major.el]}</span>}{" "}
                {r.major.dmg > 0 && (
                  <>
                    tira {fmt(r.major.dmg)} por ativação ({((r.major.dmg / r.hp) * 100).toFixed(1).replace(".", ",")}% da vida)
                    {r.major.capped && <span className="warn"> · {r.major.el ? "limitado a 2x o level" : "no limite de 8% da vida dela"}</span>}
                  </>
                )}
                {r.alt && (
                  <span className="muted">
                    {" "}
                    · {r.alt.takenBy ? `${r.alt.charm} daria ${fmt(r.alt.dmg)}, mas rende mais na ${r.alt.takenBy}` : `alternativa: ${r.alt.charm} (${fmt(r.alt.dmg)})`}
                  </span>
                )}
              </div>
              {r.minor && (
                <div className="text-[12px] mt-0.5">
                  <b>Minor:</b> <CharmIcon name={r.minor} />
                  <b>{r.minor}</b> <span className="muted">· {r.minorWhy}</span>
                </div>
              )}
              {r.bestiary && (
                <div className="text-[11px] mt-0.5">
                  Bestiário:{" "}
                  {complete ? (
                    <span className="good">completo ✓</span>
                  ) : (
                    <>
                      {fmt(r.bestiary.kills)} kills para o major ({fmt(r.bestiary.stage2)} já liberam o minor) e {r.bestiary.points} charm points
                      {done && <span className="warn"> · falta completar</span>}
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {plan.defense && (
        <p className="text-[12px] mt-2">
          <b>Apanhando muito?</b> Troque o major da {plan.defense.name} por <CharmIcon name="Dodge" />
          <b>Dodge</b> (ou Parry): é quem mais bate no lure pelo que a TibiaWiki lista (golpe de até {fmt(plan.defense.maxHit)}).
        </p>
      )}
      {plan.noDamage.length > 0 && (
        <p className="muted text-[11px] mt-1">A TibiaWiki ainda não lista o dano de: {plan.noDamage.join(", ")}. A dica de defesa considera só as outras.</p>
      )}
      <p className="muted text-[10px] mt-2">
        Dano por ativação: 5% da vida da creature, limitado a 2x o level, vezes a resistência dela ao elemento (TibiaWiki, Major Charms). Overflux e Overpower
        usam mana e vida aproximadas pelo level, sem equipamento, e param em 8% da vida da creature. Fração dos kills: {source}.
        {char ? "" : " Com login e char ativo, o quadro marca os bestiários que você já completou e pode usar só os charms que você tem."}
      </p>
    </div>
  );
}
