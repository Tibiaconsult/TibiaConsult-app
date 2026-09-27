"use client";

// Mapa na ficha da hunt: o minimapa já no ponto e no andar da hunt, a imagem da área na TibiaWiki e os links de rota.

import Link from "next/link";
import MapViewer, { tibiaMapsUrl } from "@/components/MapViewer";
import { HUNT_MAPS, TIBIAROUTE_URL, areaImage } from "@/lib/hunt-map";

export default function HuntMapBox({ id, name }: { id: string; name: string }) {
  const m = HUNT_MAPS[id];
  const img = areaImage(m?.img);
  const has = m?.x !== undefined;
  return (
    <div className="border border-[#b98a5a] rounded p-3 bg-white/40 mt-3">
      <div className="font-bold mb-1">🗺️ Mapa</div>
      {has && <MapViewer key={id} center={{ x: m.x!, y: m.y!, z: m.z! }} points={[{ x: m.x!, y: m.y!, z: m.z!, label: name }]} height={300} zoom={1} />}
      {m?.ref && <p className="muted text-[10px] mt-1">📍 Ponto de referência: {m.ref}.</p>}
      <div className="flex flex-wrap gap-2 mt-2 text-[12px]">
        {has && (
          <>
            <Link className="tc-btn !py-0.5" href={`/mapa?hunt=${id}`}>
              Mapa grande
            </Link>
            <a className="tc-btn !py-0.5" href={tibiaMapsUrl(m.x!, m.y!, m.z!)} target="_blank" rel="noreferrer">
              📍 TibiaMaps.io
            </a>
          </>
        )}
        {img && (
          <a className="tc-btn !py-0.5" href={img} target="_blank" rel="noreferrer">
            Mapa da área (TibiaWiki)
          </a>
        )}
        <a className="tc-btn !py-0.5" href={TIBIAROUTE_URL} target="_blank" rel="noreferrer" title={`Procure "${name}" na lista do TibiaRoute`}>
          🧭 Rotas no TibiaRoute
        </a>
      </div>
      {!has && !img && <p className="text-[12px] mt-1">Ainda sem posição no mapa para esta hunt.</p>}
    </div>
  );
}
