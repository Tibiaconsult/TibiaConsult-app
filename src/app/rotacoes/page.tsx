import Box from "@/components/Box";
import { SpellIcon } from "@/components/Icons";
import { ROTATIONS } from "@/data/rotations";
import { spellById } from "@/data/spells";
import { manaPerCycle } from "@/lib/rotation";
import RotationBuilder from "./RotationBuilder";

function Timeline({ steps }: { steps: { t: number; spellId: string; note?: string }[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="w-10">s</th>
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
              <td className="font-mono font-bold">{st.t}</td>
              <td className="font-bold">
                <SpellIcon id={st.spellId} />
                {sp?.name ?? st.spellId}
              </td>
              <td className="italic">{sp?.words}</td>
              <td>{st.note}</td>
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
      <p className="on-dark mb-4">
        Ciclos de 8 s montados pelos cooldowns oficiais. A stance converte o próximo feitiço de outro elemento, e é isso que deixa a Energy Wave
        entrar em qualquer hunt.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {ROTATIONS.map((r) => (
          <Box key={r.id} title={r.name} className="!mb-0">
            <p className="mb-3">{r.description}</p>
            <h2 className="mt-0">Ciclo base</h2>
            <Timeline steps={r.cycle} />
            <div className="muted mt-1 text-[11px]">Mana por ciclo: {manaPerCycle(r.cycle)}</div>
            <h2>Burst (a cada 40 s, 34 s com a Wheel)</h2>
            <Timeline steps={r.burst} />
            <dl className="mt-4 space-y-2">
              <div>
                <dt className="font-bold">Runas</dt>
                <dd>{r.runes}</dd>
              </div>
              <div>
                <dt className="font-bold">Alvo único</dt>
                <dd>{r.singleTarget}</dd>
              </div>
              <div>
                <dt className="font-bold">Wheel</dt>
                <dd>{r.wheel}</dd>
              </div>
            </dl>
          </Box>
        ))}
      </div>
      <div className="mt-6">
        <Box title="Montador de rotação">
          <p className="mb-3">
            Monte a sua sequência. O validador acusa grupo de ataque, cooldown individual e grupo secundário, e mostra o elemento convertido
            pela stance.
          </p>
          <RotationBuilder />
        </Box>
      </div>
    </div>
  );
}
