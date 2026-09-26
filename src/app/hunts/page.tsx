import Box from "@/components/Box";
import { HUNTS } from "@/data/hunts";

function pct(v: number) {
  const cls = v === 0 ? "bad" : v >= 110 ? "good" : v < 70 ? "warn" : "";
  return <span className={cls}>{v}%</span>;
}

export default function HuntsPage() {
  return (
    <div>
      <h1>Hunts</h1>
      {HUNTS.map((h) => (
        <Box key={h.id} title={`${h.name} · ${h.city}`}>
          <p>{h.access}</p>
          <ul className="list-disc pl-5 mt-2">
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
                    <td className="font-bold whitespace-nowrap">{c.name}</td>
                    <td>{c.hp.toLocaleString("pt-BR")}</td>
                    <td>{c.exp.toLocaleString("pt-BR")}</td>
                    <td>{pct(c.taken.physical)}</td>
                    <td>{pct(c.taken.death)}</td>
                    <td>{pct(c.taken.holy)}</td>
                    <td>{pct(c.taken.ice)}</td>
                    <td>{pct(c.taken.fire)}</td>
                    <td>{pct(c.taken.energy)}</td>
                    <td>{pct(c.taken.earth)}</td>
                    <td>{c.attacks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            <span className="font-bold">Elemento: </span>
            {h.element}
          </p>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <h2 className="mt-0">Set</h2>
              <table>
                <tbody>
                  {h.set.map((s) => (
                    <tr key={s.slot}>
                      <td className="muted whitespace-nowrap">{s.slot}</td>
                      <td className="font-bold">{s.item}</td>
                      <td>{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="mt-0">Como jogar</h2>
              <ul className="list-disc pl-5 space-y-1">
                {h.play.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {h.warning && <p className="warn mt-3">{h.warning}</p>}
            </div>
          </div>
        </Box>
      ))}
    </div>
  );
}
