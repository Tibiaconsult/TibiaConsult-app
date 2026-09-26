/**
 * Destino depois do login: só caminhos do próprio site ("/algo"). Bloqueia "//outro.site", "/\outro" e
 * truques como "@outro.site", que viram redirecionamento para fora quando colados depois do domínio.
 */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || /[\s\@]/.test(next)) return fallback;
  return next;
}
