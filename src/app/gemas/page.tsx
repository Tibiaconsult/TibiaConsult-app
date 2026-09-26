import Link from "next/link";
import Box from "@/components/Box";
import VocTabs, { ALL_VOCS, parseVoc } from "@/components/VocTabs";
import { BASIC_SLOT1, BASIC_SLOT2, GEM_BUILDS, GEM_RULES, Mod } from "@/data/gems";
import { WOD_PRESETS } from "@/data/wod-presets";
import { WOD_LARGE, supremeEffect, supremeName } from "@/data/wod-strings";
import { WOD_DOMAINS, WOD_SUPREME } from "@/data/wod-vocs";

export const metadata = { title: "Gemas" };

const DOMAIN_LABEL = ["Superior esquerdo", "Superior direito", "Inferior esquerdo", "Inferior direito"];
const DOMAIN_COLOR = ["#46b21c", "#ae1434", "#198d40", "#841d9e"];
const LESSER = ["Hit Points", "Mitigation", "Any Elemental Resistance", "Mana"];

function ModTable({ mods }: { mods: Mod[] }) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Mod</th>
            <th>Grade I</th>
            <th>Grade II</th>
            <th>Grade III</th>
            <th>Grade IV</th>
          </tr>
        </thead>
        <tbody>
          {mods.map((m) => (
            <tr key={m.name}>
              <td className="font-bold">{m.name}</td>
              {m.grades.map((g, i) => (
                <td key={i} className={i === 3 ? "good" : ""}>
                  {g}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function GemasPage({ searchParams }: { searchParams: Promise<{ voc?: string }> }) {
  const voc = parseVoc((await searchParams).voc);
  const label = ALL_VOCS.find(([id]) => id === voc)?.[1] ?? "";
  const domains = WOD_DOMAINS[voc];
  const supreme: Mod[] = WOD_SUPREME[voc].map((id) => ({
    name: supremeName(id),
    grades: [0, 1, 2, 3].map((g) => supremeEffect(id, g)) as Mod["grades"],
  }));
  const presets = WOD_PRESETS[voc];

  return (
    <div>
      <h1>Gemas da Wheel of Destiny</h1>
      <VocTabs base="/gemas" current={voc} />
      <Box title="Como funciona">
        <ul className="list-disc pl-5 space-y-1">
          {GEM_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <h2>Domínios de {label}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((id, i) => (
            <div key={i} className="border border-[#b98a5a] rounded p-3 bg-white/40" style={{ borderLeft: `4px solid ${DOMAIN_COLOR[i]}` }}>
              <div className="muted text-[11px]">{DOMAIN_LABEL[i]}</div>
              <div className="font-bold text-[#3a1a00]">{WOD_LARGE[id]?.[0]}</div>
              <div className="text-[11px]">{WOD_LARGE[id]?.[1]}</div>
            </div>
          ))}
        </div>
        <p className="mt-3">
          <Link className="tc-btn" href={`/planejador/wheel?voc=${voc === "sorcerer" ? "Sorcerer" : voc[0].toUpperCase() + voc.slice(1)}`}>
            Montar a roda de {label}
          </Link>
        </p>
      </Box>
      <Box title={`Mods supremos de ${label} (Greater Sage Gem)`}>
        <ModTable mods={supreme} />
        <p className="muted text-[10px] mt-2">
          Lista e valores do planner oficial do tibia.com (motor da Wheel), lidos em 26/09/2026. Nos mods de cooldown, subir o grade só soma
          Momentum.
        </p>
      </Box>
      <Box title="Mods básicos: slot 1 (iguais para todas as vocações)">
        <ModTable mods={BASIC_SLOT1} />
      </Box>
      <Box title="Mods básicos: slot 2, só resistências (iguais para todas as vocações)">
        <ModTable mods={BASIC_SLOT2} />
      </Box>
      <Box title="Combinações recomendadas">
        {voc === "sorcerer" ? (
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
        ) : presets ? (
          <div className="space-y-2">
            <p>
              <b>Gemas pequenas:</b> {presets.gems.filter((g) => LESSER.includes(g)).join(", ")}
            </p>
            <p>
              <b>Greater gems:</b> {presets.gems.filter((g) => !LESSER.includes(g)).join(", ")}
            </p>
            <p className="muted text-[10px]">Mods que o TibiaPal (tibiapal.com/wheels) recomenda para {label}, consulta em 26/09/2026.</p>
          </div>
        ) : (
          <p className="muted">Sem recomendação cadastrada.</p>
        )}
      </Box>
    </div>
  );
}
