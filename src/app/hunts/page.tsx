import { HUNTS } from "@/data/hunts";

function pct(v: number) {
  const cls = v === 0 ? "text-red-400" : v >= 110 ? "text-green-300" : v < 70 ? "text-orange-300" : "text-zinc-200";
  return <span className={cls}>{v}%</span>;
}

export default function HuntsPage() {
  return (
    <div>
      <h1>Hunts</h1>
      {HUNTS.map((h) => (
        <section key={h.id} className="card mb-6">
          <h2 className="mt-0">
            {h.name} <span className="text-sm font-normal text-zinc-500">· {h.city}</span>
          </h2>
          <p className="text-sm text-zinc-300">{h.access}</p>
          <ul className="list-disc pl-5 text-sm text-zinc-400 mt-2">
            {h.floors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="overflow-x-auto mt-4">
            <table>
              <thead>
                <tr>
                  <th>Bicho</th>
                  <th>HP</th>
                  <th>Exp</th>
                  <th>Fís</th>
                  <th>Death</th>
                  <th>Holy</th>
                  <th>Gelo</th>
                  <th>Fogo</th>
                  <th>Energia</th>
                  <th>Terra</th>
                  <th>Ataques</th>
                </tr>
              </thead>
              <tbody>
                {h.creatures.map((c) => (
                  <tr key={c.name}>
                    <td className="font-medium text-zinc-100 whitespace-nowrap">{c.name}</td>
                    <td>{c.hp.toLocaleString("pt-BR")}</td>
                    <td>{c.exp.toLocaleString("pt-BR")}</td>
                    <td>{pct(c.taken.physical)}</td>
                    <td>{pct(c.taken.death)}</td>
                    <td>{pct(c.taken.holy)}</td>
                    <td>{pct(c.taken.ice)}</td>
                    <td>{pct(c.taken.fire)}</td>
                    <td>{pct(c.taken.energy)}</td>
                    <td>{pct(c.taken.earth)}</td>
                    <td className="text-zinc-400">{c.attacks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-zinc-500">Elemento: </span>
            <span className="text-amber-100">{h.element}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Set</div>
              <table>
                <tbody>
                  {h.set.map((s) => (
                    <tr key={s.slot}>
                      <td className="text-zinc-500 whitespace-nowrap">{s.slot}</td>
                      <td className="text-zinc-100">{s.item}</td>
                      <td className="text-zinc-400">{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Como jogar</div>
              <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
                {h.play.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {h.warning && <p className="text-sm text-orange-300 mt-3">{h.warning}</p>}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
