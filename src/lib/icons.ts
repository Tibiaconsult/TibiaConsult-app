// Ícones de itens (baixados para /public/items) e de feitiços (static.tibia.com, biblioteca oficial).

const PNG_ITEMS = new Set([
  "Moonsilver_Channeler",
  "Stellar_Moonsilver_Channeler",
  "Moonsilver_Nimbus_Hat",
  "Arcanomancer_Sigil",
  "Enchanted_Flamingo_Amulet_of_Destruction",
]);

export function itemSlug(name: string): string {
  return name.trim().replace(/ /g, "_");
}

/** Caminho do sprite de um item. Para nomes compostos ("A / B"), usa o primeiro. */
export function itemIcon(name: string): string {
  const first = name.split("/")[0].trim();
  const slug = itemSlug(first);
  return `/items/${encodeURIComponent(slug)}.${PNG_ITEMS.has(slug) ? "png" : "gif"}`;
}

const SPELL_ICON: Record<string, string> = {
  "energy-wave": "energywave",
  "great-fire-wave": "greatfirewave",
  "fire-wave": "firewave",
  "great-energy-beam": "greatenergybeam",
  "great-death-beam": "greatdeathbeam",
  "energy-beam": "energybeam",
  "death-echo": "deathecho",
  "rage-of-the-skies": "rageoftheskies",
  "hells-core": "hellscore",
  "ultimate-energy-strike": "ultimateenergystrike",
  "ultimate-flame-strike": "ultimateflamestrike",
  "strong-energy-strike": "strongenergystrike",
  "strong-flame-strike": "strongflamestrike",
  lightning: "lightning",
  "death-strike": "deathstrike",
  "energy-strike": "energystrike",
  "flame-strike": "flamestrike",
  "sudden-death": "suddendeathrune",
  thunderstorm: "thunderstormrune",
  "great-fireball": "greatfireballrune",
  avalanche: "avalancherune",
  "stone-shower": "stoneshowerrune",
  explosion: "explosionrune",
  "Master of Flames": "masterofflames",
  "Master of Thunder": "masterofthunder",
  "Master of Decay": "masterofdecay",
  "Aura of Sapped Strength": "sapstrength",
  "Aura of Exposed Weakness": "exposeweakness",
  "Avatar of Storm": "avatarofstorm",
  "Magic Shield": "magicshield",
  "Ultimate Healing": "ultimatehealing",
  "Cancel Magic Shield": "cancelmagicshield",
};

export function spellIcon(idOrName: string): string | null {
  const slug = SPELL_ICON[idOrName];
  return slug ? `https://static.tibia.com/images/library/${slug}.png` : null;
}

/** Texturas do tibia.com usadas no layout (carregadas direto do static.tibia.com). */
export const TIBIA = {
  menuButton: "https://static.tibia.com/images/global/menu/button-background.gif",
  menuButtonOver: "https://static.tibia.com/images/global/menu/button-background-over.gif",
  chain: "https://static.tibia.com/images/global/general/chain.gif",
  boxTop: "https://static.tibia.com/images/global/general/box-top.gif",
  boxBottom: "https://static.tibia.com/images/global/general/box-bottom.gif",
  newsHeadline: "https://static.tibia.com/images/global/content/newsheadline_background.gif",
  letter: (l: string) => `https://static.tibia.com/images/global/letters/letter_martel_${l.toUpperCase()}.gif`,
  menuIcon: (k: string) => `https://static.tibia.com/images/global/menu/icon-${k}.gif`,
};
