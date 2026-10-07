// Números da Minha PT a partir do my_party (032/033): XP por dia, tempo online, XP por hora online e mortes.

export interface PartyChar {
  name: string;
  world: string | null;
  vocation: string | null;
  level: number | null;
  guild: string | null;
  snaps: { d: string; l: number; e: number }[];
  online: { d: string; m: number }[];
  last_seen: string | null;
  deaths: { t: string; l: number | null; r: string | null; p: boolean }[];
}

const DAY = 86400000;
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);

/** XP ganho por dia: diferença entre snapshots de dias seguidos (o do dia guarda a XP até ali). */
export function xpByDay(snaps: PartyChar["snaps"]): { d: string; xp: number }[] {
  const out: { d: string; xp: number }[] = [];
  for (let i = 1; i < snaps.length; i++) out.push({ d: snaps[i].d, xp: Math.max(0, snaps[i].e - snaps[i - 1].e) });
  return out;
}

export function stats(c: PartyChar, today: string) {
  const t0 = new Date(today + "T12:00:00Z").getTime();
  const since = (n: number) => isoDay(t0 - n * DAY);
  const xp = xpByDay(c.snaps);
  const sumXp = (n: number) => xp.filter((x) => x.d > since(n)).reduce((a, x) => a + x.xp, 0);
  const sumOn = (n: number) => c.online.filter((x) => x.d > since(n)).reduce((a, x) => a + x.m, 0);
  const lvlAt = (n: number) => c.snaps.find((s) => s.d >= since(n))?.l ?? null;
  const xp7 = sumXp(7);
  const xp30 = sumXp(30);
  const on7 = sumOn(7);
  const on30 = sumOn(30);
  const l30 = lvlAt(30);
  return {
    xp7,
    xp30,
    on7,
    on30,
    levels30: c.level !== null && l30 !== null ? c.level - l30 : null,
    xpPerHour: on30 >= 60 ? Math.round(xp30 / (on30 / 60)) : null,
    deaths30: c.deaths.filter((d) => new Date(d.t).getTime() > t0 - 30 * DAY).length,
    days: xp.slice(-14),
  };
}

/** 21.988.270.224 → "21,99 kkk"; 23.663.360 → "23,7 kk" */
export function shortXp(n: number): string {
  const f = (v: number, d: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: d });
  if (n >= 1e9) return `${f(n / 1e9, 2)} kkk`;
  if (n >= 1e6) return `${f(n / 1e6, 1)} kk`;
  if (n >= 1e3) return `${f(n / 1e3, 0)} k`;
  return f(n, 0);
}

export const hours = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` : `${min} min`);
