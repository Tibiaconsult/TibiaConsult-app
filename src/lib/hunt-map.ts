// Pontos das hunts no mapa e links externos (TibiaMaps.io, imagem da área na TibiaWiki, TibiaRoute).

import { HUNT_MAPS } from "@/data/hunt-maps";
import { wikiImage } from "@/lib/md5";

export { HUNT_MAPS };

/** Imagem da área na TibiaWiki (ex.: "Ebb and Flow Map 1.png"). */
export function areaImage(img: string | undefined): string | null {
  if (!img) return null;
  const m = img.match(/^(.*)\.(png|gif|jpg)$/i);
  return m ? wikiImage(m[1], m[2].toLowerCase()) : null;
}

export const TIBIAROUTE_URL = "https://tibiaroute.com/br/hunting-places";
