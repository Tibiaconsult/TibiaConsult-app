import { HUNTS } from "@/data/hunts";
import { HUNT_MAPS } from "@/lib/hunt-map";
import MapPage from "./MapPage";

export const metadata = {
  title: "Mapa do Tibia",
  description: "O mapa completo do Tibia, andar por andar, com os marcadores da comunidade e as hunts do site.",
};

export default async function MapaPage({ searchParams }: { searchParams: Promise<{ hunt?: string; x?: string; y?: string; z?: string }> }) {
  const q = await searchParams;
  const points = HUNTS.flatMap((h) => {
    const m = HUNT_MAPS[h.id];
    return m?.x !== undefined ? [{ id: h.id, x: m.x, y: m.y!, z: m.z!, label: h.name, href: `/hunts?h=${h.id}` }] : [];
  }).sort((a, b) => a.label.localeCompare(b.label));
  const fromHunt = q.hunt ? points.find((p) => p.id === q.hunt) : undefined;
  const n = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined);
  const start =
    fromHunt ?? (n(q.x) && n(q.y) ? { x: n(q.x)!, y: n(q.y)!, z: Math.min(15, n(q.z) ?? 7) } : { x: 32369, y: 32241, z: 7 }); // Thais
  return (
    <div>
      <h1>Mapa do Tibia</h1>
      <p className="on-dark mb-4">
        O minimapa completo do jogo, andar por andar, com os marcadores da comunidade (escadas, buracos, NPCs) e 📍 nas hunts do site. Arraste, dê zoom e
        troque de andar. Passe o mouse para ver a coordenada.
      </p>
      <MapPage points={points} start={{ x: start.x, y: start.y, z: start.z }} startId={fromHunt?.id ?? ""} />
    </div>
  );
}
