import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Aceita os dois formatos de link:
// - token_hash (template customizado, funciona em qualquer navegador);
// - code (template padrão do Supabase, exige o mesmo navegador que pediu o link).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/meus-chars";
  const supabase = await createClient();

  const token_hash = searchParams.get("token_hash");
  if (token_hash) {
    const type = (searchParams.get("type") ?? "email") as EmailOtpType;
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}
