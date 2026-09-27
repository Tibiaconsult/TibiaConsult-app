// Valor de venda (NPC) e valor de mercado aproximado dos itens de loot das creatures, para os "drops valiosos" da ficha da hunt.
// Lê os nomes do loot em src/data/creatures.ts e grava src/data/item-values.ts. Rodar de novo quando a wiki mudar:
//   node scripts/item-values.mjs   (no ambiente com proxy: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=... node scripts/item-values.mjs)

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://tibia.fandom.com/api.php";
const root = new URL("..", import.meta.url);
const src = readFileSync(new URL("src/data/creatures.ts", root), "utf8");
const names = [...new Set([...src.matchAll(/"name":"([^"]+)","amount"/g)].map((m) => m[1]))].sort();

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

const num = (s) => {
  const m = (s ?? "").replace(/[,.](?=\d{3})/g, "").match(/\d+/);
  return m ? Number(m[0]) : null;
};
const field = (txt, k) => txt.match(new RegExp(`\\|\\s*${k}\\s*=\\s*([^\\n|]*)`, "i"))?.[1]?.trim();

const out = {};
for (let i = 0; i < names.length; i += 50) {
  const batch = names.slice(i, i + 50);
  const j = await api({ action: "query", prop: "revisions", rvprop: "content", rvslots: "main", redirects: "1", titles: batch.join("|") });
  const norm = new Map();
  for (const n of j.query.normalized ?? []) norm.set(n.to, n.from);
  for (const r of j.query.redirects ?? []) norm.set(r.to, norm.get(r.from) ?? r.from);
  for (const p of j.query.pages) {
    const txt = p.revisions?.[0]?.slots?.main?.content;
    if (!txt) continue;
    const name = norm.get(p.title) ?? p.title;
    const npc = num(field(txt, "npcvalue"));
    const value = num(field(txt, "value"));
    if (npc || value) out[name] = [npc ?? 0, value ?? npc ?? 0];
  }
}
const lines = Object.keys(out)
  .sort()
  .map((k) => `  ${JSON.stringify(k)}: [${out[k][0]}, ${out[k][1]}],`);
const day = new Date().toLocaleDateString("pt-BR");
writeFileSync(
  new URL("src/data/item-values.ts", root),
  `// Valor dos itens de loot: [venda para NPC, valor de referência da wiki]. Gerado por scripts/item-values.mjs a partir da TibiaWiki
// em ${day}. ${Object.keys(out).length} de ${names.length} itens com valor.

export const ITEM_VALUES: Record<string, [number, number]> = {
${lines.join("\n")}
};
`,
);
console.log(Object.keys(out).length, "/", names.length);
