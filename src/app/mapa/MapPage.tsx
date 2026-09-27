"use client";

import Link from "next/link";
import { useState } from "react";
import Box from "@/components/Box";
import MapViewer, { MapPoint, tibiaMapsUrl } from "@/components/MapViewer";

type P = MapPoint & { id: string };

export default function MapPage({ points, start, startId }: { points: P[]; start: { x: number; y: number; z: number }; startId: string }) {
  const [sel, setSel] = useState(startId);
  const cur = points.find((p) => p.id === sel) ?? { ...start, label: "" };
  return (
    <Box title="🗺️ Mapa">
      <div className="flex flex-wrap items-center gap-2 mb-2 text-[12px]">
        <label>
          Ir para a hunt:{" "}
          <select
            value={sel}
            onChange={(e) => {
              setSel(e.target.value);
              window.history.replaceState(null, "", e.target.value ? `/mapa?hunt=${e.target.value}` : "/mapa");
            }}
          >
            <option value="">escolha...</option>
            {points.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        {sel && (
          <Link href={`/hunts?h=${sel}`} className="tc-btn !py-0.5">
            Ficha da hunt
          </Link>
        )}
        <a href={tibiaMapsUrl(cur.x, cur.y, cur.z)} target="_blank" rel="noreferrer" className="ml-auto">
          abrir este ponto no TibiaMaps.io ↗
        </a>
      </div>
      <MapViewer key={`${cur.x},${cur.y},${cur.z}`} center={cur} points={points} height={560} zoom={sel ? 1 : -1} />
      <p className="muted text-[10px] mt-2">
        Mapa e marcadores: TibiaMaps.io (tibia-map-data, licença MIT), guardados no próprio site. Tibia e o mapa são da CipSoft GmbH.
      </p>
    </Box>
  );
}
