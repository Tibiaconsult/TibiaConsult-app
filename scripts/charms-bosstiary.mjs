// Extrai da TibiaWiki os charms (custo e efeito por nível) e a lista de bosses do Bosstiary por categoria,
// e grava src/data/charms.ts e src/data/bosses.ts. Rodar de novo quando a wiki mudar:  node scripts/charms-bosstiary.mjs
// Usa a API da wiki (api.php); a página HTML fica atrás de um desafio anti-robô.

import { writeFileSync } from "node:fs";

const API = "https://tibia.fandom.com/api.php";
const root = new URL("..", import.meta.url);

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

/** Todos os membros de uma categoria (páginas do espaço principal), seguindo a paginação. */
async function members(cat) {
  const out = [];
  let cont = {};
  do {
    const d = await api({ action: "query", list: "categorymembers", cmtitle: `Category:${cat}`, cmlimit: "500", cmnamespace: "0", ...cont });
    out.push(...d.query.categorymembers.map((m) => m.title));
    cont = d.continue ?? null;
  } while (cont);
  return out;
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

async function contents(titles) {
  const out = new Map();
  for (const part of chunk(titles, 40)) {
    const d = await api({ action: "query", prop: "revisions", rvprop: "content", rvslots: "main", titles: part.join("|") });
    for (const p of d.query.pages) if (!p.missing) out.set(p.title, p.revisions[0].slots.main.content);
  }
  return out;
}

/** Campo de uma infobox, sem links e marcações da wiki. */
function field(txt, key) {
  const m = txt.match(new RegExp(`\\|\\s*${key}\\s*=([\\s\\S]*?)(?=\\n\\s*\\|\\s*[a-z_]+\\s*=|\\n\\}\\})`, "i"));
  if (!m) return "";
  return m[1]
    .replace(/<ref[\s\S]*?<\/ref>/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const deprecated = new Set(await members("Deprecated"));
const today = new Date().toISOString().slice(0, 10).split("-").reverse().join("/");

// ------------------------------------------------------------ charms
// A wiki não separa os charms por função; a classificação abaixo é do site, pelo efeito de cada um.
const KIND = {
  dano: ["Zap", "Enflame", "Freeze", "Poison", "Curse", "Divine Wrath", "Wound", "Carnage", "Overflux", "Overpower", "Low Blow", "Savage Blow"],
  defesa: ["Dodge", "Parry", "Numb", "Cripple", "Adrenaline Burst", "Cleanse", "Bless"],
};
const kindOf = (name) => (KIND.dano.includes(name) ? "dano" : KIND.defesa.includes(name) ? "defesa" : "utilidade");

const charmTitles = (await members("Charms")).filter((t) => !deprecated.has(t) && !t.includes(":"));
const charmTxt = await contents(charmTitles);
const charms = [];
for (const [title, txt] of charmTxt) {
  if (!/Infobox[ _]Charm/i.test(txt) || field(txt, "status") === "deprecated") continue;
  // "320 / 480 / 1600" ou "800, 1200, 4000" (e "1,800" com separador de milhar)
  const cost = field(txt, "cost")
    .split(/\s*\/\s*|,\s+/)
    .map((x) => Number(x.replace(/[^\d]/g, "")))
    .filter((x) => x > 0);
  const name = (field(txt, "name") || title).replace(/ \(Charm\)$/, "");
  charms.push({
    name,
    type: field(txt, "type").toLowerCase() === "minor" ? "minor" : "major",
    kind: kindOf(name),
    cost,
    effect: field(txt, "effect"),
    notes: field(txt, "notes"),
  });
}
charms.sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(
  new URL("src/data/charms.ts", root),
  `// Charms. Gerado por scripts/charms-bosstiary.mjs a partir da TibiaWiki (infobox de cada charm) em ${today}.
// Custo por nível (1, 2 e 3); o efeito vem como na wiki, em inglês, com os três níveis separados por " / ".
// Tipo (dano, defesa, utilidade) é classificação do site; a wiki não separa.

export type CharmKind = "dano" | "defesa" | "utilidade";

// Regras dos dois tipos (TibiaWiki, Major Charms e Minor Charms):
// - major: pago em charm points (vêm do bestiário completo) e só vai em criatura com o bestiário completo;
// - minor: pago em Minor Charm Echoes e vai em criatura com o estágio 2 do bestiário.
// Cada nível comprado de um charm major rende echoes; char promovido ganha 100 echoes.
export const ECHOES_PER_MAJOR_LEVEL = [50, 100, 200];
export const ECHOES_PROMOTION = 100;

export interface Charm {
  name: string;
  /** major: charm points; minor: Minor Charm Echoes */
  type: "major" | "minor";
  kind: CharmKind;
  cost: number[];
  effect: string;
  notes: string;
}

export const CHARM_LIST: Charm[] = ${JSON.stringify(charms, null, 2)};
`,
);
console.log(`${charms.length} charms.`);

// ------------------------------------------------------------ bosstiary
const bosses = [];
for (const [cat, id] of [
  ["Bane Bosses", "bane"],
  ["Archfoe Bosses", "archfoe"],
  ["Nemesis Bosses", "nemesis"],
])
  for (const name of await members(cat)) if (!deprecated.has(name)) bosses.push([name, id]);
bosses.sort((a, b) => a[0].localeCompare(b[0]));

writeFileSync(
  new URL("src/data/bosses.ts", root),
  `// Bosstiary. Gerado por scripts/charms-bosstiary.mjs a partir da TibiaWiki (categorias Bane, Archfoe e Nemesis Bosses) em ${today}.
// Kills e pontos por categoria: TibiaWiki, Bosstiary/Categories.

export type BossCategory = "bane" | "archfoe" | "nemesis";

export const BOSS_CATEGORY: Record<BossCategory, { label: string; kills: [number, number, number]; points: [number, number, number]; text: string }> = {
  bane: { label: "Bane", kills: [25, 100, 300], points: [5, 15, 30], text: "pode ser morto mais de uma vez em 20 horas" },
  archfoe: { label: "Archfoe", kills: [5, 20, 60], points: [10, 30, 60], text: "uma vez a cada 20 a 48 horas" },
  nemesis: { label: "Nemesis", kills: [1, 3, 5], points: [10, 30, 60], text: "aparece raramente ou tem cooldown maior que 48 horas" },
};

/** [nome, categoria] */
export const BOSSES: [string, BossCategory][] = ${JSON.stringify(bosses)};
`,
);
console.log(`${bosses.length} bosses (${["bane", "archfoe", "nemesis"].map((c) => `${c} ${bosses.filter((b) => b[1] === c).length}`).join(", ")}).`);
