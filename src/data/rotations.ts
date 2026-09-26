import { RotationStep } from "@/lib/rotation";
import { Element } from "@/data/spells";

export interface RotationPreset {
  id: string;
  name: string;
  element: Element;
  stance: Element;
  description: string;
  cycle: RotationStep[];
  burst: RotationStep[];
  runes: string;
  singleTarget: string;
  wheel: string;
}

export const ROTATIONS: RotationPreset[] = [
  {
    id: "energia",
    name: "Energia",
    element: "energy",
    stance: "energy",
    description: "Master of Thunder + Aura of Exposed Weakness. Bichos alinhados na frente (beam) ou em leque (wave).",
    cycle: [
      { t: 0, spellId: "energy-wave", note: "abre o ciclo" },
      { t: 2, spellId: "great-energy-beam", note: "Beam Mastery corta 1 s de tudo por alvo no feixe" },
      { t: 4, spellId: "great-fire-wave", note: "vira ENERGIA pela stance" },
      { t: 6, spellId: "lightning", note: "3+ alvos; com 1 alvo, Strong Energy Strike" },
    ],
    burst: [
      { t: 0, spellId: "rage-of-the-skies", note: "85 sqm; trava ataque 4 s" },
      { t: 4, spellId: "ultimate-energy-strike", note: "+35% do Focus Mastery" },
      { t: 6, spellId: "energy-wave", note: "volta ao ciclo" },
    ],
    runes: "Thunderstorm no lugar da Great Fire Wave quando os bichos estiverem espalhados.",
    singleTarget: "Ultimate Energy Strike (30 s) > Strong Energy Strike (8 s) > SD a cada 2 s entre eles.",
    wheel: "Beam Mastery T2 + Energy Wave T1/T2. Gema: Revelation Mastery Beam Mastery ou base do Great Energy Beam.",
  },
  {
    id: "fogo",
    name: "Fogo",
    element: "fire",
    stance: "fire",
    description: "Master of Flames + Aura of Exposed Weakness. Great Fire Wave cabe a cada 4 s: entra nos segundos 0, 4, 8; os outros ocupam 2, 6, 10.",
    cycle: [
      { t: 0, spellId: "great-fire-wave", note: "natural de fogo: +4% base (+LoD); arma a conversão" },
      { t: 2, spellId: "energy-wave", note: "vira FOGO (base 150)" },
      { t: 4, spellId: "great-fire-wave" },
      { t: 6, spellId: "great-death-beam", note: "vira FOGO; em grupo, Death Echo" },
    ],
    burst: [
      { t: 0, spellId: "hells-core", note: "73 sqm, 1100 mana; trava ataque 4 s" },
      { t: 4, spellId: "ultimate-flame-strike", note: "+35% do Focus Mastery" },
      { t: 6, spellId: "great-fire-wave", note: "volta ao ciclo" },
    ],
    runes: "Great Fireball. Runic Mastery na Wheel dá 25% de chance de +20% de ML na runa que o sorcerer fabrica.",
    singleTarget: "Ultimate Flame Strike > Strong Flame Strike > SD ou Death Echo convertidos em fogo.",
    wheel: "Lord of Destruction T2 + Death Echo T2 (solo) ou Beam Mastery T2 + Energy Wave T1 (team). Gema: RM Lord of Destruction, Great Fire Wave base ou Hell's Core base.",
  },
  {
    id: "death",
    name: "Death",
    element: "death",
    stance: "death",
    description: "Master of Decay (+30% crit extra em death natural) + Aura of Exposed Weakness. Ciclo com o augment T1 do Death Echo (4 s).",
    cycle: [
      { t: 0, spellId: "death-echo", note: "5x5 + eco de 50%; natural" },
      { t: 2, spellId: "great-death-beam", note: "natural; Beam Mastery reduz cooldowns" },
      { t: 4, spellId: "energy-wave", note: "vira DEATH" },
      { t: 6, spellId: "death-echo", note: "só com o augment de -2 s; sem ele, SD" },
    ],
    burst: [
      { t: 0, spellId: "great-death-beam", note: "arma a conversão" },
      { t: 2, spellId: "rage-of-the-skies", note: "vira DEATH em 85 sqm (a conferir no jogo)" },
      { t: 6, spellId: "ultimate-energy-strike", note: "+35% do Focus Mastery" },
    ],
    runes: "SD a cada 2 s em alvo único; Thunderstorm ou Avalanche em área não convertem, mas cabem entre feitiços.",
    singleTarget: "SD + Death Echo + Strong Strike convertido.",
    wheel: "Death Echo T2 (+12% base, -2 s) + Beam Mastery T1/T2 + LoD T1/T2. Gema: Great Death Beam base ou RM Beam Mastery.",
  },
];
