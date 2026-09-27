// Regra de senha do site (criar conta e trocar senha). A proteção contra senhas vazadas do Supabase
// só existe no plano Pro; no plano gratuito, a regra fica aqui: 8+ caracteres, com letra e número.

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "A senha precisa de pelo menos 8 caracteres.";
  if (!/[A-Za-zÀ-ÿ]/.test(pw) || !/\d/.test(pw)) return "Use letras e números na senha.";
  if (/^(.)\1+$/.test(pw) || /^(12345678|password|senha123|abcd1234)/i.test(pw)) return "Essa senha é fácil demais de adivinhar. Escolha outra.";
  return null;
}
