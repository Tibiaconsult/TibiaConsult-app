// Sugestão de perk de proficiência por vocação. Não existe fonte pública com a escolha "certa"; esta é a regra do site,
// mostrada na tela: prioriza dano e crítico das magias principais, crítico geral e o skill/ML da vocação; depois sustento;
// por último bônus situacionais (contra um tipo de creature).

export type ProfVoc = "sorcerer" | "druid" | "knight" | "paladin" | "monk";

/** Magias de dano que mais pesam na rotação de cada vocação (páginas de vocação e rotações do site). */
const CORE: Record<ProfVoc, string[]> = {
  knight: ["Fierce Berserk", "Front Sweep", "Annihilation", "Groundshaker", "Executioner's Throw"],
  paladin: ["Divine Caldera", "Divine Missile", "Ethereal Spear", "Strong Ethereal Spear", "Divine Grenade", "Divine Barrage"],
  sorcerer: ["Great Fire Wave", "Energy Wave", "Great Energy Beam", "Great Death Beam", "Hell's Core", "Rage of the Skies", "Death Echo"],
  druid: ["Strong Ice Wave", "Terra Wave", "Eternal Winter", "Wrath of Nature", "Ice Burst", "Terra Burst", "Forked Glacier", "Forked Thorns"],
  monk: ["Flurry of Blows", "Greater Flurry of Blows", "Spiritual Outburst", "Sweeping Takedown", "Forceful Uppercut", "Chained Penance"],
};
const MAGE = (v: ProfVoc) => v === "sorcerer" || v === "druid";
const SKILL: Record<ProfVoc, RegExp> = {
  knight: /Sword|Axe|Club/,
  paladin: /Distance/,
  monk: /Fist/,
  sorcerer: /Magic Level/,
  druid: /Magic Level/,
};
const ELEM_ML: Record<ProfVoc, RegExp> = {
  sorcerer: /Fire|Energy|Death/,
  druid: /Ice|Earth|Healing/,
  paladin: /Holy/,
  knight: /^$/,
  monk: /^$/,
};

export interface PerkScore {
  score: number;
  why: string;
}

export function scorePerk(voc: ProfVoc, text: string): PerkScore {
  const t = text;
  const spell = t.match(/for ([A-Z][\w' ]+)$/)?.[1];
  if (spell && !/auto-attacks|your spells|offensive runes/.test(t)) {
    const core = CORE[voc].includes(spell);
    const k = core ? 1 : 0.45;
    if (/base damage|cooldown/.test(t)) return { score: 9 * k, why: core ? `${spell} é magia principal` : `${spell} pesa pouco na rotação` };
    if (/critical/.test(t)) return { score: 8 * k, why: core ? `crítico na ${spell}, magia principal` : `crítico só na ${spell}` };
    if (/leech/.test(t)) return { score: 5 * k, why: "sustento na magia" };
    if (/healing/.test(t)) return { score: (voc === "druid" ? 5 : 3) * k, why: "cura" };
    return { score: 3 * k, why: "efeito numa magia" };
  }
  if (/^[+-]?[\d.]+% critical extra damage$|^[+-]?[\d.]+% critical hit chance$/.test(t)) return { score: 8, why: "crítico em tudo" };
  if (/Magic Level as extra damage for your spells/.test(t)) return { score: MAGE(voc) ? 7.5 : voc === "paladin" ? 3 : 2, why: "dano das magias pelo ML" };
  const skillSpells = t.match(/of your (\w+(?: \w+)?) as extra damage for your spells/);
  if (skillSpells) return { score: SKILL[voc].test(skillSpells[1]) ? 7.5 : 1, why: "dano das magias pelo skill" };
  if (/as extra damage for auto-attacks/.test(t)) return { score: MAGE(voc) ? 1 : 4, why: "dano do ataque básico" };
  if (/auto-attacks/.test(t)) return { score: MAGE(voc) ? 1 : 3.5, why: "ataque básico" };
  const lvl = t.match(/^[+-]?\d+ ((?:\w+ )?Magic Level|\w+ Fighting|Shielding)$/);
  if (lvl) {
    const s = lvl[1];
    if (/Magic Level/.test(s)) {
      if (s === "Magic Level") return { score: MAGE(voc) ? 7 : voc === "paladin" ? 4 : 2, why: "magic level" };
      return { score: ELEM_ML[voc].test(s) ? 6 : 2, why: `${s}` };
    }
    if (s === "Shielding") return { score: voc === "knight" ? 3 : 1, why: "shielding" };
    return { score: SKILL[voc].test(s) ? 7 : 1, why: s };
  }
  if (/^[+-]?\d+ attack$/.test(t)) return { score: MAGE(voc) ? 1 : 6, why: "ataque da arma" };
  if (/pierce/.test(t)) return { score: 4.5, why: "fura resistência" };
  if (/damage against bosses/.test(t)) return { score: 5, why: "boss" };
  if (/damage against targets (below|above)/.test(t)) return { score: 4, why: "condicional (vida do alvo)" };
  if (/damage against /.test(t)) return { score: 2, why: "só contra um tipo de creature" };
  if (/homing missile/.test(t)) return { score: 4, why: "dano extra aleatório" };
  if (/mana leech|life leech/.test(t)) return { score: MAGE(voc) && /mana/.test(t) ? 5 : 4, why: "sustento" };
  if (/on kill|on hit/.test(t)) return { score: 3, why: "sustento" };
  if (/extra healing for your spells/.test(t)) return { score: voc === "druid" ? 5 : 2, why: "cura" };
  if (/offensive runes/.test(t)) return { score: MAGE(voc) ? 3 : 2, why: "runas" };
  if (/armor penetration/.test(t)) return { score: 3, why: "armadura do alvo" };
  if (/damage at range/.test(t)) return { score: voc === "paladin" ? 4 : 2, why: "distância" };
  if (/defence/.test(t)) return { score: voc === "knight" ? 3 : 1, why: "defesa" };
  return { score: 2, why: "efeito geral" };
}

/** Índice do perk sugerido em cada nível. */
export function suggestPicks(voc: ProfVoc, levels: string[][]): number[] {
  return levels.map((opts) => {
    let best = 0;
    let bs = -1;
    opts.forEach((o, i) => {
      const s = scorePerk(voc, o).score;
      if (s > bs) {
        bs = s;
        best = i;
      }
    });
    return best;
  });
}
