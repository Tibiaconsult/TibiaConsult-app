// Simulação da forja (Exaltation Forge) para itens de classe 4. Fonte: TibiaWiki, Equipment Upgrade (26/09/2026).
// Fusão: 50% de sucesso (65% com 1 Exalted Core). Na falha, um item é consumido e o outro perde 1 tier
// (ou some, se T0); com core essa perda cai para 50%. Custo: 100 dust + gold por fusão.
// Convergência: garantida, aceita itens diferentes do mesmo slot, 130 dust + gold maior. Bônus de sorte da fusão não entram.

export const FUSION_GOLD = [8_000_000, 20_000_000, 40_000_000, 65_000_000, 100_000_000, 250_000_000, 750_000_000, 2_500_000_000, 8_000_000_000, 15_000_000_000];
export const CONVERGENCE_GOLD = [55_000_000, 110_000_000, 170_000_000, 300_000_000, 875_000_000, 2_350_000_000, 6_950_000_000, 21_250_000_000, 50_000_000_000, 125_000_000_000];
export const FUSION_DUST = 100;
export const CONVERGENCE_DUST = 130;

export interface ForgeParams {
  target: number;
  coreForSuccess: boolean;
  coreForProtection: boolean;
  itemPrice: number;
  corePrice: number;
  dustPrice: number;
  runs: number;
}

export interface ForgeRun {
  gold: number;
  items: number;
  dust: number;
  cores: number;
  fusions: number;
  total: number;
}

export interface ForgeResult {
  mean: ForgeRun;
  p10: number;
  p50: number;
  p90: number;
  convergence: { gold: number; dust: number; items: number; total: number };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulateOnce(p: ForgeParams, rand: () => number): ForgeRun {
  const inv = new Array(11).fill(0);
  const run: ForgeRun = { gold: 0, items: 0, dust: 0, cores: 0, fusions: 0, total: 0 };
  const coresPerFusion = (p.coreForSuccess ? 1 : 0) + (p.coreForProtection ? 1 : 0);
  const success = p.coreForSuccess ? 0.65 : 0.5;
  const loss = p.coreForProtection ? 0.5 : 1;

  function fuse(t: number) {
    run.fusions++;
    run.gold += FUSION_GOLD[t - 1];
    run.dust += FUSION_DUST;
    run.cores += coresPerFusion;
    if (rand() < success) {
      inv[t - 1] -= 2;
      inv[t]++;
    } else {
      inv[t - 1] -= 1;
      if (rand() < loss) {
        inv[t - 1] -= 1;
        if (t - 1 > 0) inv[t - 2]++;
      }
    }
  }

  function ensure(t: number, n: number) {
    while (inv[t] < n) {
      if (t === 0) {
        inv[0]++;
        run.items++;
      } else {
        ensure(t - 1, 2);
        fuse(t);
      }
    }
  }

  ensure(p.target, 1);
  run.total = run.gold + run.items * p.itemPrice + run.cores * p.corePrice + run.dust * p.dustPrice;
  return run;
}

export function simulateForge(p: ForgeParams): ForgeResult {
  const rand = rng(12345 + p.target * 7);
  const runs: ForgeRun[] = [];
  for (let i = 0; i < p.runs; i++) runs.push(simulateOnce(p, rand));
  const mean: ForgeRun = { gold: 0, items: 0, dust: 0, cores: 0, fusions: 0, total: 0 };
  for (const r of runs) for (const k of Object.keys(mean) as (keyof ForgeRun)[]) mean[k] += r[k] / runs.length;
  const totals = runs.map((r) => r.total).sort((a, b) => a - b);
  const q = (x: number) => totals[Math.min(totals.length - 1, Math.floor(x * totals.length))];

  let convGold = 0;
  let convDust = 0;
  for (let t = 1; t <= p.target; t++) {
    const fusions = 2 ** (p.target - t);
    convGold += fusions * CONVERGENCE_GOLD[t - 1];
    convDust += fusions * CONVERGENCE_DUST;
  }
  const convItems = 2 ** p.target;
  return {
    mean,
    p10: q(0.1),
    p50: q(0.5),
    p90: q(0.9),
    convergence: { gold: convGold, dust: convDust, items: convItems, total: convGold + convItems * p.itemPrice + convDust * p.dustPrice },
  };
}

// Gemas: custo de revelar e de subir grade. Fonte: TibiaWiki, Wheel of Destiny (Gem Atelier e Fragment Workshop).
export const GEM_REVEAL = { lesser: 125_000, regular: 1_000_000, greater: 6_000_000 };
export const GEM_GRADE = [
  { grade: 2, fragments: 5, basic: 2_000_000, supreme: 5_000_000 },
  { grade: 3, fragments: 15, basic: 5_000_000, supreme: 12_500_000 },
  { grade: 4, fragments: 30, basic: 30_000_000, supreme: 75_000_000 },
];

export function gemUpgradeCost(kind: "basic" | "supreme", from: number, to: number, fragmentPrice: number) {
  let gold = 0;
  let fragments = 0;
  for (const g of GEM_GRADE) {
    if (g.grade > from && g.grade <= to) {
      gold += kind === "basic" ? g.basic : g.supreme;
      fragments += g.fragments;
    }
  }
  return { gold, fragments, total: gold + fragments * fragmentPrice };
}
