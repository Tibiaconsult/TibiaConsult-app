// Manifesto do LootSplit no endereço próprio dele (lootsplit-…): escopo "/", separado do app do TibiaConsult.

export const dynamic = "force-static";

export function GET() {
  return new Response(
    JSON.stringify({
      id: "/",
      name: "LootSplit · TibiaConsult",
      short_name: "LootSplit",
      description: "Cole o Party Hunt Analyser do Tibia e receba a divisão do loot pronta, com os comandos de transfer.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#140c06",
      theme_color: "#2a1a08",
      lang: "pt-BR",
      icons: [
        { src: "/lootsplit/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/lootsplit/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/lootsplit/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    }),
    { headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=3600" } },
  );
}
