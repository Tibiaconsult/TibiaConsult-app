// Yasir, o mercador oriental que só aparece de vez em quando (Oriental Trader Mini World Change) e compra creature products.
// No jogo ele só fala a língua dele (TibiaWiki, Yasir/Transcripts); aqui ele fala e o Rashid traduz.
// A piada fixa: do jeito que a turma morre, ele vai ter que aparecer mais vezes pra todo mundo vender loot e pagar a bless do Henricus.

import type { RumorDeath } from "@/lib/rashid";

function hash(s: string): number {
  let h = 23;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const LINES: { yasir: string; pt: (n: string) => string }[] = [
  {
    yasir: "Si! Haneka ariki!",
    pt: () => "do jeito que vocês estão morrendo, vou ter que aparecer mais vezes pra vocês venderem loot e pagarem tanta bless pro Henricus.",
  },
  {
    yasir: "Yasu me halaka! Ariki, ariki!",
    pt: () => "com essa guilda morrendo desse jeito, vou ancorar o barco aqui toda semana. Senão ninguém paga a bless do Henricus.",
  },
  { yasir: "Si, jema ze harun...", pt: (n) => `${n} me vendeu até o demon horn pra pagar a bless. Pelo visto, volto amanhã.` },
  { yasir: "Haneka ariki!", pt: () => "compro seus creature products baratinho. Vocês vão precisar: o Henricus não aceita fiado." },
  {
    yasir: "Soso yana. <balança a cabeça>",
    pt: (n) => `${n} de novo? Vou pedir pra CipSoft um Mini World Change fixo só pra essa guilda.`,
  },
  { yasir: "Yasu me halaka!", pt: () => "o Henricus me mandou cartão de agradecimento. Diz que eu sou o maior patrocinador das bless de vocês." },
  { yasir: "Tje hari ku ne finjala.", pt: (n) => `meu barco virou caixa eletrônico da bless: ${n} saca comigo e deposita no Henricus.` },
  {
    yasir: "Si! Ariki! <esfrega as mãos>",
    pt: () => "eu e o Henricus somos sócios agora. Eu compro o loot de vocês, ele vende a bless. Vocês só entram com a morte.",
  },
];

/** Fala do Yasir em algumas mortes: sempre em quem morreu 4+ vezes em 30 dias, e em cerca de 1 a cada 4 das outras. */
export function yasirLine(d: RumorDeath & { month_deaths?: number }): { yasir: string; pt: string } | null {
  const h = hash(d.died_at + d.name);
  if ((d.month_deaths ?? 0) < 4 && h % 4 !== 0) return null;
  const l = LINES[(h >> 3) % LINES.length];
  return { yasir: l.yasir, pt: l.pt(d.name) };
}

/** Falas soltas do Yasir para o banner. */
export const YASIR_SAYS = [
  "Yasu me halaka! (Rashid traduz: “com tanta morte, vou ter que vir mais vezes.”)",
  "Si! Haneka ariki! (“Vende o loot, paga a bless.”)",
];
