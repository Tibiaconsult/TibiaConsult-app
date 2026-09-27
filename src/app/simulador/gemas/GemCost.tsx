"use client";

import { useState } from "react";
import { GEM_GRADE, GEM_REVEAL, gemUpgradeCost } from "@/lib/forge";

const kk = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}kk` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : `${Math.round(v)}`);

type Size = "lesser" | "regular" | "greater";
const MODS: Record<Size, { label: string; basic: number; supreme: number }> = {
  lesser: { label: "Lesser Sage Gem", basic: 1, supreme: 0 },
  regular: { label: "Sage Gem", basic: 2, supreme: 0 },
  greater: { label: "Greater Sage Gem", basic: 2, supreme: 1 },
};

export default function GemCost() {
  const [size, setSize] = useState<Size>("greater");
  const [gemPrice, setGemPrice] = useState("25000000");
  const [fragPriceLesser, setFragPriceLesser] = useState("100000");
  const [fragPriceGreater, setFragPriceGreater] = useState("1500000");
  const [basicTo, setBasicTo] = useState(1);
  const [supremeTo, setSupremeTo] = useState(2);

  const n = (s: string) => Number(s.replace(/\./g, "")) || 0;
  const m = MODS[size];
  const reveal = GEM_REVEAL[size];
  // mods básicos sobem com lesser fragments em qualquer gema; só o supremo usa greater
  const basic = gemUpgradeCost("basic", 1, basicTo, n(fragPriceLesser));
  const supreme = m.supreme ? gemUpgradeCost("supreme", 1, supremeTo, n(fragPriceGreater)) : { gold: 0, fragments: 0, total: 0 };
  const basicTotal = { gold: basic.gold * m.basic, fragments: basic.fragments * m.basic, total: basic.total * m.basic };
  const total = n(gemPrice) + reveal + basicTotal.total + supreme.total;
  const points = (basicTo === 4 ? m.basic : 0) + (m.supreme && supremeTo === 4 ? 1 : 0);
  const capped = m.supreme && supremeTo > basicTo;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          Gema
          <select className="mt-1 w-full" value={size} onChange={(e) => setSize(e.target.value as Size)}>
            {Object.entries(MODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preço da gema no market (gp)
          <input className="mt-1 w-full" value={gemPrice} onChange={(e) => setGemPrice(e.target.value)} />
        </label>
        <label>
          Grade dos mods básicos
          <select className="mt-1 w-full" value={basicTo} onChange={(e) => setBasicTo(Number(e.target.value))}>
            {[1, 2, 3, 4].map((g) => (
              <option key={g} value={g}>
                Grade {["I", "II", "III", "IV"][g - 1]}
              </option>
            ))}
          </select>
        </label>
        {m.supreme > 0 && (
          <label>
            Grade do mod supremo
            <select className="mt-1 w-full" value={supremeTo} onChange={(e) => setSupremeTo(Number(e.target.value))}>
              {[1, 2, 3, 4].map((g) => (
                <option key={g} value={g}>
                  Grade {["I", "II", "III", "IV"][g - 1]}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Preço do lesser fragment (gp)
          <input className="mt-1 w-full" value={fragPriceLesser} onChange={(e) => setFragPriceLesser(e.target.value)} />
        </label>
        <label>
          Preço do greater fragment (gp)
          <input className="mt-1 w-full" value={fragPriceGreater} onChange={(e) => setFragPriceGreater(e.target.value)} />
        </label>
      </div>

      <table>
        <tbody>
          <tr>
            <td>Compra da gema</td>
            <td>{kk(n(gemPrice))}</td>
          </tr>
          <tr>
            <td>Revelar no Gem Atelier</td>
            <td>{kk(reveal)}</td>
          </tr>
          <tr>
            <td>Mods básicos ({m.basic}) até o grade {basicTo}</td>
            <td>
              {kk(basicTotal.gold)} + {basicTotal.fragments} fragmentos lesser
            </td>
          </tr>
          {m.supreme > 0 && (
            <tr>
              <td>Mod supremo até o grade {supremeTo}</td>
              <td>
                {kk(supreme.gold)} + {supreme.fragments} greater fragments
              </td>
            </tr>
          )}
          <tr>
            <td className="font-bold">Total estimado</td>
            <td className="font-bold">{kk(total)}</td>
          </tr>
          <tr>
            <td>Pontos permanentes de Wheel ganhos</td>
            <td>+{points}</td>
          </tr>
        </tbody>
      </table>
      {capped && <p className="warn">O supremo só aproveita grade igual ou menor que o dos básicos: com básicos no grade {basicTo}, o supremo rende como grade {basicTo}.</p>}

      <h2>Tabela oficial de grades</h2>
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Fragmentos</th>
            <th>Gold (básico)</th>
            <th>Gold (supremo)</th>
          </tr>
        </thead>
        <tbody>
          {GEM_GRADE.map((g) => (
            <tr key={g.grade}>
              <td>{["", "I", "II", "III", "IV"][g.grade]}</td>
              <td>{g.fragments}</td>
              <td>{kk(g.basic)}</td>
              <td>{kk(g.supreme)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted text-[11px]">Revelar: 125k lesser, 1kk regular, 6kk greater. Grade IV dá +50% sobre o grade I e 1 ponto permanente na Wheel por mod. Preços de market e de fragmentos variam por mundo: ajuste acima.</p>
    </div>
  );
}
