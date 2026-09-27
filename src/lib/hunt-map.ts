// Pontos das hunts no mapa e links externos (TibiaMaps.io, imagem da área na TibiaWiki, TibiaRoute).

import { HUNT_MAPS } from "@/data/hunt-maps";
import { HUNT_SPAWNS } from "@/data/hunt-spawns";
import { wikiImage } from "@/lib/md5";

export { HUNT_MAPS, HUNT_SPAWNS };

/**
 * Onde abrir o mapa da hunt: o ponto da wiki, ou o centro do respawn quando a hunt não tem ponto ou o ponto é outra entrada
 * (mais de 300 sqm longe das creatures ou num andar sem nenhuma).
 */
export function huntPoint(id: string): { x: number; y: number; z: number; fromSpawn: boolean } | null {
  const m = HUNT_MAPS[id];
  const s = HUNT_SPAWNS[id];
  if (m?.x !== undefined) {
    const far = s && (Math.max(Math.abs(s.center[0] - m.x), Math.abs(s.center[1] - m.y!)) > 300 || !s.floors.includes(m.z!));
    if (!far) return { x: m.x, y: m.y!, z: m.z!, fromSpawn: false };
  }
  return s ? { x: s.center[0], y: s.center[1], z: s.center[2], fromSpawn: true } : null;
}

/** Imagem da área na TibiaWiki (ex.: "Ebb and Flow Map 1.png"). */
export function areaImage(img: string | undefined): string | null {
  if (!img) return null;
  const m = img.match(/^(.*)\.(png|gif|jpg)$/i);
  return m ? wikiImage(m[1], m[2].toLowerCase()) : null;
}

export const TIBIAROUTE_URL = "https://tibiaroute.com/br/hunting-places";
