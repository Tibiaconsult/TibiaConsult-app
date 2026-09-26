import Box from "@/components/Box";
import { ItemSprite } from "@/components/Icons";
import WeaponUpgrades from "@/components/WeaponUpgrades";
import VocTabs from "@/components/VocTabs";
import { ALL_VOCS } from "@/components/voc-list";
import { pageVoc } from "@/lib/active-server";
import { IMBUEMENTS, SLOTS } from "@/data/equipment";
import EquipmentBySlot from "../vocacoes/[voc]/EquipmentBySlot";
import Link from "next/link";

export const metadata = { title: "Equipamento" };

export default async function EquipamentoPage({ searchParams }: { searchParams: Promise<{ voc?: string }> }) {
  const voc = await pageVoc(await searchParams);
  if (voc !== "sorcerer") {
    const label = ALL_VOCS.find(([id]) => id === voc)?.[1] ?? "";
    return (
      <div>
        <h1>Equipamento por slot</h1>
        <VocTabs base="/equipamento" current={voc} />
        <Box title={`Itens de ${label}`}>
          <p className="mb-3 text-[12px]">
            <Link className="tc-btn !py-0.5" href={`/simulador/set?voc=${voc}`}>
              Montar set de {label}
            </Link>{" "}
            <Link className="tc-btn !py-0.5" href="/ferramentas/imbuements">
              Imbuements e materiais
            </Link>
          </p>
          <EquipmentBySlot voc={voc} />
        </Box>
        <Box title="Arma comum x Grand Sanguine e Stellar Moonsilver">
          <WeaponUpgrades voc={voc} />
        </Box>
      </div>
    );
  }
  return (
    <div>
      <h1>Equipamento por slot</h1>
      <VocTabs base="/equipamento" current={voc} />
      <p className="on-dark mb-4">
        Só itens com magic level que sorcerer usa. Classe 4 aceita tier até 10 na forja. Itens marcados com ★ são a escolha padrão para 800+.
      </p>
      {SLOTS.map((slot) => (
        <Box key={slot.id} id={slot.id} title={`${slot.name} · forja: ${slot.forgePerk}`}>
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
                      <ItemSprite name={it.name} />
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
      <Box title="Sanguine Coil x Grand Sanguine Coil e Moonsilver x Stellar Moonsilver">
        <WeaponUpgrades voc="sorcerer" />
      </Box>
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
