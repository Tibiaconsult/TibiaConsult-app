// Links que abrem as ferramentas já no char: roda, set e combo salvos (ou o montador vazio na vocação) e o simulador com level e skill.
// Usados na Minha área e no painel da página inicial.

export interface CharForLinks {
  vocation: string;
  level: number;
  magic_level: number;
  skill?: number | null;
  weapon_attack?: number | null;
  wheel_code?: string | null;
  set_code?: string | null;
  combo_code?: string | null;
}

export const wheelHref = (c: CharForLinks) =>
  c.wheel_code ? `/planejador/wheel?code=${encodeURIComponent(c.wheel_code)}&level=${c.level}` : `/planejador/wheel?voc=${c.vocation}&level=${c.level}`;

export const setHref = (c: CharForLinks) => (c.set_code ? `/simulador/set?${c.set_code}` : `/simulador/set?voc=${c.vocation}&level=${c.level}`);

export const comboHref = (c: CharForLinks) =>
  c.combo_code ? `/rotacoes?voc=${c.vocation}&${c.combo_code.replace(/^voc=[a-z]+&/, "")}#montador` : `/rotacoes?voc=${c.vocation}#montador`;

/** Simulador de dano com os números do char; null para o monk (fórmula não pública). */
export function simHref(c: CharForLinks): string | null {
  if (c.vocation === "monk") return null;
  if (c.vocation === "sorcerer") return `/simulador?voc=sorcerer&level=${c.level}&ml=${c.magic_level}`;
  return `/simulador?voc=${c.vocation}&level=${c.level}&ml=${c.magic_level}&skill=${c.skill ?? 0}${c.weapon_attack ? `&atk=${c.weapon_attack}` : ""}`;
}
