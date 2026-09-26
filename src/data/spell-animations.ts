// Animação de cada magia (GIF da TibiaWiki, "<magia> animation.gif"). Gerado por scripts/spell-animations.mjs em 26/09/2026.
// 32 de 74 magias têm animação na wiki. Sem animação: Great Death Beam, Ultimate Energy Strike, Ultimate Flame Strike, Strong Energy Strike, Strong Flame Strike, Lightning, Sudden Death (runa), Thunderstorm (runa), Great Fireball (runa), Avalanche (runa), Stone Shower (runa), Explosion (runa), Ice Burst, Terra Burst, Ultimate Ice Strike, Ultimate Terra Strike, Strong Ice Strike, Strong Terra Strike, Icicle (runa), Stalagmite (runa), Annihilation, Executioner's Throw, Brutal Strike, Whirlwind Throw, Shield Slam, Inflict Wound, Strong Ethereal Spear, Ethereal Spear, Holy Flash, Holy Missile (runa), Spiritual Outburst, Devastating Knockout, Greater Tiger Clash, Tiger Clash, Greater Flurry of Blows, Thousand Fist Blows, Flurry of Blows, Chained Penance, Double Jab, Swift Jab, Forceful Uppercut, Mystic Repulse.

export interface SpellAnimation {
  /** nome do arquivo na TibiaWiki, sem .gif (usar com wikiImage) */
  file: string;
  w: number;
  h: number;
}

export const SPELL_ANIMATIONS: Record<string, SpellAnimation> = {
  "energy-wave": { file: "Energy Wave animation", w: 160, h: 256 },
  "great-fire-wave": { file: "Great Fire Wave animation", w: 224, h: 256 },
  "fire-wave": { file: "Fire Wave animation", w: 224, h: 224 },
  "great-energy-beam": { file: "Great Energy Beam animation", w: 96, h: 352 },
  "energy-beam": { file: "Energy Beam animation", w: 96, h: 256 },
  "death-echo": { file: "Death Echo Effect", w: 32, h: 32 },
  "rage-of-the-skies": { file: "Rage of the Skies animation", w: 480, h: 480 },
  "hells-core": { file: "Hell's Core animation", w: 416, h: 416 },
  "death-strike": { file: "Death Strike animation", w: 96, h: 128 },
  "energy-strike": { file: "Energy Strike animation", w: 96, h: 128 },
  "flame-strike": { file: "Flame Strike animation", w: 96, h: 128 },
  "strong-ice-wave": { file: "Strong Ice Wave animation", w: 160, h: 192 },
  "terra-wave": { file: "Terra Wave animation", w: 160, h: 256 },
  "eternal-winter": { file: "Eternal Winter animation", w: 416, h: 416 },
  "wrath-of-nature": { file: "Wrath of Nature animation", w: 480, h: 480 },
  "forked-glacier": { file: "Forked Glacier Effect", w: 32, h: 32 },
  "forked-thorns": { file: "Forked Thorns Effect", w: 64, h: 64 },
  "ice-strike": { file: "Ice Strike animation", w: 96, h: 128 },
  "terra-strike": { file: "Terra Strike animation", w: 96, h: 128 },
  "ice-wave": { file: "Ice Wave animation", w: 224, h: 224 },
  "envenom": { file: "Terra Strike animation", w: 96, h: 128 },
  "fierce-berserk": { file: "Berserk animation", w: 160, h: 160 },
  "front-sweep": { file: "Front Sweep animation", w: 160, h: 128 },
  "berserk": { file: "Berserk animation", w: 160, h: 160 },
  "groundshaker": { file: "Groundshaker animation", w: 288, h: 288 },
  "shield-bash": { file: "Shield Bash Effect", w: 64, h: 64 },
  "divine-caldera": { file: "Divine Caldera animation", w: 288, h: 288 },
  "divine-barrage": { file: "Divine Barrage Effect", w: 64, h: 64 },
  "divine-grenade": { file: "Divine Grenade Effect", w: 32, h: 32 },
  "divine-missile": { file: "Divine Missile animation", w: 96, h: 128 },
  "ethereal-barrage": { file: "Ethereal Barrage Effect", w: 64, h: 64 },
  "sweeping-takedown": { file: "Sweeping Takedown Effect", w: 32, h: 32 },
};
