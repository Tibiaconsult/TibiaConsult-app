// "Preparar para esta hunt": a partir da ficha da hunt, monta set, imbuements, combo e charm para a vocação.
// Tudo sai dos dados do site: resistências e ataques dos bichos (TibiaWiki), equipamento por vocação e o simulador de rotação.
// É um ponto de partida automático, não um set testado em jogo; cada parte abre na ferramenta própria para ajustar.

import type { Element } from "@/data/spells";
import type { Hunt } from "@/data/hunts";
import { ROTATIONS } from "@/data/rotations";
import { VOCATIONS } from "@/data/vocations";
import { EL_PT, SetVoc, incomingProfile, offenseRanking, suggestSet } from "@/lib/huntset";
import { SetChoice, SlotId, findItem, recommendedSet } from "@/lib/set";
import { Build } from "@/lib/vocbuild";
import { ComboStep } from "@/lib/combo";
import { defaultInputs, simulateRotation, spellDamage, usable } from "@/lib/vocsim";

export const ALL_ELEMENTS: Element[] = ["physical", "fire", "energy", "ice", "earth", "death", "holy"];

/** Charm de dano de cada elemento. */
export const CHARM_OF: Record<Element, string> = {
  physical: "Wound",
  fire: "Enflame",
  energy: "Zap",
  ice: "Freeze",
  earth: "Poison",
  death: "Curse",
  holy: "Divine Wrath",
};

export interface CharmPick {
  el: Element;
  charm: string;
  /** sensibilidade média ponderada pelo peso no lure */
  avg: number;
  min: number;
  max: number;
}

/** Charms de dano pela resistência média dos bichos: o charm ignora stance e set, então vale o elemento que mais entra. */
export function charmRanking(h: Hunt): CharmPick[] {
  const tot = h.creatures.reduce((a, c) => a + (c.weight ?? 1), 0) || 1;
  return ALL_ELEMENTS.map((el) => {
    const vals = h.creatures.map((c) => c.taken[el] ?? 100);
    return {
      el,
      charm: CHARM_OF[el],
      avg: h.creatures.reduce((a, c) => a + (c.taken[el] ?? 100) * (c.weight ?? 1), 0) / tot,
      min: Math.min(...vals),
      max: Math.max(...vals),
    };
  }).sort((a, b) => b.avg - a.avg);
}

/** Linhas da ficha que já falam de charm (escritas à mão para a hunt). */
export function charmNotes(h: Hunt): string[] {
  return h.play.filter((p) => /charm/i.test(p));
}

// ---------------------------------------------------------------- imbuements

const PROT_IMB: Partial<Record<Element, string>> = {
  fire: "dragon-hide",
  earth: "snake-skin",
  ice: "quara-scale",
  energy: "cloud-fabric",
  death: "lich-shroud",
  holy: "demon-presence",
};
const DMG_IMB: Partial<Record<Element, string>> = { fire: "scorch", earth: "venom", ice: "frost", energy: "electrify", death: "reap" };

export interface ImbuePick {
  slot: string;
  id: string;
  why: string;
}

/** Elementos que mais batem, sem o físico (não há imbuement de proteção física). */
function protOrder(h: Hunt): Element[] {
  const p = incomingProfile(h);
  const order = (Object.entries(p) as [Element, number][])
    .filter(([el, v]) => el !== "physical" && v > 0 && PROT_IMB[el])
    .sort((a, b) => b[1] - a[1])
    .map(([el]) => el);
  return order.length ? order : ["death", "fire"];
}

/**
 * Imbuements sugeridos por slot, todos no nível Powerful.
 * Magos: Epiphany e Void na arma e no elmo. Knight, paladin e monk: Strike, Vampirism e Void na arma e skill no elmo;
 * quando o físico entra bem menos que o melhor elemento, o Strike vira o imbuement de dano desse elemento.
 * Armadura: Vampirism + a proteção do elemento que mais bate; spellbook ou escudo: a segunda proteção.
 */
export function suggestImbuements(h: Hunt, voc: SetVoc, weaponKind = ""): { picks: ImbuePick[]; converted: Element | null } {
  const prot = protOrder(h);
  const p1 = prot[0];
  const p2 = prot[1] ?? prot[0];
  const out: ImbuePick[] = [];
  let converted: Element | null = null;
  const protWhy = (el: Element) => `os bichos batem com ${EL_PT[el]}`;

  if (voc === "sorcerer" || voc === "druid") {
    out.push({ slot: "Arma", id: "epiphany", why: "+4 de magic level" }, { slot: "Arma", id: "void", why: "mana" });
    out.push({ slot: "Elmo", id: "epiphany", why: "+4 de magic level" }, { slot: "Elmo", id: "void", why: "mana" });
    out.push({ slot: "Armadura", id: "vampirism", why: "vida" }, { slot: "Armadura", id: PROT_IMB[p1]!, why: protWhy(p1) });
    out.push({ slot: "Spellbook", id: PROT_IMB[p2]!, why: protWhy(p2) });
  } else {
    const rank = offenseRanking(h, "monk");
    const phys = rank.find((r) => r.el === "physical")?.pct ?? 100;
    const bestEl = rank.find((r) => r.el !== "physical" && DMG_IMB[r.el]);
    let first = { id: "strike", why: "crítico" };
    if (bestEl && bestEl.pct - phys >= 15) {
      converted = bestEl.el;
      first = { id: DMG_IMB[bestEl.el]!, why: `físico entra ${Math.round(phys)}%, ${EL_PT[bestEl.el]} ${Math.round(bestEl.pct)}%` };
    }
    out.push({ slot: "Arma", ...first }, { slot: "Arma", id: "vampirism", why: "vida" }, { slot: "Arma", id: "void", why: "mana" });
    const skill =
      voc === "paladin"
        ? "precision"
        : voc === "monk"
          ? "punch"
          : weaponKind.startsWith("Machado")
            ? "chop"
            : weaponKind.startsWith("Clava")
              ? "bash"
              : "slash";
    out.push({ slot: "Elmo", id: skill, why: "+4 de skill" }, { slot: "Elmo", id: "void", why: "mana" });
    out.push({ slot: "Armadura", id: "vampirism", why: "vida" }, { slot: "Armadura", id: PROT_IMB[p1]!, why: protWhy(p1) });
    if (voc === "knight") out.push({ slot: "Escudo", id: PROT_IMB[p2]!, why: protWhy(p2) });
  }
  out.push({ slot: "Botas", id: "swiftness", why: "velocidade" });
  return { picks: out, converted };
}

/** Lista de compras para /ferramentas/imbuements?sel=id:nível:quantidade (nível 2 = Powerful). */
export function imbueCartParam(picks: ImbuePick[]): string {
  const n = new Map<string, number>();
  for (const p of picks) n.set(p.id, (n.get(p.id) ?? 0) + 1);
  return [...n.entries()].map(([id, q]) => `${id}:2:${q}`).join(",");
}

// ---------------------------------------------------------------- set

const SORC_SLOT: Record<string, SlotId> = {
  Arma: "wand",
  Spellbook: "spellbook",
  Elmo: "helmet",
  Armadura: "armor",
  Pernas: "legs",
  Botas: "boots",
  Anel: "ring",
  Amuleto: "amulet",
};
const SORC_IMB: Record<string, string> = {
  epiphany: "epiphany",
  void: "void",
  vampirism: "vampirism",
  swiftness: "swiftness",
  "dragon-hide": "dragonhide",
  "snake-skin": "snakeskin",
  "quara-scale": "quarascale",
  "cloud-fabric": "cloudfabric",
  "lich-shroud": "lichshroud",
};

/** Set do sorcerer no formato do montador completo: o recomendado, com as peças e imbuements da hunt onde o montador conhece o item. */
export function sorcererSet(h: Hunt, level: number, imbues: ImbuePick[]): SetChoice {
  const s = recommendedSet();
  for (const p of suggestSet(h, "sorcerer", level).picks) {
    const slot = SORC_SLOT[p.slot];
    if (slot && p.item && findItem(slot, p.item.name)) s[slot] = { ...s[slot], item: p.item.name };
  }
  for (const [label, slot] of Object.entries(SORC_SLOT)) {
    const mine = imbues.filter((i) => i.slot === label && SORC_IMB[i.id]);
    if (mine.length) s[slot] = { ...s[slot], imbues: mine.map((i) => ({ kind: SORC_IMB[i.id], level: 3 as const })) };
  }
  return s;
}

/** Set das outras vocações no formato do montador por vocação. */
export function vocBuild(h: Hunt, voc: Exclude<SetVoc, "sorcerer">, level: number): { build: Build; imbues: ImbuePick[]; converted: Element | null } {
  const s = suggestSet(h, voc, level);
  const weapon = s.picks.find((p) => p.slot === "Arma")?.item;
  const { picks: imbues, converted } = suggestImbuements(h, voc, weapon?.kind ?? "");
  const build: Build = {};
  for (const p of s.picks) {
    if (!p.item) continue;
    const mine = imbues.filter((i) => i.slot === p.slot).slice(0, p.item.imb);
    build[p.slot] = { item: p.item.name, tier: 0, imbues: mine.map((i) => ({ id: i.id, tier: 2 })) };
  }
  return { build, imbues: imbues.filter((i) => build[i.slot]?.imbues.some((x) => x.id === i.id) ?? false), converted };
}

// ---------------------------------------------------------------- combo

export const SORC_STANCE: Partial<Record<Element, string>> = { fire: "Master of Flames", energy: "Master of Thunder", death: "Master of Decay" };

export interface ComboPlan {
  stance: string;
  steps: ComboStep[];
  /** query para /rotacoes (sem o #montador) */
  query: string;
  note: string;
}

/** Combo da hunt. Sorcerer: a rotação pronta do melhor elemento. Druid, knight e paladin: os primeiros 12 s da rotação que mais causa dano no simulador. */
export function comboPlan(
  h: Hunt,
  voc: SetVoc,
  char: { level: number; magic_level: number; skill: number | null } | null,
  weaponElement: Element | null,
): ComboPlan | null {
  if (voc === "monk") return null;
  if (voc === "sorcerer") {
    const best = offenseRanking(h, "sorcerer")[0].el;
    const rot = ROTATIONS.find((r) => r.stance === best) ?? ROTATIONS[0];
    const steps = rot.cycle.map((s) => ({ t: s.t, spellId: s.spellId }));
    return {
      stance: SORC_STANCE[rot.stance] ?? rot.stance,
      steps,
      query: `voc=sorcerer&combo=${steps.map((s) => `${s.t}:${s.spellId}`).join(",")}&stance=${rot.stance}`,
      note: `Ciclo de ${rot.name.toLowerCase()}: ${EL_PT[best]} é o elemento que mais entra para sorcerer nesta hunt.`,
    };
  }
  const v = VOCATIONS[voc];
  const inp = defaultInputs(v);
  if (char) {
    inp.level = char.level;
    if (char.magic_level > 0) inp.magicLevel = char.magic_level;
    if (char.skill) inp.skill = char.skill;
  }
  if (voc === "knight" && weaponElement) inp.weaponElement = weaponElement;
  const rows = v.spells.filter((s) => usable(v, inp, s)).map((s) => spellDamage(v, inp, s, h, null));
  const rot = simulateRotation(v, rows, 12);
  const steps = rot.casts.map((c) => ({ t: c.t, spellId: c.id }));
  if (!steps.length) return null;
  return {
    stance: inp.stance,
    steps,
    query: `voc=${voc}&combo=${steps.map((s) => `${s.t}:${s.spellId}`).join(",")}`,
    note: `Abertura com ${inp.targets} bichos no lure: a cada liberação do grupo de ataque, a magia pronta que mais causa dano nesta hunt, pelo simulador.`,
  };
}
