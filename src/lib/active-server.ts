import { cookies } from "next/headers";
import { parseVoc, type AnyVoc } from "@/components/voc-list";

/** Vocação da página: a do link (?voc=) ou, sem ela, a vocação ativa guardada no cookie. */
export async function pageVoc(sp: { voc?: string }): Promise<AnyVoc> {
  if (sp.voc) return parseVoc(sp.voc);
  return parseVoc((await cookies()).get("tc-voc")?.value);
}
