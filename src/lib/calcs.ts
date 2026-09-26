// Fórmulas da TibiaWiki, consulta em 26/09/2026:
// - Experience Formula: exp total para o level L = 50/3 × (L³ − 6L² + 17L − 12).
// - Blessings, seção Price: regular R(L), enhanced E(L) e Twist of Fate T(L).
// - Stamina: offline, 1 min de stamina a cada 3 min; acima de 39 h, a cada 6 min; só começa após 10 min deslogado.

export function expForLevel(level: number): number {
  const L = Math.max(1, Math.floor(level));
  return Math.round((50 / 3) * (L ** 3 - 6 * L ** 2 + 17 * L - 12));
}

export function blessRegular(level: number): number {
  if (level <= 30) return 2000;
  if (level < 120) return 200 * (level - 20);
  return 20000 + 75 * (level - 120);
}

export function blessEnhanced(level: number): number {
  if (level <= 30) return 2600;
  if (level < 120) return 260 * (level - 20);
  return 26000 + 100 * (level - 120);
}

export function twistOfFate(level: number): number {
  if (level <= 30) return 2000;
  if (level < 270) return 200 * (level - 20);
  return 50000;
}

/** Minutos offline para ir de `from` a `to` minutos de stamina (máx. 42 h = 2520 min). */
export function staminaOfflineMinutes(from: number, to: number): number {
  const a = Math.max(0, Math.min(2520, from));
  const b = Math.max(0, Math.min(2520, to));
  if (b <= a) return 0;
  const limit = 39 * 60;
  const normal = Math.max(0, Math.min(b, limit) - a);
  const bonus = Math.max(0, b - Math.max(a, limit));
  return 10 + normal * 3 + bonus * 6;
}

/** Stamina depois de `offline` minutos deslogado, partindo de `from` minutos. */
export function staminaAfterOffline(from: number, offline: number): number {
  let st = Math.max(0, Math.min(2520, from));
  let t = Math.max(0, offline - 10);
  const limit = 39 * 60;
  if (st < limit) {
    const gain = Math.min(limit - st, Math.floor(t / 3));
    st += gain;
    t -= gain * 3;
  }
  if (st >= limit) st = Math.min(2520, st + Math.floor(t / 6));
  return st;
}
