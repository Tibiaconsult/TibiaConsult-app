"use client";

import { useEffect, useMemo, useState } from "react";
import { itemIcon } from "@/lib/icons";
import { wikiImage } from "@/lib/md5";
import { ProfVoc, scorePerk, suggestPicks } from "@/lib/prof-suggest";

export interface ProfWeapon {
  name: string;
  level: number;
  kind: string;
  hands: string;
  /** perks por nível: [url da imagem, url da sobreposição, texto] */
  levels: [string, string, string][][];
}

// XP por nível (TibiaWiki, Weapon Proficiency, 26/09/2026). Níveis 8 e 9 só dão maestria (título e conquista).
const XP: Record<"standard" | "knight" | "crossbow", number[]> = {
  standard: [1750, 25000, 100000, 400000, 2000000, 8000000, 30000000, 60000000, 90000000],
  knight: [1250, 20000, 80000, 300000, 1500000, 6000000, 20000000, 40000000, 60000000],
  crossbow: [600, 8000, 30000, 150000, 650000, 2500000, 10000000, 20000000, 30000000],
};
// XP por criatura (dificuldade do bestiário), sem e com influência máxima e fiendish
const KILL_XP: [string, number, number, number][] = [
  ["Medium", 100, 150, 250],
  ["Hard", 165, 247, 412],
  ["Challenging", 240, 360, 600],
];
const CATALYSTS: [string, number][] = [
  ["Greater Proficiency Catalyst", 100000],
  ["Proficiency Catalyst", 25000],
  ["Lesser Proficiency Catalyst", 5000],
];
const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
const xpKind = (w: ProfWeapon) => (/Espada|Machado|Clava/.test(w.kind) ? "knight" : /Crossbow/.test(w.kind) ? "crossbow" : "standard");

function PerkIcon({ img, ov, size = 36 }: { img: string; ov: string; size?: number }) {
  return (
    <span className="relative inline-block shrink-0 rounded-sm bg-[#1b140f] border border-[#6b5a3a]" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img && <img src={img} alt="" className="absolute inset-0 m-auto" style={{ maxWidth: size - 4, maxHeight: size - 4, imageRendering: "pixelated" }} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {ov && <img src={ov} alt="" width={14} height={14} className="absolute -top-1 -right-1" style={{ imageRendering: "pixelated" }} />}
    </span>
  );
}

export default function ProfTree({ voc, weapons }: { voc: ProfVoc; weapons: ProfWeapon[] }) {
  const [name, setName] = useState(weapons[0]?.name ?? "");
  const [picks, setPicks] = useState<number[]>([]);
  const [curLevel, setCurLevel] = useState(0);
  const [curXp, setCurXp] = useState(0);
  const [target, setTarget] = useState(7);
  const w = weapons.find((x) => x.name === name) ?? weapons[0];
  const suggestion = useMemo(() => (w ? suggestPicks(voc, w.levels.map((lv) => lv.map((p) => p[2]))) : []), [voc, w]);

  // ?w= e ?p= (link compartilhado)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const wn = u.get("w");
    if (wn && weapons.some((x) => x.name === wn)) setName(wn);
    const p = u.get("p");
    if (p) setPicks(p.split("-").map(Number));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!w) return <p>Nenhuma arma com árvore de proficiência para esta vocação.</p>;
  const chosen = w.levels.map((_, i) => picks[i] ?? -1);
  const maxLvl = w.levels.length;
  const table = XP[xpKind(w)];
  const tgt = Math.min(target, 9);
  const have = (curLevel > 0 ? table[curLevel - 1] : 0) + curXp;
  const need = Math.max(0, table[tgt - 1] - have);
  // catalisadores do maior para o menor; o resto arredonda para cima em Lesser
  const greater = Math.floor(need / 100000);
  const normal = Math.floor((need - greater * 100000) / 25000);
  const lesserRaw = (need - greater * 100000 - normal * 25000) / 5000;
  const cat = [
    [CATALYSTS[0][0], greater],
    [CATALYSTS[1][0], normal],
    [CATALYSTS[2][0], Math.floor(lesserRaw)],
  ] as const;
  const lesserExtra = lesserRaw % 1 > 0 ? 1 : 0;

  const pick = (lvl: number, i: number) => {
    const next = [...chosen];
    next[lvl] = next[lvl] === i ? -1 : i;
    setPicks(next);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("w", w.name);
      u.searchParams.set("p", next.join("-"));
      window.history.replaceState(null, "", u.toString());
    } catch {
      // sem URL
    }
  };

  return (
    <div className="space-y-4 text-[12px]">
      <div>
        <div className="font-bold mb-1">Arma</div>
        <div className="flex flex-wrap gap-1">
          {weapons.map((x) => (
            <button
              key={x.name}
              type="button"
              title={`${x.name} · lv ${x.level} · ${x.kind}${x.hands === "Duas" ? " · duas mãos" : ""}`}
              onClick={() => {
                setName(x.name);
                setPicks([]);
              }}
              className={`tc-item-card w-[46px] h-[46px] grid place-items-center rounded border ${x.name === w.name ? "border-[#ffd700] bg-[#3a2d1f]" : "border-[#5f4d41] bg-[#1b140f]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={itemIcon(x.name)} alt={x.name} width={32} height={32} loading="lazy" style={{ imageRendering: "pixelated" }} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={w.name} src={itemIcon(w.name)} alt="" width={48} height={48} className="tc-equip-pop" style={{ imageRendering: "pixelated" }} />
        <div>
          <div className="font-bold text-[14px] text-[#3a1a00]">{w.name}</div>
          <div className="muted">
            level {w.level} · {w.kind}
            {w.hands === "Duas" ? " · duas mãos" : ""} · {maxLvl} níveis de perk · maestria no nível {maxLvl + 2}
          </div>
        </div>
        <button type="button" className="tc-btn" onClick={() => setPicks(suggestion)}>
          ★ Usar a sugestão
        </button>
        <button type="button" className="tc-btn tc-btn-danger" onClick={() => setPicks([])}>
          limpar
        </button>
      </div>

      {/* árvore: uma coluna por nível, como no jogo */}
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1 p-2 rounded border-2 border-[#5f4d41] bg-[#2b221b]" style={{ gridTemplateColumns: `repeat(${maxLvl}, minmax(150px, 1fr))` }}>
          {w.levels.map((_, i) => (
            <div key={`h${i}`} className="text-center font-bold text-[#ffd700] text-[13px]">
              {i + 1}
            </div>
          ))}
          {w.levels.map((opts, i) => (
            <div key={i} className="flex flex-col gap-1">
              {opts.map(([img, ov, text], k) => {
                const on = chosen[i] === k;
                const sug = suggestion[i] === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pick(i, k)}
                    title={`${text} · ${scorePerk(voc, text).why}`}
                    className={`flex items-center gap-1.5 text-left rounded p-1 border transition ${on ? "border-[#ffd700] bg-[#4a3a22] text-[#fff3c4]" : "border-[#5f4d41] bg-[#1b140f] text-[#d9cbb0] hover:border-[#b98a5a]"}`}
                  >
                    <PerkIcon img={img} ov={ov} />
                    <span className="text-[11px] leading-tight flex-1">{text}</span>
                    {sug && <span className="text-[#ffd700] text-[12px]" title="sugestão do site">★</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border border-[#b98a5a] rounded p-3 bg-white/50">
          <div className="font-bold text-[#3a1a00] mb-1">Perks escolhidos</div>
          {chosen.every((c) => c < 0) ? (
            <p className="muted">Clique num perk em cada nível, ou use a sugestão (★).</p>
          ) : (
            <ol className="list-decimal pl-5 space-y-0.5">
              {chosen.map((c, i) => (
                <li key={i} className={c < 0 ? "muted" : ""}>
                  {c < 0 ? "nenhum" : w.levels[i][c][2]}
                </li>
              ))}
            </ol>
          )}
          <p className="muted text-[10px] mt-2">
            ★ Sugestão do site (não há recomendação oficial): prioriza dano e crítico das magias principais da vocação, crítico geral e o skill ou
            ML dela; depois sustento; por último bônus que só valem contra um tipo de criatura. Passe o mouse no perk para ver o motivo.
          </p>
        </div>

        <div className="border border-[#b98a5a] rounded p-3 bg-white/50 space-y-2">
          <div className="font-bold text-[#3a1a00]">XP de proficiência e catalisadores</div>
          <div className="flex flex-wrap gap-3 items-end">
            <label>
              <span className="font-bold block">Nível atual</span>
              <select value={curLevel} onChange={(e) => setCurLevel(Number(e.target.value))}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="font-bold block">XP já feito no nível</span>
              <input type="number" className="w-28" min={0} value={curXp} onChange={(e) => setCurXp(Number(e.target.value) || 0)} />
            </label>
            <label>
              <span className="font-bold block">Quero chegar no</span>
              <select value={target} onChange={(e) => setTarget(Number(e.target.value))}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <option key={i} value={i + 1}>
                    nível {i + 1}
                    {i + 1 > maxLvl ? " (maestria)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            Faltam <b>{fmt(need)}</b> de XP de proficiência ({xpKind(w) === "knight" ? "tabela de arma de knight" : xpKind(w) === "crossbow" ? "tabela de crossbow" : "tabela padrão"}).
          </div>
          <div className="flex flex-wrap gap-3">
            {cat.map(([n, q]) => (
              <span key={n} className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wikiImage(n)} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
                <b>{q + (n.startsWith("Lesser") ? lesserExtra : 0)}×</b> {n.replace(" Proficiency Catalyst", "").replace("Proficiency Catalyst", "normal")}
              </span>
            ))}
          </div>
          <div className="muted text-[11px]">
            Ou, só matando bichos com a arma na mão:{" "}
            {KILL_XP.map(([d, a, , f]) => `${fmt(need / a)} ${d} (${fmt(need / f)} fiendish)`).join(" · ")}.
          </div>
          <p className="muted text-[10px]">
            Catalisadores: Lesser 5.000, normal 25.000 e Greater 100.000 de XP (TibiaWiki). XP por bicho segue a dificuldade do bestiário; criatura
            influenciada dá +10% por nível de influência e fiendish, bem mais. Só a arma equipada na hora da morte ganha XP.
          </p>
        </div>
      </div>

      <div className="border border-[#b98a5a] rounded p-3 bg-white/50 space-y-1">
        <div className="font-bold text-[#3a1a00] flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wikiImage("Dust")} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />
          Evolução com Dust (Summer Update 2026)
        </div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>
            Dá para trocar até <b>dois perks</b> da árvore desta arma por outros de uma lista grande: o 1º custa <b>250 Dust</b> e exige nível 3; o 2º
            custa <b>1.000 Dust</b> e exige a arma dominada (nível {maxLvl + 2}).
          </li>
          <li>O perk novo sai sorteado no valor mais baixo. Depois dá para refinar (sobe o valor aos poucos, com Dust crescente), maximizar de vez com um item novo de loot, remodelar (sorteia três e você escolhe) ou limpar de graça (volta o perk original).</li>
          <li>Alguns perks do sorteio reforçam magias específicas de cada vocação (mais dano, mais mana ou vida de volta).</li>
          <li>O Dust é do char e não passa para outro; os perks modificados ficam na arma mesmo se o char for vendido. O limite de Dust que o char carrega subiu bastante com a atualização.</li>
        </ul>
        <p className="muted text-[10px]">Fonte: TibiaWiki, Weapon Proficiency e Updates/15.30.a30dad (Summer Update 2026), consulta em 26/09/2026.</p>
      </div>
    </div>
  );
}
