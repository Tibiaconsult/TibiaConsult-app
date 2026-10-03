// Nomes em português, emoji e cor de cada evento do calendário (tabela tibia_events, 019). Nome oficial em inglês fica no título.

export interface TibiaEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  tentative: boolean;
}

const INFO: Record<string, { pt: string; emoji: string; color: string }> = {
  "Double Experience and Skill Events": { pt: "XP e skill em dobro", emoji: "⚡", color: "#1e8f4e" },
  "Rapid Respawn Events": { pt: "Respawn rápido", emoji: "🔁", color: "#1f6fb5" },
  "Last Creep Standing": { pt: "Last Creep Standing", emoji: "🏟️", color: "#8a4bb8" },
  "A Pirate's Death to Me": { pt: "A Pirate's Death to Me", emoji: "🏴‍☠️", color: "#6b4a2b" },
  "Grimvale Mini World Change": { pt: "Grimvale (lua cheia)", emoji: "🌕", color: "#5b6b7a" },
  Orcsoberfest: { pt: "Orcsoberfest", emoji: "🍺", color: "#b5761f" },
  Halloween: { pt: "Halloween", emoji: "🎃", color: "#d05a14" },
  Christmas: { pt: "Natal", emoji: "🎄", color: "#b01e2e" },
  "Winterlight Solstice": { pt: "Solstício de inverno", emoji: "❄️", color: "#3a8fb7" },
  "Tibia Anniversary": { pt: "Aniversário do Tibia", emoji: "🎂", color: "#c2185b" },
  "The First Dragon Quest": { pt: "The First Dragon", emoji: "🐉", color: "#7a2d2d" },
  "Masquerade Days": { pt: "Dias de Máscara", emoji: "🎭", color: "#7b3fa0" },
  "A Piece of Cake": { pt: "A Piece of Cake", emoji: "🍰", color: "#c46a8a" },
  "Double Daily Reward Month": { pt: "Daily Reward em dobro", emoji: "🎁", color: "#2a8a7a" },
  "The Colours of Magic": { pt: "The Colours of Magic", emoji: "🌈", color: "#4a5fc1" },
  "April's Fools": { pt: "Primeiro de Abril", emoji: "🤡", color: "#c79b00" },
  "Chyllfroest Mini World Change": { pt: "Chyllfroest", emoji: "🧊", color: "#4d8fa8" },
  "Spring into Life": { pt: "Spring into Life", emoji: "🌱", color: "#4f9a3a" },
  "Demon's Lullaby": { pt: "Demon's Lullaby", emoji: "😈", color: "#8b1f1f" },
  "Flower Month": { pt: "Mês das Flores", emoji: "🌸", color: "#c0567f" },
  Bewitched: { pt: "Bewitched", emoji: "🧙", color: "#5a3f8f" },
  "Hot Cuisine Quest": { pt: "Hot Cuisine", emoji: "🍲", color: "#b5461f" },
  "Rise of Devovorga": { pt: "Rise of Devovorga", emoji: "🌋", color: "#6b2a8a" },
  "Annual Autumn Vintage": { pt: "Vindima de Outono", emoji: "🍇", color: "#7a3a5a" },
  "The Lightbearer": { pt: "The Lightbearer", emoji: "🕯️", color: "#b08a1a" },
  "Exaltation Overload": { pt: "Exaltation Overload (forja turbinada)", emoji: "⚒️", color: "#9a5b12" },
  "Game World Merge": { pt: "Fusão de mundos", emoji: "🔀", color: "#4a4a6a" },
};

/** Eventos anunciados nas notícias do tibia.com que a TibiaWiki não lista em "Upcoming Events" (entram junto com a tabela). */
export const ANNOUNCED: TibiaEvent[] = [
  // "Exaltation Overload", 28/09/2026: da server save de 02/10 à de 05/10 (último dia 04/10). Ruse 4% e Transcendence 1,5% para todos, fiendish em dobro, +50% de XP por stack de sinister embrace
  { id: "Exaltation Overload|2026-10-02", name: "Exaltation Overload", start_date: "2026-10-02", end_date: "2026-10-04", tentative: false },
  // "Game World Merge Announcement", 21/09/2026: "on October 22, 2026 at the earliest"
  { id: "Game World Merge|2026-10-22", name: "Game World Merge", start_date: "2026-10-22", end_date: "2026-10-22", tentative: true },
];

/** Junta a tabela com os anunciados que caem no período, sem repetir. */
export function withAnnounced(list: TibiaEvent[], from: string, to = "9999-12-31"): TibiaEvent[] {
  const ids = new Set(list.map((e) => e.id));
  const extra = ANNOUNCED.filter((e) => !ids.has(e.id) && e.end_date >= from && e.start_date <= to);
  return [...list, ...extra].sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export const eventInfo = (name: string) => INFO[name] ?? { pt: name, emoji: "📅", color: "#555" };

/** "2026-10-06" → Date ao meio-dia (evita pular de dia por fuso). */
export const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00");

export const fmtDay = (iso: string) => day(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** Eventos começam no server save (5h de Brasília) e o último dia termina no server save seguinte. */
export const SS_NOTE = "Os eventos viram no server save (5h no horário de Brasília; 6h quando a Europa sai do horário de verão).";

// Categorias das notícias do tibia.com
export const NEWS_CATEGORY: Record<string, { pt: string; emoji: string }> = {
  development: { pt: "Desenvolvimento", emoji: "🛠️" },
  community: { pt: "Comunidade", emoji: "👥" },
  technical: { pt: "Técnico", emoji: "⚙️" },
  support: { pt: "Suporte", emoji: "🛟" },
  cipsoft: { pt: "CipSoft", emoji: "🏢" },
};

/** Limpa o HTML das notícias: só formatação básica, links https e imagens do static.tibia.com. */
export function cleanNewsHtml(html: string): string {
  let s = html
    .replace(/<(script|style|iframe|object|embed|form|noscript)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s(hspace|vspace|align|class|id|width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // imagens: só do static.tibia.com
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /src\s*=\s*"([^"]+)"/i.exec(tag)?.[1] ?? "";
    return /^https:\/\/static\.tibia\.com\//.test(src) ? `<img src="${src}" alt="" loading="lazy">` : "";
  });
  // links: só https, abrindo em nova aba
  s = s.replace(/<a\b[^>]*>/gi, (tag) => {
    const href = /href\s*=\s*"([^"]+)"/i.exec(tag)?.[1]?.replace(/&amp;/g, "&") ?? "";
    return /^https:\/\//.test(href) ? `<a href="${href.replace(/"/g, "%22")}" target="_blank" rel="noopener noreferrer">` : "<a>";
  });
  // demais tags fora da lista viram texto puro
  return s.replace(/<\/?(?!(p|br|b|strong|i|em|u|ul|ol|li|a|img|h[1-6]|table|tbody|thead|tr|td|th|div|span|small)\b)[a-z][^>]*>/gi, "");
}
