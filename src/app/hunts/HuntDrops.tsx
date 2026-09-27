import Link from "next/link";
import type { Hunt } from "@/data/hunts";
import { creatureHref } from "@/lib/creature-labels";
import { HuntDrop, huntDrops } from "@/lib/hunt-loot";
import { itemIcon } from "@/lib/icons";
import { fmtK } from "@/lib/huntanalyser";

const pct = (v: number) => `${v >= 10 ? Math.round(v) : v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

function Row({ d }: { d: HuntDrop }) {
  return (
    <tr>
      <td className="whitespace-nowrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={itemIcon(d.item)} alt="" width={24} height={24} loading="lazy" className="sprite inline-block align-middle mr-1" />
        {d.item.replace(/ \((Item|Object)\)$/, "")}
      </td>
      <td>{fmtK(d.value)}</td>
      <td>{pct(d.chance)}</td>
      <td className="text-[11px]">
        {d.from.map((c, i) => (
          <span key={c}>
            {i > 0 && ", "}
            <Link href={creatureHref(c)}>{c}</Link>
          </span>
        ))}
      </td>
    </tr>
  );
}

/** O que paga a hunt: itens que mais rendem em média e os raros caros. */
export default function HuntDrops({ h }: { h: Hunt }) {
  const { top, rare, goldPerKill } = huntDrops(h);
  if (!top.length) return null;
  const itemsPerKill = top.reduce((a, d) => a + d.perKill, 0);
  return (
    <div className="border border-[#b98a5a] rounded p-3 bg-white/40 mt-3">
      <div className="font-bold mb-1">💰 Drops que pagam a hunt</div>
      <p className="text-[12px] mb-2">
        Em média, cada kill do lure rende cerca de <b>{fmtK(Math.round(goldPerKill + itemsPerKill))}</b> em gold e nos itens abaixo (valor de venda, sem contar
        o resto do loot).
      </p>
      <div className="overflow-x-auto">
        <table className="text-[12px]">
          <thead>
            <tr>
              <th>Item</th>
              <th>Valor</th>
              <th>Chance</th>
              <th>Quem dropa</th>
            </tr>
          </thead>
          <tbody>
            {top.map((d) => (
              <Row key={d.item} d={d} />
            ))}
          </tbody>
        </table>
      </div>
      {rare.length > 0 && (
        <>
          <div className="font-bold text-[12px] mt-3 mb-1">💎 Raros que valem o dia</div>
          <div className="overflow-x-auto">
            <table className="text-[12px]">
              <tbody>
                {rare.map((d) => (
                  <Row key={d.item} d={d} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="muted text-[10px] mt-2">
        Chance e valor: TibiaWiki (estatísticas de loot da comunidade; sem estatística, pela raridade). O preço do Market muda: confira antes de vender.
      </p>
    </div>
  );
}
