import Box from "@/components/Box";
import { BASIC_SLOT1, BASIC_SLOT2, DOMAINS, GEM_BUILDS, GEM_RULES, SUPREME, Mod } from "@/data/gems";

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

export default function GemasPage() {
  return (
    <div>
      <h1>Gemas da Wheel of Destiny</h1>
      <Box title="Como funciona">
        <ul className="list-disc pl-5 space-y-1">
          {GEM_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <h2>Domínios do sorcerer</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d) => (
            <div key={d.id} className="border border-[#b98a5a] rounded p-3 bg-white/40">
              <div className="muted text-[11px]">{d.name}</div>
              <div className="font-bold text-[#3a1a00]">{d.revelation}</div>
              <div className="muted text-[11px]">cor: {d.color}</div>
            </div>
          ))}
        </div>
      </Box>
      <Box title="Mods básicos: slot 1">
        <ModTable mods={BASIC_SLOT1} />
      </Box>
      <Box title="Mods básicos: slot 2 (só resistências)">
        <ModTable mods={BASIC_SLOT2} />
      </Box>
      <Box title="Mods supremos (Greater Sage Gem)">
        <ModTable mods={SUPREME} />
      </Box>
      <Box title="Combinações recomendadas">
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
    </div>
  );
}
