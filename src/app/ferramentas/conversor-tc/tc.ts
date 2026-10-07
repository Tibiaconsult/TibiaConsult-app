// Conversão Tibia Coins ⇄ gold ⇄ reais. Taxa do Market: 2,5% do valor da oferta, no máximo 2.500.000 gp (tibia.com, 06/10/2026).

export const MARKET_FEE = 0.025;
export const MARKET_FEE_CAP = 2_500_000;
export const PACKS = [1, 25, 250, 1000] as const;

/** taxa que o Market cobra para criar uma oferta desse valor total */
export const marketFee = (gold: number) => Math.min(MARKET_FEE_CAP, Math.max(0, Math.round(gold * MARKET_FEE)));

export function convert(tc: number, gpPerTc: number, brlPerTc: number) {
  const gold = tc * gpPerTc;
  const brl = tc * brlPerTc;
  return {
    tc,
    gold,
    kk: gold / 1e6,
    brl,
    fee: marketFee(gold),
    /** quanto vale 1 kk em reais com esses preços */
    brlPerKk: gpPerTc > 0 ? brlPerTc / (gpPerTc / 1e6) : 0,
    /** quantos kk compra R$ 1 */
    kkPerBrl: brlPerTc > 0 ? gpPerTc / 1e6 / brlPerTc : 0,
  };
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString("pt-BR");
export const fmtKk = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: n >= 100 ? 1 : 2 });
export const fmtBrl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
