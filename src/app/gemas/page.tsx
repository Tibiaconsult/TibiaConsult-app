import Link from "next/link";
import Box from "@/components/Box";
import VocTabs from "@/components/VocTabs";
import { ALL_VOCS } from "@/components/voc-list";
import { WodIcon } from "@/components/WodIcons";
import { GEM_BUILDS, GEM_RULES } from "@/data/gems";
import { BASIC_MODS, GEM_ITEM, GEM_RECS, GEM_TIERS, GRADE_MULT, GemRec } from "@/data/gem-data";
import { WOD_BASIC, WOD_LARGE, formatGem, supremeEffect, supremeName } from "@/data/wod-strings";
import { WOD_DOMAINS, WOD_SUPREME } from "@/data/wod-vocs";
import { pageVoc } from "@/lib/active-server";
import { wikiImage } from "@/lib/md5";

export const metadata = { title: "Gemas" };

const DOMAIN_LABEL = ["Superior esquerdo", "Superior direito", "Inferior esquerdo", "Inferior direito"];
const DOMAIN_COLOR = ["#46b21c", "#ae1434", "#198d40", "#841d9e"];
const GRADES = ["I", "II", "III", "IV"];

/** Texto de um mod básico no grau pedido (a penalidade negativa não sobe com o grau). */
function basicText(effects: [number, number][], grade: number) {
  return effects
    .map(([id, v]) => {
      const [name, fmt] = WOD_BASIC[id] ?? [`efeito ${id}`, ""];
      const val = v < 0 ? v : Math.round(v * GRADE_MULT[grade] * 100) / 100;
      return `${formatGem(fmt, val).replace("+-", "-")} ${name}`;
    })
    .join(" / ");
}
const basicName = (effects: [number, number][]) => effects.map(([id, v]) => `${v < 0 ? "−" : ""}${WOD_BASIC[id]?.[0] ?? id}`).join(" + ");

function Gem({ src, size = 32 }: { src: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className="inline-block align-middle" style={{ imageRendering: "pixelated" }} />;
}

export default async function GemasPage({ searchParams }: { searchParams: Promise<{ voc?: string }> }) {
  const voc = await pageVoc(await searchParams);
  const label = ALL_VOCS.find(([id]) => id === voc)?.[1] ?? "";
  const gem = GEM_ITEM[voc];
  const domains = WOD_DOMAINS[voc];
  const supIds = WOD_SUPREME[voc];
  const recs = GEM_RECS[voc];
  const recSup = (r: GemRec) => supIds.filter((id) => r.supreme?.(supremeName(id), supremeEffect(id, 0)));
  const wheelVoc = voc[0].toUpperCase() + voc.slice(1);

  return (
    <div>
      <h1>Gemas da Wheel of Destiny</h1>
      <VocTabs base="/gemas" current={voc} />

      <Box title={`As gemas de ${label}: ${gem}`}>
        <div className="grid gap-3 sm:grid-cols-3">
          {GEM_TIERS.map((t) => (
            <div key={t.label} className="border border-[#b98a5a] rounded p-3 bg-white/50 flex gap-3 items-start">
              <div className="shrink-0 grid place-items-center w-[52px] h-[52px] rounded bg-[#1b140f] border border-[#5f4d41]">
                <Gem src={wikiImage(`${t.prefix}${gem} Gem`)} size={40} />
              </div>
              <div className="text-[12px]">
                <div className="font-bold text-[#3a1a00] text-[13px]">
                  {t.prefix}
                  {gem} Gem
                </div>
                <div>{t.mods}</div>
                <div>
                  Casa com <b>{t.vr}</b>
                </div>
                <div className="muted">Cai de {t.drop}. Revelar: {t.reveal}.</div>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto mt-3">
          <table>
            <thead>
              <tr>
                <th>Fragment Workshop</th>
                <th>Fragmentos</th>
                <th>Gold (mod básico)</th>
                <th>Gold (mod supremo)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Grau I → II", "5", "2.000.000", "5.000.000"],
                ["Grau II → III", "15", "5.000.000", "12.500.000"],
                ["Grau III → IV", "30", "30.000.000", "75.000.000"],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <td key={i} className={i === 0 ? "font-bold" : ""}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted text-[10px] mt-1">
            Triturar gema não revelada: lesser 1 a 4 e regular 2 a 8 Lesser Fragments; greater 1 a 4 Greater Fragments. Desmontar gema revelada: 1 a
            5, 2 a 10 e 1 a 5. Fonte: TibiaWiki, Wheel of Destiny (Fragment Workshop), 26/09/2026.
          </p>
        </div>
        <ul className="list-disc pl-5 space-y-1 mt-3 text-[12px]">
          {GEM_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-4 items-center mt-3 text-[12px]">
          <span className="flex items-center gap-1">
            <Gem src={wikiImage("Lesser Fragment")} /> Lesser Fragment: sai ao triturar ou desmontar gemas lesser e regular
          </span>
          <span className="flex items-center gap-1">
            <Gem src={wikiImage("Greater Fragment")} /> Greater Fragment: sai das gemas greater
          </span>
          <Link className="tc-btn" href={`/planejador/wheel?voc=${wheelVoc}`}>
            Encaixar gemas na roda de {label}
          </Link>
        </div>
      </Box>

      <Box title={`Sugestão para ${label}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="!mt-0">Mods básicos</h2>
            <ul className="space-y-2">
              {recs.basic.map((r) => (
                <li key={r.label} className="flex items-center gap-2 text-[12px]">
                  <span className="flex gap-0.5">
                    {r.basic!.map((id) => (
                      <WodIcon key={id} sheet="basic" index={id} title={basicName(BASIC_MODS.find((m) => m.id === id)?.effects ?? [])} />
                    ))}
                  </span>
                  <span>
                    <b>{r.label}</b>
                    <span className="muted">
                      {" "}
                      · grau IV:{" "}
                      {r.basic!.length > 1 ? "+3% no elemento escolhido (fogo, terra, gelo ou energia)" : basicText(BASIC_MODS.find((m) => m.id === r.basic![0])?.effects ?? [], 3)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="!mt-0">Mods supremos (Greater)</h2>
            <ul className="space-y-2">
              {recs.supreme.map((r) =>
                recSup(r).map((id) => (
                  <li key={r.label + id} className="flex items-center gap-2 text-[12px]">
                    <WodIcon sheet="supreme" index={id} title={supremeName(id)} />
                    <span>
                      <b>{r.label}</b>
                      <span className="muted"> · grau IV: {supremeEffect(id, 3)}</span>
                    </span>
                  </li>
                )),
              )}
            </ul>
            {recs.missing?.map((m) => (
              <p key={m} className="muted text-[11px] mt-2">
                {m}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-3 text-[12px] border-t border-[#d9c39a] pt-2">
          <b>Como montar:</b> a Greater vai no domínio em que o Vessel Resonance chega ao III (normalmente o da revelation que você mais usa), com
          {recs.basic.some((r) => r.label === "Mana") ? " Mana ou Hit Points" : " Hit Points"} no encaixe 1, a resistência da hunt no encaixe 2 e
          um dos supremos acima. Lesser e regular nos outros domínios, com Mitigation ou Hit Points e resistência.
        </div>
        <p className="muted text-[10px] mt-2">Mods recomendados pelo TibiaPal (tibiapal.com/wheels), ligados aos mods do planner oficial. Consulta em 26/09/2026.</p>
      </Box>

      <Box title={`Domínios de ${label}`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((id, i) => (
            <div key={i} className="border border-[#b98a5a] rounded p-3 bg-white/40 flex gap-2 items-start" style={{ borderLeft: `4px solid ${DOMAIN_COLOR[i]}` }}>
              <WodIcon sheet="large" index={id} title={WOD_LARGE[id]?.[0]} />
              <div>
                <div className="muted text-[11px]">{DOMAIN_LABEL[i]}</div>
                <div className="font-bold text-[#3a1a00]">{WOD_LARGE[id]?.[0]}</div>
                <div className="text-[11px]">{WOD_LARGE[id]?.[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </Box>

      <Box title={`Mods supremos de ${label} (Greater ${gem} Gem)`}>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Mod</th>
                {GRADES.map((g) => (
                  <th key={g}>Grau {g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supIds.map((id) => {
                const rec = recs.supreme.some((r) => r.supreme?.(supremeName(id), supremeEffect(id, 0)));
                return (
                  <tr key={id} className={rec ? "bg-[#fff4cf]" : ""}>
                    <td className="font-bold whitespace-nowrap">
                      <WodIcon sheet="supreme" index={id} size={28} /> {supremeName(id)} {rec && <span className="good text-[10px]">★ sugerido</span>}
                    </td>
                    {[0, 1, 2, 3].map((g) => (
                      <td key={g} className={g === 3 ? "good" : ""}>
                        {supremeEffect(id, g)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted text-[10px] mt-1">Lista, ícones e valores do planner oficial do tibia.com. Nos mods de cooldown, subir o grau só soma Momentum.</p>
      </Box>

      <Box title="Mods básicos (iguais para as cinco vocações)">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Mod</th>
                <th>Encaixe</th>
                {GRADES.map((g) => (
                  <th key={g}>Grau {g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BASIC_MODS.map((m) => {
                const rec = recs.basic.some((r) => r.basic?.includes(m.id));
                return (
                  <tr key={m.id} className={rec ? "bg-[#fff4cf]" : ""}>
                    <td className="font-bold whitespace-nowrap">
                      <WodIcon sheet="basic" index={m.id} size={26} /> {basicName(m.effects)} {rec && <span className="good text-[10px]">★</span>}
                    </td>
                    <td>{m.pos.join(" e ")}</td>
                    {[0, 1, 2, 3].map((g) => (
                      <td key={g} className={`whitespace-nowrap ${g === 3 ? "good" : ""}`}>
                        {basicText(m.effects, g)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted text-[10px] mt-1">
          Encaixe 1 aceita vida, mana, capacidade (puros ou com uma resistência), resistência elemental e Mitigation; o encaixe 2 só resistências.
          Valores do grau IV lidos do motor oficial; graus I a III pela proporção oficial (grau IV = +50% sobre o I). Penalidades não mudam com o grau.
        </p>
      </Box>

      {voc === "sorcerer" && (
        <Box title="Combinações do sorcerer">
          <div className="grid gap-4 md:grid-cols-2">
            {GEM_BUILDS.map((b) => (
              <div key={b.name} className="border border-[#b98a5a] rounded p-3 bg-white/40">
                <div className="font-bold text-[#3a1a00] mb-2">{b.name}</div>
                <ol className="list-decimal pl-5 space-y-1">
                  {b.gems.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Box>
      )}
    </div>
  );
}
