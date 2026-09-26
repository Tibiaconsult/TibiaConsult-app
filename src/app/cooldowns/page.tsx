import Box from "@/components/Box";
import { SPELLS, SUPPORT_SPELLS, ELEMENT_LABEL, SECONDARY_GROUP_LABEL } from "@/data/spells";

export default function CooldownsPage() {
  return (
    <div>
      <h1>Cooldowns do sorcerer</h1>
      <Box title="Feitiços e runas de ataque">
        <p className="mb-3">
          Grupo de ataque: 2 s entre qualquer feitiço ou runa. Hell&apos;s Core e Rage travam por 4 s. Quem divide grupo secundário não pode
          ser usado junto.
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
                  <td className="font-bold">
                    {s.name}
                    {s.notes && <div className="muted font-normal mt-0.5 text-[11px]">{s.notes}</div>}
                  </td>
                  <td className="whitespace-nowrap italic">{s.words}</td>
                  <td>{s.level}</td>
                  <td>{s.mana || "-"}</td>
                  <td>{s.base ?? "-"}</td>
                  <td>{s.element && <span className={`tag tag-${s.element}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                  <td className="whitespace-nowrap">{s.cooldown} s</td>
                  <td>{s.attackLock} s</td>
                  <td className="whitespace-nowrap">{s.secondary ? SECONDARY_GROUP_LABEL[s.secondary.group] : "-"}</td>
                  <td>{s.area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="Suporte e defesa">
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
                  <td className="font-bold whitespace-nowrap">{s.name}</td>
                  <td className="whitespace-nowrap italic">{s.words}</td>
                  <td>{s.mana}</td>
                  <td className="whitespace-nowrap">{s.cooldown}</td>
                  <td>{s.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </div>
  );
}
