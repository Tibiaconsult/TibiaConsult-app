"use client";

// Conversor de Tibia Coins: a pessoa diz quanto a TC vale em gold no mundo dela e quanto cobra em reais; digitando TC, kk
// ou reais, os outros dois campos acompanham. Preços ficam salvos neste navegador.

import { useEffect, useState } from "react";
import Box from "@/components/Box";
import NumberInput from "@/components/NumberInput";
import { itemIcon } from "@/lib/icons";
import { MARKET_FEE_CAP, PACKS, convert, fmtBrl, fmtInt, fmtKk } from "./tc";

const KEY = "tc-conversor";
type Field = "tc" | "kk" | "brl";
type Saved = { gp: number; brl: number; brlPack: number; field: Field; amount: number };
const DEFAULT: Saved = { gp: 40000, brl: 30, brlPack: 250, field: "tc", amount: 250 };

export default function TcConverter() {
  const [s, setS] = useState<Saved>(DEFAULT);
  const [copied, setCopied] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...DEFAULT, ...(JSON.parse(raw) as Partial<Saved>) });
    } catch {
      // sem localStorage: fica o padrão
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = (next: Saved) => {
    setS(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // segue sem salvar
    }
  };

  const brlPerTc = s.brlPack > 0 ? s.brl / s.brlPack : 0;
  // o campo digitado manda; os outros saem dele (TC pode dar fração quando a conta parte de kk ou de reais)
  const tcExact =
    s.field === "tc" ? s.amount : s.field === "kk" ? (s.gp > 0 ? (s.amount * 1e6) / s.gp : 0) : brlPerTc > 0 ? s.amount / brlPerTc : 0;
  const r = convert(tcExact, s.gp, brlPerTc);
  const set = (field: Field) => (amount: number) => save({ ...s, field, amount: Math.max(0, amount) });
  const whole = Math.ceil(tcExact - 1e-9);
  const fractional = Math.abs(tcExact - Math.round(tcExact)) > 1e-6;
  const r2 = (n: number) => Math.round(n * 100) / 100;

  const text = `${fractional ? fmtKk(r.tc) : fmtInt(r.tc)} TC = ${fmtKk(r.kk)} kk = ${fmtBrl(r.brl)} (TC a ${fmtInt(s.gp)} gp; ${fmtBrl(s.brl)} a cada ${fmtInt(s.brlPack)} TC)`;

  return (
    <div>
      <Box title="1. Seus preços">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={itemIcon("Tibia Coins")} alt="" width={24} height={24} className="sprite" />
              Quanto 1 TC vale em gold no seu mundo
            </span>
            <NumberInput className="mt-1 w-40" value={s.gp} min={0} max={10_000_000} onValue={(gp) => save({ ...s, gp })} />
            <span className="muted text-[11px] block mt-1">Veja o preço da TC no Market do seu servidor (gp por 1 TC).</span>
          </label>
          <label className="block">
            <span>Quanto você cobra em reais</span>
            <span className="flex flex-wrap items-center gap-2 mt-1">
              R$
              <NumberInput className="w-28" value={s.brl} min={0} max={1_000_000} step="0.01" onValue={(brl) => save({ ...s, brl })} />a cada
              <select value={s.brlPack} onChange={(e) => save({ ...s, brlPack: Number(e.target.value) })}>
                {PACKS.map((p) => (
                  <option key={p} value={p}>
                    {fmtInt(p)} TC
                  </option>
                ))}
              </select>
            </span>
            <span className="muted text-[11px] block mt-1">= {fmtBrl(brlPerTc)} por TC. Ficam salvos neste aparelho.</span>
          </label>
        </div>
      </Box>

      <Box title="2. Converter">
        <p className="text-[12px] mb-2">Digite em qualquer um dos três campos; os outros acompanham.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            Tibia Coins
            <NumberInput className="mt-1 w-full" value={s.field === "tc" ? s.amount : Math.round(tcExact * 10) / 10} min={0} max={10_000_000} onValue={set("tc")} />
          </label>
          <label className="block">
            Gold (kk)
            <NumberInput className="mt-1 w-full" value={s.field === "kk" ? s.amount : r2(r.kk)} min={0} max={1_000_000} step="0.01" onValue={set("kk")} />
          </label>
          <label className="block">
            Reais (R$)
            <NumberInput className="mt-1 w-full" value={s.field === "brl" ? s.amount : r2(r.brl)} min={0} max={10_000_000} step="0.01" onValue={set("brl")} />
          </label>
        </div>

        <div className="border border-[#b98a5a] rounded p-3 mt-4 bg-white/40">
          <p className="text-[16px] text-[#3a1a00]">
            <b>{fractional ? fmtKk(r.tc) : fmtInt(r.tc)} TC</b> valem <b>{fmtKk(r.kk)} kk</b> ({fmtInt(r.gold)} gp), que valem <b>{fmtBrl(r.brl)}</b>.
          </p>
          {fractional && (
            <p className="text-[12px] mt-1">
              Em TC inteiras: <b>{fmtInt(whole)} TC</b> = {fmtKk(convert(whole, s.gp, brlPerTc).kk)} kk = {fmtBrl(convert(whole, s.gp, brlPerTc).brl)}.
            </p>
          )}
          <p className="text-[12px] mt-2">
            Com esses preços: <b>1 kk = {fmtBrl(r.brlPerKk)}</b> · <b>R$ 1 = {fmtKk(r.kkPerBrl)} kk</b> · <b>100 kk = {fmtBrl(r.brlPerKk * 100)}</b>
          </p>
          <p className="text-[12px] mt-1">
            Vendendo esses {fractional ? fmtKk(r.tc) : fmtInt(r.tc)} TC no Market: a taxa da oferta é <b>{fmtInt(r.fee)} gp</b> (2,5%, no máximo {fmtKk(MARKET_FEE_CAP / 1e6)} kk), então
            sobram <b>{fmtKk((r.gold - r.fee) / 1e6)} kk</b> líquidos.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <code className="text-[11px] bg-white/60 px-2 py-1 rounded break-all">{text}</code>
            <button
              type="button"
              className="tc-btn !py-0.5"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  // sem área de transferência: o texto continua visível para copiar à mão
                }
              }}
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      </Box>

      <Box title="Tabela rápida">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>TC</th>
                <th>Gold</th>
                <th>Reais</th>
              </tr>
            </thead>
            <tbody>
              {[25, 250, 750, 1500, 3000, 5000].map((tc) => {
                const x = convert(tc, s.gp, brlPerTc);
                return (
                  <tr key={tc}>
                    <td>{fmtInt(tc)}</td>
                    <td>{fmtKk(x.kk)} kk</td>
                    <td>{fmtBrl(x.brl)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted text-[10px] mt-2">
          Valores de referência com os preços que você informou. Taxa do Market de 2,5% com teto de 2,5kk, em vigor desde 06/10/2026.
        </p>
      </Box>
    </div>
  );
}
