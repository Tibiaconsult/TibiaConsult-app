// Rede social com humor: tipos de causo, reações, legendas automáticas das mortes e conquistas do perfil.
// As regras de quem posta, limites e denúncias ficam no banco (supabase/013_rede_social.sql).

export type PostKind = "morte" | "loot" | "perrengue" | "vacilo" | "conquista" | "outro";
export const POST_KINDS: { id: PostKind; label: string; emoji: string; hint: string }[] = [
  { id: "morte", label: "Morte épica", emoji: "💀", hint: "Como foi parar no templo" },
  { id: "loot", label: "Loot", emoji: "💰", hint: "Drop raro, ou a falta dele" },
  { id: "perrengue", label: "Perrengue", emoji: "🔥", hint: "Quase morreu, mas não morreu" },
  { id: "vacilo", label: "Vacilo", emoji: "🤡", hint: "Esqueceu a bless, o utamo, a cabeça" },
  { id: "conquista", label: "Conquista", emoji: "🏆", hint: "Level, quest, boss, bestiário" },
  { id: "outro", label: "Resenha", emoji: "🍺", hint: "Qualquer outra história" },
];
export const kindOf = (k: string) => POST_KINDS.find((x) => x.id === k) ?? POST_KINDS[POST_KINDS.length - 1];

export type ReactionId = "f" | "kkk" | "loot" | "palhaco";
export const REACTIONS: { id: ReactionId; emoji: string; label: string }[] = [
  { id: "f", emoji: "🪦", label: "F" },
  { id: "kkk", emoji: "😂", label: "kkk" },
  { id: "loot", emoji: "💰", label: "Loot!" },
  { id: "palhaco", emoji: "🤡", label: "Palhaço" },
];

/** Chave de uma morte do mural para comentários e reações: nome em minúsculas + segundo da morte. */
export const deathKey = (name: string, diedAt: string) => `${name.toLowerCase()}|${Math.floor(new Date(diedAt).getTime() / 1000)}`;

/** Número estável a partir de um texto: a mesma morte sempre ganha a mesma legenda. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const pick = <T>(arr: T[], seed: string) => arr[hash(seed) % arr.length];

const WEAK = /\b(rat|cave rat|rotworm|troll|wasp|bug|snake|spider|chicken|sheep|deer|rabbit|pig|dog|wolf|bat|frog|orc|goblin|skeleton)\b/i;
const CLASSIC = /\b(dragon|demon|hydra|behemoth|juggernaut|hellhound|serpent spawn|warlock|grim reaper)\b/i;
const FLOOR = /\b(fire field|energy field|poison field|field|drown|drowning|trap|explosion)\b/i;

const GENERIC = [
  "A bless tava em dia? Pergunta pra um amigo.",
  "Culpa do lag, com certeza.",
  "Faltou uma potion. Sempre falta uma potion.",
  "O templo agradece a visita.",
  "Deslogou do jeito mais caro possível.",
  "Pegou o respawn certo na hora errada.",
  "Estava só testando a Wheel, juro.",
  "Um minuto de silêncio pelo loot que ficou no chão.",
  "Faltou o utamo. Ou sobrou coragem.",
  "Foi buscar o bestiário e o bestiário buscou ele.",
];

/** Legenda automática de uma morte do mural. */
export function deathCaption(d: { name: string; died_at: string; reason: string | null; by_player: boolean }): string {
  const seed = d.name + d.died_at;
  const reason = d.reason ?? "";
  const killers = reason
    .replace(/^.*?\bby\b/i, "")
    .split(/,| and /)
    .filter((x) => x.trim());
  if (d.by_player)
    return pick(
      ["Treta confirmada. Anota o nome e segue o baile.", "Morreu pra player: agora é pessoal.", "PK na conta. A vingança é um prato que se come no Thais."],
      seed,
    );
  if (FLOOR.test(reason)) return pick(["O chão sempre vence.", "Perdeu para o piso. Clássico.", "Nem o bicho precisou trabalhar."], seed);
  if (killers.length >= 4)
    return pick(
      ["Trem de monstros: não deu tempo nem de apertar a potion.", "Chamou a festa inteira e a festa veio.", "Lure grande demais, templo perto demais."],
      seed,
    );
  const weak = reason.match(WEAK);
  if (weak) return `Morreu pra ${weak[1].toLowerCase()}. Não tem explicação, só aceitação.`;
  const classic = reason.match(CLASSIC);
  if (classic) return `Clássico. O ${classic[1].toLowerCase()} manda lembranças.`;
  return pick(GENERIC, seed);
}

/** "há 5 min", "há 3 h", "há 2 dias". */
export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "ontem" : `há ${d} dias`;
}

// ---------------------------------------------------------------- conquistas

export interface Profile {
  name: string;
  vocation: string | null;
  level: number | null;
  world: string | null;
  verified_at: string | null;
  deaths: { died_at: string; level: number | null; reason: string | null; by_player: boolean }[];
  snapshots: { date: string; level: number; experience: number }[];
  posts: number;
  clowns: number;
  fs: number;
  /** minutos online nos últimos 30 dias e no mês atual (coleta a cada 5 min) */
  online30: number;
  online_month: number;
  /** primeiro dia com coleta de tempo online no site */
  online_since: string | null;
  /** quantas vezes foi o Funcionário do Mês */
  wins: number;
}

/** 754 → "12 h 34 min" */
export function fmtOnline(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
}

/** Legenda do Funcionário do Mês conforme as horas. */
export function employeeCaption(min: number): string {
  const h = min / 60;
  if (h >= 300) return "Mora no Tibia. A correspondência já chega direto no depot.";
  if (h >= 200) return "Bate ponto mais que CLT. O RH está preocupado.";
  if (h >= 100) return "Dedicação exemplar. A CipSoft agradece a preferência.";
  if (h >= 30) return "Assiduidade de dar inveja. Luz do sol é superestimada.";
  return "Começo de mês: a vaga ainda está em disputa.";
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  text: string;
  earned: boolean;
}

export function achievements(p: Profile): Achievement[] {
  const now = Date.now();
  const days = (iso: string) => (now - new Date(iso).getTime()) / 86400000;
  const deaths7 = p.deaths.filter((d) => days(d.died_at) <= 7).length;
  const deaths30 = p.deaths.filter((d) => days(d.died_at) <= 30).length;
  const byLevel = new Map<number, number>();
  for (const d of p.deaths) if (d.level) byLevel.set(d.level, (byLevel.get(d.level) ?? 0) + 1);
  let bestJump = 0;
  for (let i = 1; i < p.snapshots.length; i++) bestJump = Math.max(bestJump, p.snapshots[i].level - p.snapshots[i - 1].level);

  const list: Omit<Achievement, "earned">[] = [];
  const earned = new Set<string>();
  const add = (id: string, emoji: string, title: string, text: string, ok: boolean) => {
    list.push({ id, emoji, title, text });
    if (ok) earned.add(id);
  };
  add("cova", "🪦", "Pé na Cova", "Morreu 3 vezes em uma semana. O templo já sabe seu nome.", deaths7 >= 3);
  add("templo", "⛪", "Frequentador do Templo", "10 mortes registradas. Cliente fidelidade.", p.deaths.length >= 10);
  add(
    "dejavu",
    "🔁",
    "Déjà vu",
    "Morreu duas vezes no mesmo level. Tá preso no loop.",
    [...byLevel.values()].some((n) => n >= 2),
  );
  add(
    "treta",
    "⚔️",
    "Treta Confirmada",
    "Morreu para outro jogador pelo menos uma vez.",
    p.deaths.some((d) => d.by_player),
  );
  add("imortal", "🛡️", "Imortal (por enquanto)", "30 dias sem morrer. Não comenta, senão dá azar.", deaths30 === 0 && p.snapshots.length >= 7);
  add("bot", "🤖", "Tá de bot?", "Subiu 3 levels ou mais em um dia. Só perguntando.", bestJump >= 3);
  add("lenda", "👑", "Lenda Viva", "Level 1000 ou mais.", (p.level ?? 0) >= 1000);
  add("causos", "📜", "Contador de Causos", "Contou 5 causos na Taverna.", p.posts >= 5);
  add("palhaco", "🤡", "Palhaço da Taverna", "Recebeu 5 reações de palhaço. A galera ama.", p.clowns >= 5);
  add("chorado", "🕯️", "Chorado pela Galera", "Recebeu 5 F nas mortes do mural.", p.fs >= 5);
  add("funcionario", "🏅", "Funcionário do Mês", "Foi o char que mais ficou online num mês. Quadro na parede.", p.wins > 0);
  add("vidasocial", "🦇", "Sem Vida Social", "100 horas online em 30 dias. Lá fora ainda existe, tá?", p.online30 >= 6000);
  add(
    "grama",
    "🌱",
    "Foi Tocar Grama",
    "Menos de 10 horas online em 30 dias. Saudável demais para este jogo.",
    Boolean(p.online_since && days(p.online_since) >= 30 && p.online30 < 600),
  );
  add("novato", "🐣", "Recém-chegado", "Verificou o char nesta semana. Bem-vindo à Taverna.", Boolean(p.verified_at && days(p.verified_at) <= 7));
  return list.map((a) => ({ ...a, earned: earned.has(a.id) }));
}
