"use client";

import { useMemo, useState } from "react";
import { CONVERGENCE_GOLD, FUSION_GOLD, simulateForge } from "@/lib/forge";
import { AMPLIFICATION, MOMENTUM, ONSLAUGHT, RUSE, TRANSCENDENCE } from "@/lib/set";

const kk = (v: number) => (v >= 1e9 ? `${(v / 1e9).toFixed(2)}kkk` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}kk` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : `${Math.round(v)}`);

function num(v: string) {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function ForgeSimulator() {
  const [target, setTarget] = useState(3);
  const [coreS, setCoreS] = useState(false);
  const [coreP, setCoreP] = useState(false);
  const [itemPrice, setItemPrice] = useState("40000000");
  const [corePrice, setCorePrice] = useState("1500000");
  const [dustPrice, setDustPrice] = useState("0");

  const res = useMemo(
    () => simulateForge({ target, coreForSuccess: coreS, coreForProtection: coreP, itemPrice: num(itemPrice), corePrice: num(corePrice), dustPrice: num(dustPrice), runs: 4000 }),
    [target, coreS, coreP, itemPrice, corePrice, dustPrice],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          Tier desejado
          <select className="mt-1 w-full" value={target} onChange={(e) => setTarget(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
              <option key={t} value={t}>
                T{t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preço de 1 item T0 no market (gp)
          <input className="mt-1 w-full" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        </label>
        <label>
          Preço de 1 Exalted Core (gp)
          <input className="mt-1 w-full" value={corePrice} onChange={(e) => setCorePrice(e.target.value)} />
        </label>
        <label>
          Valor de 1 dust (gp, 0 para ignorar)
          <input className="mt-1 w-full" value={dustPrice} onChange={(e) => setDustPrice(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={coreS} onChange={(e) => setCoreS(e.target.checked)} /> Core para subir a chance (50% → 65%)
        </label>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={coreP} onChange={(e) => setCoreP(e.target.checked)} /> Core para proteger na falha (perda 100% → 50%)
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <h2 className="mt-0">Fusão normal (média de 4.000 simulações)</h2>
          <table>
            <tbody>
              <tr>
                <td>Itens T0 comprados</td>
                <td className="font-bold">{res.mean.items.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Fusões</td>
                <td>{res.mean.fusions.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Gold da forja</td>
                <td>{kk(res.mean.gold)}</td>
              </tr>
              <tr>
                <td>Dust</td>
                <td>{Math.round(res.mean.dust)}</td>
              </tr>
              <tr>
                <td>Exalted Cores</td>
                <td>{res.mean.cores.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="font-bold">Custo total esperado</td>
                <td className="font-bold">{kk(res.mean.total)}</td>
              </tr>
              <tr>
                <td>Faixa provável (10% a 90%)</td>
                <td>
                  {kk(res.p10)} a {kk(res.p90)} (mediana {kk(res.p50)})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40">
          <h2 className="mt-0">Convergência (garantida)</h2>
          <table>
            <tbody>
              <tr>
                <td>Itens T0 do mesmo slot</td>
                <td className="font-bold">{res.convergence.items}</td>
              </tr>
              <tr>
                <td>Gold da forja</td>
                <td>{kk(res.convergence.gold)}</td>
              </tr>
              <tr>
                <td>Dust</td>
                <td>{res.convergence.dust}</td>
              </tr>
              <tr>
                <td className="font-bold">Custo total</td>
                <td className="font-bold">{kk(res.convergence.total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="muted text-[11px] mt-2">Convergência aceita itens diferentes do mesmo slot (ex.: dois elmos classe 4 quaisquer), sem risco de perda.</p>
          <p className={res.convergence.total < res.mean.total ? "good mt-2" : "warn mt-2"}>
            {res.convergence.total < res.mean.total ? "Neste cenário a convergência sai mais barata." : "Neste cenário a fusão normal sai mais barata na média."}
          </p>
        </div>
      </div>

      <h2>O que cada tier dá</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Gold fusão</th>
              <th>Gold convergência</th>
              <th>Onslaught (wand)</th>
              <th>Momentum (elmo)</th>
              <th>Ruse (armadura)</th>
              <th>Transcendence (pernas)</th>
              <th>Amplification (botas)</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
              <tr key={t} style={t === target ? { outline: "2px solid #1a6b2d" } : undefined}>
                <td className="font-bold">T{t}</td>
                <td>{kk(FUSION_GOLD[t - 1])}</td>
                <td>{kk(CONVERGENCE_GOLD[t - 1])}</td>
                <td>{ONSLAUGHT[t]}%</td>
                <td>{MOMENTUM[t]}%</td>
                <td>{RUSE[t]}%</td>
                <td>{TRANSCENDENCE[t]}%</td>
                <td>{AMPLIFICATION[t]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="list-disc pl-5 text-[12px]">
        <li>Onslaught: golpe fatal com +60% de dano (média de +{(ONSLAUGHT[target] * 0.6).toFixed(2)}% no T{target}).</li>
        <li>Momentum: a cada 2 s em combate, chance de tirar 2 s dos cooldowns individuais e secundários.</li>
        <li>Transcendence: chance de virar Avatar (estágio 3) por 7 s. Amplification multiplica as outras chances.</li>
        <li>Os bônus de sorte da fusão (item não consumido, tier duplo etc.) não entram: o custo real tende a ficar um pouco abaixo.</li>
      </ul>
    </div>
  );
}
