// Textos do planner oficial da Wheel of Destiny (tibia.com, SkillwheelStringsJsonLibrary.json), copiados em 26/09/2026.
// Os números de cada fatia vêm do motor oficial (skillgrid.js), carregado em tempo real do static.tibia.com.

/** Dedication perks: [nome, formato] */
export const WOD_SMALL: Record<number, [string, string]> = {
  0: ["Hit Points", "PlusInteger"],
  1: ["Mana", "PlusInteger"],
  2: ["(unknown)", "PlusInteger"],
  3: ["Capacity", "PlusInteger"],
  4: ["Mitigation Multiplier", "PercentWithTwoFloatingpoints"],
};

/** Conviction perks: [nome, formato, augment I, augment II, descrição] */
export const WOD_MEDIUM: Record<number, [string, string, string, string, string]> = {
  0: ["Fire Resistance", "PlusFullPercent", "", "", ""],
  1: ["Energy Resistance", "PlusFullPercent", "", "", ""],
  2: ["Ice Resistance", "PlusFullPercent", "", "", ""],
  3: ["Earth Resistance", "PlusFullPercent", "", "", ""],
  4: ["Holy and Death Resistance", "SpecialFormat", "", "", ""],
  5: ["Mana Leech", "PlusPercentWithTwoFloatingpoints", "", "", ""],
  6: ["Life Leech", "PlusPercentWithTwoFloatingpoints", "", "", ""],
  7: ["Weapon Skill Boost", "PlusInteger", "", "", "Applies to sword, axe and club fighting"],
  8: ["Battle Instinct", "NoEffectDisplay", "", "", "Gain +6 shielding and +1 sword/axe/club fighting when 5 creatures are on adjacent squares. For each additional creature, up to a maximum of 8, you get +6 shielding and +1 sword/axe/club fighting more."],
  9: ["Battle Healing", "NoEffectDisplay", "", "", "Healing Spells have 10% increased healing. This bonus is doubled when wearing a shield."],
  10: ["Augmented Fierce Berserk", "RomanNumerals", "-30 Mana Cost", "+10% Base Damage", ""],
  11: ["Augmented Intense Wound Cleansing", "RomanNumerals", "+125% Base Healing", "-60s Cooldown", ""],
  12: ["Augmented Front Sweep", "RomanNumerals", "+40% Base Damage", "Expanded Shape", ""],
  13: ["Augmented Groundshaker", "RomanNumerals", "-2s Cooldown", "+12.5% Base Damage", ""],
  14: ["Augmented Shield Slam", "RomanNumerals", "Adds 15% life leech to this spell", "-25% damage from the next hostile auto attack", ""],
  15: ["Distance Skill Boost", "PlusInteger", "", "", ""],
  16: ["Ballistic Mastery", "NoEffectDisplay", "", "", "The critical extra damage for attacks with a crossbow is increased by 10%. While wielding a bow your attacks and spells have +4% physical and holy pierce."],
  17: ["Positional Tactics", "NoEffectDisplay", "", "", "Gain +3 distance fighting while no monster is within 1 squares. Otherwise gain +3 holy magic level and +3 healing magic level."],
  18: ["Augmented Divine Caldera", "RomanNumerals", "-20 Mana Cost", "+10% Base Damage", ""],
  19: ["Augmented Divine Barrage", "RomanNumerals", "+8% Base Damage", "+12% Base Damage", ""],
  20: ["Augmented Divine Dazzle", "RomanNumerals", "Jumps to +2 additional targets", "Duration increased; -8s Cooldown", ""],
  21: ["Augmented Strong Ethereal Spear", "RomanNumerals", "-2s Cooldown", "+380% Base Damage", ""],
  22: ["Augmented Ethereal Barrage", "RomanNumerals", "Adds 10% life leech to this spell", "Adds 10% critical hit chance for this spell.", ""],
  23: ["Focus Mastery", "NoEffectDisplay", "", "", "Increases the damage of your next damage spell by 35% within 12 seconds after casting a focus spell. Reduces the primary cooldown by 2 seconds."],
  24: ["Augmented Great Fire Wave", "RomanNumerals", "Adds 15% critical extra damage for this spell.", "+5% Base Damage", ""],
  25: ["Augmented Energy Wave", "RomanNumerals", "Affected area enlarged", "+10% Base Damage", ""],
  26: ["Augmented Special Spells", "RomanNumerals", "-4s Cooldown for Lightning, Strong Energy Strike and Strong Flame Strike", "+50% Base Damage for Lightning, Strong Energy Strike and Strong Flame Strike", ""],
  27: ["Augmented Focus Spells", "RomanNumerals", "+5% Base Damage for Hell's Core and Rage of the Skies", "-4s Cooldown; Focus secondary group cooldown -4s for Hell's Core and Rage of the Skies", ""],
  28: ["Healing Link", "NoEffectDisplay", "", "", "If you heal someone with Nature's Embrace or Heal Friend, you also heal yourself for 25% of the applied healing."],
  29: ["Augmented Forked Spells", "RomanNumerals", "-2s Cooldown for Forked Thorns and Forked Glacier", "Jumps to +1 additional target for Forked Thorns and Forked Glacier", ""],
  30: ["Augmented Terra Wave", "RomanNumerals", "+6.5% Base Damage", "Adds 10% life leech to this spell", ""],
  31: ["Augmented Strong Ice Wave", "RomanNumerals", "+6% Base Damage", "Expanded Shape", ""],
  32: ["Augmented Mass Healing", "RomanNumerals", "+4% Base Healing", "Affected area enlarged", ""],
  33: ["Augmented Heal Friend", "RomanNumerals", "+4% Base Healing", "+6% Base Healing", ""],
  34: ["Magic Skill Boost", "PlusInteger", "", "", ""],
  35: ["Runic Mastery", "NoEffectDisplay", "", "", "If you use a rune, you have a 25% chance of increasing your magic level by 10%, or by 20% if you use a rune that can be created by your vocation."],
  36: ["Augmented Death Echo", "RomanNumerals", "-2s Cooldown", "+12% Base Damage", ""],
  37: ["Vessel Resonance Top Left", "RomanNumerals", "", "", "Each level of Vessel Resonance unlocks equivalent Gem Mods in its domain. If the Vessel Resonance matches the gem quality, a damage and healing bonus is granted."],
  38: ["Vessel Resonance Top Right", "RomanNumerals", "", "", "Each level of Vessel Resonance unlocks equivalent Gem Mods in its domain. If the Vessel Resonance matches the gem quality, a damage and healing bonus is granted."],
  39: ["Vessel Resonance Bottom Left", "RomanNumerals", "", "", "Each level of Vessel Resonance unlocks equivalent Gem Mods in its domain. If the Vessel Resonance matches the gem quality, a damage and healing bonus is granted."],
  40: ["Vessel Resonance Bottom Right", "RomanNumerals", "", "", "Each level of Vessel Resonance unlocks equivalent Gem Mods in its domain. If the Vessel Resonance matches the gem quality, a damage and healing bonus is granted."],
  41: ["Sanctuary", "NoEffectDisplay", "", "", "Your damage and healing with attacks, spells and runes is increased by 10% when hitting adjacent targets. Additionaly consuming Harmony creates a field lasting 5 seconds, increasing your damage and healing done by 2% for each Harmony consumed."],
  42: ["Guiding Presence", "NoEffectDisplay", "", "", "Gain an aura that shares your mantra with members of your group and increases your passive party bonuses by 33%."],
  43: ["Fist Fighting Skill Boost", "PlusInteger", "", "", ""],
  44: ["Augmented Thousand Fist Blows", "RomanNumerals", "Adds 40% critical extra damage for this spell.", "-4s Cooldown", ""],
  45: ["Augmented Mass Spirit Mend", "RomanNumerals", "+8% Base Healing", "-4s Cooldown", ""],
  46: ["Augmented Mystic Repulse", "RomanNumerals", "-4s Cooldown", "+60% Base Damage", ""],
  47: ["Augmented Chained Penance", "RomanNumerals", "Jumps to +1 additional target", "+18% Base Damage", ""],
  48: ["Augmented Flurry of Blows", "RomanNumerals", "Range increased by 1", "+15% Base Damage", ""],
};

/** Revelation perks: [nome, resumo, descrição dos estágios] */
export const WOD_LARGE: Record<number, [string, string, string]> = {
  0: ["Gift of Life", "Allows you to survive an otherwise fatal blow.", "If an attack (except with agony damage) were to kill you but the overkill damage amounts to less than 20%/25%/30% of your maximum hit points, you will heal yourself for 20%/25%/30% of your maximum hit points. Only after that is the damage applied. In addition, all your spell cooldowns are reduced by 60 seconds, and 20%/25%/30% of your maximum mana is restored. Cooldown: 30h/20h/10h. The cooldown is only reduced while the character has a battle sign."],
  1: ["Executioner's Throw", "Throwing attack that deals massive damage to enemies with low hit points.", "This spell throws your weapon on your target and jumps on 2/3/4 nearby enemies. Deals 100%/125%/150% additional damage to targets with less than 30% of their hit points. Cooldown: 18/14/10 seconds."],
  2: ["Combat Mastery", "Improve your combat prowess based on the equipment you use.", "Take less damage the lower your life is (1% reduced damage taken per 14%/12%/10% missing hp). This bonus is doubled while wielding a shield. Deal more damage the lower your targets life is (1% increased damage per 14%/12%/10% missing hp). This bonus is doubled while wielding a two-handed weapon."],
  3: ["Avatar of Steel", "Transforms you into a powerful form that reduces damage taken and increases damage dealt.", "This spell transforms yourself into a powerful avatar for 15 seconds. While in this form, you benefit from 5%/10%/15% damage reduction and all your attacks are critical hits with 5%/10%/15% critical extra damage. Cooldown: 120/90/60 minutes."],
  4: ["Divine Grenade", "Deploy a powerful delayed effect that deals holy damage.", "This spell plants a marker at the feet of your target that explodes after 3 seconds, dealing holy damage. +16% base damage per additional stage. Cooldown: 26/20/14 seconds."],
  5: ["Divine Empowerment", "This support spell creates a field that increases your dealt damage.", "This support spell creates a field of holy energy around your feet for 5 seconds. As long as you stand in this field, your dealt damage increases by 8%/10%/12%. Cooldown: 32/28/24 seconds."],
  6: ["Avatar of Light", "Transforms you into a powerful form that reduces damage taken and increases damage dealt.", "This spell transforms yourself into a powerful avatar for 15 seconds. While in this form, you benefit from 5%/10%/15% damage reduction and all your attacks are critical hits with 5%/10%/15% critical extra damage. Cooldown: 120/90/60 minutes."],
  7: ["Beam Mastery", "Boosts all of your beam spells.", "Your beams now also hit tiles adjacent to the main beam, dealing 25%/40%/70% of the initial damage. In addition, for each target hit by a beam spell, the cooldown of all other spells is reduced by 1 sec (up to a maximum of 3 sec) and the damage of beam spells is increased by 10%/12%/14% (up to a maximum of 30%/36%/42%)."],
  8: ["Lord of Destruction", "Improve damage, critical hit chance and critical damage for spells with the damage type of your elemental stance.", "Grants 2.00%/3.00%/4.00% more fire damage for Master of Flames, 2.00%/3.00%/4.00% more critical hit chance for Master of Thunder and 15.00%/25.50%/30.00% more critical damage for Master of Decay."],
  9: ["Avatar of Storm", "Transforms you into a powerful form that reduces damage taken and increases damage dealt.", "This spell transforms yourself into a powerful avatar for 15 seconds. While in this form, you benefit from 5%/10%/15% damage reduction and all your attacks are critical hits with 5%/10%/15% critical extra damage. Cooldown: 120/90/60 minutes."],
  10: ["Twin Bursts", "Powerful ring spell that deals ice or earth damage that is enhanced against targets with high hit points.", "Decide wisely whether you want to cast ice or earth damage in a small area around you, as these two ring spells share the same cooldown. Both spells deal 20%/40%/60% additional damage to targets with more than 60% of their hit points. Cooldown: 22/18/14 seconds."],
  11: ["Blessing of the Grove", "Allows your healing spells to achieve critical hits and increases your healing if the target's missing hit points is below certain thresholds.", "Your healing spells can achieve critical hits. Additionally, your healing is increased by 5%/7.5%/10% against targets below 60% hit points. This effect is doubled against targets below 30% hit points."],
  12: ["Avatar of Nature", "Transforms you into a powerful form that reduces damage taken and increases damage dealt.", "This spell transforms yourself into a powerful avatar for 15 seconds. While in this form, you benefit from 5%/10%/15% damage reduction and all your attacks are critical hits with 5%/10%/15% critical extra damage. Cooldown: 120/90/60 minutes."],
  13: ["Spiritual Outburst", "A powerful spell that consumes Harmony to release a massive chain attack.", "This spell consumes your Harmony. Releases a massive attack chaining to 7 additional enemies. When used with full Harmony, repeats after 1 second for 37.5%/50%/62.5% of its original damage. Cooldown: 24/20/16 seconds."],
  14: ["Ascetic", "Improve all spenders and allows mantra to improve the damage of your attacks.", "Increases the Harmony base bonus by 1%/2%/3% and your autoattacks deal additional damage equal to 100%/200%/300% of your mantra."],
  15: ["Avatar of Balance", "Transforms you into a powerful form that reduces damage taken and increases damage dealt.", "This spell transforms yourself into a powerful avatar for 15 seconds. While in this form, you benefit from 5%/10%/15% damage reduction and all your attacks are critical hits with 5%/10%/15% critical extra damage. Cooldown: 120/90/60 minutes."],
};

/** Mods básicos de gema: [nome, formato] */
export const WOD_BASIC: Record<number, [string, string]> = {
  0: ["Physical Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  1: ["Holy Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  2: ["Death Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  3: ["Fire Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  4: ["Earth Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  5: ["Ice Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  6: ["Energy Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  7: ["Mana Drain Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  8: ["Life Drain Resistance", "PlusPercentWithUpToTwoFloatingpoints"],
  9: ["Mitigation Multiplier", "PercentWithTwoFloatingpoints"],
  10: ["Hit Points", "PlusInteger"],
  11: ["Mana", "PlusInteger"],
  12: ["Capacity", "PlusInteger"],
};

type SupKind = "dmg" | "crit" | "heal" | "cd" | "rm" | "dodge" | "critg" | "ll" | "ml";
/** Mods supremos: [nome, tipo, valor no grau I]. Graus II a IV: ×1,1, ×1,2 e ×1,5 (cooldown fixo, com momentum). */
const SUP: [string, SupKind, number][] = [
  ["Dodge", "dodge", 0.28], ["Critical Extra Damage", "critg", 2], ["Life Leech", "ll", 2], ["Mana Leech", "ml", 0.8],
  ["Augmented Ultimate Healing", "heal", 5], ["Gift of Life", "rm", 150], ["Augmented Avatar of Steel", "cd", 900],
  ["Augmented Executioner's Throw", "cd", 2], ["Augmented Executioner's Throw", "dmg", 6], ["Augmented Executioner's Throw", "crit", 12],
  ["Augmented Fierce Berserk", "dmg", 5], ["Augmented Fierce Berserk", "crit", 8], ["Augmented Berserk", "dmg", 5], ["Augmented Berserk", "crit", 12],
  ["Augmented Front Sweep", "dmg", 8], ["Augmented Front Sweep", "crit", 12], ["Augmented Groundshaker", "dmg", 6.5], ["Augmented Groundshaker", "crit", 12],
  ["Augmented Annihilation", "dmg", 12], ["Augmented Annihilation", "crit", 15], ["Augmented Fair Wound Cleansing", "heal", 10],
  ["Avatar of Steel", "rm", 150], ["Executioner's Throw", "rm", 150], ["Combat Mastery", "rm", 150],
  ["Augmented Avatar of Light", "cd", 900], ["Augmented Divine Dazzle", "cd", 4], ["Augmented Divine Grenade", "dmg", 6], ["Augmented Divine Grenade", "crit", 12],
  ["Augmented Divine Caldera", "dmg", 5], ["Augmented Divine Caldera", "crit", 8], ["Augmented Divine Missile", "dmg", 8], ["Augmented Divine Missile", "crit", 12],
  ["Augmented Ethereal Spear", "dmg", 10], ["Augmented Ethereal Spear", "crit", 15], ["Augmented Strong Ethereal Spear", "dmg", 8], ["Augmented Strong Ethereal Spear", "crit", 12],
  ["Augmented Divine Empowerment", "cd", 6], ["Augmented Divine Grenade", "cd", 2], ["Augmented Salvation", "heal", 6],
  ["Avatar of Light", "rm", 150], ["Divine Grenade", "rm", 150], ["Divine Empowerment", "rm", 150],
  ["Augmented Avatar of Storm", "cd", 900], ["Augmented Energy Wave", "cd", 1], ["Augmented Great Death Beam", "dmg", 10], ["Augmented Great Death Beam", "crit", 15],
  ["Augmented Hell's Core", "dmg", 8], ["Augmented Hell's Core", "crit", 12], ["Augmented Energy Wave", "dmg", 5], ["Augmented Energy Wave", "crit", 12],
  ["Augmented Great Fire Wave", "dmg", 5], ["Augmented Great Fire Wave", "crit", 8], ["Augmented Rage of the Skies", "dmg", 8], ["Augmented Rage of the Skies", "crit", 12],
  ["Augmented Great Energy Beam", "dmg", 10], ["Augmented Great Energy Beam", "crit", 15],
  ["Avatar of Storm", "rm", 150], ["Beam Mastery", "rm", 150], ["Lord of Destruction", "rm", 150],
  ["Augmented Avatar of Nature", "cd", 900], ["Augmented Nature's Embrace", "cd", 10], ["Augmented Terra Burst", "dmg", 7], ["Augmented Terra Burst", "crit", 12],
  ["Augmented Ice Burst", "dmg", 7], ["Augmented Ice Burst", "crit", 12], ["Augmented Eternal Winter", "dmg", 8], ["Augmented Eternal Winter", "crit", 12],
  ["Augmented Terra Wave", "dmg", 5], ["Augmented Terra Wave", "crit", 12], ["Augmented Strong Ice Wave", "dmg", 8], ["Augmented Strong Ice Wave", "crit", 15],
  ["Augmented Heal Friend", "heal", 5], ["Augmented Mass Healing", "heal", 5],
  ["Avatar of Nature", "rm", 150], ["Blessing of the Grove", "rm", 150], ["Twin Bursts", "rm", 150],
  ["Augmented Avatar of Balance", "cd", 900], ["Augmented Spirit Mend", "heal", 6], ["Augmented Spiritual Outburst", "dmg", 5], ["Augmented Spiritual Outburst", "crit", 8],
  ["Augmented Forceful Uppercut", "dmg", 10], ["Augmented Forceful Uppercut", "crit", 8], ["Augmented Flurry of Blows", "dmg", 6.5], ["Augmented Flurry of Blows", "crit", 8],
  ["Augmented Greater Flurry of Blows", "dmg", 5], ["Augmented Greater Flurry of Blows", "crit", 8], ["Augmented Sweeping Takedown", "dmg", 5], ["Augmented Sweeping Takedown", "crit", 8],
  ["Augmented Focus Serenity", "cd", 150], ["Augmented Focus Harmony", "cd", 30], ["Augmented Mass Spirit Mend", "heal", 5],
  ["Avatar of Balance", "rm", 150], ["Spiritual Outburst", "rm", 150], ["Ascetic", "rm", 150],
];

const GRADE = [1, 1.1, 1.2, 1.5];
const MOMENTUM = ["", ", +0.33% Momentum", ", +0.66% Momentum", ", +1% Momentum"];
const num = (v: number) => (Math.round(v * 100) / 100).toString();

/** Nome do mod supremo. */
export function supremeName(id: number): string {
  const s = SUP[id];
  if (!s) return `Mod ${id}`;
  return s[1] === "rm" ? `Revelation Mastery ${s[0]}` : s[0];
}

/** Efeito do mod supremo no grau (0 a 3), no texto do planner oficial. */
export function supremeEffect(id: number, grade = 0): string {
  const s = SUP[id];
  if (!s) return "";
  const [, kind, base] = s;
  // o planner oficial arredonda o Flurry of Blows para 7,2 e 7,9
  const v = id === 82 ? [6.5, 7.2, 7.9, 9.75][grade] : base * GRADE[grade];
  switch (kind) {
    case "dmg":
      return `+${num(v)}% Base Damage`;
    case "crit":
      return `+${num(v)}% Critical Extra Damage`;
    case "heal":
      return `+${num(v)}% Base Healing`;
    case "cd":
      return `-${base}s Cooldown${MOMENTUM[grade]}`;
    case "rm":
      return `+${[150, 165, 180, 225][grade]} ${s[0]}`;
    case "dodge":
      return `+${num(v)}% Dodge`;
    case "critg":
      return `+${num(v)}% Critical Extra Damage`;
    case "ll":
      return `+${num(v)}% Life Leech`;
    case "ml":
      return `+${num(v)}% Mana Leech`;
  }
}

const roman = (n: number) => ["", "I", "II", "III", "IV", "V"][n] ?? String(n);

/** Formata um valor de perk como o planner oficial (função C do wheelofdestinyplanner.js). */
export function formatPerk(format: string, n: number): string {
  switch (format) {
    case "NoEffectDisplay":
      return "";
    case "PlusInteger":
      return `+${n.toLocaleString("pt-BR")}`;
    case "PlusFullPercent":
      return `+${n}%`;
    case "PlusPercentWithTwoFloatingpoints":
      return `${n < 0 ? "" : "+"}${(n / 100).toFixed(2).replace(".", ",")}%`;
    case "PercentWithTwoFloatingpoints":
      return `${(n / 100).toFixed(2).replace(".", ",")}%`;
    case "RomanNumerals":
      return roman(n);
    case "SpecialFormat":
      return `+${n}% holy e +${n}% death`;
  }
  return String(n);
}

/** Formata valores de gema (função Cn do planner oficial). */
export function formatGem(format: string, n: number): string {
  switch (format) {
    case "PlusInteger":
      return `+${n.toLocaleString("pt-BR")}`;
    case "PercentWithTwoFloatingpoints":
      return `${(Math.round(100 * n) / 100).toString().replace(".", ",")}%`;
    case "PlusPercentWithUpToTwoFloatingpoints":
      return `+${(Math.round(100 * n) / 100).toString().replace(".", ",")}%`;
  }
  return String(n);
}

export function shortName(name: string): string {
  return name.replace(/^Augmented /, "Aug. ").replace(/^Vessel Resonance /, "VR ");
}
