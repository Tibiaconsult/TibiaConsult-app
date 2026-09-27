import type { MetadataRoute } from "next";

// Permite instalar o site como app (celular e PC), com o ícone do Tibia.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TibiaConsult",
    short_name: "TibiaConsult",
    description: "Tibia para todas as vocações: simuladores, set, Wheel, hunts, ferramentas e comunidade.",
    start_url: "/",
    display: "standalone",
    background_color: "#051122",
    theme_color: "#0d3b1c",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
