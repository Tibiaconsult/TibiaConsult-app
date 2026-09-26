import { ROTATIONS } from "@/data/rotations";
import { spellById } from "@/data/spells";
import { manaPerCycle } from "@/lib/rotation";
import RotationBuilder from "./RotationBuilder";

function Timeline({ steps }: { steps: { t: number; spellId: string; note?: string }[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="w-12">s</th>
          <th>Feitiço</th>
          <th>Palavras</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((st, i) => {
          const sp = spellById(st.spellId);
          return (
            <tr key={i}>
              <td className="text-amber-200 font-mono">{st.t}</td>
              <td className="font-medium text-zinc-100">{sp?.name ?? st.spellId}</td>
              <td className="text-zinc-400">{sp?.words}</td>
              <td className="text-zinc-400">{st.note}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function RotacoesPage() {
  return (
    <div>
      <h1>Rotações por elemento</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Ciclos de 8 s montados pelos cooldowns oficiais. A stance converte o próximo feitiço de outro elemento, e é isso que deixa a Energy Wave entrar em qualquer hunt.
      </p>
      <div className="grid gap-6 lg:grid-cols-3">
        {ROTATIONS.map((r) => (
          <section key={r.id} className="card">
            <h2 className="mt-0">{r.name}</h2>
            <p className="text-sm text-zinc-400 mb-3">{r.description}</p>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Ciclo base</div>
            <Timeline steps={r.cycle} />
            <div className="text-xs text-zinc-500 mt-1">Mana por ciclo: {manaPerCycle(r.cycle)}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mt-4 mb-1">Burst (a cada 40 s, 34 s com a Wheel)</div>
            <Timeline steps={r.burst} />
            <dl className="text-sm mt-4 space-y-2">
              <div>
                <dt className="text-zinc-500">Runas</dt>
                <dd className="text-zinc-300">{r.runes}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Alvo único</dt>
                <dd className="text-zinc-300">{r.singleTarget}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Wheel</dt>
                <dd className="text-zinc-300">{r.wheel}</dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
      <h2>Montador de rotação</h2>
      <p className="text-sm text-zinc-400 mb-3">
        Monte a sua sequência. O validador acusa grupo de ataque, cooldown individual e grupo secundário, e mostra o elemento convertido pela stance.
      </p>
      <RotationBuilder />
    </div>
  );
}
