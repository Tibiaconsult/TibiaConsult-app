// Set das vocações druid, knight, paladin e monk no montador (/simulador/set?voc=...&a=...): um item por slot, com tier e imbuements.
// Slots pelos rótulos da lista de equipamento ("Arma", "Elmo", "Escudo"...). O código vai na URL e em chars.set_code.

export interface SlotPick {
  item: string | null;
  tier: number;
  imbues: { id: string; tier: number }[];
}
export type Build = Record<string, SlotPick>;

export const encodeBuild = (b: Build) => btoa(unescape(encodeURIComponent(JSON.stringify(b))));

export function decodeBuild(s: string | null): Build | null {
  if (!s) return null;
  try {
    // "+" do base64 vira espaço quando o código passa sem encodeURIComponent (links antigos salvos no char)
    const raw = JSON.parse(decodeURIComponent(escape(atob(s.replace(/ /g, "+"))))) as Record<string, Partial<SlotPick>>;
    const out: Build = {};
    for (const [k, v] of Object.entries(raw)) out[k] = { item: v.item ?? null, tier: v.tier ?? 0, imbues: v.imbues ?? [] };
    return out;
  } catch {
    return null;
  }
}
