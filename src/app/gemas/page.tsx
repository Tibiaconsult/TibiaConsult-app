import { BASIC_SLOT1, BASIC_SLOT2, DOMAINS, GEM_BUILDS, GEM_RULES, SUPREME, Mod } from "@/data/gems";

function ModTable({ title, mods }: { title: string; mods: Mod[] }) {
  return (
    <div>
      <h2>{title}</h2>
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
                <td className="text-zinc-100">{m.name}</td>
                {m.grades.map((g, i) => (
                  <td key={i} className={i === 3 ? "text-amber-200" : ""}>
                    {g}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GemasPage() {
  return (
    <div>
      <h1>Gemas da Wheel of Destiny</h1>
      <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
        {GEM_RULES.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <h2>Domínios do sorcerer</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DOMAINS.map((d) => (
          <div key={d.id} className="card">
            <div className="text-xs text-zinc-500">{d.name}</div>
            <div className="font-semibold text-amber-100">{d.revelation}</div>
            <div className="text-xs text-zinc-500">cor: {d.color}</div>
          </div>
        ))}
      </div>

      <ModTable title="Mods básicos: slot 1" mods={BASIC_SLOT1} />
      <ModTable title="Mods básicos: slot 2 (só resistências)" mods={BASIC_SLOT2} />
      <ModTable title="Mods supremos (Greater Sage Gem)" mods={SUPREME} />

      <h2>Combinações recomendadas</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {GEM_BUILDS.map((b) => (
          <div key={b.name} className="card">
            <div className="font-semibold text-amber-100 mb-2">{b.name}</div>
            <ol className="list-decimal pl-5 text-sm text-zinc-300 space-y-1">
              {b.gems.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
