// Ficha das creatures das hunts cadastradas: sprite, HP, exp, armadura, mitigação, velocidade, bestiário, resistências,
// imunidades, onde vive e loot (raridade da wiki + chance real das estatísticas de loot da comunidade, quando houver).
// Grava src/data/creatures.ts. Rodar de novo quando a wiki mudar:  node scripts/creatures.mjs
// (no ambiente com proxy: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=... node scripts/creatures.mjs)

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://tibia.fandom.com/api.php";
const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

// creatures com o mesmo nome de um item: a página da criatura leva "(Creature)"
const PAGE = { Sabretooth: "Sabretooth (Creature)" };

const names = new Set();
for (const f of ["hunts.ts", "hunts-extra.ts", "hunts-high.ts", "hunts-high2.ts"]) {
  const s = read(`src/data/${f}`);
  for (const m of s.matchAll(/\{ name: "([^"]+)", hp:/g)) names.add(m[1]);
  for (const m of s.matchAll(/\bc\("([^"]+)",\s*\d/g)) names.add(m[1]);
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

/** Campos "| chave = valor" de primeiro nível do Infobox Creature. */
function infobox(txt) {
  const box = templates(txt).find((t) => /^Infobox[ _]Creature/i.test(t));
  if (!box) return null;
  const out = {};
  for (const p of params(box).slice(1)) {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim().toLowerCase()] = p.slice(i + 1).trim();
  }
  return out;
}

const num = (s) => {
  const m = (s ?? "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};
const pct = (s) => {
  const n = num(s);
  return n === null ? null : n;
};
const yes = (s) => /^yes/i.test((s ?? "").trim());

function loot(field) {
  const table = templates(field ?? "").find((t) => /^Loot Table/i.test(t));
  if (!table) return [];
  const items = [];
  for (const t of templates(table.replace(/^Loot Table\s*/i, ""))) {
    const p = params(t);
    if (!/^Loot Item/i.test(p[0])) continue;
    const pos = p.slice(1).filter((x) => x && !/^[a-z_]+\s*=/i.test(x));
    let amount = null;
    if (pos[0] && /^\d/.test(pos[0])) amount = pos.shift();
    const name = clean(pos[0] ?? "");
    const rarity =
      (pos[1] ?? "")
        .toLowerCase()
        .replace(/[^a-z -]/g, "")
        .trim() || null;
    if (name) items.push({ name, amount, rarity });
  }
  return items;
}

/** Chance real de cada item pela página Loot Statistics. Cada bloco {{Loot2}} é de uma versão do jogo e o loot muda entre elas
 * (ex.: Gore Horn deixa Crystal Coin em 30% na 8.6 e 20% na 14.00), então vale o bloco da versão mais nova que tenha pelo menos
 * MIN_KILLS kills; se nenhum tiver, o de mais kills. */
const MIN_KILLS = 200;
const lootKey = (n) => n.trim().replace(/\s*\(item\)$/i, "").toLowerCase();
const verKey = (v) => (v ?? "").split(/[^\d]+/).filter(Boolean).slice(0, 3).map(Number);
const newer = (a, b) => {
  const x = verKey(a);
  const y = verKey(b);
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
};
function lootStats(txt) {
  const blocks = [];
  for (const t of templates(txt ?? "")) {
    if (!/^Loot2/i.test(t)) continue;
    const p = params(t);
    const kills = num(p.find((x) => /^kills\s*=/i.test(x))?.split("=")[1]);
    if (!kills) continue;
    const version = p.find((x) => /^version\s*=/i.test(x))?.split("=")[1].trim() ?? "";
    const drops = {};
    for (const x of p) {
      const m = x.match(/^([^,=]+),\s*times:\s*(\d+)/);
      const name = m && lootKey(m[1]);
      if (m && name !== "empty") drops[name] = (drops[name] ?? 0) + Number(m[2]);
    }
    blocks.push({ kills, version, drops });
  }
  const enough = blocks.filter((b) => b.kills >= MIN_KILLS);
  if (enough.length) return enough.reduce((a, b) => (newer(b.version, a.version) ? b : a));
  return blocks.reduce((a, b) => (b.kills > a.kills ? b : a), blocks[0] ?? null);
}

const MODS = ["physical", "earth", "fire", "death", "energy", "holy", "ice", "hpdrain", "drown", "heal"];

const out = {};
const list = [...names];
const pageOf = (n) => PAGE[n] ?? n;
for (let k = 0; k < list.length; k += 25) {
  const chunk = list.slice(k, k + 25);
  const titles = chunk.flatMap((n) => [pageOf(n), `Loot Statistics:${pageOf(n)}`]);
  const d = await api({ action: "query", prop: "revisions", rvprop: "content", rvslots: "main", redirects: "1", titles: titles.join("|") });
  const alias = new Map([...(d.query.normalized ?? []), ...(d.query.redirects ?? [])].map((r) => [r.to, r.from]));
  const byTitle = new Map();
  for (const p of d.query.pages ?? []) if (!p.missing) byTitle.set(alias.get(p.title) ?? p.title, p.revisions[0].slots.main.content);
  for (const n of chunk) {
    const txt = byTitle.get(pageOf(n));
    const ib = txt && infobox(txt);
    if (!ib) continue;
    const stats = lootStats(byTitle.get(`Loot Statistics:${pageOf(n)}`));
    const mods = {};
    for (const m of MODS) {
      const v = pct(ib[m === "heal" ? "healmod" : `${m}dmgmod`]);
      if (v !== null) mods[m] = v;
    }
    out[n] = {
      name: n,
      page: pageOf(n),
      hp: num(ib.hp),
      exp: num(ib.exp),
      armor: num(ib.armor),
      mitigation: num(ib.mitigation),
      speed: num(ib.speed),
      cls: clean(ib.bestiaryclass ?? "") || null,
      level: clean(ib.bestiarylevel ?? "") || null,
      occurrence: clean(ib.occurrence ?? "") || null,
      paraimmune: yes(ib.paraimmune),
      senseinvis: yes(ib.senseinvis),
      pushable: yes(ib.pushable),
      walksaround: clean(ib.walksaround ?? "").replace(/^--$/, "") || null,
      mods,
      location: clean((ib.location ?? "").replace(/<[^>]+>/g, " ")).slice(0, 400) || null,
      kills: stats?.kills ?? null,
      loot: loot(ib.loot).map((it) => {
        const times = stats?.drops[lootKey(it.name)];
        return { ...it, chance: stats && times !== undefined ? Math.round((times / stats.kills) * 1000) / 10 : null };
      }),
    };
  }
}

const today = new Date().toISOString().slice(0, 10).split("-").reverse().join("/");
const missing = list.filter((n) => !out[n]).sort();
writeFileSync(
  new URL("src/data/creatures.ts", root),
  `// Ficha das creatures das hunts cadastradas. Gerado por scripts/creatures.mjs a partir da TibiaWiki (Infobox Creature e
// Loot Statistics) em ${today}. ${Object.keys(out).length} de ${list.length} creatures. Sem ficha: ${missing.join(", ") || "nenhuma"}.

export interface LootItem {
  name: string;
  /** quantidade por drop ("1-2"), quando a wiki informa */
  amount: string | null;
  /** raridade da wiki: always, common, uncommon, semi-rare, rare, very rare */
  rarity: string | null;
  /** chance real (%) pelas estatísticas de loot da comunidade */
  chance: number | null;
}

export interface Creature {
  name: string;
  /** página na TibiaWiki (difere do nome quando há item homônimo) */
  page: string;
  hp: number | null;
  exp: number | null;
  armor: number | null;
  mitigation: number | null;
  speed: number | null;
  /** classe e dificuldade no bestiário */
  cls: string | null;
  level: string | null;
  occurrence: string | null;
  paraimmune: boolean;
  senseinvis: boolean;
  pushable: boolean;
  walksaround: string | null;
  /** dano recebido por elemento (%): 100 = normal, acima = fraqueza, abaixo = resistência */
  mods: Partial<Record<"physical" | "earth" | "fire" | "death" | "energy" | "holy" | "ice" | "hpdrain" | "drown" | "heal", number>>;
  location: string | null;
  /** kills da estatística de loot usada nas chances */
  kills: number | null;
  loot: LootItem[];
}

export const CREATURES: Record<string, Creature> = {
${Object.values(out)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((v) => `  ${JSON.stringify(v.name)}: ${JSON.stringify(v)},`)
  .join("\n")}
};
`,
);
console.log(`${Object.keys(out).length} de ${list.length} creatures.`);
console.log(`Sem ficha (${missing.length}): ${missing.join(", ")}`);
