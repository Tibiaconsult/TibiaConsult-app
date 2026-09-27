"use client";

// Mapa do Tibia dentro do site: o minimapa completo do jogo (TibiaMaps.io, 16 andares, baixado em /public/mapa), com os
// marcadores da comunidade, os pontos das hunts, troca de andar e a coordenada embaixo do mouse. Não depende de nenhum
// arquivo do computador do jogador: tudo vem do próprio site.

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LMap, ImageOverlay } from "leaflet";

// limites do mapa (bounds.json do tibia-map-data): 1 pixel = 1 sqm
const X0 = 31744;
const Y0 = 30976;
const W = 2560;
const H = 2048;

export interface MapPoint {
  x: number;
  y: number;
  z: number;
  label: string;
  href?: string;
}

const floorFile = (z: number) => `/mapa/floor-${String(z).padStart(2, "0")}.png`;
export const floorName = (z: number) => (z === 7 ? "térreo" : z < 7 ? `+${7 - z} (acima)` : `-${z - 7} (subsolo)`);
export const tibiaMapsUrl = (x: number, y: number, z: number) => `https://tibiamaps.io/map#${x},${y},${z}:2`;

// marcador do jogo → cor do pontinho
const ICON_COLOR: Record<string, string> = {
  up: "#35c46a",
  down: "#e05252",
  flag: "#f3d27a",
  "!": "#ff9d2e",
  "?": "#7fb2ff",
  star: "#ffd700",
  skull: "#bbbbbb",
  $: "#9be27a",
  lock: "#c39bff",
  sword: "#ff7070",
};

export default function MapViewer({
  center,
  points = [],
  height = 360,
  zoom = 1,
}: {
  center: { x: number; y: number; z: number };
  points?: MapPoint[];
  height?: number;
  zoom?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<ImageOverlay | null>(null);
  const markLayer = useRef<LayerGroup | null>(null);
  const pointLayer = useRef<LayerGroup | null>(null);
  const [z, setZ] = useState(center.z);
  const [pos, setPos] = useState<string>("");
  const [showMarks, setShowMarks] = useState(true);
  const [ready, setReady] = useState(false);

  // cria o mapa uma vez
  useEffect(() => {
    let alive = true;
    import("leaflet").then((L) => {
      if (!alive || !box.current || map.current) return;
      const m = L.map(box.current, {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 4,
        zoomSnap: 0.5,
        attributionControl: false,
        preferCanvas: true,
        maxBounds: [
          [-H - 200, -200],
          [200, W + 200],
        ],
      });
      layer.current = L.imageOverlay(floorFile(center.z), [
        [-H, 0],
        [0, W],
      ]).addTo(m);
      markLayer.current = L.layerGroup().addTo(m);
      pointLayer.current = L.layerGroup().addTo(m);
      m.setView([-(center.y - Y0) - 0.5, center.x - X0 + 0.5], zoom);
      m.on("mousemove", (e) => {
        const x = Math.floor(e.latlng.lng) + X0;
        const y = Math.floor(-e.latlng.lat) + Y0;
        setPos(`${x}, ${y}`);
      });
      map.current = m;
      setReady(true);
    });
    return () => {
      alive = false;
      map.current?.remove();
      map.current = null;
    };
    // o centro inicial vale só na criação; depois o jogador navega à vontade
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // troca de andar: imagem, marcadores do jogo e pontos das hunts daquele andar
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    import("leaflet").then(async (L) => {
      if (!alive || !map.current) return;
      layer.current?.setUrl(floorFile(z));
      markLayer.current?.clearLayers();
      pointLayer.current?.clearLayers();
      for (const p of points.filter((p) => p.z === z)) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="font-size:22px;line-height:22px;transform:translate(-50%,-100%);filter:drop-shadow(0 1px 1px #000)">📍</div>`,
        });
        const mk = L.marker([-(p.y - Y0) - 0.5, p.x - X0 + 0.5], { icon, title: p.label }).addTo(pointLayer.current!);
        mk.bindTooltip(p.label, { direction: "top", offset: [0, -20] });
        if (p.href) mk.on("click", () => (window.location.href = p.href!));
      }
      if (!showMarks) return;
      try {
        const res = await fetch(`/mapa/markers-${String(z).padStart(2, "0")}.json`);
        const list = (await res.json()) as [number, number, string, string][];
        if (!alive) return;
        for (const [x, y, icon, desc] of list) {
          const c = L.circleMarker([-(y - Y0) - 0.5, x - X0 + 0.5], {
            radius: 3,
            color: "#000",
            weight: 1,
            fillColor: ICON_COLOR[icon] ?? "#ffffff",
            fillOpacity: 0.9,
          }).addTo(markLayer.current!);
          if (desc) c.bindTooltip(desc, { direction: "top" });
        }
      } catch {
        // sem marcadores: o mapa segue normal
      }
    });
    return () => {
      alive = false;
    };
  }, [ready, z, showMarks, points]);

  return (
    <div className="text-[12px]">
      <div className="flex flex-wrap items-center gap-1 mb-1">
        <button type="button" className="tc-btn !py-0 !px-2" onClick={() => setZ((v) => Math.max(0, v - 1))} disabled={z <= 0} title="Subir um andar">
          ▲
        </button>
        <button type="button" className="tc-btn !py-0 !px-2" onClick={() => setZ((v) => Math.min(15, v + 1))} disabled={z >= 15} title="Descer um andar">
          ▼
        </button>
        <b className="ml-1">Andar {floorName(z)}</b>
        <label className="ml-2 inline-flex items-center gap-1">
          <input type="checkbox" checked={showMarks} onChange={(e) => setShowMarks(e.target.checked)} /> marcadores
        </label>
        <span className="ml-auto muted font-mono">{pos && `${pos}, ${z}`}</span>
      </div>
      <div ref={box} className="tc-map rounded border border-[#5a4632]" style={{ height, background: "#000" }} />
    </div>
  );
}
