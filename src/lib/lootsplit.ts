// Divisão de loot a partir do "Copy to Clipboard" do Party Hunt Analyser do cliente do Tibia.
// Formato esperado (tolerante a espaços e vírgulas):
//   Session data: From 2026-09-26, 20:00:00 to 2026-09-26, 21:10:00
//   Session: 01:10h
//   Loot Type: Market
//   Loot: 1,234,567
//   Supplies: 345,678
//   Balance: 888,889
//   Nome do Jogador (Leader)
//       Loot: 600,000
//       Supplies: 100,000
//       Balance: 500,000
//       Damage: 1,234,567
//       Healing: 234,567

export interface Member {
  name: string;
  leader: boolean;
  loot: number;
  supplies: number;
  balance: number;
  damage: number;
  healing: number;
}

export interface Session {
  duration: string | null;
  minutes: number | null;
  lootType: string | null;
  members: Member[];
}

const num = (s: string) => Number(s.replace(/[^\d-]/g, "")) || 0;

export function parseSession(text: string): Session {
  const lines = text.replace(/\r/g, "").split("\n");
  const members: Member[] = [];
  let cur: Member | null = null;
  let duration: string | null = null;
  let lootType: string | null = null;
  let inPlayers = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    const indented = /^\s/.test(line);
    const t = line.trim();
    const kv = t.match(/^(Loot|Supplies|Balance|Damage|Healing):\s*(-?[\d,.]+)/i);
    const sess = t.match(/^Session:\s*(\d+):(\d+)h?/i);
    if (sess) {
      duration = `${sess[1]}:${sess[2]}h`;
      continue;
    }
    if (/^Session data:/i.test(t)) continue;
    const lt = t.match(/^Loot Type:\s*(.+)$/i);
    if (lt) {
      lootType = lt[1].trim();
      continue;
    }
    if (kv && (indented || cur) && inPlayers && cur) {
      const key = kv[1].toLowerCase() as "loot" | "supplies" | "balance" | "damage" | "healing";
      cur[key] = num(kv[2]);
      continue;
    }
    if (kv && !inPlayers) continue; // totais do grupo
    // linha com nome de jogador
    const name = t.replace(/\s*\(Leader\)\s*$/i, "").trim();
    if (!name || /:/.test(name)) continue;
    inPlayers = true;
    cur = { name, leader: /\(Leader\)/i.test(t), loot: 0, supplies: 0, balance: 0, damage: 0, healing: 0 };
    members.push(cur);
  }
  // quando o texto não traz Balance por jogador, calcula
  for (const m of members) if (!m.balance && (m.loot || m.supplies)) m.balance = m.loot - m.supplies;
  const mm = duration?.match(/(\d+):(\d+)/);
  return { duration, minutes: mm ? Number(mm[1]) * 60 + Number(mm[2]) : null, lootType, members };
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

export interface SplitResult {
  total: number;
  share: number;
  perHour: number | null;
  rows: (Member & { expense: number; adjusted: number; diff: number })[];
  transfers: Transfer[];
}

/** Divide o saldo por igual e gera o menor conjunto simples de transferências (quem tem mais paga quem tem menos). */
export function split(session: Session, expenses: Record<string, number>, removed: Set<string>): SplitResult {
  const rows = session.members
    .filter((m) => !removed.has(m.name))
    .map((m) => {
      const expense = expenses[m.name] ?? 0;
      return { ...m, expense, adjusted: m.balance - expense, diff: 0 };
    });
  const n = rows.length || 1;
  const total = rows.reduce((a, r) => a + r.adjusted, 0);
  const share = Math.floor(total / n);
  // Cada jogador termina com a parte igual mais o reembolso da própria despesa extra.
  // diff positivo: repassa; negativo: recebe.
  for (const r of rows) r.diff = r.balance - (share + r.expense);

  const payers = rows
    .filter((r) => r.diff > 0)
    .map((r) => ({ name: r.name, left: r.diff }))
    .sort((a, b) => b.left - a.left);
  const receivers = rows
    .filter((r) => r.diff < 0)
    .map((r) => ({ name: r.name, left: -r.diff }))
    .sort((a, b) => b.left - a.left);
  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < payers.length && j < receivers.length) {
    const amount = Math.min(payers[i].left, receivers[j].left);
    if (amount > 0) transfers.push({ from: payers[i].name, to: receivers[j].name, amount });
    payers[i].left -= amount;
    receivers[j].left -= amount;
    if (payers[i].left <= 0) i++;
    if (receivers[j].left <= 0) j++;
  }
  const perHour = session.minutes ? (share * 60) / session.minutes : null;
  return { total, share, perHour, rows, transfers };
}

export const SAMPLE = `Session data: From 2026-09-26, 20:00:00 to 2026-09-26, 21:30:00
Session: 01:30h
Loot Type: Market
Loot: 12,480,000
Supplies: 3,120,000
Balance: 9,360,000
Knight Exemplo (Leader)
	Loot: 9,900,000
	Supplies: 1,050,000
	Balance: 8,850,000
	Damage: 21,300,000
	Healing: 4,100,000
Sorc Exemplo
	Loot: 1,200,000
	Supplies: 820,000
	Balance: 380,000
	Damage: 35,800,000
	Healing: 1,900,000
Druid Exemplo
	Loot: 880,000
	Supplies: 700,000
	Balance: 180,000
	Damage: 18,200,000
	Healing: 9,700,000
Paladin Exemplo
	Loot: 500,000
	Supplies: 550,000
	Balance: -50,000
	Damage: 30,100,000
	Healing: 1,300,000`;

/** 1234567 → "1.23kk", 210973 → "211k", 950 → "950" (como os jogadores escrevem no chat). */
export function shortGold(v: number): string {
  const a = Math.abs(v);
  const s = a >= 1e6 ? `${Number((a / 1e6).toFixed(2))}kk` : a >= 1e3 ? `${Math.round(a / 1e3)}k` : String(Math.round(a));
  return v < 0 ? `-${s}` : s;
}

/**
 * Resumo pronto para colar no chat ou no Discord, no formato que a turma já usa:
 *   1. Fulano to pay 211k to Ciclano (Bank: transfer 210973 to Ciclano)
 *   Total profit: 1.95kk~ which is: 651k~ for each player.
 *   Session duration: 00:50h, which is: 782k~ for each player per hour.
 *   Damage Split: A - 38.3%, B - 35.7%, C - 26.1%.
 */
export function splitSummary(session: Session, result: SplitResult): string {
  const out: string[] = result.transfers.map((t, i) => `${i + 1}. ${t.from} to pay ${shortGold(t.amount)} to ${t.to} (Bank: transfer ${t.amount} to ${t.to})`);
  if (!result.transfers.length) out.push("Nobody needs to transfer anything.");
  out.push(`Total profit: ${shortGold(result.total)}~ which is: ${shortGold(result.share)}~ for each player.`);
  if (session.duration && result.perHour !== null)
    out.push(`Session duration: ${session.duration}, which is: ${shortGold(result.perHour)}~ for each player per hour.`);
  const dmg = result.rows.reduce((a, r) => a + r.damage, 0);
  if (dmg > 0) {
    const parts = [...result.rows].sort((a, b) => b.damage - a.damage).map((r) => `${r.name} - ${((r.damage / dmg) * 100).toFixed(1)}%`);
    out.push(`Damage Split: ${parts.join(", ")}.`);
  }
  return out.join("\n\n");
}
