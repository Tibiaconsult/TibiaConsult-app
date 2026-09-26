import Box from "@/components/Box";
import { IMBUEMENTS, SLOTS } from "@/data/equipment";

export default function EquipamentoPage() {
  return (
    <div>
      <h1>Equipamento por slot</h1>
      <p className="on-dark mb-4">
        Só itens com magic level que sorcerer usa. Classe 4 aceita tier até 10 na forja. Itens marcados com ★ são a escolha padrão para 800+.
      </p>
      {SLOTS.map((slot) => (
        <Box key={slot.id} title={`${slot.name} · forja: ${slot.forgePerk}`}>
          <p className="mb-2">{slot.advice}</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Lv</th>
                  <th>Arm</th>
                  <th>ML</th>
                  <th>Extras</th>
                  <th>Proteção</th>
                  <th>Cl</th>
                  <th>Origem</th>
                </tr>
              </thead>
              <tbody>
                {slot.items.map((it) => (
                  <tr key={it.name}>
                    <td className="font-bold whitespace-nowrap">
                      {it.best && <span className="text-[#b8860b] mr-1">★</span>}
                      {it.name}
                    </td>
                    <td>{it.level}</td>
                    <td>{it.arm ?? "-"}</td>
                    <td className="whitespace-nowrap">{it.ml}</td>
                    <td>{it.extras ?? "-"}</td>
                    <td>{it.protection ?? "-"}</td>
                    <td>{it.cls ?? "-"}</td>
                    <td>{it.source ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      ))}
      <Box title="Imbuements">
        <table>
          <tbody>
            {IMBUEMENTS.map((i) => (
              <tr key={i.slot}>
                <td className="font-bold whitespace-nowrap">{i.slot}</td>
                <td>{i.best}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </div>
  );
}
