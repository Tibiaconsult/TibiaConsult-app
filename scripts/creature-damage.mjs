// Extrai da TibiaWiki o dano que cada criatura das hunts causa (golpe físico e cada ataque com faixa e elemento)
// e grava src/data/creature-damage.ts. Rodar de novo quando a wiki mudar:  node scripts/creature-damage.mjs
// Usa a API da wiki (api.php); a página HTML fica atrás de um desafio anti-robô.

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://tibia.fandom.com/api.php";
const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

// nomes das criaturas das fichas de hunt (objetos com name e taken, ou o atalho c("Nome", ...))
const names = new Set();
for (const f of ["hunts.ts", "hunts-extra.ts", "hunts-high.ts", "hunts-high2.ts"]) {
  const src = read(`src/data/${f}`);
  for (const m of src.matchAll(/\{ name: "([^"]+)", hp:/g)) names.add(m[1]);
  for (const m of src.matchAll(/\bc\("([^"]+)",\s*\d/g)) names.add(m[1]);
}

async function api(params) {
  const u = new URL(API);
  for (const [k, v] of Object.entries({ format: "json", formatversion: "2", ...params })) u.searchParams.set(k, v);
  for (let i = 0; i < 4; i++) {
    const r = await fetch(u, { headers: { "User-Agent": "TibiaConsult/1.0 (ferramenta de fãs)" } });
    if (r.ok) return r.json();
    await new Promise((res) => setTimeout(res, 2000 * 2 ** i));
  }
  throw new Error(`API falhou: ${u}`);
}

/** Modelos {{...}} de primeiro nível dentro de um texto (respeita chaves aninhadas). */
function templates(txt) {
  const out = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < txt.length - 1; i++) {
    if (txt[i] === "{" && txt[i + 1] === "{") {
      if (depth === 0) start = i;
      depth++;
      i++;
    } else if (txt[i] === "}" && txt[i + 1] === "}") {
      depth--;
      i++;
      if (depth === 0 && start >= 0) out.push(txt.slice(start + 2, i - 1));
    }
  }
  return out;
}

/** Divide os parâmetros de um modelo pelo "|" de primeiro nível. */
function params(body) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === "{{" || two === "[[" || two === "}}" || two === "]]") {
      depth += two[0] === "{" || two[0] === "[" ? 1 : -1;
      cur += two;
      i++;
    } else if (body[i] === "|" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += body[i];
  }
  parts.push(cur);
  return parts.map((p) => p.trim());
}

const clean = (s) =>
  s
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Maior valor da primeira faixa do texto: "350-720" → 720, "0-550+" → 550, "370" → 370. */
function maxOf(range) {
  const m = clean(range).match(/(\d[\d,.]*)\s*(?:-|to|–)\s*(\d[\d,.]*)|(\d[\d,.]*)/);
  if (!m) return null;
  const n = Number((m[2] ?? m[3]).replace(/[,.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const ELEMENTS = {
  physical: "physical",
  bleed: "physical",
  bleeding: "physical",
  fire: "fire",
  burning: "fire",
  energy: "energy",
  electrified: "energy",
  ice: "ice",
  freezing: "ice",
  earth: "earth",
  poison: "earth",
  poisoned: "earth",
  death: "death",
  cursed: "death",
  holy: "holy",
  dazzled: "holy",
  "life drain": "lifedrain",
  "mana drain": "manadrain",
  drown: "drown",
};
const elementOf = (s) => ELEMENTS[clean(s).toLowerCase()] ?? null;

function parse(txt) {
  const i = txt.search(/\|\s*abilities\s*=/i);
  if (i < 0) return null;
  const list = templates(txt.slice(i)).find((t) => /^Ability List/i.test(t)) ?? "Ability List";
  let melee = null;
  const attacks = [];
  for (const t of templates(list.replace(/^Ability List\s*/i, ""))) {
    const p = params(t);
    const kind = p[0].toLowerCase();
    if (kind === "melee") {
      melee = maxOf(p[1] ?? "");
      continue;
    }
    if (kind !== "ability") continue;
    const named = Object.fromEntries(p.filter((x) => /^[a-z_]+\s*=/.test(x)).map((x) => [x.split("=")[0].trim(), x.slice(x.indexOf("=") + 1).trim()]));
    const pos = p.slice(1).filter((x) => !/^[a-z_]+\s*=/.test(x));
    const max = maxOf(pos[1] ?? "");
    const element = elementOf(named.element ?? pos[2] ?? "");
    if (!max || !element) continue;
    attacks.push({ name: clean(pos[0] ?? "").slice(0, 60), max, element });
  }
  // sem ataques com números: usa o campo "maxdmg" ({{Max Damage|physical=400|earth=200}}), quando a wiki traz
  if (!attacks.length) {
    const j = txt.search(/\|\s*maxdmg\s*=/i);
    const md = j >= 0 ? templates(txt.slice(j, j + 400)).find((t) => /^Max Damage/i.test(t)) : null;
    for (const x of md ? params(md).slice(1) : []) {
      const [k, v] = x.split("=").map((y) => y.trim());
      const element = elementOf(k ?? "");
      const max = maxOf(v ?? "");
      if (element && max) attacks.push({ name: "dano máximo listado", max, element });
    }
  }
  return { melee, attacks };
}

const out = {};
const list = [...names];
for (let k = 0; k < list.length; k += 40) {
  const d = await api({ action: "query", prop: "revisions", rvprop: "content", rvslots: "main", redirects: "1", titles: list.slice(k, k + 40).join("|") });
  const back = new Map([...(d.query.redirects ?? []), ...(d.query.normalized ?? [])].map((r) => [r.to, r.from]));
  for (const p of d.query.pages ?? []) {
    if (p.missing) continue;
    const txt = p.revisions[0].slots.main.content;
    if (!/Infobox[ _]Creature/i.test(txt)) continue;
    const r = parse(txt);
    if (r && (r.melee || r.attacks.length)) out[back.get(p.title) ?? p.title] = r;
  }
}

const today = new Date().toISOString().slice(0, 10).split("-").reverse().join("/");
const missing = list.filter((n) => !out[n]).sort();
writeFileSync(
  new URL("src/data/creature-damage.ts", root),
  `// Dano das criaturas das hunts: golpe físico (melee) e cada ataque com o maior valor e o elemento.
// Gerado por scripts/creature-damage.mjs a partir da TibiaWiki (lista de habilidades de cada criatura) em ${today}.
// ${Object.keys(out).length} de ${list.length} criaturas têm dano listado na wiki. Sem dados: ${missing.join(", ") || "nenhuma"}.

export type DamageElement = "physical" | "fire" | "energy" | "ice" | "earth" | "death" | "holy" | "lifedrain" | "manadrain" | "drown";

export interface CreatureDamage {
  /** maior golpe físico corpo a corpo */
  melee: number | null;
  attacks: { name: string; max: number; element: DamageElement }[];
}

export const CREATURE_DAMAGE: Record<string, CreatureDamage> = {
${Object.entries(out)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join("\n")}
};
`,
);
console.log(`${Object.keys(out).length} de ${list.length} criaturas com dano.`);
console.log(`Sem dados (${missing.length}): ${missing.join(", ")}`);
