import { IMBUEMENTS, SLOTS } from "@/data/equipment";

export default function EquipamentoPage() {
  return (
    <div>
      <h1>Equipamento por slot</h1>
      <p className="text-sm text-zinc-400">
        Só itens com magic level que sorcerer usa. Classe 4 aceita tier até 10 na forja. Itens marcados são a escolha padrão para 800+.
      </p>
      {SLOTS.map((slot) => (
        <section key={slot.id}>
          <h2>
            {slot.name} <span className="text-xs font-normal text-zinc-500">forja: {slot.forgePerk}</span>
          </h2>
          <p className="text-sm text-zinc-300 mb-2">{slot.advice}</p>
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
                  <tr key={it.name} className={it.best ? "bg-amber-950/30" : ""}>
                    <td className="font-medium text-zinc-100 whitespace-nowrap">
                      {it.best && <span className="text-amber-300 mr-1">★</span>}
                      {it.name}
                    </td>
                    <td>{it.level}</td>
                    <td>{it.arm ?? "-"}</td>
                    <td className="whitespace-nowrap">{it.ml}</td>
                    <td className="text-zinc-300">{it.extras ?? "-"}</td>
                    <td className="text-zinc-300">{it.protection ?? "-"}</td>
                    <td>{it.cls ?? "-"}</td>
                    <td className="text-zinc-400">{it.source ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <h2>Imbuements</h2>
      <table>
        <tbody>
          {IMBUEMENTS.map((i) => (
            <tr key={i.slot}>
              <td className="font-medium text-zinc-100 whitespace-nowrap">{i.slot}</td>
              <td className="text-zinc-300">{i.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
