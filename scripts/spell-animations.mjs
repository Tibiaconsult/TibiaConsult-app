// Extrai da TibiaWiki a animação de cada magia do site e grava src/data/spell-animations.ts.
// Rodar de novo quando a wiki ganhar animações novas:  node scripts/spell-animations.mjs
//
// Lê os nomes das magias direto de src/data/spells.ts (sorcerer) e src/data/vocations.ts (demais vocações),
// pergunta à API da wiki quais imagens cada página usa e fica com a que tem "animation" no nome.
// A página HTML da wiki fica atrás de um desafio anti-robô; a API (api.php) responde normalmente.

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://tibia.fandom.com/api.php";
const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

/** id e nome de cada magia, na ordem dos arquivos, sem repetir id. */
function spellNames() {
  const out = new Map();
  const sorc = read("src/data/spells.ts");
  for (const m of sorc.matchAll(/id: "([a-z0-9-]+)",\s*name: "([^"]+)"/g)) out.set(m[1], m[2]);
  const voc = read("src/data/vocations.ts");
  for (const m of voc.matchAll(/\{ id: "([a-z0-9-]+)", name: "([^"]+)"/g)) out.set(m[1], m[2]);
  for (const m of voc.matchAll(/M\("([a-z0-9-]+)", "([^"]+)"/g)) out.set(m[1], m[2]);
  return out;
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

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

const names = spellNames();
// no site as runas levam " (runa)"; na wiki a página é "<nome> Rune"
const base = (name) => name.replace(/ \(runa\)$/, "");
const wikiTitle = (name) => (/ \(runa\)$/.test(name) ? `${base(name)} Rune` : name);
const byTitle = new Map(); // título da página na wiki -> ids
for (const [id, name] of names) byTitle.set(wikiTitle(name), [...(byTitle.get(wikiTitle(name)) ?? []), id]);

const isAnim = (f) => /animation|effect/i.test(f) && !/icon/i.test(f);
// ordem de preferência: "<magia> animation", "<magia> Effect", o resto
const rank = (f, title) => {
  const t = base(title).toLowerCase();
  const n = f.toLowerCase();
  if (n.startsWith(t) && /animation/.test(n)) return 0;
  if (n.startsWith(t) && /effect/.test(n)) return n.includes("(") ? 2 : 1;
  return 3;
};

// 1) imagens usadas na página de cada magia (com redirecionamento resolvido)
const found = new Map(); // título -> arquivos candidatos
for (const titles of chunk([...byTitle.keys()], 40)) {
  const d = await api({ action: "query", titles: titles.join("|"), prop: "images", imlimit: "max", redirects: "1" });
  const redirect = new Map((d.query.redirects ?? []).map((r) => [r.to, r.from]));
  const normal = new Map((d.query.normalized ?? []).map((n) => [n.to, n.from]));
  for (const p of d.query.pages ?? []) {
    const files = (p.images ?? []).map((i) => i.title.replace(/^File:/, "")).filter(isAnim);
    const asked = redirect.get(p.title) ?? normal.get(p.title) ?? p.title;
    found.set(asked, files);
  }
}
// 2) arquivos com o nome da magia que a página não usa (ex.: "Strong Ice Wave animation", "Death Echo Effect")
for (const title of byTitle.keys()) {
  const d = await api({ action: "query", list: "allimages", aiprefix: base(title).replace(/ /g, "_"), ailimit: "50" });
  const extra = (d.query.allimages ?? []).map((i) => i.name.replace(/_/g, " ")).filter(isAnim);
  found.set(title, [...new Set([...(found.get(title) ?? []), ...extra])]);
}
const anim = new Map(); // título -> arquivo escolhido
for (const [title, files] of found) {
  const best = [...files].sort((a, b) => rank(a, title) - rank(b, title))[0];
  // só aceita arquivo de outra magia quando a própria página da magia o usa (ex.: Fierce Berserk usa "Berserk animation")
  if (best && (rank(best, title) < 3 || /animation/i.test(best))) anim.set(title, best);
}

// 2) tamanho de cada animação
const size = new Map();
for (const files of chunk([...new Set(anim.values())], 40)) {
  const d = await api({ action: "query", titles: files.map((f) => `File:${f}`).join("|"), prop: "imageinfo", iiprop: "size" });
  for (const p of d.query.pages ?? []) {
    const ii = p.imageinfo?.[0];
    if (ii) size.set(p.title.replace(/^File:/, ""), { w: ii.width, h: ii.height });
  }
}

const rows = [];
for (const [title, ids] of byTitle) {
  const file = anim.get(title);
  if (!file || !size.has(file)) continue;
  const { w, h } = size.get(file);
  for (const id of ids) rows.push(`  "${id}": { file: ${JSON.stringify(file.replace(/\.gif$/i, ""))}, w: ${w}, h: ${h} },`);
}
const missing = [...names].filter(([id]) => !rows.some((r) => r.startsWith(`  "${id}"`))).map(([, n]) => n);

const today = new Date().toISOString().slice(0, 10).split("-").reverse().join("/");
writeFileSync(
  new URL("src/data/spell-animations.ts", root),
  `// Animação de cada magia (GIF da TibiaWiki, "<magia> animation.gif"). Gerado por scripts/spell-animations.mjs em ${today}.
// ${rows.length} de ${names.size} magias têm animação na wiki. Sem animação: ${missing.join(", ") || "nenhuma"}.

export interface SpellAnimation {
  /** nome do arquivo na TibiaWiki, sem .gif (usar com wikiImage) */
  file: string;
  w: number;
  h: number;
}

export const SPELL_ANIMATIONS: Record<string, SpellAnimation> = {
${rows.join("\n")}
};
`,
);
console.log(`${rows.length} de ${names.size} magias com animação.`);
console.log(`Sem animação (${missing.length}): ${missing.join(", ")}`);
