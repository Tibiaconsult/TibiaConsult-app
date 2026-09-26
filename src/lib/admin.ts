import { createClient } from "@/lib/supabase/server";

/** Confere no banco (função is_admin) se o usuário logado é administrador. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("is_admin");
  if (error || data !== true) return null;
  return { supabase, user };
}
