"use client";

// Mapa do Tibia dentro do site: o minimapa completo do jogo (TibiaMaps.io, 16 andares, baixado em /public/mapa), com os
// marcadores da comunidade, os pontos das hunts, troca de andar e a coordenada embaixo do mouse. Não depende de nenhum
// arquivo do computador do jogador: tudo vem do próprio site.

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LMap, ImageOverlay } from "leaflet";
import { creatureIcon } from "@/lib/icons";

// limites do mapa (bounds.json do tibia-map-data): 1 pixel = 1 sqm
const X0 = 31744;
const Y0 = 30976;
const W = 2560;
const H = 2048;

/** Rota desenhada: pontos [x, y, andar] na ordem do caminho. */
export interface MapLine {
  pts: [number, number, number][];
  color: string;
  label?: string;
  dashed?: boolean;
}

export interface MapPoint {
  x: number;
  y: number;
  z: number;
  label: string;
  href?: string;
  /** conteúdo do balão ao clicar (HTML já escapado); sem ele, o clique abre o href */
  popup?: string;
}

/** Spawns de um andar (scripts/spawns.mjs): nomes das creatures, nomes das hunts e [x, y, creature, quantidade, hunt]. */
interface SpawnFloor {
  c: string[];
  h: string[];
  s: [number, number, number, number, number][];
}
// creatures só aparecem com zoom suficiente: longe, viram uma nuvem de ícones
const SPAWN_MIN_ZOOM = 0;

const NO_LINES: MapLine[] = [];
const toLL = (x: number, y: number): [number, number] => [-(y - Y0) - 0.5, x - X0 + 0.5];

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
  lines = NO_LINES,
  onPick,
}: {
  center: { x: number; y: number; z: number };
  points?: MapPoint[];
  height?: number;
  zoom?: number;
  lines?: MapLine[];
  /** modo desenho: cada clique no mapa devolve o sqm e o andar em que o jogador está */
  onPick?: (x: number, y: number, z: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<ImageOverlay | null>(null);
  const markLayer = useRef<LayerGroup | null>(null);
  const pointLayer = useRef<LayerGroup | null>(null);
  const spawnLayer = useRef<LayerGroup | null>(null);
  const lineLayer = useRef<LayerGroup | null>(null);
  const pickRef = useRef<typeof onPick>(undefined);
  const zRef = useRef(center.z);
  const spawnData = useRef<SpawnFloor | null>(null);
  const [z, setZ] = useState(center.z);
  const [pos, setPos] = useState<string>("");
  const [showMarks, setShowMarks] = useState(true);
  const [showSpawns, setShowSpawns] = useState(true);
  const [spawnHint, setSpawnHint] = useState(false);
  const [ready, setReady] = useState(false);

  // desenha só as creatures que estão na tela (o andar inteiro pode ter mais de mil blocos)
  const drawSpawns = useRef<() => void>(() => {});
  const draw = useCallback(() => {
    const m = map.current;
    const layer = spawnLayer.current;
    if (!m || !layer) return;
    layer.clearLayers();
    const d = spawnData.current;
    const far = m.getZoom() < SPAWN_MIN_ZOOM;
    setSpawnHint(!!d?.s.length && far && showSpawns);
    if (!d || !showSpawns || far) return;
    import("leaflet").then((L) => {
      if (spawnData.current !== d) return;
      const b = m.getBounds().pad(0.1);
      const size = m.getZoom() >= 2 ? 32 : m.getZoom() >= 1 ? 24 : 18;
      for (const [x, y, ci, n, hi] of d.s) {
        const ll = L.latLng(-(y - Y0) - 0.5, x - X0 + 0.5);
        if (!b.contains(ll)) continue;
        const name = d.c[ci];
        const icon = L.divIcon({
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html:
            `<div style="position:relative;width:${size}px;height:${size}px"><img src="${creatureIcon(name)}" alt="" width="${size}" height="${size}" style="image-rendering:pixelated"/>` +
            (n > 1
              ? `<span style="position:absolute;right:-4px;bottom:-4px;background:#000c;color:#fff;font:bold 10px/12px sans-serif;padding:0 3px;border-radius:6px">${n}</span>`
              : "") +
            `</div>`,
        });
        L.marker(ll, { icon, keyboard: false }).bindTooltip(`${n}x ${name} · ${d.h[hi]}`, { direction: "top" }).addTo(layer);
      }
    });
  }, [showSpawns]);
  useEffect(() => {
    drawSpawns.current = draw;
    draw();
  }, [draw]);

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
      spawnLayer.current = L.layerGroup().addTo(m);
      lineLayer.current = L.layerGroup().addTo(m);
      pointLayer.current = L.layerGroup().addTo(m);
      m.on("click", (e) => pickRef.current?.(Math.floor(e.latlng.lng) + X0, Math.floor(-e.latlng.lat) + Y0, zRef.current));
      m.setView([-(center.y - Y0) - 0.5, center.x - X0 + 0.5], zoom);
      m.on("mousemove", (e) => {
        const x = Math.floor(e.latlng.lng) + X0;
        const y = Math.floor(-e.latlng.lat) + Y0;
        setPos(`${x}, ${y}`);
      });
      m.on("moveend zoomend", () => drawSpawns.current());
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

  useEffect(() => {
    pickRef.current = onPick;
    zRef.current = z;
    if (box.current) {
      box.current.style.cursor = onPick ? "crosshair" : "";
      // desenhando: ícones de creature e marcadores não seguram o clique, que vira ponto da rota
      box.current.classList.toggle("tc-drawing", !!onPick);
    }
  }, [onPick, z]);

  // rotas: trechos do andar aberto, início (verde), fim (vermelho) e onde a rota sobe ou desce
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    import("leaflet").then((L) => {
      const lay = lineLayer.current;
      if (!alive || !lay) return;
      lay.clearLayers();
      for (const ln of lines) {
        let seg: [number, number][] = [];
        const flush = () => {
          if (seg.length > 1) {
            L.polyline(seg, { color: "#000", weight: 6, opacity: 0.5, interactive: false }).addTo(lay);
            const pl = L.polyline(seg, { color: ln.color, weight: 3, dashArray: ln.dashed ? "6 6" : undefined }).addTo(lay);
            if (ln.label) pl.bindTooltip(ln.label, { sticky: true });
          }
          seg = [];
        };
        ln.pts.forEach(([x, y, pz], i) => {
          if (pz === z) seg.push(toLL(x, y));
          else flush();
          const prev = ln.pts[i - 1];
          const next = ln.pts[i + 1];
          // escada: o ponto está neste andar e o vizinho em outro
          const other = [prev, next].find((q) => q && q[2] !== pz && pz === z);
          if (other)
            L.marker(toLL(x, y), {
              interactive: false,
              icon: L.divIcon({
                className: "",
                iconSize: [18, 18],
                iconAnchor: [9, 9],
                html: `<div style="width:18px;height:18px;border-radius:9px;background:${ln.color};color:#000;font:bold 12px/18px sans-serif;text-align:center;border:1px solid #000">${other[2] < pz ? "▲" : "▼"}</div>`,
              }),
            }).addTo(lay);
        });
        flush();
        const first = ln.pts[0];
        const last = ln.pts[ln.pts.length - 1];
        if (first?.[2] === z)
          L.circleMarker(toLL(first[0], first[1]), { radius: 6, color: "#000", weight: 1, fillColor: "#35c46a", fillOpacity: 1 })
            .bindTooltip("início")
            .addTo(lay);
        if (last && ln.pts.length > 1 && last[2] === z)
          L.circleMarker(toLL(last[0], last[1]), { radius: 6, color: "#000", weight: 1, fillColor: "#e05252", fillOpacity: 1 }).bindTooltip("fim").addTo(lay);
      }
    });
    return () => {
      alive = false;
    };
  }, [ready, z, lines]);

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
        if (p.popup) mk.bindPopup(p.popup, { offset: [0, -18], maxWidth: 280 });
        else if (p.href) mk.on("click", () => (window.location.href = p.href!));
      }
      spawnData.current = null;
      drawSpawns.current();
      fetch(`/mapa/spawns-${String(z).padStart(2, "0")}.json`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: SpawnFloor | null) => {
          if (!alive) return;
          spawnData.current = d;
          drawSpawns.current();
        })
        .catch(() => {});
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
        <label className="ml-2 inline-flex items-center gap-1">
          <input type="checkbox" checked={showSpawns} onChange={(e) => setShowSpawns(e.target.checked)} /> creatures
        </label>
        {spawnHint && <span className="muted">(dê zoom para ver as creatures)</span>}
        <span className="ml-auto muted font-mono">{pos && `${pos}, ${z}`}</span>
      </div>
      <div ref={box} className="tc-map rounded border border-[#5a4632]" style={{ height, background: "#000" }} />
    </div>
  );
}
