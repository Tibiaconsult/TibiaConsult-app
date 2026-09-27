import { HUNTS, Hunt } from "@/data/hunts";
import { HUNT_RECS, REC_VOC_LABEL, RecVoc } from "@/data/hunt-recs";
import { creatureIcon } from "@/lib/icons";
import { HUNT_MAPS } from "@/lib/hunt-map";
import MapPage from "./MapPage";

export const metadata = {
  title: "Mapa do Tibia",
  description: "O mapa completo do Tibia, andar por andar, com os marcadores da comunidade e as hunts do site.",
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Balão do 📍: creatures da área, level recomendado e os atalhos. */
function popup(h: Hunt): string {
  const rec = HUNT_RECS[h.id];
  const lv = rec
    ? [
        ...(Object.keys(REC_VOC_LABEL) as RecVoc[]).filter((v) => rec.solo[v]).map((v) => `${REC_VOC_LABEL[v]} ${rec.solo[v]}+`),
        ...(rec.team ? [`PT ${rec.team}+`] : []),
      ].join(" · ")
    : "";
  const mobs = h.creatures
    .map(
      (c) =>
        `<a href="/criaturas/${encodeURIComponent(c.name)}" title="${esc(c.name)}" style="display:inline-block;text-align:center;width:62px;font-size:10px;line-height:11px;vertical-align:top">` +
        `<img src="${creatureIcon(c.name)}" alt="" width="32" height="32" loading="lazy" style="image-rendering:pixelated;display:block;margin:0 auto"/>${esc(c.name)}</a>`,
    )
    .join("");
  return (
    `<div style="font-size:12px"><b>${esc(h.name)}</b>` +
    (lv ? `<div style="font-size:11px;margin:2px 0">Level: ${esc(lv)}</div>` : "") +
    `<div style="margin:4px 0">${mobs}</div>` +
    `<a href="/hunts?h=${h.id}">Ficha da hunt</a> · <a href="/hunts/preparar?h=${h.id}">Preparar</a></div>`
  );
}

export default async function MapaPage({ searchParams }: { searchParams: Promise<{ hunt?: string; x?: string; y?: string; z?: string }> }) {
  const q = await searchParams;
  const points = HUNTS.flatMap((h) => {
    const m = HUNT_MAPS[h.id];
    return m?.x !== undefined ? [{ id: h.id, x: m.x, y: m.y!, z: m.z!, label: h.name, href: `/hunts?h=${h.id}`, popup: popup(h) }] : [];
  }).sort((a, b) => a.label.localeCompare(b.label));
  const fromHunt = q.hunt ? points.find((p) => p.id === q.hunt) : undefined;
  const n = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined);
  const start = fromHunt ?? (n(q.x) && n(q.y) ? { x: n(q.x)!, y: n(q.y)!, z: Math.min(15, n(q.z) ?? 7) } : { x: 32369, y: 32241, z: 7 }); // Thais
  return (
    <div>
      <h1>Mapa do Tibia</h1>
      <p className="on-dark mb-4">
        O minimapa completo do jogo, andar por andar, com os marcadores da comunidade (escadas, buracos, NPCs) e 📍 nas hunts do site. Arraste, dê zoom e troque
        de andar. Passe o mouse para ver a coordenada.
      </p>
      <MapPage points={points} start={{ x: start.x, y: start.y, z: start.z }} startId={fromHunt?.id ?? ""} />
    </div>
  );
}
