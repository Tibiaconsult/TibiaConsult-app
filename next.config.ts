import type { NextConfig } from "next";

// Cabeçalhos de segurança. A CSP lista só o que o site usa: Supabase (login e dados), static.tibia.com (motor da Wheel,
// artes e ícones) e as imagens da TibiaWiki. Em desenvolvimento a CSP fica de fora (o Next precisa de eval no modo dev).
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://static.tibia.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://static.tibia.com https://static.wikia.nocookie.net https://tibia.fandom.com",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE} ${SUPABASE.replace("https://", "wss://")} https://static.tibia.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
