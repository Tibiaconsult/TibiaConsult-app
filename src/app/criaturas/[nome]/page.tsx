import Link from "next/link";
import { notFound } from "next/navigation";
import Box from "@/components/Box";
import { CREATURE_DAMAGE } from "@/data/creature-damage";
import {
  ALL_CREATURES,
  ATTACK_ELEMENTS,
  ELEMENT_EMOJI,
  ELEMENT_PT,
  LEVEL_PT,
  RARITY_COLOR,
  RARITY_PT,
  bestiaryOf,
  getCreature,
  huntsOf,
} from "@/lib/creatures";
import { creatureIcon, itemIcon } from "@/lib/icons";

type Props = { params: Promise<{ nome: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return ALL_CREATURES.map((c) => ({ nome: c.name }));
}

const nameOf = (raw: string) => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export async function generateMetadata({ params }: Props) {
  const c = getCreature(nameOf((await params).nome));
  return c ? { title: c.name, description: `${c.name}: ${c.hp} HP, ${c.exp} exp, fraquezas, bestiário e loot.` } : {};
}

const n = (v: number | null) => (v === null ? "?" : v.toLocaleString("pt-BR"));
const RARITY_ORDER = ["always", "common", "uncommon", "semi-rare", "rare", "very rare"];

export default async function CriaturaPage({ params }: Props) {
  const c = getCreature(nameOf((await params).nome));
  if (!c) notFound();
  const b = bestiaryOf(c);
  const hunts = huntsOf(c.name);
  const dmg = CREATURE_DAMAGE[c.name];
  const loot = [...c.loot].sort(
    (a, b2) => (b2.chance ?? -1) - (a.chance ?? -1) || RARITY_ORDER.indexOf(a.rarity ?? "") - RARITY_ORDER.indexOf(b2.rarity ?? ""),
  );
  const wiki = `https://tibia.fandom.com/wiki/${encodeURIComponent(c.page.replace(/ /g, "_"))}`;
  const traits = [
    c.paraimmune ? "Imune a paralisia" : "Pode ser paralisada",
    c.senseinvis ? "Vê invisível" : "Não vê invisível",
    c.pushable ? "Pode ser empurrada" : "Não pode ser empurrada",
    c.walksaround ? `Desvia de campos: ${c.walksaround}` : null,
  ].filter(Boolean);

  return (
    <div>
      <p className="on-dark text-[12px] mb-1">
        <Link href="/criaturas">← Todas as criaturas</Link>
      </p>
      <div className="flex items-center gap-3 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creatureIcon(c.name)}
          alt={c.name}
          width={96}
          height={96}
          className="sprite shrink-0"
          style={{ objectFit: "contain", imageRendering: "pixelated" }}
        />
        <div>
          <h1 className="!mb-1">{c.name}</h1>
          <p className="on-dark text-[13px]">
            {c.cls ?? "?"}
            {c.level ? ` · ${LEVEL_PT[c.level] ?? c.level}` : ""}
            {c.occurrence && c.occurrence !== "Common" ? ` · ${c.occurrence}` : ""}
            {c.location ? ` · ${c.location}` : ""}
          </p>
        </div>
      </div>

      <Box title="📋 Ficha">
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-5 text-center">
          {[
            ["Vida", n(c.hp)],
            ["Experiência", n(c.exp)],
            ["Exp por HP", c.hp && c.exp ? (c.exp / c.hp).toFixed(2) : "?"],
            ["Armadura", n(c.armor)],
            ["Mitigação", c.mitigation === null ? "?" : `${c.mitigation}%`],
          ].map(([l, v]) => (
            <div key={l} className="border border-[#b98a5a] rounded p-2 bg-white/40">
              <div className="muted text-[11px]">{l}</div>
              <div className="font-bold text-[18px] text-[#3a1a00]">{v}</div>
            </div>
          ))}
        </div>
        <p className="text-[12px] mt-2">
          {c.speed ? `Velocidade ${c.speed} · ` : ""}
          {traits.join(" · ")}
        </p>
      </Box>

      <div className="grid gap-4 md:grid-cols-2">
        <Box title="🎯 Dano recebido por elemento">
          <div className="space-y-1">
            {ATTACK_ELEMENTS.map((el) => {
              const v = c.mods[el];
              if (v === undefined) return null;
              const color = v > 100 ? "#3d7a1e" : v < 100 ? "#a33" : "#8a7a5a";
              return (
                <div key={el} className="flex items-center gap-2 text-[12px]">
                  <span className="w-[92px] shrink-0">
                    {ELEMENT_EMOJI[el]} {ELEMENT_PT[el]}
                  </span>
                  <div className="flex-1 h-3 rounded bg-black/10 overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.min(v, 150) / 1.5}%`, background: color }} />
                  </div>
                  <b className="w-[44px] text-right" style={{ color }}>
                    {v}%
                  </b>
                </div>
              );
            })}
          </div>
          <p className="muted text-[11px] mt-2">Acima de 100% = fraqueza (bate mais). Abaixo = resistência. 0% = imune.</p>
        </Box>

        <Box title="📖 Bestiário">
          {b ? (
            <ul className="text-[12px] space-y-1">
              <li>
                Dificuldade: <b>{LEVEL_PT[c.level ?? ""] ?? c.level}</b>
                {c.occurrence ? ` · ocorrência ${c.occurrence}` : ""}
              </li>
              <li>
                Kills por estágio: <b>{n(b.kills[0])}</b> → <b>{n(b.kills[1])}</b> → <b>{n(b.kills[2])}</b> (completo)
              </li>
              <li>
                Charm points ao completar: <b>{b.charms}</b>
              </li>
              <li>
                Acompanhe no <Link href="/ferramentas/bestiario">Bestiary Tracker</Link>.
              </li>
            </ul>
          ) : (
            <p className="text-[12px]">Sem dados de bestiário na wiki.</p>
          )}
        </Box>
      </div>

      {dmg && (dmg.melee || dmg.attacks.length > 0) && (
        <Box title="💥 Ataques">
          <ul className="text-[12px] space-y-0.5">
            {dmg.melee && (
              <li>
                ⚔️ Corpo a corpo: até <b>{n(dmg.melee)}</b>
              </li>
            )}
            {dmg.attacks.map((a, i) => (
              <li key={i}>
                {ELEMENT_EMOJI[a.element] ?? "•"} {a.name}: até <b>{n(a.max)}</b> ({ELEMENT_PT[a.element] ?? a.element})
              </li>
            ))}
          </ul>
        </Box>
      )}

      <Box title={`💰 Loot (${loot.length} itens)`}>
        {loot.length === 0 ? (
          <p className="text-[12px]">A wiki não lista loot para esta criatura.</p>
        ) : (
          <>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {loot.map((it) => (
                <div key={it.name} className="flex items-center gap-2 border border-[#b98a5a]/60 rounded px-2 py-1 bg-white/40 text-[12px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={itemIcon(it.name)} alt="" width={32} height={32} loading="lazy" className="sprite shrink-0" />
                  <span className="flex-1 min-w-0 truncate" title={it.name}>
                    {it.amount ? `${it.amount}x ` : ""}
                    {it.name}
                  </span>
                  {it.rarity && (
                    <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: RARITY_COLOR[it.rarity] ?? "#555" }}>
                      {RARITY_PT[it.rarity] ?? it.rarity}
                    </span>
                  )}
                  {it.chance !== null && <b className="w-[46px] text-right whitespace-nowrap">{it.chance}%</b>}
                </div>
              ))}
            </div>
            {c.kills && (
              <p className="muted text-[11px] mt-2">
                Chance por kill medida pela comunidade em {n(c.kills)} kills (Loot Statistics da TibiaWiki). Sem porcentagem: item sem registro na estatística.
              </p>
            )}
          </>
        )}
      </Box>

      <Box title="🗺️ Onde caçar">
        {hunts.length === 0 ? (
          <p className="text-[12px]">Nenhuma ficha de hunt com esta criatura.</p>
        ) : (
          <ul className="text-[12px] space-y-0.5">
            {hunts.map((h) => (
              <li key={h.id}>
                <Link href={`/hunts?h=${h.id}`}>{h.name}</Link> <span className="muted">({h.city})</span>
              </li>
            ))}
          </ul>
        )}
        <p className="muted text-[11px] mt-2">
          Dados da <a href={wiki}>TibiaWiki</a>.
        </p>
      </Box>
    </div>
  );
}
