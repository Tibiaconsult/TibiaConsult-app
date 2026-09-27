// Coordenadas de cada hunt no mapa (x, y, andar), tiradas da TibiaWiki ({{Mapper Coords}} da página do local de caça).
// Grava src/data/hunt-maps.ts. Rodar de novo quando entrar hunt nova:  node scripts/hunt-maps.mjs
// Hunts cuja página tem outro nome na wiki ficam em PAGE; as sem coordenada na wiki ficam em MANUAL.

import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

const hunts = [];
for (const f of ["hunts.ts", "hunts-extra.ts", "hunts-high.ts", "hunts-high2.ts"])
  for (const m of read(`src/data/${f}`).matchAll(/id: "([^"]+)",\s*\n\s*name: "([^"]+)"/g)) hunts.push({ id: m[1], name: m[2] });

// página da wiki quando o nome da hunt no site é diferente
const PAGE = JSON.parse(read("scripts/hunt-maps-pages.json"));
const title = (h) => PAGE[h.id] ?? h.name.replace(/\s*\(.*\)\s*$/, "").trim();

async function api(titles) {
  const u = new URL("https://tibia.fandom.com/api.php");
  for (const [k, v] of Object.entries({ action: "query", prop: "revisions", rvprop: "content", rvslots: "main", format: "json", formatversion: "2", redirects: "1", titles }))
    u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { "User-Agent": "TibiaConsult/1.0 (ferramenta de fãs)" } });
  return r.json();
}

/** "132.102" → 132*256+102 (o formato do Mapper da TibiaWiki). */
const coord = (s) => {
  const [a, b] = s.split(".");
  return Number(a) * 256 + Number(b ?? 0);
};

const out = {};
for (let i = 0; i < hunts.length; i += 40) {
  const chunk = hunts.slice(i, i + 40);
  const d = await api(chunk.map(title).join("|"));
  const alias = new Map([...(d.query.normalized ?? []), ...(d.query.redirects ?? [])].map((r) => [r.to, r.from]));
  const by = new Map();
  for (const p of d.query.pages ?? []) if (!p.missing) by.set(alias.get(p.title) ?? p.title, { title: p.title, txt: p.revisions[0].slots.main.content });
  for (const h of chunk) {
    const p = by.get(title(h));
    if (!p) continue;
    const m = p.txt.match(/\{\{Mapper Coords\|(?:text=[^|]*\|)?(\d+\.\d+)\|(\d+\.\d+)\|(\d+)/i);
    const img = p.txt.match(/\|\s*map\s*=\s*([^\n|]+\.(?:png|gif|jpg))/i);
    out[h.id] = { page: p.title, ...(m ? { x: coord(m[1]), y: coord(m[2]), z: Number(m[3]) } : {}), ...(img ? { img: img[1].trim() } : {}) };
  }
}

const MANUAL = JSON.parse(read("scripts/hunt-maps-manual.json"));
for (const [id, v] of Object.entries(MANUAL)) out[id] = { ...(out[id] ?? {}), ...v };

const today = new Date().toISOString().slice(0, 10).split("-").reverse().join("/");
const missing = hunts.filter((h) => out[h.id]?.x === undefined).map((h) => h.id);
writeFileSync(
  new URL("src/data/hunt-maps.ts", root),
  `// Posição de cada hunt no mapa (x, y, andar) e a imagem da área na TibiaWiki. Gerado por scripts/hunt-maps.mjs em ${today}.
// Sem coordenada: ${missing.join(", ") || "nenhuma"}.

export interface HuntMap {
  /** página da hunt na TibiaWiki */
  page: string;
  x?: number;
  y?: number;
  z?: number;
  /** imagem da área na TibiaWiki */
  img?: string;
  /** de onde veio a coordenada quando não é da página da wiki (ex.: entrada, marcador do TibiaMaps) */
  ref?: string;
}

export const HUNT_MAPS: Record<string, HuntMap> = ${JSON.stringify(out, null, 2)};
`,
);
console.log(Object.keys(out).length, "de", hunts.length, "com página;", hunts.length - missing.length, "com coordenada. Sem:", missing.join(", "));
