// Criatura e boss boostados do dia, pela API pública do TibiaData (api.tibiadata.com), que lê o tibia.com.
// Atualiza a cada 30 minutos; se a API falhar, a caixa simplesmente não aparece.

interface BoostedItem {
  name: string;
  image_url: string;
}

async function getJson(url: string): Promise<unknown> {
  try {
    const r = await fetch(url, { next: { revalidate: 1800 } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function getBoosted(): Promise<{ creature: BoostedItem | null; boss: BoostedItem | null }> {
  const [c, b] = await Promise.all([getJson("https://api.tibiadata.com/v4/creatures"), getJson("https://api.tibiadata.com/v4/boostablebosses")]);
  const creature = (c as { creatures?: { boosted?: BoostedItem } } | null)?.creatures?.boosted ?? null;
  const boss = (b as { boostable_bosses?: { boosted?: BoostedItem } } | null)?.boostable_bosses?.boosted ?? null;
  return { creature: creature?.name ? creature : null, boss: boss?.name ? boss : null };
}

export default async function Boosted({ compact = false }: { compact?: boolean }) {
  const { creature, boss } = await getBoosted();
  if (!creature && !boss) return null;
  const items = [creature && { label: "Criatura", ...creature }, boss && { label: "Boss", ...boss }].filter(Boolean) as (BoostedItem & { label: string })[];
  return (
    <div className={compact ? "space-y-2" : "flex flex-wrap gap-4"}>
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={i.image_url} alt="" width={48} height={48} className="sprite" />
          <div className="text-[12px] leading-tight">
            <div className="muted text-[10px]">{i.label === "Criatura" ? "Criatura boostada hoje" : "Boss boostado hoje"}</div>
            <div className="font-bold">{i.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
