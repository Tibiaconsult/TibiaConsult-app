// Level up na Taverna: o Rashid comemora os marcos de 50 em 50 (50, 100, 150...) sem perder a chance de zoar.
// Sempre a mesma frase para o mesmo char e level.

export interface LevelUp {
  name: string;
  level: number;
  from_level: number;
  milestone: number | null;
  at: string;
  guild: string | null;
  vocation: string | null;
  world: string | null;
  month_deaths: number;
}

/** Chave do level up para comentários e reações: nome em minúsculas + "lvl" + level. */
export const levelKey = (name: string, level: number) => `${name.toLowerCase()}|lvl${level}`;

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type Line = (n: string, l: number, d: number) => string;

const GENERIC: Line[] = [
  (n, l) => `${n} chegou no ${l}! Agora morre com mais dignidade.`,
  (n, l) => `Level ${l}! ${n} vai comemorar do jeito tradicional: morrendo na primeira hunt nova.`,
  (n, l) => `Parabéns, ${n}! Level ${l}. O Henricus mandou flores e o boleto da bless.`,
  (n, l) => `${n} bateu ${l}. A bless ficou mais cara, mas quem liga, né?`,
  (n, l) => `${n} no ${l}! Vou contar pra todo mundo. Dessa vez é notícia boa, até estranhei.`,
  (n, l) => `Level ${l} pra ${n}. E nem morreu no caminho. Estou tão orgulhoso quanto confuso.`,
  (n, l) => `${n} passou do ${l}. Dizem que foi skill. Eu acho que foi o Rapid Respawn.`,
  (n, l) => `${n} chegou no ${l} e já está dizendo que o spawn ficou pequeno pra ele.`,
  (n, l) => `${n} fez ${l}! Os rats de Thais decretaram luto oficial.`,
  (n, l) => `${n} agora é ${l}. A esposa ainda não sabe quantas horas isso custou.`,
  (n, l) => `Level ${l}! ${n} jurou que agora compra bless antes de toda hunt. Anotei aqui pra cobrar.`,
  (n, l) => `${n} no ${l}. Pode pagar a rodada, que level up na minha taverna tem preço.`,
  (n, l) => `${n} fez ${l} e o Yasir já subiu o preço de tudo que compra. Coincidência? Acho que não.`,
  (n, l) => `Level ${l}! ${n} já está olhando o Bazaar pra ver quanto o char vale. Não vende, não, fica pra gente zoar.`,
];

// subiu mesmo morrendo muito no mês
const STUBBORN: Line[] = [
  (n, l, d) => `${n} fez ${l} mesmo com ${d} mortes no mês. Isso não é level up, é teimosia.`,
  (n, l, d) => `${l} depois de ${d} mortes esse mês. O Henricus perdeu um cliente? Não, é só uma pausa.`,
  (n, l, d) => `${n} chegou no ${l}. Com ${d} mortes no mês, foi mais sobe e desce que elevador de Venore.`,
];

// marcos grandes
const BIG: Line[] = [
  (n, l) => `${n} chegou no ${l}. A partir de agora cada morte dói no bolso e na alma.`,
  (n, l) => `${l}! ${n} já pode andar em Thais de nariz empinado. O Bozo já está preparando as piadas.`,
  (n, l) => `Level ${l} pra ${n}. Até o Henricus aplaudiu, e ele só aplaude quando alguém morre.`,
];

/** Frase do Rashid para um level up. */
export function levelLine(u: Pick<LevelUp, "name" | "level" | "month_deaths">): string {
  const h = hash(u.name.toLowerCase() + u.level);
  const pool = u.month_deaths >= 2 && h % 2 === 0 ? STUBBORN : u.level >= 500 && h % 3 === 0 ? BIG : GENERIC;
  return pool[h % pool.length](u.name, u.level, u.month_deaths);
}
