// Índice da busca rápida do topo. É carregado só quando alguém abre a busca (import dinâmico), para não pesar nas outras páginas.

import { BESTIARY } from "@/data/bestiary";
import { SLOTS } from "@/data/equipment";
import { HUNTS } from "@/data/hunts";
import { IMBUEMENTS } from "@/data/imbuements";
import { SPELLS } from "@/data/spells";
import { VOC_EQUIPMENT } from "@/data/voc-equipment";
import { AMMO, JEWELRY } from "@/data/voc-extras";
import { VOCATIONS, VOC_IDS } from "@/data/vocations";
import { MENU } from "@/components/menu";

export interface SearchEntry {
  label: string;
  kind: string;
  href: string;
  /** texto extra que também casa na busca */
  extra?: string;
}

const VOC_LABEL: Record<string, string> = { sorcerer: "Sorcerer", druid: "Druid", knight: "Knight", paladin: "Paladin", monk: "Monk" };

export function buildIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];
  const seen = new Set<string>();
  const push = (e: SearchEntry) => {
    const k = e.kind + "|" + e.label + "|" + e.href;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(e);
  };

  for (const g of MENU) for (const i of g.items) push({ label: i.label, kind: `Página · ${g.label}`, href: i.href, extra: i.keywords });

  for (const h of HUNTS) push({ label: h.name, kind: `Hunt · ${h.city}`, href: `/hunts?h=${h.id}`, extra: h.creatures.map((c) => c.name).join(" ") });

  for (const s of SPELLS) push({ label: s.name, kind: "Magia · Sorcerer", href: `/cooldowns#spell-${s.id}`, extra: s.words });
  for (const v of VOC_IDS)
    for (const s of VOCATIONS[v].spells) push({ label: s.name, kind: `Magia · ${VOC_LABEL[v]}`, href: `/cooldowns?voc=${v}#spell-${s.id}`, extra: s.words });

  for (const slot of SLOTS)
    for (const it of slot.items)
      for (const name of it.name.split(" / ")) push({ label: name.trim(), kind: `Item · Sorcerer · ${slot.name}`, href: `/equipamento#${slot.id}` });
  for (const v of VOC_IDS)
    for (const r of VOC_EQUIPMENT[v] ?? [])
      push({ label: r.name, kind: `Item · ${VOC_LABEL[v]} · ${r.slot}`, href: `/equipamento?voc=${v}&slot=${encodeURIComponent(r.slot)}` });
  for (const r of [...JEWELRY, ...AMMO]) {
    const v = r.vocs.length === 1 ? r.vocs[0] : "knight";
    const who = r.vocs.length ? r.vocs.map((x) => VOC_LABEL[x]).join(", ") : "todas";
    push({ label: r.name, kind: `Item · ${r.slot} · ${who}`, href: `/equipamento?voc=${v}&slot=${encodeURIComponent(r.slot)}` });
  }

  for (const im of IMBUEMENTS)
    push({ label: im.name, kind: `Imbuement · ${im.pt}`, href: `/ferramentas/imbuements#${im.id}`, extra: im.materials.map((m) => m.item).join(" ") });

  // criaturas das hunts têm ficha própria (atributos, bestiário e loot)
  const withSheet = new Set(HUNTS.flatMap((h) => h.creatures.map((c) => c.name)));
  for (const name of withSheet) push({ label: name, kind: "Criatura · ficha e loot", href: `/criaturas/${encodeURIComponent(name)}` });

  for (const b of BESTIARY) push({ label: b[0], kind: "Criatura · Bestiary", href: `/ferramentas/bestiario?q=${encodeURIComponent(b[0])}` });

  return out;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ");

/** Busca simples: todas as palavras precisam aparecer; nome que começa com o termo vem primeiro. */
export function search(index: SearchEntry[], q: string, limit = 12): SearchEntry[] {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: [number, SearchEntry][] = [];
  for (const e of index) {
    const label = norm(e.label);
    const hay = label + " " + norm(e.kind) + " " + norm(e.extra ?? "");
    if (!words.every((w) => hay.includes(w))) continue;
    let score = 0;
    if (label.startsWith(words[0])) score += 10;
    if (words.every((w) => label.includes(w))) score += 5;
    if (e.kind.startsWith("Página")) score += 3;
    if (e.kind.startsWith("Hunt")) score += 2;
    score -= label.length / 100;
    scored.push([score, e]);
  }
  return scored
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map((x) => x[1]);
}
