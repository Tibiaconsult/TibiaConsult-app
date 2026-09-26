import { SPELLS, SUPPORT_SPELLS, ELEMENT_LABEL, SECONDARY_GROUP_LABEL } from "@/data/spells";

const ELEMENT_CLASS: Record<string, string> = {
  fire: "bg-orange-900/60 text-orange-200",
  energy: "bg-violet-900/60 text-violet-200",
  death: "bg-zinc-700/70 text-zinc-100",
  ice: "bg-sky-900/60 text-sky-200",
  earth: "bg-green-900/60 text-green-200",
  physical: "bg-stone-700/60 text-stone-100",
  holy: "bg-yellow-900/60 text-yellow-100",
};

export default function CooldownsPage() {
  return (
    <div>
      <h1>Cooldowns do sorcerer</h1>
      <p className="text-sm text-zinc-400 mb-4">
        Grupo de ataque: 2 s entre qualquer feitiço ou runa. Hell&apos;s Core e Rage travam por 4 s. Quem divide grupo secundário não pode ser usado junto.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Feitiço</th>
              <th>Palavras</th>
              <th>Lv</th>
              <th>Mana</th>
              <th>Base</th>
              <th>Elemento</th>
              <th>CD</th>
              <th>Trava ataque</th>
              <th>Grupo secundário</th>
              <th>Área</th>
            </tr>
          </thead>
          <tbody>
            {SPELLS.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-zinc-100">
                  {s.name}
                  {s.notes && <div className="text-xs text-zinc-500 font-normal mt-0.5">{s.notes}</div>}
                </td>
                <td className="text-zinc-400 whitespace-nowrap">{s.words}</td>
                <td>{s.level}</td>
                <td>{s.mana || "-"}</td>
                <td>{s.base ?? "-"}</td>
                <td>{s.element && <span className={`tag ${ELEMENT_CLASS[s.element]}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                <td className="whitespace-nowrap">{s.cooldown} s</td>
                <td>{s.attackLock} s</td>
                <td className="whitespace-nowrap">{s.secondary ? SECONDARY_GROUP_LABEL[s.secondary.group] : "-"}</td>
                <td className="text-zinc-400">{s.area}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Suporte e defesa</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Feitiço</th>
              <th>Palavras</th>
              <th>Mana</th>
              <th>Cooldown</th>
              <th>Efeito</th>
            </tr>
          </thead>
          <tbody>
            {SUPPORT_SPELLS.map((s) => (
              <tr key={s.name}>
                <td className="font-medium text-zinc-100 whitespace-nowrap">{s.name}</td>
                <td className="text-zinc-400 whitespace-nowrap">{s.words}</td>
                <td>{s.mana}</td>
                <td className="whitespace-nowrap">{s.cooldown}</td>
                <td className="text-zinc-300">{s.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
