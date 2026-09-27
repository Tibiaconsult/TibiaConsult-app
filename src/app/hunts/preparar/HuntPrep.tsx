"use client";

import NumberInput from "@/components/NumberInput";
import Link from "next/link";
import { useMemo, useState } from "react";
import Box from "@/components/Box";
import { ItemSprite } from "@/components/Icons";
import SaveToChar from "@/components/SaveToChar";
import ComboPlayer from "@/components/ComboPlayer";
import { sorcererSteps, vocSteps } from "@/lib/player-steps";
import type { Hunt } from "@/data/hunts";
import { HUNT_RECS } from "@/data/hunt-recs";
import { IMBUEMENTS, IMBUE_TIER } from "@/data/imbuements";
import { ELEMENT_LABEL, spellById } from "@/data/spells";
import { VOCATIONS } from "@/data/vocations";
import { VOC_LABEL, useActive } from "@/lib/active";
import { EL_PT, SetVoc, incomingProfile, offenseRanking } from "@/lib/huntset";
import { SORC_STANCE, charmNotes, charmRanking, comboPlan, imbueCartParam, sorcererSet, suggestImbuements, vocBuild } from "@/lib/huntprep";
import { spellIcon } from "@/lib/icons";
import { wikiImage } from "@/lib/md5";
import { computeSet, encodeSet } from "@/lib/set";
import { DAMAGE_LABEL, PROTECTABLE, incomingDamage } from "@/lib/huntdamage";
import { VOC_EQUIPMENT } from "@/data/voc-equipment";
import { encodeBuild } from "@/lib/vocbuild";

const SORC_SLOTS: [string, string][] = [
  ["wand", "Arma"],
  ["spellbook", "Spellbook"],
  ["helmet", "Elmo"],
  ["armor", "Armadura"],
  ["legs", "Pernas"],
  ["boots", "Botas"],
  ["ring", "Anel"],
  ["amulet", "Amuleto"],
];
const SORC_IMB_ID: Record<string, string> = {
  dragonhide: "dragon-hide",
  snakeskin: "snake-skin",
  quarascale: "quara-scale",
  cloudfabric: "cloud-fabric",
  lichshroud: "lich-shroud",
};

// imbuements de proteção no nível Powerful: elemento e % (TibiaWiki, Imbuing)
const PROT_POWERFUL: Record<string, [string, number]> = {
  "lich-shroud": ["death", 10],
  "snake-skin": ["earth", 15],
  "dragon-hide": ["fire", 15],
  "quara-scale": ["ice", 15],
  "cloud-fabric": ["energy", 15],
  "demon-presence": ["holy", 15],
};

function ImbueIcon({ id }: { id: string }) {
  const d = IMBUEMENTS.find((x) => x.id === id);
  if (!d) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={wikiImage(`${IMBUE_TIER[2]} ${d.name}`, "png")}
      alt=""
      title={`Powerful ${d.name}`}
      width={18}
      height={18}
      className="inline-block align-middle rounded-sm border border-black/50"
    />
  );
}

/** Tudo para sair para a hunt: set, imbuements, combo e charm, já na vocação ativa. */
export default function HuntPrep({ h, voc }: { h: Hunt; voc: SetVoc }) {
  const { char } = useActive();
  const own = char && char.vocation === voc ? char : null;
  const rec = HUNT_RECS[h.id]?.solo[voc];
  const [manualLevel, setManualLevel] = useState<number | null>(null);
  const level = manualLevel ?? own?.level ?? Math.max(rec ?? 800, 800);

  const offense = useMemo(() => offenseRanking(h, voc), [h, voc]);
  const incoming = useMemo(
    () => (Object.entries(incomingProfile(h)) as [keyof typeof EL_PT, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]),
    [h],
  );
  const charms = useMemo(() => charmRanking(h), [h]);
  const incomingDmg = useMemo(() => incomingDamage(h, voc), [h, voc]);
  const notes = charmNotes(h);

  const plan = useMemo(() => {
    if (voc === "sorcerer") {
      const { picks } = suggestImbuements(h, "sorcerer");
      const set = sorcererSet(h, level, picks);
      const rows = SORC_SLOTS.map(([slot, label]) => {
        const c = set[slot as keyof typeof set];
        return { label, item: c.item, tier: c.tier, imbues: c.imbues.map((i) => SORC_IMB_ID[i.kind] ?? i.kind) };
      });
      const imbues = rows.flatMap((r) => r.imbues.map((id) => ({ slot: r.label, id })));
      const code = encodeSet(set);
      return {
        prot: computeSet(set).prot as Record<string, number>,
        rows,
        imbues,
        converted: null,
        setHref: `/simulador/set?voc=sorcerer&level=${level}&a=${code}`,
        setSave: `voc=sorcerer&level=${level}&ml=${own?.magic_level ?? 0}&a=${code}`,
      };
    }
    const { build, imbues, converted } = vocBuild(h, voc, level);
    const code = encodeURIComponent(encodeBuild(build));
    // proteção do set: atributos dos itens (TibiaWiki) + imbuements de proteção no nível Powerful
    const prot: Record<string, number> = {};
    for (const p of Object.values(build)) {
      const it = VOC_EQUIPMENT[voc]?.find((r) => r.name === p.item);
      for (const [el, v] of Object.entries(it?.res ?? {})) prot[el] = (prot[el] ?? 0) + v;
      for (const im of p.imbues) if (PROT_POWERFUL[im.id]) prot[PROT_POWERFUL[im.id][0]] = (prot[PROT_POWERFUL[im.id][0]] ?? 0) + PROT_POWERFUL[im.id][1];
    }
    return {
      prot,
      rows: Object.entries(build).map(([label, p]) => ({ label, item: p.item, tier: p.tier, imbues: p.imbues.map((i) => i.id) })),
      imbues: imbues.map((i) => ({ slot: i.slot, id: i.id })),
      converted,
      setHref: `/simulador/set?voc=${voc}&level=${level}&hunt=${h.id}&a=${code}`,
      setSave: `voc=${voc}&level=${level}&a=${code}`,
    };
  }, [h, voc, level, own?.magic_level]);

  const imbueWhy = useMemo(() => {
    const { picks } = suggestImbuements(h, voc);
    return Object.fromEntries(picks.map((p) => [`${p.slot}|${p.id}`, p.why]));
  }, [h, voc]);

  const combo = useMemo(
    () =>
      comboPlan(
        h,
        voc,
        own ? { level, magic_level: own.magic_level, skill: own.skill } : { level, magic_level: 0, skill: null },
        voc === "knight" ? (offense[0]?.el ?? null) : null,
      ),
    [h, voc, own, level, offense],
  );
  const vspells = voc === "sorcerer" ? null : VOCATIONS[voc].spells;
  const spellInfo = (id: string) => {
    if (!vspells) {
      const s = spellById(id);
      return { name: s?.name ?? id, icon: spellIcon(id) };
    }
    const s = vspells.find((x) => x.id === id);
    return { name: s?.name ?? id, icon: s ? `https://static.tibia.com/images/library/${s.icon}.png` : null };
  };

  const stance = voc === "sorcerer" ? (SORC_STANCE[offense[0]?.el] ?? "Master of Thunder") : VOCATIONS[voc].stances[0].name;
  const simHref = `/simulador?voc=${voc}&hunt=${h.id}&level=${level}${own?.magic_level ? `&ml=${own.magic_level}` : ""}${own?.skill ? `&skill=${own.skill}` : ""}`;
  const comboSave = combo ? (voc === "sorcerer" ? combo.query.replace(/^voc=sorcerer&/, "") : combo.query) : "";

  return (
    <div>
      <Box title={`${h.name} · ${VOC_LABEL[voc]}`}>
        <div className="flex flex-wrap gap-4 items-end text-[12px]">
          <label>
            <span className="font-bold block">Level para os itens</span>
            <NumberInput className="w-24" min={8} max={5000} value={level} onValue={setManualLevel} />
          </label>
          <div>
            <b>Recomendado solo:</b> {rec ? `${rec}+` : "não listado para a vocação"}
            {own && rec ? (
              <span className={own.level >= rec ? " good" : " warn"}>
                {" "}
                · {own.name} está no {own.level} {own.level >= rec ? "(dentro)" : `(faltam ${rec - own.level} levels)`}
              </span>
            ) : null}
          </div>
          <div>
            <b>Cidade:</b> {h.city}
          </div>
        </div>
        {!own && (
          <p className="muted text-[11px] mt-2">
            Com login e o char escolhido na barra do topo, o level, o magic level e a skill do seu char entram sozinhos e os botões de salvar gravam no char.
          </p>
        )}
      </Box>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Box title="Elemento e stance" className="!mb-0">
            <p className="text-[12px] mb-2">
              <b>Stance:</b> {stance}
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {offense.slice(0, 4).map((o, i) => (
                <span key={o.el} className={`tag tag-${o.el} ${i === 0 ? "font-bold" : "opacity-80"}`}>
                  {ELEMENT_LABEL[o.el]} {Math.round(o.pct)}%
                </span>
              ))}
            </div>
            <p className="text-[12px]">
              <b>As creatures batem com:</b>{" "}
              {incoming
                .slice(0, 4)
                .map(([el]) => EL_PT[el])
                .join(", ") || "não informado"}
            </p>
            {voc === "sorcerer" && <p className="text-[12px] mt-1">{h.element}</p>}
            {plan.converted && (
              <p className="text-[12px] mt-1">
                Físico entra pouco aqui: vale converter parte do dano da arma para {EL_PT[plan.converted]} com o imbuement de dano.
              </p>
            )}
          </Box>
        </div>

        <div>
          <Box title="Charms" className="!mb-0">
            <table>
              <tbody>
                {charms.slice(0, 3).map((c, i) => (
                  <tr key={c.el}>
                    <td className={i === 0 ? "font-bold" : ""}>{c.charm}</td>
                    <td>
                      <span className={`tag tag-${c.el}`}>{ELEMENT_LABEL[c.el]}</span>
                    </td>
                    <td>
                      média {Math.round(c.avg)}% <span className="muted">({c.min === c.max ? `${c.min}%` : `${c.min} a ${c.max}%`})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {notes.length > 0 && (
              <ul className="list-disc pl-5 mt-2 text-[12px]">
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            <p className="muted text-[10px] mt-1">O charm de dano ignora stance e set: vale o elemento que mais entra, pela média ponderada do lure.</p>
          </Box>
        </div>
      </div>

      <div className="h-4" />
      <Box title="Dano que você toma">
        {incomingDmg.rows.length === 0 ? (
          <p className="text-[12px]">A TibiaWiki ainda não lista o dano dos ataques das creatures desta hunt. Use os elementos acima como guia.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Elemento</th>
                    <th>Maior hit</th>
                    <th>De quem</th>
                    <th>Peso no lure</th>
                    <th>Proteção do set</th>
                    <th>Maior hit com o set</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingDmg.rows.map((r) => {
                    const canProtect = PROTECTABLE.includes(r.el);
                    const pr = canProtect ? (plan.prot[r.el] ?? 0) : null;
                    const weak = canProtect && r.share >= 15 && (pr ?? 0) < 5;
                    return (
                      <tr key={r.el} className={weak ? "bg-[#fff0d0]" : ""}>
                        <td className="font-bold whitespace-nowrap">
                          {canProtect ? <span className={`tag tag-${r.el}`}>{DAMAGE_LABEL[r.el]}</span> : DAMAGE_LABEL[r.el]}
                        </td>
                        <td className="font-bold">{r.maxHit.toLocaleString("pt-BR")}</td>
                        <td className="text-[11px]">
                          {r.creature} · {r.attack}
                        </td>
                        <td>{Math.round(r.share)}%</td>
                        <td className={weak ? "warn font-bold" : ""}>{pr === null ? "não se protege" : `${pr}%`}</td>
                        <td>{pr === null ? "-" : Math.round(r.maxHit * (1 - pr / 100)).toLocaleString("pt-BR")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {incomingDmg.rows.some((r) => PROTECTABLE.includes(r.el) && r.share >= 15 && (plan.prot[r.el] ?? 0) < 5) && (
              <p className="warn text-[12px] mt-2">
                As linhas destacadas pesam no lure e o set quase não protege: vale anel, amuleto ou imbuement desse elemento.
              </p>
            )}
            <p className="muted text-[10px] mt-2">
              Maior valor de cada ataque listado na TibiaWiki, sem crítico nem combo de várias creatures. Peso no lure = maior valor de cada ataque vezes quantos
              dessa creature vêm. Proteção do set sugerido acima (itens e imbuements Powerful), sem a stance e a Wheel.
              {incomingDmg.missing.length > 0 && ` Sem dano na wiki: ${incomingDmg.missing.join(", ")}.`}
            </p>
          </>
        )}
      </Box>
      <div className="h-4" />
      <Box title="Set">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Item</th>
                <th>Imbuements (Powerful)</th>
              </tr>
            </thead>
            <tbody>
              {plan.rows.map((r) => (
                <tr key={r.label}>
                  <td className="muted whitespace-nowrap">{r.label}</td>
                  <td className="font-bold">
                    {r.item ? (
                      <>
                        <ItemSprite name={r.item} size={28} />
                        {r.item}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="text-[11px]">
                    {r.imbues.length
                      ? r.imbues.map((id, k) => (
                          <span key={k} className="inline-flex items-center gap-1 mr-2 whitespace-nowrap">
                            <ImbueIcon id={id} />
                            {IMBUEMENTS.find((x) => x.id === id)?.name ?? id}
                          </span>
                        ))
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 items-center mt-3">
          <a className="tc-btn" href={plan.setHref}>
            Abrir no montador de set
          </a>
          <SaveToChar voc={voc} field="set_code" value={plan.setSave} what="o set" />
        </div>
        <p className="muted text-[10px] mt-2">
          {voc === "sorcerer"
            ? "Parte do set recomendado do Master Sorcerer; as peças trocam pelas de maior proteção contra os ataques da hunt quando o montador conhece o item."
            : "Cada peça é a de maior proteção contra os elementos dos ataques das creatures, entre os itens da vocação até o level escolhido."}{" "}
          Sugestão automática, não um set testado em jogo.
        </p>
      </Box>

      <Box title="Imbuements">
        <ul className="grid gap-1 sm:grid-cols-2 text-[12px]">
          {plan.imbues.map((i, k) => (
            <li key={k} className="flex items-center gap-2">
              <ImbueIcon id={i.id} />
              <span>
                <b>{IMBUEMENTS.find((x) => x.id === i.id)?.name ?? i.id}</b> <span className="muted">no slot {i.slot}</span>
                {imbueWhy[`${i.slot}|${i.id}`] && <span className="muted"> · {imbueWhy[`${i.slot}|${i.id}`]}</span>}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <a className="tc-btn" href={`/ferramentas/imbuements?sel=${imbueCartParam(plan.imbues.map((i) => ({ ...i, why: "" })))}`}>
            Lista de compras desses imbuements
          </a>
        </div>
      </Box>

      <Box title="Combo">
        {combo ? (
          <>
            <p className="text-[12px] mb-2">
              <b>{combo.stance}.</b> {combo.note}
            </p>
            <ol className="flex flex-wrap gap-2">
              {combo.steps.map((s, i) => {
                const sp = spellInfo(s.spellId);
                return (
                  <li key={i} className="border border-[#b98a5a] rounded px-2 py-1 bg-white/40 text-[11px] flex items-center gap-1">
                    <span className="muted">{s.t}s</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {sp.icon && <img src={sp.icon} alt="" width={22} height={22} />}
                    {sp.name}
                  </li>
                );
              })}
            </ol>
            <div className="mt-3">
              <ComboPlayer steps={voc === "sorcerer" ? sorcererSteps(combo.steps) : vocSteps(voc, combo.steps)} />
            </div>
            <div className="flex flex-wrap gap-3 items-center mt-3">
              <a className="tc-btn" href={`/rotacoes?${combo.query}#montador`}>
                Abrir no montador de combos
              </a>
              <SaveToChar voc={voc} field="combo_code" value={comboSave} what="o combo" />
              <a className="tc-btn" href={simHref}>
                Simular o dano nesta hunt
              </a>
            </div>
          </>
        ) : (
          <div className="text-[12px]">
            <p>O combo automático do monk depende da fórmula de dano das magias dele, que não é pública. Monte o seu com o validador de cooldown e Harmony:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link className="tc-btn" href="/rotacoes?voc=monk#montador">
                Montador de combos do monk
              </Link>
              <Link className="tc-btn" href="/vocacoes/monk">
                Magias e Harmony
              </Link>
            </div>
          </div>
        )}
      </Box>

      <Box title="Antes de sair">
        <ul className="list-disc pl-5 space-y-1 text-[12px]">
          {/* as dicas da ficha foram escritas para o sorcerer (stance, feitiços); para as outras vocações fica só o aviso */}
          {voc === "sorcerer" && h.play.filter((p) => !/charm/i.test(p)).map((p) => <li key={p}>{p}</li>)}
          <li>Acesso: {h.access}</li>
          {h.warning && <li className="warn">{h.warning}</li>}
        </ul>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link className="tc-btn" href={`/hunts?h=${h.id}`}>
            Ficha completa da hunt
          </Link>
          <Link className="tc-btn" href="/ferramentas/bestiario">
            Bestiary Tracker
          </Link>
          <Link className="tc-btn" href="/ferramentas/loot">
            Divisão de loot
          </Link>
        </div>
      </Box>
    </div>
  );
}
