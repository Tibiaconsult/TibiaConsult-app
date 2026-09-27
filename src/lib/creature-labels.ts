// Rótulos e cores da lista/ficha de creatures (leve: pode ir para o navegador).

export const creatureHref = (name: string) => `/criaturas/${encodeURIComponent(name)}`;

export const ELEMENT_PT: Record<string, string> = {
  physical: "Físico",
  earth: "Terra",
  fire: "Fogo",
  death: "Morte",
  energy: "Energia",
  holy: "Sagrado",
  ice: "Gelo",
  hpdrain: "Life drain",
  drown: "Afogamento",
  heal: "Cura recebida",
};
export const ELEMENT_EMOJI: Record<string, string> = {
  physical: "⚔️",
  earth: "🌿",
  fire: "🔥",
  death: "💀",
  energy: "⚡",
  holy: "✨",
  ice: "❄️",
  hpdrain: "🩸",
  drown: "💧",
  heal: "💚",
};
/** elementos de ataque (o que o jogador escolhe), na ordem da tabela */
export const ATTACK_ELEMENTS = ["physical", "fire", "energy", "ice", "earth", "death", "holy"] as const;

export const RARITY_PT: Record<string, string> = {
  always: "Sempre",
  common: "Comum",
  uncommon: "Incomum",
  "semi-rare": "Semi-raro",
  rare: "Raro",
  "very rare": "Muito raro",
};
export const RARITY_COLOR: Record<string, string> = {
  always: "#4a4a4a",
  common: "#3d6b2a",
  uncommon: "#2a5a8a",
  "semi-rare": "#6a3a9a",
  rare: "#b36b00",
  "very rare": "#b3261e",
};
export const LEVEL_PT: Record<string, string> = {
  Harmless: "Inofensiva",
  Trivial: "Trivial",
  Easy: "Fácil",
  Medium: "Média",
  Hard: "Difícil",
  Challenging: "Desafiadora",
};
