"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemSprite } from "@/components/Icons";
import { IMBUEMENTS, IMBUE_CLEAR, IMBUE_GOLD, IMBUE_HOURS, IMBUE_TIER } from "@/data/imbuements";

const fmt = (v: number) => v.toLocaleString("pt-BR");

type Pick = { tier: number; qty: number };

export default function ImbuementList() {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, Pick>>({});

  // ?sel=id:nível:quantidade,... (nível 0 Basic, 1 Intricate, 2 Powerful), vindo do "Preparar para esta hunt"
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("sel");
    if (!raw) return;
    const next: Record<string, Pick> = {};
    for (const part of raw.split(",")) {
      const [id, tier, qty] = part.split(":");
      if (!IMBUEMENTS.some((x) => x.id === id)) continue;
      next[id] = { tier: Math.min(2, Math.max(0, Number(tier) || 0)), qty: Math.min(20, Math.max(1, Number(qty) || 1)) };
    }
    if (Object.keys(next).length) setCart(next);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const shown = IMBUEMENTS.filter((i) => {
    const t = q.trim().toLowerCase();
    return !t || [i.name, i.pt, i.slots, ...i.materials.map((m) => m.label)].join(" ").toLowerCase().includes(t);
  });

  const shopping = useMemo(() => {
    const mats = new Map<string, { qty: number; item: string }>();
    let gold = 0;
    for (const [id, p] of Object.entries(cart)) {
      const imb = IMBUEMENTS.find((x) => x.id === id);
      if (!imb || p.qty <= 0) continue;
      gold += IMBUE_GOLD[p.tier] * p.qty;
      imb.materials.slice(0, p.tier + 1).forEach((m) => {
        const cur = mats.get(m.label) ?? { qty: 0, item: m.item };
        cur.qty += m.qty * p.qty;
        mats.set(m.label, cur);
      });
    }
    return { mats: [...mats.entries()], gold };
  }, [cart]);

  const setPick = (id: string, p: Pick | null) => {
    const next = { ...cart };
    if (p) next[id] = p;
    else delete next[id];
    setCart(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-4 text-[12px]">
        {IMBUE_TIER.map((t, i) => (
          <div key={t} className="border border-[#b98a5a] rounded p-2 bg-white/40">
            <div className="muted text-[11px]">Taxa {t}</div>
            <div className="font-bold">{fmt(IMBUE_GOLD[i])} gp</div>
          </div>
        ))}
        <div className="border border-[#b98a5a] rounded p-2 bg-white/40">
          <div className="muted text-[11px]">Remover um imbuement</div>
          <div className="font-bold">{fmt(IMBUE_CLEAR)} gp</div>
        </div>
      </div>
      <p className="text-[12px]">
        Cada imbuement dura {IMBUE_HOURS} horas de uso. O nível acima usa os materiais do nível de baixo mais o novo: Powerful pede os três.
        Pernas não aceitam imbuement.
      </p>

      {shopping.mats.length > 0 && (
        <div className="border-2 border-[#5a7d2a] rounded p-3 bg-[#eef3e0]">
          <div className="flex flex-wrap justify-between gap-2 items-center">
            <b>Sua lista de compras</b>
            <button type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={() => setCart({})}>
              limpar
            </button>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2 mt-2 text-[12px]">
            {shopping.mats.map(([label, m]) => (
              <li key={label}>
                <ItemSprite name={m.item} size={24} />
                <b>{fmt(m.qty)}</b> {label}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px]">
            Taxas no shrine: <b>{fmt(shopping.gold)} gp</b>. O preço dos materiais varia por mundo: confira no market.
          </p>
        </div>
      )}

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar por imbuement, efeito, slot ou material (ex.: vampirism, gelo, botas)" className="w-full" />

      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((i) => {
          const pick = cart[i.id];
          return (
            <div key={i.id} id={i.id} className={`scroll-mt-24 border rounded p-3 ${pick ? "border-[#5a7d2a] bg-[#eef3e0]" : "border-[#b98a5a] bg-white/40"}`}>
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-bold text-[#3a1a00] text-[14px]">{i.name}</div>
                  <div className="muted text-[11px]">
                    {i.pt} · {i.slots}
                  </div>
                </div>
              </div>
              <table className="mt-2 w-full">
                <tbody>
                  {IMBUE_TIER.map((t, k) => (
                    <tr key={t}>
                      <td className="whitespace-nowrap font-bold">{t}</td>
                      <td className="text-[11px]">{i.tiers[k]}</td>
                      <td className="text-[11px] whitespace-nowrap">
                        <ItemSprite name={i.materials[k]?.item ?? ""} size={22} />
                        {i.materials[k] ? `+${i.materials[k].qty} ${i.materials[k].label}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap gap-2 items-center mt-2 text-[12px]">
                <span>Na lista:</span>
                <select value={pick ? pick.tier : -1} onChange={(e) => (Number(e.target.value) < 0 ? setPick(i.id, null) : setPick(i.id, { tier: Number(e.target.value), qty: pick?.qty ?? 1 }))}>
                  <option value={-1}>não</option>
                  {IMBUE_TIER.map((t, k) => (
                    <option key={t} value={k}>
                      {t}
                    </option>
                  ))}
                </select>
                {pick && (
                  <label>
                    quantos itens{" "}
                    <input type="number" className="w-16" min={1} value={pick.qty} onChange={(e) => setPick(i.id, { ...pick, qty: Math.max(1, Number(e.target.value) || 1) })} />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted text-[10px]">Fonte: TibiaWiki, página Imbuing (materiais, efeitos, taxas e duração), consulta em 26/09/2026.</p>
    </div>
  );
}
