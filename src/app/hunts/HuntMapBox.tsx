"use client";

// Mapa na ficha da hunt: o minimapa já no ponto e no andar da hunt, a imagem da área na TibiaWiki e os links de rota.

import Link from "next/link";
import MapViewer, { tibiaMapsUrl } from "@/components/MapViewer";
import { TIBIAROUTE, tibiaRouteUrl } from "@/data/tibiaroute";
import { creatureHref } from "@/lib/creature-labels";
import { HUNT_MAPS, HUNT_SPAWNS, TIBIAROUTE_URL, areaImage, huntPoint } from "@/lib/hunt-map";
import { creatureIcon } from "@/lib/icons";

export default function HuntMapBox({ id, name }: { id: string; name: string }) {
  const m = HUNT_MAPS[id];
  const img = areaImage(m?.img);
  const pt = huntPoint(id);
  const has = pt !== null;
  const spawn = HUNT_SPAWNS[id];
  const routes = TIBIAROUTE[id] ?? [];
  return (
    <div className="border border-[#b98a5a] rounded p-3 bg-white/40 mt-3">
      <div className="font-bold mb-1">🗺️ Mapa</div>
      {pt && <MapViewer key={id} center={pt} points={[{ x: pt.x, y: pt.y, z: pt.z, label: name }]} height={340} zoom={1} />}
      {pt?.fromSpawn ? (
        <p className="muted text-[10px] mt-1">📍 Mapa aberto no meio do respawn.</p>
      ) : (
        m?.ref && <p className="muted text-[10px] mt-1">📍 Ponto de referência: {m.ref}.</p>
      )}
      {spawn && (
        <div className="text-[12px] mt-2">
          <b>👾 Respawn: {spawn.total} creatures</b> <span className="muted">(aproximado)</span>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {Object.entries(spawn.counts).map(([c, n]) => (
              <Link key={c} href={creatureHref(c)} className="whitespace-nowrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creatureIcon(c)} alt="" width={24} height={24} loading="lazy" className="sprite inline-block align-middle" /> {n}x {c}
              </Link>
            ))}
          </div>
          <p className="muted text-[10px] mt-1">
            {spawn.floors.length > 1 ? `Em ${spawn.floors.length} andares (use ▲▼). ` : ""}Posição e quantidade de cada spawn: arquivo de spawns do Canary
            (OpenTibiaBR), que reproduz o mapa do Tibia; pode diferir um pouco do servidor oficial.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2 text-[12px]">
        {has && (
          <>
            <Link className="tc-btn !py-0.5" href={`/mapa?hunt=${id}`}>
              Mapa grande
            </Link>
            <a className="tc-btn !py-0.5" href={tibiaMapsUrl(pt.x, pt.y, pt.z)} target="_blank" rel="noreferrer">
              📍 TibiaMaps.io
            </a>
          </>
        )}
        {img && (
          <a className="tc-btn !py-0.5" href={img} target="_blank" rel="noreferrer">
            Mapa da área (TibiaWiki)
          </a>
        )}
        {routes.length === 0 && (
          <a className="tc-btn !py-0.5" href={TIBIAROUTE_URL} target="_blank" rel="noreferrer" title={`Procure "${name}" na lista do TibiaRoute`}>
            🧭 Rotas no TibiaRoute
          </a>
        )}
      </div>
      {routes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 text-[12px]">
          <b>🧭 Rota desenhada no TibiaRoute:</b>
          {routes.map((r) => (
            <a key={r.slug} className="tc-btn !py-0.5" href={tibiaRouteUrl(r.slug)} target="_blank" rel="noreferrer">
              {r.label}
            </a>
          ))}
        </div>
      )}
      {!has && !img && <p className="text-[12px] mt-1">Ainda sem posição no mapa para esta hunt.</p>}
    </div>
  );
}
