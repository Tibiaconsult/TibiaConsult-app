// Leitura do "Copy to Clipboard" do Hunt Analyser (solo) do cliente do Tibia e detecção da hunt pelas creatures mortas.
// Formato esperado (tolerante a espaços, vírgulas e pontos):
//   Session data: From 2026-09-26, 19:14:39 to 2026-09-26, 20:27:12
//   Session: 01:12h
//   Raw XP Gain: 3,195,340
//   XP Gain: 4,793,010
//   Loot: 1,011,366
//   Supplies: 571,238
//   Balance: 440,128
//   Killed Monsters:
//     252x hellspawn

export interface HuntSession {
  minutes: number | null;
  xp: number | null;
  rawXp: number | null;
  loot: number;
  supplies: number;
  balance: number;
  kills: Record<string, number>;
}

const num = (s: string) => Number(s.replace(/[^\d-]/g, "")) || 0;

export function parseHuntAnalyser(text: string): HuntSession {
  const out: HuntSession = { minutes: null, xp: null, rawXp: null, loot: 0, supplies: 0, balance: 0, kills: {} };
  let section: "none" | "kills" | "items" = "none";
  let balanceSeen = false;
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const t = raw.trim();
    if (!t) continue;
    const sess = t.match(/^Session:\s*(\d+):(\d+)h?/i);
    if (sess) {
      out.minutes = Number(sess[1]) * 60 + Number(sess[2]);
      continue;
    }
    if (/^Killed Monsters:?/i.test(t)) {
      section = "kills";
      continue;
    }
    if (/^Looted Items:?/i.test(t)) {
      section = "items";
      continue;
    }
    const kv = t.match(/^(Raw XP Gain|XP Gain|Loot|Supplies|Balance):\s*(-?[\d,.]+)/i);
    if (kv) {
      section = "none";
      const k = kv[1].toLowerCase();
      if (k === "raw xp gain") out.rawXp = num(kv[2]);
      else if (k === "xp gain") out.xp = num(kv[2]);
      else if (k === "loot") out.loot = num(kv[2]);
      else if (k === "supplies") out.supplies = num(kv[2]);
      else {
        out.balance = num(kv[2]);
        balanceSeen = true;
      }
      continue;
    }
    if (section === "kills") {
      const m = t.match(/^(\d[\d,.]*)x\s+(.+)$/i);
      if (m) out.kills[m[2].trim().toLowerCase()] = (out.kills[m[2].trim().toLowerCase()] ?? 0) + num(m[1]);
    }
  }
  if (!balanceSeen) out.balance = out.loot - out.supplies;
  return out;
}

/** Nome da creature como o cliente escreve (minúsculo, às vezes no plural) → nome da ficha. */
function matches(killed: string, creature: string): boolean {
  const a = killed.toLowerCase().replace(/^(a|an|the) /, "");
  const b = creature.toLowerCase();
  return a === b || a === `${b}s` || a === `${b}es` || a.replace(/ies$/, "y") === b || a.replace(/ves$/, "f") === b || a.replace(/eeth$/, "ooth") === b;
}

/** Hunt mais provável pelas creatures mortas (a que soma mais kills), com a fração dos kills que casou. */
export function detectHunt(kills: Record<string, number>, hunts: { id: string; creatures: { name: string }[] }[]): { id: string; share: number } | null {
  const total = Object.values(kills).reduce((a, b) => a + b, 0);
  if (!total) return null;
  let best: { id: string; share: number } | null = null;
  for (const h of hunts) {
    let hit = 0;
    for (const [k, n] of Object.entries(kills)) if (h.creatures.some((c) => matches(k, c.name))) hit += n;
    const share = hit / total;
    if (share > 0 && (!best || share > best.share)) best = { id: h.id, share };
  }
  return best;
}

export const fmtK = (v: number) => {
  const a = Math.abs(v);
  const s = a >= 1e6 ? `${(a / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}kk` : a >= 1e3 ? `${Math.round(a / 1e3)}k` : String(a);
  return v < 0 ? `-${s}` : s;
};
