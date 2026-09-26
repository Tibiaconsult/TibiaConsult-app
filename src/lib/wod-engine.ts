// Motor oficial da Wheel of Destiny (CipSoft), o mesmo do planner do tibia.com.
// Carregado em tempo real de static.tibia.com; não é copiado para o projeto.

/* eslint-disable @typescript-eslint/no-explicit-any */
export const WOD_ENGINE_URL = "https://static.tibia.com/javascripts/wheelofdestiny/skillgrid.js";

let modulePromise: Promise<any> | null = null;

export function loadWodEngine(): Promise<any> {
  if (modulePromise) return modulePromise;
  modulePromise = new Promise((resolve, reject) => {
    const w = window as any;
    const start = () => w.createModule().then(resolve, reject);
    if (typeof w.createModule === "function") return start();
    const s = document.createElement("script");
    s.src = WOD_ENGINE_URL;
    s.async = true;
    s.referrerPolicy = "no-referrer";
    s.onload = start;
    s.onerror = () => {
      modulePromise = null;
      reject(new Error("Não foi possível carregar o motor da Wheel do tibia.com."));
    };
    document.head.appendChild(s);
  });
  return modulePromise;
}

/** Converte vetores e enums do Emscripten em objetos simples. */
export function plain(o: any): any {
  if (o == null || typeof o !== "object") return o;
  if (typeof o.size === "function" && typeof o.get === "function") {
    const out: any[] = [];
    for (let i = 0; i < o.size(); i++) out.push(plain(o.get(i)));
    return out;
  }
  if ("value" in o && Object.keys(o).length <= 1) return o.value;
  const r: any = {};
  for (const k in o) {
    try {
      const v = o[k];
      if (typeof v !== "function") r[k] = plain(v);
    } catch {
      // propriedade sem getter válido
    }
  }
  return r;
}

export const VOC_NAMES = ["Knight", "Paladin", "Sorcerer", "Druid", "Monk"] as const;
export type WodVoc = (typeof VOC_NAMES)[number];

/** Letra inicial do código do planner oficial por vocação. */
export const CODE_PREFIX: Record<string, WodVoc> = { K: "Knight", P: "Paladin", S: "Sorcerer", D: "Druid", M: "Monk" };

/** Geometria das 36 fatias (do planner oficial): anel e ângulos em graus, no sentido do canvas. */
export const WOD_SLICES: { id: string; ring: number; a0: number; a1: number; q: "TL" | "TR" | "BL" | "BR" }[] = [
  { id: "QTL0", ring: 0, a0: 180, a1: 270, q: "TL" }, { id: "QTL1", ring: 1, a0: 180, a1: 225, q: "TL" }, { id: "QTL3", ring: 1, a0: 225, a1: 270, q: "TL" },
  { id: "QTL2", ring: 2, a0: 180, a1: 210, q: "TL" }, { id: "QTL4", ring: 2, a0: 210, a1: 240, q: "TL" }, { id: "QTL6", ring: 2, a0: 240, a1: 270, q: "TL" },
  { id: "QTL5", ring: 3, a0: 195, a1: 225, q: "TL" }, { id: "QTL7", ring: 3, a0: 225, a1: 255, q: "TL" }, { id: "QTL8", ring: 4, a0: 195, a1: 255, q: "TL" },
  { id: "QTR0", ring: 0, a0: 270, a1: 360, q: "TR" }, { id: "QTR3", ring: 1, a0: 270, a1: 315, q: "TR" }, { id: "QTR1", ring: 1, a0: 315, a1: 360, q: "TR" },
  { id: "QTR6", ring: 2, a0: 270, a1: 300, q: "TR" }, { id: "QTR4", ring: 2, a0: 300, a1: 330, q: "TR" }, { id: "QTR2", ring: 2, a0: 330, a1: 360, q: "TR" },
  { id: "QTR7", ring: 3, a0: 285, a1: 315, q: "TR" }, { id: "QTR5", ring: 3, a0: 315, a1: 345, q: "TR" }, { id: "QTR8", ring: 4, a0: 285, a1: 345, q: "TR" },
  { id: "QBL0", ring: 0, a0: 90, a1: 180, q: "BL" }, { id: "QBL3", ring: 1, a0: 90, a1: 135, q: "BL" }, { id: "QBL1", ring: 1, a0: 135, a1: 180, q: "BL" },
  { id: "QBL6", ring: 2, a0: 90, a1: 120, q: "BL" }, { id: "QBL4", ring: 2, a0: 120, a1: 150, q: "BL" }, { id: "QBL2", ring: 2, a0: 150, a1: 180, q: "BL" },
  { id: "QBL7", ring: 3, a0: 105, a1: 135, q: "BL" }, { id: "QBL5", ring: 3, a0: 135, a1: 165, q: "BL" }, { id: "QBL8", ring: 4, a0: 105, a1: 165, q: "BL" },
  { id: "QBR0", ring: 0, a0: 0, a1: 90, q: "BR" }, { id: "QBR1", ring: 1, a0: 0, a1: 45, q: "BR" }, { id: "QBR3", ring: 1, a0: 45, a1: 90, q: "BR" },
  { id: "QBR2", ring: 2, a0: 0, a1: 30, q: "BR" }, { id: "QBR4", ring: 2, a0: 30, a1: 60, q: "BR" }, { id: "QBR6", ring: 2, a0: 60, a1: 90, q: "BR" },
  { id: "QBR5", ring: 3, a0: 15, a1: 45, q: "BR" }, { id: "QBR7", ring: 3, a0: 45, a1: 75, q: "BR" }, { id: "QBR8", ring: 4, a0: 15, a1: 75, q: "BR" },
];

export const QUARTER_COLOR: Record<string, string> = { TL: "#46b21c", TR: "#ae1434", BL: "#198d40", BR: "#841d9e" };
export const QUARTERS = ["TL", "TR", "BL", "BR"] as const;
