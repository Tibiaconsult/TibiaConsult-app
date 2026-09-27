// Respawn das hunts: onde cada creature nasce e quantas são, a partir do arquivo de spawns do Canary (OpenTibiaBR, GPL-2.0),
// que reproduz o mapa do Tibia global. Para cada hunt, pega os spawns das creatures da ficha perto do ponto da hunt no mapa
// (ou o maior grupo delas, quando a hunt não tem ponto) e grava:
//   public/mapa/spawns-ZZ.json  → por andar: nomes das creatures (c), nomes das hunts (h) e [x, y, creature, quantidade, hunt] (agrupado em blocos de 6x6 sqm)
//   src/data/hunt-spawns.ts     → por hunt: total, quantidade por creature, andares e centro
// Rodar de novo quando o Canary atualizar:  node scripts/spawns.mjs  (no ambiente com proxy: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=...)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "https://raw.githubusercontent.com/opentibiabr/canary/main/data-otservbr-global/world/otservbr-monster.xml";
const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

// creatures de cada hunt, lidas das fichas
const hunts = [];
for (const f of ["hunts.ts", "hunts-extra.ts", "hunts-high.ts", "hunts-high2.ts"]) {
  const parts = read(`src/data/${f}`)
    .split(/\n\s+id: "/)
    .slice(1);
  for (const p of parts) {
    const id = p.slice(0, p.indexOf('"'));
    const names = new Set([...p.matchAll(/\{ name: "([^"]+)", hp:/g), ...p.matchAll(/\bc\("([^"]+)",\s*\d/g)].map((m) => m[1]));
    const label = p.match(/\n\s+name: "([^"]+)"/)?.[1] ?? id;
    if (names.size) hunts.push({ id, label, names });
  }
}

// ponto de cada hunt no mapa
const hm = read("src/data/hunt-maps.ts");
const MAPS = JSON.parse(hm.slice(hm.indexOf("= {") + 2, hm.lastIndexOf("}") + 1));

// spawns do Canary
const xml = await (await fetch(SRC)).text();
const all = [];
for (const b of xml.matchAll(/<monster centerx="(\d+)" centery="(\d+)" centerz="(\d+)"[^>]*>([\s\S]*?)<\/monster>\s*(?=<monster centerx|<\/monsters>)/g)) {
  const [cx, cy, cz] = [Number(b[1]), Number(b[2]), Number(b[3])];
  for (const m of b[4].matchAll(/<monster name="([^"]+)" x="(-?\d+)" y="(-?\d+)" z="(-?\d+)"/g)) {
    all.push({ name: m[1], x: cx + Number(m[2]), y: cy + Number(m[3]), z: cz });
  }
}

// grupos de spawns vizinhos (até 12 sqm no mesmo andar ou no andar ao lado): uma área de hunt costuma ser um grupo só
function groups(list) {
  const parent = list.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const cell = new Map();
  const key = (x, y, z) => `${Math.floor(x / 12)},${Math.floor(y / 12)},${z}`;
  list.forEach((e, i) => {
    const k = key(e.x, e.y, e.z);
    if (!cell.has(k)) cell.set(k, []);
    cell.get(k).push(i);
  });
  list.forEach((e, i) => {
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++)
          for (const j of cell.get(key(e.x + dx * 12, e.y + dy * 12, e.z + dz)) ?? []) {
            const o = list[j];
            if (Math.abs(o.x - e.x) <= 12 && Math.abs(o.y - e.y) <= 12) parent[find(i)] = find(j);
          }
  });
  const out = new Map();
  list.forEach((e, i) => {
    const r = find(i);
    if (!out.has(r)) out.set(r, []);
    out.get(r).push(e);
  });
  return [...out.values()];
}

const creatureIdx = new Map();
const cIdx = (n) => (creatureIdx.has(n) ? creatureIdx.get(n) : (creatureIdx.set(n, creatureIdx.size), creatureIdx.size - 1));
const perFloor = Array.from({ length: 16 }, () => new Map());
const summary = {};
const report = [];

// creatures que só aparecem nesta hunt (entre as do site): separam áreas vizinhas que dividem creatures (Feru, Issavi)
const seen = new Map();
for (const h of hunts) for (const n of h.names) seen.set(n, (seen.get(n) ?? 0) + 1);
const signature = (h) => [...h.names].filter((n) => seen.get(n) === 1);
const othersSig = (h) => new Set(hunts.filter((o) => o !== h).flatMap(signature));

hunts.forEach((h, hi) => {
  const mine = all.filter((e) => h.names.has(e.name));
  if (!mine.length) return report.push(`${h.id}: sem dados`);
  const sig = new Set(signature(h));
  const other = othersSig(h);
  // com creature exclusiva: só os grupos que têm alguma; sem ela: fora os grupos com creature exclusiva de outra hunt
  const gs = groups(mine).filter((g) => (sig.size ? g.some((e) => sig.has(e.name)) : !g.some((e) => other.has(e.name))));
  const p = MAPS[h.id];
  const dist = (g) => Math.min(...g.map((e) => Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)) + 40 * Math.abs(e.z - p.z)));
  let pick;
  if (p?.x !== undefined) {
    pick = gs.filter((g) => dist(g) <= 150);
    // o ponto às vezes é a entrada: sem grupo perto, pega o grupo mais próximo e os vizinhos dele
    if (!pick.length && gs.length) {
      const d0 = Math.min(...gs.map(dist));
      if (d0 <= 600) pick = gs.filter((g) => dist(g) <= d0 + 150);
      // ponto longe demais (outra entrada): vale a creature exclusiva, onde ela estiver
      else if (sig.size) pick = gs;
    }
  } else {
    const best = gs.filter((g) => new Set(g.map((e) => e.name)).size >= 2).sort((a, b) => b.length - a.length)[0];
    pick = best ? [best] : [];
  }
  const sel = pick.flat();
  if (!sel.length) return report.push(`${h.id}: nenhum grupo perto do ponto`);
  const counts = {};
  const floors = new Set();
  for (const e of sel) {
    counts[e.name] = (counts[e.name] ?? 0) + 1;
    floors.add(e.z);
    const k = `${Math.floor(e.x / 6)},${Math.floor(e.y / 6)},${e.name},${hi}`;
    const f = perFloor[e.z];
    const cur = f.get(k) ?? { sx: 0, sy: 0, n: 0, name: e.name, hi };
    cur.sx += e.x;
    cur.sy += e.y;
    cur.n++;
    f.set(k, cur);
  }
  // centro: média do andar com mais creatures
  const zBest = [...floors].sort((a, b) => sel.filter((e) => e.z === b).length - sel.filter((e) => e.z === a).length)[0];
  const onZ = sel.filter((e) => e.z === zBest);
  const center = [Math.round(onZ.reduce((a, e) => a + e.x, 0) / onZ.length), Math.round(onZ.reduce((a, e) => a + e.y, 0) / onZ.length), zBest];
  const sorted = Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
  summary[h.id] = { total: sel.length, counts: sorted, floors: [...floors].sort((a, b) => a - b), center };
  report.push(`${h.id}: ${sel.length} em ${pick.length} grupo(s), andares ${[...floors].sort((a, b) => a - b).join("/")} · ${JSON.stringify(sorted)}`);
});

mkdirSync(new URL("public/mapa", root), { recursive: true });
const names = [...creatureIdx.keys()];
const huntIds = hunts.map((h) => h.label);
perFloor.forEach((f, z) => {
  const rows = [...f.values()].map((v) => [Math.round(v.sx / v.n), Math.round(v.sy / v.n), cIdx(v.name), v.n, v.hi]);
  writeFileSync(new URL(`public/mapa/spawns-${String(z).padStart(2, "0")}.json`, root), JSON.stringify({ c: [], h: [], s: rows }));
});
// índices finais (as creatures só ganham índice ao gravar os andares)
const finalNames = [...creatureIdx.keys()];
perFloor.forEach((f, z) => {
  const file = new URL(`public/mapa/spawns-${String(z).padStart(2, "0")}.json`, root);
  const d = JSON.parse(readFileSync(file, "utf8"));
  d.c = finalNames;
  d.h = huntIds;
  writeFileSync(file, JSON.stringify(d));
});
void names;

const day = new Date().toLocaleDateString("pt-BR");
const missing = hunts.filter((h) => !summary[h.id]).map((h) => h.id);
writeFileSync(
  new URL("src/data/hunt-spawns.ts", root),
  `// Respawn de cada hunt (quantas creatures de cada nascem na área), pelo arquivo de spawns do Canary (OpenTibiaBR), que reproduz o
// mapa do Tibia global: é aproximado. Gerado por scripts/spawns.mjs em ${day}. ${Object.keys(summary).length} de ${hunts.length} hunts.
// Sem dados: ${missing.join(", ") || "nenhuma"}.

export interface HuntSpawn {
  total: number;
  counts: Record<string, number>;
  floors: number[];
  /** centro da área no andar com mais creatures: [x, y, z] */
  center: [number, number, number];
}

export const HUNT_SPAWNS: Record<string, HuntSpawn> = ${JSON.stringify(summary)};
`,
);
console.log(report.join("\n"));
