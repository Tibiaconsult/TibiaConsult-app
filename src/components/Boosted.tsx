// Creature e boss boostados do dia (usados no pódio do topo), pela API pública do TibiaData (api.tibiadata.com), que lê o tibia.com.
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
